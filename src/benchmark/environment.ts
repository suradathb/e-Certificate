// STEP 7 — Immutable environment snapshot. NEVER stores RPC secrets/keys.
import * as os from "os";
import * as crypto from "crypto";
import * as fs from "fs";
import { EnvironmentSnapshot } from "./types";

/** Extract only the host from an RPC URL (drops path/api-key). */
export function rpcHostOnly(url: string): string {
  try { return new URL(url).host; } catch { return "unknown"; }
}

export function sha256File(path: string): string | null {
  try {
    const buf = fs.readFileSync(path);
    return crypto.createHash("sha256").update(buf).digest("hex");
  } catch { return null; }
}

export function captureEnvironment(params: {
  network: string;
  chainId: number | null;
  rpcUrl: string;
  contractAddress: string;
  contractSourcePath?: string;
  runnerPath?: string;
  git?: { commit: string | null; branch: string | null; dirty: boolean | null };
  ethersVersion?: string | null;
  hardhatVersion?: string | null;
}): EnvironmentSnapshot {
  return {
    timestamp_utc: new Date().toISOString(),
    os: os.platform(),
    os_version: os.release(),
    cpu_model: os.cpus()?.[0]?.model ?? "unknown",
    cpu_count: os.cpus()?.length ?? 0,
    ram_total_bytes: os.totalmem(),
    node_version: process.version,
    ethers_version: params.ethersVersion ?? null,
    hardhat_version: params.hardhatVersion ?? null,
    git_commit: params.git?.commit ?? null,
    git_branch: params.git?.branch ?? null,
    git_dirty: params.git?.dirty ?? null,
    network: params.network,
    chain_id: params.chainId,
    rpc_provider_host: rpcHostOnly(params.rpcUrl),   // host only — no secret
    contract_address: params.contractAddress,
    contract_source_sha256: params.contractSourcePath ? sha256File(params.contractSourcePath) : null,
    runner_sha256: params.runnerPath ? sha256File(params.runnerPath) : null,
  };
}
