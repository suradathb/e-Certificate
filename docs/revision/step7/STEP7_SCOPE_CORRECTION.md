# STEP 7 — SCOPE CORRECTION & MINIMUM EVIDENCE GAP

> Evidence/scope audit only. NO new testnet transactions executed. NO manuscript / contract / reviewer-checklist changes. All figures below are recomputed from raw artifacts in `benchmark-final-results/`.

---

## A. Original STEP 7 requirement (reconstructed faithfully)

From `STEP7_FINAL_EXPERIMENT_PLAN.md` (frozen before runs) + `STEP7_PILOT_DECISION.md`:

- **Workload sizes:** N ∈ {100, 500, 1000} per operation ("matching the manuscript's evaluated scales").
- **Operations:** mint (primary), transfer, block, unblock; fetch read-only measured separately.
- **Networks:** zkSync Era Sepolia (L2, chain 300) + Ethereum Sepolia (L1 baseline, chain 11155111).
- **Repeated batches:** *"CONFIRM from live micro-pilot (**provisional 5**)"* — explicitly NOT finalized. Pilot decision repeated: *"provisional 5 repeats … **Do NOT finalize yet**."*
- **Concurrency:** *"CONFIRM from live micro-pilot (provisional 3)."*
- **Governing rule (the key one):** the repeat count *"must be selected according to actual cost/constraints and must not be invented in advance."* The pilot's purpose was to determine a defensible repeat strategy.

**So the original STEP 7 did NOT specify a fixed repeat count.** It specified: repeated batches with the count justified by real cost/stability evidence.

---

## B. Where REPEATS=3 / 45-batch requirement was introduced

- Introduced in `STEP7_PROTOCOL_AMENDMENT.md`, dated **2026-09-28 15:20-ish**, AFTER the initial single-repeat live runs — NOT in the original plan or pilot decision.
- It froze REPEATS=3 → L2 36 + L1 9 = 45 batches → "31 remaining" → 3/3 completion matrix.
- **This was a later scope expansion**, now withdrawn/cancelled (banner in that file).

---

## C. Which parts were ORIGINAL requirements

1. N ∈ {100, 500, 1000}. ✅
2. mint/transfer/block/unblock on L2. ✅
3. L1 baseline for comparison. ✅
4. Repeated batches as a *concept*, with count justified by evidence. ✅
5. concurrency, nonce strategy, environment provenance, retry/error accounting, latency, gas, TPS_completed, raw immutable evidence, checkpoint/resume, contract unchanged. ✅

## D. Which parts were LATER scope expansion (now withdrawn)

1. Fixed **REPEATS = 3**. ❌
2. **45 / 36 / 9** batch targets. ❌
3. **"31 remaining"** requirement. ❌
4. **3/3 completion matrix** (every cell must have 3 independent batches). ❌
5. Implied **17–25h** mandatory runtime just to hit 3/3. ❌

---

## E. Inventory of all VALID experiments already completed

14 valid batches (concurrency=3, correct contract, 0 final failure, full success). 6,600 measured successful tx total. All 0 retry, 0 failure.

