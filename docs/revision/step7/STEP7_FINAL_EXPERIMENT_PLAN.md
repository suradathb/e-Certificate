# STEP 7 — FINAL EXPERIMENT PLAN (PRE-REGISTRATION / FREEZE)

> This document is frozen BEFORE the final runs. It contains NO results.
> Any deviation during execution must be recorded as an amendment with justification.
> Final concurrency and repeat count are provisional here and are CONFIRMED only after the
> live micro-pilot (STEP7_PILOT_DECISION.md) — this plan will be amended with the confirmed
> values before the final experiment is executed.

## Networks (exact)
- **zkSync Era Sepolia** — chain_id 300 (verify from RPC at runtime). RPC host from `.env` (`ZKSYNC_RPC` / `ZKSYNC_RPC_ALCHEMY`).
- **Ethereum Sepolia (L1 baseline)** — chain_id 11155111. RPC host from `.env` (`ETH_RPC`).
- Chain IDs are verified from the RPC at runtime; the `.env` network label alone is not trusted.

## Operations (match implementation)
- mint (`issueCert`, onlyAdmin) — primary.
- transfer (`safeTransferFrom`).
- block (`blockCert`, onlyAdmin), unblock (`unblockCert`, onlyAdmin).
- fetch — read-only; measured separately (read schema); never assigned tx_hash/gas.

## Workload sizes
- N ∈ {100, 500, 1000} per operation (matching the manuscript's evaluated scales).

## Concurrency
- Single admin signer with pre-reserved sequential nonces (NonceManager) for onlyAdmin ops.
- Concurrency level: **CONFIRM from live micro-pilot** (provisional 3 on public zkSync RPC).
- Record configured concurrency and max observed in-flight (OverlapTracker) to prove real overlap.

## Repeated batches
- **CONFIRM from live micro-pilot** (provisional 5 repeats per (network, operation, N)).
- repeat_index recorded on every attempt/batch record.

## Retry policy (frozen)
- max_retries = 3; backoff = exponential, base 250 ms.
- retryable: RPC_TIMEOUT, RPC_RATE_LIMIT, RPC_CONNECTION, NONCE_ERROR, REPLACEMENT_ERROR, RECEIPT_TIMEOUT.
- non-retryable: INSUFFICIENT_FUNDS, GAS_ESTIMATION, CONTRACT_REVERT, UNKNOWN.
- Every attempt (including failures that later succeed on retry) is recorded; nothing overwritten.

## Timing definitions (frozen)
- submit_time: monotonic `performance.now()` immediately before RPC submission.
- receipt_time: monotonic `performance.now()` when the receipt is available to the client.
- latency_ms = receipt_time − submit_time. Block timestamps are NOT used for client latency.

## TPS definition (frozen)
- TPS_completed = final_success / (batch_duration_ms / 1000).
- Never computed from median latency. Submission rate, if reported, is labeled separately and never called "confirmed TPS".

## Gas / cost (frozen)
- Record measured `gasUsed` and `effectiveGasPrice` (where exposed) per receipt.
- Any USD figure is a **scenario-based estimate**: store price value, source, timestamp, and label as assumption. Do NOT silently reuse 25/0.25 Gwei or \$3,200 ETH unless explicitly recorded as a normalization assumption.

## Outlier / exclusion handling (frozen)
- No silent exclusion. All attempts retained in raw data.
- If any exclusion is applied in analysis, it is defined here before runs: none pre-specified; report with and without any post-hoc exclusion if introduced.

## Statistical summaries (frozen)
- Per (network, operation, N): count, mean, std, median, Q1, Q3, IQR, P95, max of successful-attempt latency.
- Reliability: attempted, first_attempt_success, operations_requiring_retry, total_retry_attempts, final_success, final_failure.

## Confidence interval methodology (frozen)
- Statistic: mean latency (and, separately, batch-level TPS).
- Resampling unit: **batch** for between-run variability (avoid pseudo-replication by not treating all transactions across batches as independent); transaction-level CI reported only within a single batch.
- Method: percentile bootstrap; resamples = 10,000; seed = 20260927 (fixed).
- Report batch-level mean ± CI where repeats ≥ 3.

## Random seeds
- Deterministic cowId/token generation per run_id.
- Bootstrap seed fixed (20260927).

## Expected output paths
```
benchmark-final-results/experiment_<id>/
  environment.json, experiment_config.json
  raw/attempts.csv, raw/attempts.jsonl, raw/reads.csv
  batches/batches.csv
  summary/summary.csv, summary/summary.json
```
- A SHA-256 manifest is generated for completed experiment artifacts.
- Never written under Hardhat's auto-cleaned `artifacts/`.

## Protected / untouched
- STEP 6 replay evidence (`replay-artifacts/`) — not modified.
- Production contract semantics — unchanged (`git diff -- contracts/` must be empty).
- CC.tex / CC.bib / reviewer checklist — not modified in STEP 7A.
