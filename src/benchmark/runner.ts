// STEP 7 — Core benchmark runner (network-agnostic; caller injects a contract + signer).
// Real bounded concurrency + single-admin nonce management + full attempt accounting.
// Writes nothing itself; returns records so the CLI decides output paths (raw immutability).

import { performance } from "perf_hooks";
import { AttemptRecord, BatchRecord, OperationType, RetryPolicy } from "./types";
import { runBounded, NonceManager } from "./concurrency";
import { classifyError, isRetryable, sanitizeError } from "./errorTaxonomy";
import { tpsCompleted } from "./stats";

export interface RunConfig {
  experiment_id: string;
  run_id: string;
  repeat_index: number;
  network: string;
  chain_id: number | null;
  rpc_provider: string;      // host only
  operation: OperationType;
  N: number;
  concurrency: number;
  retry: RetryPolicy;
}

// The caller supplies a function that submits ONE logical operation given a reserved nonce,
// and returns receipt-ish fields. This keeps runner independent of ethers/network specifics.
export interface SubmitResult {
  tx_hash: string | null;
  gas_used: string | null;
  effective_gas_price: string | null;
  transaction_cost_native: string | null;
  block_number: number | null;
  token_id: string | null;
}
export type SubmitFn = (index: number, nonce: number) => Promise<SubmitResult>;

export interface RunOutput {
  attempts: AttemptRecord[];
  batch: BatchRecord;
}

// onAttempt is called the moment each attempt finishes (crash-safe incremental persistence).
export async function runBatch(
  cfg: RunConfig,
  startNonce: number,
  submit: SubmitFn,
  onAttempt?: (rec: AttemptRecord) => void
): Promise<RunOutput> {
  const attempts: AttemptRecord[] = [];
  const nonces = new NonceManager(startNonce);

  let first_attempt_success = 0;
  let operations_requiring_retry = 0;
  let total_retry_attempts = 0;
  let final_success = 0;
  let final_failure = 0;

  const indices = Array.from({ length: cfg.N }, (_, i) => i);
  const batch_start = performance.now();

  await runBounded(indices, cfg.concurrency, async (i) => {
    let attemptNo = 0;
    let retryCount = 0;
    let done = false;
    while (!done) {
      attemptNo++;
      const nonce = nonces.next();
      const submit_time = performance.now();
      try {
        const r = await submit(i, nonce);
        const receipt_time = performance.now();
        const okRec = rec(cfg, i, attemptNo, retryCount, "success", {
          tx_hash: r.tx_hash, submit_time, receipt_time,
          gas_used: r.gas_used, effective_gas_price: r.effective_gas_price,
          transaction_cost_native: r.transaction_cost_native, block_number: r.block_number,
          token_id: r.token_id, error_type: null, error_message: null,
        });
        attempts.push(okRec);
        if (onAttempt) onAttempt(okRec);
        if (attemptNo === 1) first_attempt_success++; else operations_requiring_retry++;
        final_success++;
        done = true;
      } catch (err: any) {
        const receipt_time = performance.now();
        const et = classifyError(err);
        const failRec = rec(cfg, i, attemptNo, retryCount, "failed", {
          tx_hash: null, submit_time, receipt_time,
          gas_used: null, effective_gas_price: null, transaction_cost_native: null,
          block_number: null, token_id: null,
          error_type: et, error_message: sanitizeError(String(err?.message || err)),
        });
        attempts.push(failRec);
        if (onAttempt) onAttempt(failRec);
        if (isRetryable(et) && retryCount < cfg.retry.max_retries) {
          retryCount++; total_retry_attempts++;
          if (cfg.retry.backoff !== "none") {
            const wait = cfg.retry.backoff === "exponential"
              ? cfg.retry.backoff_base_ms * 2 ** (retryCount - 1)
              : cfg.retry.backoff_base_ms;
            await new Promise((res) => setTimeout(res, wait));
          }
        } else {
          final_failure++;
          done = true;
        }
      }
    }
    return null;
  });

  const batch_end = performance.now();
  const batch_duration_ms = batch_end - batch_start;

  const batch: BatchRecord = {
    experiment_id: cfg.experiment_id, run_id: cfg.run_id, repeat_index: cfg.repeat_index,
    network: cfg.network, chain_id: cfg.chain_id, operation: cfg.operation,
    N: cfg.N, concurrency: cfg.concurrency,
    batch_start_ms: batch_start, batch_end_ms: batch_end, batch_duration_ms,
    attempted_logical_operations: cfg.N,
    first_attempt_success, operations_requiring_retry,
    total_retry_attempts, final_success, final_failure,
    tps_completed: tpsCompleted(final_success, batch_duration_ms),
  };
  return { attempts, batch };
}

function rec(cfg: RunConfig, i: number, attemptNo: number, retryCount: number,
  status: "success" | "failed", x: Partial<AttemptRecord>): AttemptRecord {
  const latency = (x.submit_time != null && x.receipt_time != null)
    ? (x.receipt_time as number) - (x.submit_time as number) : null;
  return {
    experiment_id: cfg.experiment_id, run_id: cfg.run_id, repeat_index: cfg.repeat_index,
    timestamp_utc: new Date().toISOString(),
    network: cfg.network, chain_id: cfg.chain_id, rpc_provider: cfg.rpc_provider,
    operation: cfg.operation, N: cfg.N, concurrency: cfg.concurrency,
    token_id: x.token_id ?? null, tx_hash: x.tx_hash ?? null,
    submit_time_ms: x.submit_time ?? null, receipt_time_ms: x.receipt_time ?? null, latency_ms: latency,
    gas_used: x.gas_used ?? null, effective_gas_price: x.effective_gas_price ?? null,
    transaction_cost_native: x.transaction_cost_native ?? null,
    status, attempt_number: attemptNo, retry_count: retryCount,
    error_type: x.error_type ?? null, error_message: x.error_message ?? null,
    block_number: x.block_number ?? null,
  };
}