| net | op | N | n(tx) | dur(s) | TPS_completed | lat mean | sd | median | IQR | P95 | max | gas(med) | egp(Gwei) |
|-----|-----|---|-------|--------|---------------|----------|-----|--------|-----|-----|-----|----------|-----------|
| L2 | mint | 100 | 100 | 105.7 | 0.946 | 3154.7 | 897.7 | 3129.1 | [2583.6, 3754.6] | 4614.9 | 6252.1 | 161370 | 0.025 |
| L2 | mint | 500 | 500 | 437.0 | 1.144 | 2619.8 | 1238.5 | 2053.1 | [1855.3, 3094.0] | 4448.4 | 11723.8 | 161581 | 0.025 |
| L2 | mint | 1000 | 1000 | 1024.6 | 0.976 | 3067.8 | 2523.8 | 2798.3 | [1997.9, 3586.2] | 4845.5 | 46097.6 | 161587 | 0.025 |
| L2 | transfer | 100 | 100 | 94.3 | 1.060 | 2824.0 | 836.2 | 2748.1 | [1992.7, 3307.7] | 4339.4 | 5471.6 | 95186 | 0.025 |
| L2 | transfer | 500 | 500 | 477.5 | 1.047 | 2853.5 | 964.6 | 2699.2 | [1982.7, 3415.7] | 4651.3 | 7847.2 | 104382 | 0.025 |
| L2 | transfer | 1000 | 1000 | 902.2 | 1.108 | 2699.8 | 1168.4 | 2406.4 | [1848.2, 3205.5] | 4535.3 | 12114.9 | 95180 | 0.025 |
| L2 | block | 100 | 100 | 98.0 | 1.020 | 2884.4 | 959.7 | 2670.2 | [1877.3, 3573.8] | 4841.0 | 5392.2 | 88997 | 0.025 |
| L2 | block | 500 | 500 | 466.6 | 1.072 | 2794.5 | 927.2 | 2647.8 | [1901.3, 3366.7] | 4517.5 | 6333.9 | 96371 | 0.025 |
| L2 | block | 1000 | 1000 | 910.2 | 1.099 | 2725.4 | 1080.4 | 2572.4 | [1835.2, 3255.2] | 4688.8 | 10733.2 | 88997 | 0.025 |
| L2 | unblock | 100 | 100 | 90.7 | 1.103 | 2705.7 | 1537.0 | 2017.9 | [1814.6, 3065.4] | 4375.7 | 10844.9 | 86519 | 0.025 |
| L2 | unblock | 100 | 100 | 85.2 | 1.174 | 2505.3 | 993.1 | 1868.6 | [1812.1, 2795.5] | 4481.2 | 6276.6 | 86519 | 0.025 |
| L2 | unblock | 500 | 500 | 421.4 | 1.187 | 2520.6 | 1074.1 | 1869.1 | [1830.0, 3037.3] | 4326.7 | 12325.6 | 86513 | 0.025 |
| L2 | unblock | 1000 | 1000 | 981.9 | 1.018 | 2942.4 | 3609.2 | 2486.6 | [1861.7, 3368.1] | 4787.3 | 65384.2 | 86519 | 0.025 |
| L1 | mint | 100 | 100 | 506.1 | 0.198 | 15179.3 | 5403.2 | 12055.2 | [11690.3, 23126.0] | 24579.5 | 25196.0 | 205878 | 1.0657 |

**Between-run data available:** only **L2 unblock N=100** has 2 valid batches:
- TPS 1.103 vs 1.174 (diff 0.071); median latency 2017.9 vs 1868.6 ms (diff 149.3 ms). Small between-run difference observed.

**Excluded (preserved, not deleted):** 4 pre-bugfix L2 transfer batches (100/500/1000 + one N=100), all success=0/fail=all — failed before the `safeTransferFrom` overload + signer bugfix. Correctly excluded.

---

## F. Reviewer-by-reviewer evidence mapping

### R1-19 — concurrency + client execution environment not reported
- **Requirement (verbatim):** "The number of simultaneous requests and client execution environment are not reported." → publish concurrent runner, concurrency, nonce strategy, machine, OS, Node, RPC provider, rate limits, batch timing.
- **Existing evidence:** runner published; concurrency=3 recorded; NonceManager; environment.json (host/OS/Node/RPC host); batch timing (batch_start/end/duration_ms); OverlapTracker.
- **Repeated batches REQUIRED?** ❌ NO. This is a methodology-disclosure item, satisfied by one documented run.
- **Missing:** nothing material — provenance already recorded.

### R1-21 — failed transaction handling not explained
- **Requirement:** report attempted, first-attempt success, retry, final failure, error classes; no double-count.
- **Existing evidence:** every batch records attempted/first_attempt_success/operations_requiring_retry/total_retry_attempts/final_success/final_failure; error taxonomy (10 classes). Current data: 6,600/6,600 success, 0 retry, 0 failure.
- **Repeated batches REQUIRED?** ❌ NO. Accounting is per-attempt.
- **Missing:** nothing — but note error *rate* is 0% under tested workload (worth stating as a limitation: no stress-induced failures observed).

### R1-24 — no formal statistical test compares L1 and L2
- **Requirement (verbatim):** "No formal statistical test directly compares L1 and L2." → "**ทำ repeated batches ใช้ batch เป็น analysis unit** แล้วรายงาน effect size, CI และ test ที่เหมาะกับ distribution; หลีกเลี่ยง pseudo-replication."
- **Existing evidence:** L1 mint N=100 = 1 batch; L2 mint N=100 = 1 batch. **Only 1 batch per side → cannot use batch as analysis unit for a between-layer test.**
- **Repeated batches REQUIRED?** ✅ **YES — this is the ONE item that genuinely requires repeated independent batches.** The reviewer explicitly asks for batch-as-analysis-unit + CI + test, and explicitly warns against pseudo-replication (i.e., cannot just pool 100 tx as 100 independent samples).
- **Missing:** ≥2 (ideally ≥3) matched batches per layer for at least one N, to compute a batch-level comparison with honest CI. **Matched mint only** (L1 has only mint).

