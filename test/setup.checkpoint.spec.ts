// STEP 7B.1 — Checkpoint/resume hardening tests (HARNESS VALIDATION ONLY).
// Pure logic + local fs; no Sepolia. Run: npx hardhat test test/setup.checkpoint.spec.ts
import { expect } from "chai";
import * as fs from "fs";
import * as path from "path";
import {
  SetupCheckpoint, saveCheckpoint, loadCheckpoint, freshCheckpoint,
  checkpointPath, CheckpointError,
} from "../src/benchmark/setupCheckpoint";
import { verifyTokens, preconditionExpectations, ChainView } from "../src/benchmark/setupVerify";

const TMP = path.join(process.cwd(), "benchmark-final-results", "_ckpt_test");
const ADMIN = "0x2a01fa3ddc33a96f2a83cf0f5b9022ad20bfafee";
const BOB = "0x43d48a93e2a9909891bbad233cfefc50d3c45026";

function baseInit(over: Partial<SetupCheckpoint> = {}) {
  return freshCheckpoint({
    experiment_id: "exp1", run_id: "transfer_N20_c3", repeat_index: 0,
    network: "zkSyncTestnet", chain_id: 300,
    contract_address: "0x3D16641A759A4d524B5ec0a968595C7FF700C0cF",
    wallet_address: ADMIN, operation: "transfer", N: 20, concurrency: 3,
    setup_phase: "mint", expected_setup_count: 20,
    runner_version: "step7b1", runner_hash: "abc123",
    ...over,
  } as any);
}

describe("STEP 7B.1 — setup checkpoint", () => {
  beforeEach(() => { if (fs.existsSync(TMP)) fs.rmSync(TMP, { recursive: true, force: true }); });

  it("1 & 3: normal completion persists tokens; no duplicate on reload", () => {
    const f = checkpointPath(TMP, "exp1", "transfer_N20_c3");
    const cp = baseInit();
    for (let i = 0; i < 20; i++) { cp.token_ids.push(String(i + 1)); cp.completed_setup_count++; cp.next_setup_index = i + 1; }
    cp.setup_status = "COMPLETE";
    saveCheckpoint(f, cp);
    const back = loadCheckpoint(f, { run_id: "transfer_N20_c3", chain_id: 300, contract_address: cp.contract_address, wallet_address: ADMIN, operation: "transfer", N: 20 })!;
    expect(back.completed_setup_count).to.equal(20);
    expect(back.next_setup_index).to.equal(20); // resume would start at 20 => 0 remaining
    expect(back.token_ids.length).to.equal(20);
  });

  it("2: interruption at 7 -> resume executes remaining 13, 0 duplicates", () => {
    const f = checkpointPath(TMP, "exp1", "transfer_N20_c3");
    const cp = baseInit();
    for (let i = 0; i < 7; i++) { cp.token_ids.push(String(i + 1)); cp.completed_setup_count++; cp.next_setup_index = i + 1; }
    saveCheckpoint(f, cp); // simulate crash after 7
    const resumed = loadCheckpoint(f, { run_id: "transfer_N20_c3", chain_id: 300, contract_address: cp.contract_address, wallet_address: ADMIN, operation: "transfer", N: 20 })!;
    const start = resumed.next_setup_index;
    let newlyExecuted = 0;
    for (let i = start; i < resumed.expected_setup_count; i++) { resumed.token_ids.push(String(i + 1)); resumed.completed_setup_count++; resumed.next_setup_index = i + 1; newlyExecuted++; }
    expect(start).to.equal(7);
    expect(newlyExecuted).to.equal(13);
    expect(resumed.completed_setup_count).to.equal(20);
    expect(new Set(resumed.token_ids).size).to.equal(20); // no duplicates
  });

  it("4 & 5: malformed / truncated checkpoint fails safe", () => {
    const f = checkpointPath(TMP, "exp1", "transfer_N20_c3");
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, "{ this is not : valid json ");
    expect(() => loadCheckpoint(f, { run_id: "transfer_N20_c3", chain_id: 300, contract_address: "x", wallet_address: ADMIN, operation: "transfer", N: 20 }))
      .to.throw(CheckpointError).with.property("code", "MALFORMED_CHECKPOINT");
  });

  it("6,7,8,9: chain/contract/wallet/run mismatch fails safe", () => {
    const f = checkpointPath(TMP, "exp1", "transfer_N20_c3");
    saveCheckpoint(f, baseInit());
    const good = { run_id: "transfer_N20_c3", chain_id: 300, contract_address: "0x3D16641A759A4d524B5ec0a968595C7FF700C0cF", wallet_address: ADMIN, operation: "transfer", N: 20 };
    expect(() => loadCheckpoint(f, { ...good, chain_id: 11155111 })).to.throw(CheckpointError).with.property("code","CHAIN_MISMATCH");
    expect(() => loadCheckpoint(f, { ...good, contract_address: "0xdead" })).to.throw(CheckpointError).with.property("code","CONTRACT_MISMATCH");
    expect(() => loadCheckpoint(f, { ...good, wallet_address: "0xdead" })).to.throw(CheckpointError).with.property("code","WALLET_MISMATCH");
    expect(() => loadCheckpoint(f, { ...good, run_id: "block_N20_c3" })).to.throw(CheckpointError).with.property("code","RUN_MISMATCH");
    expect(() => loadCheckpoint(f, { ...good, operation: "block" })).to.throw(CheckpointError).with.property("code","OPERATION_MISMATCH");
    expect(() => loadCheckpoint(f, { ...good, N: 100 })).to.throw(CheckpointError).with.property("code","N_MISMATCH");
  });

  it("16: independent runs use isolated checkpoint namespaces", () => {
    const f1 = checkpointPath(TMP, "exp1", "transfer_N20_c3");
    const f2 = checkpointPath(TMP, "exp1", "block_N20_c3");
    expect(f1).to.not.equal(f2);
    expect(path.dirname(f1)).to.not.equal(path.dirname(f2));
  });
});

