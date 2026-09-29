// STEP 7B.1 — Resumable setup checkpoint (atomic, crash-safe, chain-verified).
// Applies to SETUP transactions only (mint-for-transfer, mint-for-block,
// mint+block-for-unblock). Measured operations are NOT resumable here.
// Never persists secrets (no PRIVATE_KEY / RPC key / .env).

import * as fs from "fs";
import * as path from "path";

export interface SetupCheckpoint {
  experiment_id: string;
  run_id: string;
  repeat_index: number;

  network: string;
  chain_id: number;
  contract_address: string;
  wallet_address: string;

  operation: "transfer" | "block" | "unblock";
  N: number;
  concurrency: number;

  setup_phase: "mint" | "block" | "done";
  expected_setup_count: number;
  completed_setup_count: number;
  next_setup_index: number;

  token_ids: string[];
  setup_tx_hashes: string[];
  block_numbers: number[];

  // for unblock: which token_ids have been pre-blocked
  preblocked_token_ids: string[];

  runner_version: string;
  runner_hash: string;

  checkpoint_created_at: string;
  checkpoint_updated_at: string;
  setup_status: "IN_PROGRESS" | "COMPLETE";
}

export function checkpointPath(root: string, experiment_id: string, run_id: string): string {
  return path.join(root, "checkpoints", experiment_id, run_id, "setup_checkpoint.json");
}

/** Atomic write: tmp -> fsync -> rename. A partial file is never accepted. */
export function saveCheckpoint(file: string, cp: SetupCheckpoint): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  cp.checkpoint_updated_at = new Date().toISOString();
  const tmp = file + ".tmp";
  const fd = fs.openSync(tmp, "w");
  try {
    fs.writeSync(fd, JSON.stringify(cp, null, 2));
    try { fs.fsyncSync(fd); } catch { /* fsync best-effort */ }
  } finally {
    fs.closeSync(fd);
  }
  fs.renameSync(tmp, file); // atomic on same filesystem
}

export class CheckpointError extends Error {
  constructor(public code: string, msg: string) { super(msg); }
}

/** Load + validate a checkpoint against the expected run identity. Fails safe. */
export function loadCheckpoint(
  file: string,
  expect: {
    experiment_id?: string; run_id: string; chain_id: number;
    contract_address: string; wallet_address: string;
    operation: string; N: number;
  }
): SetupCheckpoint | null {
  if (!fs.existsSync(file)) return null;
  let raw: string;
  try { raw = fs.readFileSync(file, "utf-8"); } catch { return null; }
  let cp: SetupCheckpoint;
  try { cp = JSON.parse(raw); } catch {
    throw new CheckpointError("MALFORMED_CHECKPOINT", "checkpoint JSON is malformed/truncated");
  }
  // required fields present?
  for (const k of ["run_id","chain_id","contract_address","wallet_address","operation","N","token_ids"]) {
    if ((cp as any)[k] === undefined) throw new CheckpointError("MALFORMED_CHECKPOINT", `missing field ${k}`);
  }
  // identity checks — fail safe on any mismatch
  const norm = (s: string) => String(s || "").toLowerCase();
  if (cp.run_id !== expect.run_id) throw new CheckpointError("RUN_MISMATCH", `run_id ${cp.run_id} != ${expect.run_id}`);
  if (Number(cp.chain_id) !== Number(expect.chain_id)) throw new CheckpointError("CHAIN_MISMATCH", `chain ${cp.chain_id} != ${expect.chain_id}`);
  if (norm(cp.contract_address) !== norm(expect.contract_address)) throw new CheckpointError("CONTRACT_MISMATCH", "contract mismatch");
  if (norm(cp.wallet_address) !== norm(expect.wallet_address)) throw new CheckpointError("WALLET_MISMATCH", "wallet mismatch");
  if (cp.operation !== expect.operation) throw new CheckpointError("OPERATION_MISMATCH", `op ${cp.operation} != ${expect.operation}`);
  if (Number(cp.N) !== Number(expect.N)) throw new CheckpointError("N_MISMATCH", `N ${cp.N} != ${expect.N}`);
  return cp;
}

export function freshCheckpoint(init: Omit<SetupCheckpoint,
  "token_ids"|"setup_tx_hashes"|"block_numbers"|"preblocked_token_ids"|"completed_setup_count"|"next_setup_index"|"setup_status"|"checkpoint_created_at"|"checkpoint_updated_at">
): SetupCheckpoint {
  const now = new Date().toISOString();
  return {
    ...init,
    token_ids: [], setup_tx_hashes: [], block_numbers: [], preblocked_token_ids: [],
    completed_setup_count: 0, next_setup_index: 0,
    setup_status: "IN_PROGRESS",
    checkpoint_created_at: now, checkpoint_updated_at: now,
  };
}