### R1-27 — no maximum or outlier behavior reported
- **Requirement:** add maximum, P99 where appropriate, timeout count, ECDF/box plot, **repeated-batch variability**.
- **Existing evidence:** max + P95 available per batch (P99 computable from raw); timeout count = 0; ECDF/box plot generable from raw. Repeated-batch variability only for unblock N=100.
- **Repeated batches REQUIRED?** ⚠️ **RECOMMENDED, not strictly required.** Max/tail/ECDF come from transaction-level data (already have). "Repeated-batch variability" is *desirable* to show but the tail-reporting core is satisfiable now.
- **Missing:** P99 + ECDF/box figures (from existing raw); optional extra batches for variability.

### R2-07 — L1 batch sizes ambiguous; 15 TPS must not be a fixed property
- **Requirement:** state N_L1, runs, dates, RPC, operations, batch duration; call it "observed application-level throughput under stated conditions."
- **Existing evidence:** L1 mint N=100, 1 run, date recorded, RPC host recorded, batch_duration recorded, TPS_completed=0.198 (NOT 15). The old "15 TPS" is already being removed.
- **Repeated batches REQUIRED?** ❌ NO — need clear conditions, not multiple batches. (Note: current L1 is only N=100; N=500/1000 L1 absent — see G.)
- **Missing:** L1 workload only covers N=100. If paper reports L1 across N, need N=500/1000; if paper reports L1 only at one N, current is enough.

### R2-09 — clarify N=1000 = distinct certificates
- **Requirement:** explain mint creates N token IDs; transfer/block/unblock act once each on N distinct tokens.
- **Existing evidence:** raw attempts store distinct token_id per operation — directly demonstrable from data.
- **Repeated batches REQUIRED?** ❌ NO. Pure clarification, evidenced by existing token_id records.
- **Missing:** nothing — a sentence + reference to raw data.

### R2-11 — add mean, error bars, error rates; clarify all tx succeeded
- **Requirement:** publish analysis script; report attempted/succeeded/failed/retried, mean, SD, median, IQR, P95, max, CI; define retry inclusion.
- **Existing evidence:** all of mean/SD/median/IQR/P95/max computed per batch (table E); analysis pipeline exists; success/fail/retry recorded.
- **Repeated batches REQUIRED?** ⚠️ Partially. "**error bars**" implies a variability estimate. Within-batch CI is computable now; between-batch error bars need ≥2-3 batches. But mean+SD+percentiles are satisfiable now.
- **Missing:** decide whether "error bars" = within-batch bootstrap CI (have) or between-batch (need repeats). Reviewer text leans to distribution stats, which we have.

### COM-06 (R1-19,R2-07,R2-09) & COM-09 (R1-21,R1-24,R1-27,R2-11)
- COM-06: methodology/workload disclosure — satisfiable now.
- COM-09: statistical + error reporting — mostly satisfiable now; the ONLY hard repeated-batch dependency inside it is R1-24 (L1-vs-L2 batch-level test).

---

## G. Claim-by-claim L1/L2 evidence requirement

**Rule:** direct L1/L2 comparison only for matched operations. L1 measured = **mint only**.

- If the manuscript claims **L1-vs-L2 for issuance/mint only** → matched cells needed: mint N∈{100,500,1000}. Currently L1 has **only N=100**. Gap: L1 mint N=500, N=1000 (if the paper compares across N) — else N=100 match suffices.
- If the manuscript claims **lifecycle-wide L1 vs L2 superiority** (transfer/block/unblock too) → **that claim is UNSUPPORTED**: there is NO L1 transfer/block/unblock data, and the frozen protocol itself said L1 = mint only. Such a claim must be narrowed to issuance, or explicitly marked as not measured on L1.
- **Action (audit, not execution):** the manuscript must restrict L1/L2 quantitative comparison to mint. Any lifecycle-wide L1 claim = narrow it.

---

## H. What evidence is genuinely still missing

1. **For a batch-level L1-vs-L2 statistical comparison (R1-24):** ≥2–3 matched batches per layer at one N (mint). Currently 1 vs 1 → no batch-level test possible.
2. **P99 + ECDF/box-plot figures (R1-27):** derivable from EXISTING raw — no new runs.
3. **L1 coverage across N (only if the paper compares L1 across N=100/500/1000):** L1 mint N=500, N=1000 absent.
4. Nothing else is blocked by data — the rest is writing/derivation from existing raw.

---

