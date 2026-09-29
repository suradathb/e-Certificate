> **CANCELLED (2026-09-28 15:46)** — The REPEATS=3 protocol amendment described below was cancelled by the user. The 45/36/9 batch targets, the 31-remaining requirement, the 3/3 completion matrix, and the per-cell 3-independent-batch requirement are all VOID. Existing benchmark runs remain valid evidence, but there is no requirement to reach 3 repeats per cell. The text below is retained only for audit history.

---

# STEP 7 — PROTOCOL AMENDMENT (repeat count)

> This is a **protocol amendment**, NOT a pre-registration. The final repeat count was frozen AFTER the initial single-repeat runs, and BEFORE executing the additional repeats.

## Chronological record

1. **Original plan** (`STEP7_FINAL_EXPERIMENT_PLAN.md`): repeat count = "CONFIRM from live micro-pilot (**provisional 5**)"; the plan explicitly said it "will be amended with the confirmed values before the final experiment is executed."
2. **Pilot decision** (`STEP7_PILOT_DECISION.md`): repeat count remained "provisional **5 repeats** … **Do NOT finalize yet**." No final value was frozen.
3. **Procedural deviation**: the initial L2 runs (mint/transfer/block/unblock × N=100/500/1000) and the L1 mint N=100 run were executed at **repeat = 1** before the repeat count was formally finalized.
4. **Amendment (this document)**: after identifying that gap, and before executing any additional repeated batches, the final repeat count is frozen at **REPEATS = 3 independent batches per cell**.
5. **Reason**: feasibility/resource constraints (time + testnet gas) combined with the minimum repeated-batch level the existing statistical plan already anticipated ("batch-level CI where repeats ≥ 3"). Three independent batches allow direct observation of between-run variability while remaining feasible.

## Caution

- n=3 independent batches is a **small sample**. Results must emphasize **descriptive** between-run variability.
- Any 95% CI is **exploratory/descriptive** only (resampling unit = batch, n=3); it must NOT be used to imply strong population-level precision.
- This amendment must never be described as a "pre-registered repeat count."

## Frozen final matrix

- **L2 (zkSync Era Sepolia, contract 0x3D16…C0cF):** mint/transfer/block/unblock × N∈{100,500,1000} × 3 repeats = **36 batches**.
- **L1 (Ethereum Sepolia, contract 0xD56A…F549):** mint only × N∈{100,500,1000} × 3 repeats = **9 batches**.
- **Total target = 45 independent batches.** Concurrency = 3 (single admin signer, managed nonces). Contract unchanged.
- Direct L1/L2 comparison permitted ONLY for mint at N=100/500/1000 (matched cells).

