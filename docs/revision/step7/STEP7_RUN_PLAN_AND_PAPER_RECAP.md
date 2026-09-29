# STEP 7 — RUN PLAN + PAPER CONSISTENCY RECAP + REVIEWER STATUS

> Evidence/scope recap. No manuscript edits made here. Purpose: (1) list remaining runs in order, (2) flag paper misunderstandings/inconsistencies still present, (3) recap reviewer-answer status clearly. All claims traced to CC.tex line numbers and real artifacts.

---

## PART 1 — STEPS TO RUN (in order), then STEP 8

### Currently running / just done (user-driven, live L1)
- L1 mint N=100 — ✅ done (1 valid batch, tps 0.198, median 12.06 s)
- L1 mint N=500 — 🔄 running now
- L1 mint N=1000 — ⏳ next (command below)

```bash
cd "/Users/admin/Desktop/Document_ป_เอก/submission_ClusterComputing/e-Certificate"
BENCH_MODE=live BENCH_OP=mint BENCH_NS="1000" BENCH_CONC="3" \
npx hardhat run scripts/benchmark-final/benchmark_final.ts --network ethereumSepolia
```

After N=1000 completes → **L1 mint matrix is complete for N={100,500,1000}**, matching the L2 mint matrix → full matched mint L1-vs-L2 comparison across all three N.

### The ONE genuine remaining evidence gap (from scope audit R1-24)
A formal L1-vs-L2 batch-level statistical comparison needs ≥2–3 matched batches per layer at a common N. After the three L1 mint runs above, **each L1 mint cell still has only 1 batch** (n=1). Two ways forward — **your decision (claim-affecting)**:

- **Option A — enable a formal cross-layer test:** run +2 more repeats of the cheapest matched cell (mint N=100) on BOTH layers → L2 mint N=100 ×3, L1 mint N=100 ×3. ≈ <40 min, negligible gas. Then R1-24 can be answered with an (exploratory, n=3) batch-level CI.
- **Option B — narrow the claim:** report L1-vs-L2 descriptively (per-transaction) and explicitly state no formal cross-layer hypothesis test is claimed. 0 extra runs. R1-24 answered by scoping.

> This is the only remaining run decision. Everything else needed for STEP 8 is already in hand.

### Optional (NOT required by any reviewer item as a blocker)
- Extra L2 repeats for between-batch error bars (R1-27/R2-11 "strengthen only"). Not required.

### Then STEP 8
Once L1 mint N=500 + N=1000 finish (and you pick Option A or B for R1-24), the experimental dataset is COMPLETE for the paper's actual claims. STEP 8 = regenerate all statistics from raw, build the final evidence package, then (separately) update the manuscript.

---

## PART 2 — PAPER MISUNDERSTANDINGS / INCONSISTENCIES STILL PRESENT IN CC.tex

These are REAL problems still in the manuscript (not yet fixed). **Not edited here** — listed for your decision.

### 🔴 CRITICAL — old refuted numbers still in the Introduction
- **L69:** *"sustained application-level throughput **exceeding 2,000 transactions per second**, and approximately **95--99% reduction** in certificate issuance cost"* — this is the OLD 2,037 TPS + 95–99% claim we already refuted and removed from the Abstract/Results. **It is still in the Introduction.** The Abstract (L49) now says ~1 TPS / ~98%; the Intro contradicts it. **Must be reconciled to the measured ~1 TPS and ~98%.**

### 🟠 Inconsistency — "three operations" vs "four operations"
- **L368:** *"We evaluate **three** certificate lifecycle operations … issuance (minting), ownership transfer, and metadata retrieval"* — but the study actually evaluates **four state-changing ops** (mint, transfer, block, unblock) + fetch. This sentence is stale (pre-block/unblock). Contradicts L388 ("all four operations") and the results. **Must be fixed to four + fetch.**

### 🟠 Cost-figure caption still says "USD"
- **L456:** `\caption{Mint cost on Layer-2 (USD).}` — but cost is now reported in native/Gwei from receipts, and USD was explicitly removed as an assumption. Caption is stale. Also **Fig img9.png** likely still shows old USD numbers → figure needs regeneration.

### 🟠 O(1) claim needs the reviewer-facing explanation (R1-18/R2-05)
- **L541:** the $O(1)$ on-chain verification vs $O(n)$ claim is stated but reviewers asked for clarification of the complexity claim. The text explains it reasonably (per-batch proof verification) but this needs to be explicitly linked to the reviewer response. Not wrong, but not yet "answered."