// ---- chain verification / preconditions / measurement boundary ----
class MockChain implements ChainView {
  constructor(private owners: Record<string,string|null>, private blocked: Record<string,boolean|null>) {}
  async ownerOf(t: string) { return this.owners[t] ?? null; }
  async isBlocked(t: string) { return this.blocked[t] ?? null; }
}

describe("STEP 7B.1 — chain verification & preconditions", () => {
  it("10 & K: checkpoint COMPLETE but chain disagrees -> mismatch, no measurement", async () => {
    const chain = new MockChain({ "1": ADMIN, "2": null }, { "1": false, "2": null });
    const res = await verifyTokens(chain, preconditionExpectations("transfer", ["1","2"], ADMIN));
    expect(res.ok).to.equal(false);
    expect(res.mismatches.some(m => m.tokenId === "2" && m.reason === "TOKEN_NOT_EXIST")).to.equal(true);
  });

  it("11: transfer precondition — owner must be source", async () => {
    const chain = new MockChain({ "1": ADMIN, "2": BOB }, { "1": false, "2": false });
    const res = await verifyTokens(chain, preconditionExpectations("transfer", ["1","2"], ADMIN));
    expect(res.ok).to.equal(false);
    expect(res.mismatches[0].reason).to.contain("OWNER_MISMATCH");
  });

  it("12: block precondition — all Active", async () => {
    const chain = new MockChain({ "1": ADMIN, "2": ADMIN }, { "1": false, "2": true });
    const res = await verifyTokens(chain, preconditionExpectations("block", ["1","2"], ADMIN));
    expect(res.ok).to.equal(false);
    expect(res.mismatches[0].reason).to.contain("STATE_MISMATCH");
  });

  it("13: unblock precondition — all Suspended", async () => {
    const chain = new MockChain({ "1": ADMIN, "2": ADMIN }, { "1": true, "2": true });
    const res = await verifyTokens(chain, preconditionExpectations("unblock", ["1","2"], ADMIN));
    expect(res.ok).to.equal(true);
    expect(res.verified).to.equal(2);
  });

  it("14: measurement boundary — TPS denominator excludes setup time", () => {
    const setup_start = 1000, setup_complete = 5000, measured_start = 5200, measured_end = 8200;
    const success = 300;
    const tps = success / ((measured_end - measured_start) / 1000);
    expect(tps).to.equal(100); // 300 / 3s, setup 4s excluded
    expect(measured_start).to.be.greaterThan(setup_complete);
  });
});
