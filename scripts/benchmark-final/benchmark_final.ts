// STEP 7A — Benchmark CLI / pilot runner.
// Deploys NFTCowCert on the in-process Hardhat network (pilot/dry-run) OR connects to a
// configured live network, runs a concurrency pilot matrix for the MINT operation, and
// writes machine-readable raw/batch/summary/environment artifacts.
//
// Local dry-run (free, proves the harness works):
//   npx hardhat run scripts/benchmark-final/benchmark_final.ts
//
// Config via env:
//   BENCH_MODE=local|live         (default local)
//   BENCH_OP=mint                 (pilot focuses on mint = onlyAdmin, gas-paying path)
//   BENCH_NS="5,10"               (pilot N values)
//   BENCH_CONC="1,2,4"            (pilot concurrency levels)
//   BENCH_OUT=benchmark-final-results

import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import { runBatch, RunConfig, SubmitFn } from "../../src/benchmark/runner";
import { captureEnvironment } from "../../src/benchmark/environment";
import { summarize } from "../../src/benchmark/stats";
import { AttemptSink, appendBatch, completedRuns, withTimeout } from "../../src/benchmark/rawWriter";
import { SetupCheckpoint, saveCheckpoint, loadCheckpoint, freshCheckpoint, checkpointPath } from "../../src/benchmark/setupCheckpoint";
import { verifyTokens, preconditionExpectations, ChainView } from "../../src/benchmark/setupVerify";
import { AttemptRecord, BatchRecord, RetryPolicy } from "../../src/benchmark/types";

// Runner provenance (recorded in checkpoints). STEP 7B.1 changed the runner, so the
// hash is computed from this file at runtime and stored with every new run.
import * as crypto from "crypto";
const RUNNER_VERSION = "step7b1-resume";
const RUNNER_HASH = (() => { try { return crypto.createHash("sha256").update(fs.readFileSync(__filename)).digest("hex"); } catch { return "unknown"; } })();

const RETRY: RetryPolicy = {
  max_retries: 3, backoff: "exponential", backoff_base_ms: 250,
  retryable: ["RPC_TIMEOUT","RPC_RATE_LIMIT","RPC_CONNECTION","NONCE_ERROR","REPLACEMENT_ERROR","RECEIPT_TIMEOUT"],
  non_retryable: ["INSUFFICIENT_FUNDS","GAS_ESTIMATION","CONTRACT_REVERT","UNKNOWN"],
};