### 🟡 V1 cost inconsistency ($50–200 vs $3–8) — R1-04/R1-28
- **L96:** V1 "High gas fees … (\$50–\$200 per transaction during congestion)". **L530:** V1 "median issuance costs in the range of USD \$3–\$8". These two V1 cost figures coexist and look contradictory (different scenarios: congestion peak vs median). **Reviewer flagged this. Needs a reconciling sentence** (peak vs median) or pick one framing.

### 🟡 Reproducibility placeholders — commit hash / release
- **L348–349:** `Release version v2.0.0` + `Commit hash 0xe022…`. The commit hash format `0xe022…` is 64 hex chars = looks like a tx hash or fabricated SHA, **not a git commit** (git SHAs are 40 hex). The repo was downloaded as ZIP, not a clone → **no real commit/tag exists.** This is a factual claim in the paper that cannot be backed. **Must be corrected to a real git tag/commit or removed.**

### 🟡 Figures still stale (deferred backlog)
- Fig.3 (img03.png) formal-model diagram (should reflect Active/Suspended, not old states).
- Fig.4 (img04.png).
- Fig.cost (img9.png) — USD → native.
- Latency/TPS figures (img7/img8) may still encode old numbers → verify against new data.

### ✅ Already consistent (good)
- Abstract (L45–51): matches measured data (2–3 s / 12 s / 98% / zero failures). ✅
- Results Latency/Cost/Throughput (L420–485): real numbers, TPS defined correctly, submission-rate caveat present. ✅
- L388 workload table: correctly states "L2 all four operations; L1 baseline: mint N=100." ✅
- L572 limitation: correctly states L1 at smaller volume + per-transaction normalization. ✅
- Domain-extensible framing (L47/67/635): consistently bounded. ✅

---

## PART 3 — REVIEWER-ANSWER STATUS (clear recap)

### Directly tied to STEP 7 benchmark (this phase)
| Item | Requirement (short) | Status now | Blocker |
|------|--------------------|-----------|---------|
| R1-19 | concurrency + client env | ✅ satisfiable from data | none |
| R1-21 | failed-tx handling, retry, error classes | ✅ satisfiable (0% error observed) | none |
| R1-24 | formal L1-vs-L2 test, batch as unit | ⚠️ needs Option A (matched n≥3) or B (narrow claim) | **decision** |
| R1-27 | max, P99, tail, ECDF, variability | 🟡 core from raw; figures to generate | derive from raw |
| R2-07 | L1 workload conditions, not fixed 15 TPS | ✅ (L1 now measured; 0.2 TPS) | finish L1 N=500/1000 |
| R2-09 | N=1000 = distinct certs | ✅ from token_id data | writing only |
| R2-11 | mean/SD/median/IQR/P95/max/CI, error rate | 🟡 core ready; error bars = Option A optional | mostly done |

### Paper-consistency items surfaced in this recap (STEP 8 manuscript work)
| Item | What | Where |
|------|------|-------|
| R1-01 | 2,037 TPS / 95–99% still in Intro | **L69** — CRITICAL fix |
| — | three vs four operations | **L368** |
| — | cost caption USD | **L456** |
| R1-04/R1-28 | V1 $50–200 vs $3–8 | **L96 / L530** |
| R1-18/R2-05 | O(1) complexity explanation | **L541** |
| — | commit/tag placeholder not real | **L348–349** |

### Not yet addressed (tracked, outside STEP 7 benchmark) — from prior summary
- R1-05, R1-07 (zkSync justification), R1-08 (organization), R1-09, R1-10, R1-13, R1-22, R1-25.
- R2-12 (terminology consistency — easy), R2-13 (code comments Thai/emoji → English — easy).
- COM-01/05/07/08/10.

---

## Bottom line
1. **Runs left:** L1 mint N=500 (running) → N=1000 → mint matrix complete. Then ONE decision on R1-24 (Option A = +4 mint N=100 batches ≈ <40 min, or Option B = narrow claim, 0 runs).
2. **Biggest paper problem still live:** L69 Intro still claims 2,000+ TPS / 95–99% — directly contradicts the corrected Abstract/Results. Must fix in STEP 8.
3. **Other stale spots:** three-vs-four ops (L368), USD cost caption (L456), V1 cost $50–200 vs $3–8 (L96/L530), fake commit hash (L348–349), stale figures.
4. Reviewer benchmark items are essentially answered by existing data except R1-24 (your decision).
