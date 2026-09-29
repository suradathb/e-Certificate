# STEP 7 — PILOT DECISION

> Evidence from an executed pilot. Local (in-process Hardhat) dry-run only — this establishes
> that the harness works and concurrency/nonce accounting is correct. It is NOT a substitute
> for live-network feasibility; latency/TPS numbers below are local and not reportable.

## Pilot configurations actually executed
- Mode: local (in-process Hardhat, chain_id 31337), operation = mint (onlyAdmin, gas-paying path).
- Matrix: N ∈ {5, 10} × concurrency ∈ {1, 2, 4} = 6 runs.
- Single admin signer with pre-reserved sequential nonces (NonceManager).
- Unit tests: 11/11 passing. Harness core logic (stats/TPS/nonce/concurrency/redaction): 14/14 (Node smoke test).

## Observed pilot results (local)
| run | N | conc | success | fail | first-attempt | retries | dur(ms) | TPS(local) | median lat(ms) | P95(ms) |
|-----|---|------|---------|------|---------------|---------|---------|------------|----------------|---------|
| mint_N5_c1  | 5  | 1 | 5  | 0 | 5  | 0 | 17 | 300.3 | 2.56 | 5.50 |
| mint_N5_c2  | 5  | 2 | 5  | 0 | 5  | 0 | 11 | 471.2 | 3.95 | 4.79 |
| mint_N5_c4  | 5  | 4 | 5  | 0 | 5  | 0 | 12 | 405.2 | 7.06 | 7.88 |
| mint_N10_c1 | 10 | 1 | 10 | 0 | 10 | 0 | 22 | 461.4 | 2.11 | 2.49 |
| mint_N10_c2 | 10 | 2 | 10 | 0 | 10 | 0 | 20 | 501.6 | 3.41 | 5.50 |
| mint_N10_c4 | 10 | 4 | 10 | 0 | 10 | 0 | 18 | 547.6 | 6.41 | 8.30 |

## Observations
- **Failures/retries:** 0 across all runs. Nonce management under concurrency works (no NONCE_ERROR).
- **RPC limitations:** none observed — but local has NO rate limits; this does not validate live-network behavior.
- **Nonce behavior:** sequential reservation from one admin signer succeeded at concurrency up to 4.
- **Variance:** local durations are 11–22 ms and TPS is dominated by in-process execution, not network. TPS is NOT monotonic in concurrency here because there is no network latency to amortize → **local TPS is not meaningful for the paper.**
- **Estimated final runtime / faucet:** cannot be estimated from local; must come from a small LIVE pilot (below).

## Decision
1. **Harness is validated functionally** (schemas, concurrency, nonce, retry accounting, stats, secret redaction, immutable raw output).
2. **A live micro-pilot is required** before choosing final concurrency and repeat count. Local cannot answer RPC rate-limit / real-latency / faucet questions.
3. Recommended **live micro-pilot** (small, low gas):
   - Network: zkSync Era Sepolia first (cheaper/faster than L1), operation = mint.
   - Matrix: N=5 × concurrency ∈ {1, 2, 3}; then N=20 × best-looking concurrency.
   - Purpose: measure real submit→receipt latency, observe rate-limit/nonce behavior, estimate per-tx gas, extrapolate runtime + faucet needs for N=100/500/1000.

## Provisional recommendation (to be confirmed by live micro-pilot)
- **Concurrency:** start at **3** for zkSync Era Sepolia (public RPC is rate-limited; low concurrency reduces 429s). Adjust from live pilot.
- **Repeated batches:** provisional **5 repeats** per (operation, N) for batch-level variability — justified only after the live micro-pilot confirms stability and runtime budget. Do NOT finalize yet.

## Justification
The number of repeats and concurrency must be driven by live RPC stability and gas budget, which the local pilot cannot observe. The local pilot's role — proving the harness is correct and safe to spend real gas — is complete.
