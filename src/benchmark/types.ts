// STEP 7 — Benchmark schemas (raw attempt, read, batch, environment).
// All fields machine-readable; use null where a field does not apply (never fabricate).

export type OperationType = "mint" | "transfer" | "block" | "unblock";
export type ReadOperationType = "fetch";

export type ErrorType =
  | "RPC_TIMEOUT"
  | "RPC_RATE_LIMIT"
  | "RPC_CONNECTION"
  | "NONCE_ERROR"
  | "REPLACEMENT_ERROR"
  | "INSUFFICIENT_FUNDS"
  | "GAS_ESTIMATION"
  | "CONTRACT_REVERT"
  | "RECEIPT_TIMEOUT"
  | "UNKNOWN";

// One record PER ATTEMPT (a logical op may have multiple attempts).
export interface AttemptRecord {
  experiment_id: string;
  run_id: string;
  repeat_index: number;
  timestamp_utc: string;

  network: string;
  chain_id: number | null;
  rpc_provider: string;      // host only (no secrets)

  operation: OperationType;
  N: number;
  concurrency: number;

  token_id: string | null;

  tx_hash: string | null;

  submit_time_ms: number | null;   // monotonic (performance.now)
  receipt_time_ms: number | null;   // monotonic
  latency_ms: number | null;        // receipt - submit

  gas_used: string | null;
  effective_gas_price: string | null;
  transaction_cost_native: string | null;

  status: "success" | "failed";

  attempt_number: number;    // 1-based
  retry_count: number;       // retries so far for this logical op
  error_type: ErrorType | null;
  error_message: string | null;   // sanitized

  block_number: number | null;
}

// Read observation (fetch) — NOT a transaction.
export interface ReadRecord {
  experiment_id: string;
  run_id: string;
  repeat_index: number;
  timestamp_utc: string;
  network: string;
  chain_id: number | null;
  read_kind: "contract_read" | "rpc_read" | "ipfs_gateway" | "local_cache";
  token_id: string | null;
  latency_ms: number | null;
  status: "success" | "failed";
  error_type: ErrorType | null;
  error_message: string | null;
}

// One record PER BATCH (a run of N ops at a given concurrency).
export interface BatchRecord {
  experiment_id: string;
  run_id: string;
  repeat_index: number;

  network: string;
  chain_id: number | null;
  operation: OperationType;
  N: number;
  concurrency: number;

  batch_start_ms: number;   // monotonic
  batch_end_ms: number;
  batch_duration_ms: number;

  attempted_logical_operations: number;
  first_attempt_success: number;
  operations_requiring_retry: number;
  total_retry_attempts: number;
  final_success: number;
  final_failure: number;

  // TPS computed from an explicit denominator (see stats.ts):
  tps_completed: number;    // final_success / (batch_duration_ms/1000)
}

export interface EnvironmentSnapshot {
  timestamp_utc: string;
  os: string;
  os_version: string;
  cpu_model: string;
  cpu_count: number;
  ram_total_bytes: number;
  node_version: string;
  ethers_version: string | null;
  hardhat_version: string | null;
  git_commit: string | null;
  git_branch: string | null;
  git_dirty: boolean | null;
  network: string;
  chain_id: number | null;
  rpc_provider_host: string;   // host only, NEVER full URL with key
  contract_address: string;
  contract_source_sha256: string | null;
  runner_sha256: string | null;
}

export interface RetryPolicy {
  max_retries: number;
  backoff: "none" | "fixed" | "exponential";
  backoff_base_ms: number;
  retryable: ErrorType[];
  non_retryable: ErrorType[];
}