function csvEscape(v: any){ const s=v==null?"":String(v); return /[",\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s; }
function writeCsv(file: string, rows: Record<string, any>[], headers: string[]) {
  const lines=[headers.join(",")]; for(const r of rows) lines.push(headers.map(h=>csvEscape(r[h])).join(","));
  fs.writeFileSync(file, lines.join("\n")+"\n");
}

async function main() {
  const mode = process.env.BENCH_MODE || "local";
  // repeat index for this batch (frozen protocol: 3 independent repeats -> run r1, r2, r3 separately)
  const repeatIndex = parseInt(process.env.BENCH_REPEAT_INDEX || "1", 10);
  const op = (process.env.BENCH_OP || "mint") as "mint" | "transfer" | "block" | "unblock";
  if (!["mint","transfer","block","unblock"].includes(op)) throw new Error(`invalid BENCH_OP=${op}`);
  const Ns = (process.env.BENCH_NS || "5,10").split(",").map(x=>parseInt(x.trim(),10));
  const concs = (process.env.BENCH_CONC || "1,2,4").split(",").map(x=>parseInt(x.trim(),10));
  const outRoot = process.env.BENCH_OUT || "benchmark-final-results";
  const experiment_id = `pilot_${Date.now()}`;

  // --- deploy / connect ---
  const signers = await ethers.getSigners();
  const admin = signers[0];
  // transfer destination: a second signer if present, else an address from .env, else admin itself.
  const transferTo = signers[1]?.address || process.env.TRANSFER_TO || admin.address;
  let c: any;
  let addr: string;
  if (mode === "live") {
    // Connect to the ALREADY-DEPLOYED contract from .env (do NOT deploy — saves gas).
    // zkSync uses ZKSYNC_CONTRACT; Ethereum Sepolia uses SEPOLIA_CONTRACT.
    const net0 = await ethers.provider.getNetwork();
    const isZk = Number(net0.chainId) === 300;
    addr = (isZk ? process.env.ZKSYNC_CONTRACT : process.env.SEPOLIA_CONTRACT)
        || process.env.ZKSYNC_CONTRACT_TEST || process.env.ETH_CONTRACT_TEST || "";
    if (!addr) throw new Error("live mode: missing contract address in .env (ZKSYNC_CONTRACT / SEPOLIA_CONTRACT)");
    c = await ethers.getContractAt("NFTCowCert", addr);
    console.log(`live mode: connected to existing contract ${addr} (chainId ${Number(net0.chainId)})`);
  } else {
    // local: deploy a fresh contract (free, in-process)
    const Factory = await ethers.getContractFactory("NFTCowCert");
    const deployed = await Factory.deploy(admin.address);
    await deployed.waitForDeployment();
    c = deployed;
    addr = await deployed.getAddress();
  }
  const net = await ethers.provider.getNetwork();
  const chainId = Number(net.chainId);

  // --- PRE-FLIGHT (live only): fail fast BEFORE spending gas ---
  if (mode === "live") {
    const bal = await ethers.provider.getBalance(admin.address);
    console.log(`admin=${admin.address} balance=${ethers.formatEther(bal)} native`);
    if (bal === 0n) throw new Error(`PRE-FLIGHT FAIL: admin ${admin.address} has 0 balance — fund it before running (no gas wasted).`);
    // verify admin is authorized for onlyAdmin ops (isAdmin mapping)
    try {
      const ok = await (c as any).isAdmin(admin.address);
      console.log(`isAdmin(${admin.address}) = ${ok}`);
      if (!ok) throw new Error(`PRE-FLIGHT FAIL: ${admin.address} is not admin on ${addr} — issueCert/block/unblock would revert.`);
    } catch (e:any) {
      if (String(e?.message||"").includes("PRE-FLIGHT")) throw e;
      console.warn(`could not verify isAdmin (continuing): ${String(e?.message||e).slice(0,120)}`);
    }
  }

  const expDir = path.join(process.cwd(), outRoot, `experiment_${experiment_id}`);
  fs.mkdirSync(path.join(expDir,"raw"), { recursive: true });
  fs.mkdirSync(path.join(expDir,"batches"), { recursive: true });
  fs.mkdirSync(path.join(expDir,"summary"), { recursive: true });

  // --- environment snapshot (no secrets) ---
  const env = captureEnvironment({
    network: network.name, chainId, rpcUrl: mode==="local" ? "local://hardhat" : (process.env.ZKSYNC_RPC||""),
    contractAddress: addr,
    contractSourcePath: path.join(process.cwd(),"contracts","NFTCowCert_v2.sol"),
    runnerPath: __filename,
    ethersVersion: (ethers as any).version ?? null,
  });
  fs.writeFileSync(path.join(expDir,"environment.json"), JSON.stringify(env,null,2));
  fs.writeFileSync(path.join(expDir,"experiment_config.json"), JSON.stringify(
    { experiment_id, mode, op, Ns, concurrencyLevels: concs, retry: RETRY, seedNote:"deterministic cowIds" }, null, 2));

  // Crash-safe incremental sinks (append). If the run dies mid-way, evidence already written survives.
  const attemptsJsonl = path.join(expDir, "raw", "attempts.jsonl");
  const batchesJsonl = path.join(expDir, "batches", "batches.jsonl");
  const sink = new AttemptSink(attemptsJsonl);
  const alreadyDone = completedRuns(batchesJsonl);   // resume support
  const RECEIPT_TIMEOUT_MS = parseInt(process.env.BENCH_RECEIPT_TIMEOUT_MS || "120000", 10);

  for (const N of Ns) {
    for (const conc of concs) {
      const run_id = `${op}_N${N}_c${conc}_r${repeatIndex}`;
      if (alreadyDone.has(run_id)) { console.log(`skip ${run_id} (already completed)`); continue; }

      // For non-mint operations we first SETUP N tokens (minted sequentially; NOT measured),
      // so the measured operation acts on real, existing tokens.
      const targetTokenIds: string[] = [];
      if (op !== "mint") {
        // ---- resumable setup with atomic checkpoint (STEP 7B.1) ----
        const ckptFile = checkpointPath(expDir, experiment_id, run_id);
        let cp: SetupCheckpoint;
        try {
          const loaded = loadCheckpoint(ckptFile, { experiment_id, run_id, chain_id: chainId,
            contract_address: addr, wallet_address: admin.address, operation: op as any, N });
          cp = loaded ?? freshCheckpoint({ experiment_id, run_id, repeat_index: repeatIndex, network: network.name,
            chain_id: chainId, contract_address: addr, wallet_address: admin.address,
            operation: op as any, N, concurrency: conc, setup_phase: "mint", expected_setup_count: N,
            runner_version: RUNNER_VERSION, runner_hash: RUNNER_HASH });
        } catch (e:any) {
          throw new Error(`checkpoint load failed for ${run_id}: ${e?.code || e?.message}`);
        }
        // 1) MINT setup — resume from next_setup_index
        console.log(`  [setup] mint for ${op}: resuming at ${cp.next_setup_index}/${N}`);
        for (let i = cp.next_setup_index; i < N; i++) {
          const cowId = `SETUP-${run_id}-${i}`;
          const cowHash = ethers.keccak256(ethers.toUtf8Bytes(cowId));
          const tx = await c.issueCert(admin.address, `bafkreisetup${i}`, cowId, cowHash);
          const rcpt = await withTimeout(tx.wait(), RECEIPT_TIMEOUT_MS, `setup ${run_id}#${i}`);
          let tid: string | null = null;
          for (const log of rcpt!.logs ?? []) {
            try { const p = c.interface.parseLog(log as any);
              if (p?.name==="Transfer" && String(p.args.from).toLowerCase()===ethers.ZeroAddress.toLowerCase()) tid = p.args.tokenId.toString();
            } catch {}
          }
          if (tid) { cp.token_ids.push(tid); cp.setup_tx_hashes.push(tx.hash); cp.block_numbers.push(rcpt!.blockNumber ?? 0); }
          cp.completed_setup_count++; cp.next_setup_index = i + 1;
          saveCheckpoint(ckptFile, cp);   // atomic checkpoint per item
        }
        // 2) PRE-BLOCK setup for unblock — resume by tokens not yet pre-blocked
        if (op === "unblock") {
          cp.setup_phase = "block"; saveCheckpoint(ckptFile, cp);
          const remaining = cp.token_ids.filter(t => !cp.preblocked_token_ids.includes(t));
          console.log(`  [setup] pre-block for unblock: ${cp.preblocked_token_ids.length}/${cp.token_ids.length} done, ${remaining.length} remaining`);
          for (const tid of remaining) {
            const tx = await c.blockCert(tid); await withTimeout(tx.wait(), RECEIPT_TIMEOUT_MS, `preblock ${tid}`);
            cp.preblocked_token_ids.push(tid); saveCheckpoint(ckptFile, cp);
          }
        }
        targetTokenIds.push(...cp.token_ids);
        // 3) VERIFY preconditions against AUTHORITATIVE chain state before measuring
        const chainView: ChainView = {
          ownerOf: async (t) => { try { return String(await (c as any).ownerOf(t)).toLowerCase(); } catch { return null; } },
          isBlocked: async (t) => { try { return await (c as any).isCertBlocked(t); } catch { return null; } },
        };
        const vres = await verifyTokens(chainView, preconditionExpectations(op as any, targetTokenIds, admin.address));
        if (!vres.ok) {
          console.error(`PRECONDITION FAIL for ${run_id}: ${vres.mismatches.slice(0,5).map(m=>m.tokenId+":"+m.reason).join(", ")}`);
          throw new Error(`CHECKPOINT_STATE_MISMATCH: preconditions not satisfied for ${run_id} (measured phase not started)`);
        }
        cp.setup_phase = "done"; cp.setup_status = "COMPLETE"; saveCheckpoint(ckptFile, cp);
        console.log(`  [setup] verified ${vres.verified}/${targetTokenIds.length} tokens; measured phase may start`);
      }

      // reserve a contiguous nonce block for the admin signer (measured phase)
      const startNonce = await ethers.provider.getTransactionCount(admin.address, "pending");

      const cfg: RunConfig = {
        experiment_id, run_id, repeat_index: repeatIndex,
        network: network.name, chain_id: chainId, rpc_provider: env.rpc_provider_host,
        operation: op, N, concurrency: conc, retry: RETRY,
      };

      const submit: SubmitFn = async (i, nonce) => {
        let tx: any;
        if (op === "mint") {
          const cowId = `PILOT-${run_id}-${i}`;
          const cowHash = ethers.keccak256(ethers.toUtf8Bytes(cowId));
          tx = await c.issueCert(admin.address, `bafkreipilot${i}`, cowId, cowHash, { nonce });
        } else if (op === "transfer") {
          // disambiguate ERC-721 overloads (3-arg vs 4-arg) — ethers v6 requires explicit signature
          tx = await c["safeTransferFrom(address,address,uint256)"](admin.address, transferTo, targetTokenIds[i], { nonce });
        } else if (op === "block") {
          tx = await c.blockCert(targetTokenIds[i], { nonce });
        } else { // unblock
          tx = await c.unblockCert(targetTokenIds[i], { nonce });
        }
        // receipt timeout: if the node hangs, abandon and record RECEIPT_TIMEOUT, then move on
        const rcpt = await withTimeout(tx.wait(), RECEIPT_TIMEOUT_MS, `wait ${run_id}#${i}`);
        let tokenId: string | null = op === "mint" ? null : (targetTokenIds[i] ?? null);
        for (const log of rcpt!.logs ?? []) {
          try { const p = c.interface.parseLog(log as any);
            if (p?.name==="Transfer" && String(p.args.from).toLowerCase()===ethers.ZeroAddress.toLowerCase())
              tokenId = p.args.tokenId.toString();
          } catch {}
        }
        return {
          tx_hash: tx.hash,
          gas_used: rcpt!.gasUsed?.toString() ?? null,
          effective_gas_price: (rcpt as any).gasPrice?.toString?.() ?? null,
          transaction_cost_native: null,
          block_number: rcpt!.blockNumber ?? null,
          token_id: tokenId,
        };
      };

      try {
        // onAttempt persists each attempt immediately (crash-safe)
        const { attempts, batch } = await runBatch(cfg, startNonce, submit, (r) => sink.write(r));
        appendBatch(batchesJsonl, batch);   // mark run complete (enables resume/skip)
        console.log(`${run_id}: attempts=${attempts.length} success=${batch.final_success} fail=${batch.final_failure} dur=${batch.batch_duration_ms.toFixed(0)}ms tps=${batch.tps_completed.toFixed(2)}`);
      } catch (e: any) {
        // one run failing must not kill the whole experiment
        console.error(`run ${run_id} errored (continuing): ${String(e?.message || e).slice(0,160)}`);
      }
    }
  }

  await sink.close();

  // --- raw is the append-only JSONL written incrementally (source of truth). ---
  // Read it back (includes any resumed runs) and derive CSV WITHOUT overwriting the JSONL.
  const rawAll: AttemptRecord[] = fs.readFileSync(attemptsJsonl, "utf-8")
    .split("\n").filter(l => l.trim()).map(l => JSON.parse(l));
  const attemptHeaders = Object.keys(rawAll[0] || {"experiment_id":1});
  writeCsv(path.join(expDir,"raw","attempts.csv"), rawAll as any, attemptHeaders);

  // batches: read from the append-only batches.jsonl (includes resumed runs)
  const batchesAll: BatchRecord[] = fs.readFileSync(batchesJsonl, "utf-8")
    .split("\n").filter(l => l.trim()).map(l => JSON.parse(l));

  const batchHeaders = Object.keys(batchesAll[0] || {"experiment_id":1});
  writeCsv(path.join(expDir,"batches","batches.csv"), batchesAll as any, batchHeaders);

  // --- summary (latency per successful attempt, per run) ---
  const summaries = batchesAll.map(b => {
    const lat = rawAll.filter(a=>a.run_id===b.run_id && a.status==="success" && a.latency_ms!=null).map(a=>a.latency_ms as number);
    const s = summarize(lat);
    return { run_id: b.run_id, N: b.N, concurrency: b.concurrency,
      final_success: b.final_success, final_failure: b.final_failure,
      first_attempt_success: b.first_attempt_success, total_retry_attempts: b.total_retry_attempts,
      batch_duration_ms: Math.round(b.batch_duration_ms), tps_completed: Number(b.tps_completed.toFixed(3)),
      latency_median_ms: s.median, latency_p95_ms: s.p95, latency_iqr_ms: s.iqr, latency_max_ms: s.max };
  });
  writeCsv(path.join(expDir,"summary","summary.csv"), summaries as any, Object.keys(summaries[0]||{"run_id":1}));
  fs.writeFileSync(path.join(expDir,"summary","summary.json"), JSON.stringify(summaries,null,2));

  console.log(`\nArtifacts -> ${expDir}`);
}

main().catch((e)=>{ console.error(e); process.exit(1); });
