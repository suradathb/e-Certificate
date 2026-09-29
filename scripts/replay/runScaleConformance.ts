// STEP 6 — Scale event-replay conformance runner (N = 100/500/1000).
// Deploys the contract on the in-process Hardhat network, generates a DETERMINISTIC
// (seeded) lifecycle workload, collects REAL emitted logs, reconstructs state from
// logs only, queries the contract, compares, and writes machine-readable artifacts.
//
// This is NOT a TPS/performance benchmark. Primary metric = conformance rate.
//
// Run:
//   npx hardhat run scripts/replay/runScaleConformance.ts
//   (defaults to N in {100,500,1000}; override with REPLAY_NS="100,500")

import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import { reconstructFromLogs } from "../../src/replay/reconstructCertificateState";
import { compareState, ContractState } from "../../src/replay/compareContractState";

// ---- deterministic PRNG (mulberry32) ----
function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SEED = 42;
// NOTE: use a dir OUTSIDE Hardhat's "artifacts/" (which hardhat auto-cleans on compile/test).
const OUT_DIR = path.join(process.cwd(), "replay-artifacts");

function cidFor(i: number) { return `bafkreicid${i.toString().padStart(6, "0")}`; }
function cowId(i: number) { return `COW-${i.toString().padStart(6, "0")}`; }

async function contractStateOf(c: any, tokenId: string): Promise<ContractState> {
  try {
    const owner = await c.ownerOf(tokenId);
    const cert = await c.certs(tokenId);
    const isBlocked = await c.isCertBlocked(tokenId);
    return { exists: true, owner: String(owner).toLowerCase(),
             status: isBlocked ? "Suspended" : "Active", metadataCID: String(cert.metadataCID) };
  } catch { return { exists: false, owner: null, status: null, metadataCID: null }; }
}

async function runN(N: number) {
  const rnd = mulberry32(SEED + N);
  const [admin, alice, bob] = await ethers.getSigners();
  const Factory = await ethers.getContractFactory("NFTCowCert");
  const c = await Factory.deploy(admin.address);
  await c.waitForDeployment();
  const addr = await c.getAddress();

  const t0 = Date.now();
  let eventOps = 0;

  // Issue N certificates to alice, then apply a deterministic mix of ops.
  for (let i = 1; i <= N; i++) {
    await (await c.issueCert(alice.address, cidFor(i), cowId(i),
      ethers.keccak256(ethers.toUtf8Bytes(cowId(i))))).wait();
    eventOps++; // CertIssued (+Transfer)

    const r = rnd();
    if (r < 0.4) { // transfer to bob
      await (await c.connect(alice).safeTransferFrom(alice.address, bob.address, i)).wait(); eventOps++;
    }
    const r2 = rnd();
    if (r2 < 0.5) { // suspend
      await (await c.blockCert(i)).wait(); eventOps++;
      if (rnd() < 0.6) { await (await c.unblockCert(i)).wait(); eventOps++; } // maybe reinstate
    }
  }

  // Collect logs and reconstruct (from logs ONLY).
  const logs = await ethers.provider.getLogs({ address: addr, fromBlock: 0, toBlock: "latest" });
  const reconstructed = reconstructFromLogs(logs as any);

  // Compare against contract.
  let matches = 0, mismatches = 0;
  const unreconstructible: string[] = [];
  for (let i = 1; i <= N; i++) {
    const tokenId = String(i);
    const replayed = reconstructed.get(tokenId);
    const cs = await contractStateOf(c, tokenId);
    if (!replayed) { mismatches++; continue; }
    const row = compareState(replayed, cs, { compareMetadata: true });
    if (row.overall) matches++; else mismatches++;
    if (row.metadataMatch === false) unreconstructible.push(`${tokenId}:metadata`);
  }

  const replayTimeMs = Date.now() - t0;
  const result = {
    network: network.name,
    contractAddress: addr,
    blockRange: { fromBlock: 0, toBlock: "latest" },
    certificateCount: N,
    eventCount: logs.length,
    lifecycleOps: eventOps,
    reconstructed: reconstructed.size,
    matchCount: matches,
    mismatchCount: mismatches,
    unreconstructibleFields: unreconstructible,
    conformanceRate: matches / N,
    seed: SEED + N,
    operationDistribution: { transferProb: 0.4, suspendProb: 0.5, reinstateGivenSuspendProb: 0.6 },
    timestamp: new Date().toISOString(),
    versions: { node: process.version, hardhatNetwork: network.name },
    replayTimeMs,
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, `replay_${N}.json`), JSON.stringify(result, null, 2));
  console.log(`N=${N}: events=${logs.length} reconstructed=${reconstructed.size} match=${matches} mismatch=${mismatches} conformance=${(result.conformanceRate*100).toFixed(2)}% time=${replayTimeMs}ms`);
  return result;
}

async function main() {
  const Ns = (process.env.REPLAY_NS || "100,500,1000").split(",").map((s) => parseInt(s.trim(), 10));
  const rows: any[] = [];
  for (const N of Ns) rows.push(await runN(N));

  // summary CSV
  const header = "N,Events,Reconstructed,Matches,Mismatches,ConformanceRate,ReplayTimeMs";
  const lines = rows.map((r) =>
    [r.certificateCount, r.eventCount, r.reconstructed, r.matchCount, r.mismatchCount,
     r.conformanceRate.toFixed(4), r.replayTimeMs].join(","));
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, "replay_summary.csv"), [header, ...lines].join("\n") + "\n");
  console.log("Wrote replay-artifacts/replay_summary.csv");
}

main().catch((e) => { console.error(e); process.exit(1); });