## I. Are additional repeated batches REQUIRED / RECOMMENDED / NOT NECESSARY?

| Reviewer item | Verdict | Why |
|---------------|---------|-----|
| R1-19 | **NOT NECESSARY** | Methodology disclosure; one documented run suffices. |
| R1-21 | **NOT NECESSARY** | Per-attempt accounting; already complete. |
| R1-24 | **REQUIRED** | Explicitly needs batch-as-unit L1-vs-L2 test + CI; 1 vs 1 batch cannot. |
| R1-27 | **RECOMMENDED** | Max/tail/ECDF from existing raw; repeated-batch variability only strengthens. |
| R2-07 | **NOT NECESSARY** (for repeats) | Needs stated conditions; but L1 N-coverage depends on the paper's claim (see G). |
| R2-09 | **NOT NECESSARY** | Clarification from existing token_id data. |
| R2-11 | **RECOMMENDED** | mean/SD/percentiles ready now; between-batch error bars need repeats. |

**Bottom line:** exactly **one** reviewer item (**R1-24**) genuinely REQUIRES repeated independent batches. Two (R1-27, R2-11) are RECOMMENDED/strengthened by them but satisfiable at a basic level from existing data. Four (R1-19, R1-21, R2-07, R2-09) do NOT need repeats.

---

## J. Minimum additional experiment set to satisfy ORIGINAL STEP 7

Scoped strictly to close the genuine gap (R1-24 batch-level L1-vs-L2), without inventing new research questions and without a blanket 3/3 matrix:

**Minimum defensible set = matched mint, batch-level, at a single N (N=100, the cheapest matched cell):**
- L2 mint N=100: currently 1 valid batch → **+2 batches** (to reach 3 for a batch-level unit).
- L1 mint N=100: currently 1 valid batch → **+2 batches** (to reach 3).
- Total **minimum = 4 additional batches** (all mint N=100), enabling n=3 vs n=3 batch-level comparison with an explicitly exploratory CI (resampling unit = batch, n=3).

**Rationale for N=100 (not 500/1000):** R1-24 needs *matched* batch-level replication, not scale coverage. N=100 is the cheapest and fastest matched cell; scale behavior across N is already characterized transaction-level from the single 500/1000 batches. This avoids the withdrawn "3/3 for every cell" expansion.

> This is a **minimum**, presented for your decision — NOT a re-imposed fixed repeat count. If you decide R1-24 can be answered by narrowing the manuscript claim (report L1 and L2 descriptively without a formal cross-layer test), then **zero** additional batches are required. That is a claim decision for you.

---

## K. Estimated time / gas for the minimum set (4 batches, all mint N=100)

Per-batch measured wall-clock (from inventory):
- L2 mint N=100 ≈ 105.7 s → ×2 ≈ **~3.5 min** measured (+ setup mint ~ same again; L2 setup is the mint itself, so negligible extra).
- L1 mint N=100 ≈ 506.1 s (8.4 min) → ×2 ≈ **~17 min** measured.
- **Total wall-clock ≈ 20–25 min** (plus per-run connection/setup overhead, call it **≤ 40 min** realistically).

Gas (from real receipts):
- L2 mint: gas ~161k × egp 0.025 Gwei → ~4.0×10⁻⁶ ETH/tx × 100 × 2 ≈ **~0.0008 ETH** (negligible).
- L1 mint: gas ~205,878 × egp ~1.07 Gwei ≈ 2.2×10⁻⁴ ETH/tx × 100 × 2 ≈ **~0.044 ETH** on Sepolia (testnet, free from faucet; balance ~11.6 ETH).

**So the entire genuine gap closes in well under an hour and a rounding-error of testnet gas — versus the withdrawn 17–25h / 31-batch plan.**

---

## Summary verdict

- Original STEP 7 asked for repeated batches with an **evidence-justified** count — NOT a fixed 3.
- The 45-batch / 3-of-3 matrix was a later expansion, now withdrawn.
- Existing 14 valid batches (6,600 tx, 0 failure) already satisfy R1-19, R1-21, R2-07, R2-09 and the descriptive core of R1-27 & R2-11.
- The **only** genuine repeated-batch dependency is **R1-24** (formal L1-vs-L2 batch-level comparison).
- **Minimum to fully satisfy original STEP 7 = 4 mint N=100 batches (+2 L2, +2 L1), ≈ <40 min, negligible gas** — OR zero, if you choose to narrow the cross-layer claim to descriptive.
- L1 lifecycle-wide superiority claims (if any) are UNSUPPORTED and must be narrowed to mint/issuance.
