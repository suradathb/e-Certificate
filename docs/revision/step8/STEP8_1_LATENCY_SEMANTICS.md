# STEP 8.1 — LATENCY SEMANTIC CORRECTION

> Manuscript edits to CC.tex only. No raw data changed. No new experiment. No TPS/cost/O(1) redesign (terminology-only touch where a latency sentence also carried the retracted TPS/cost claim). Code verified as source of truth for the latency boundary before writing definitions.

## 0. Code-verified latency boundary (source of truth)

From `src/benchmark/runner.ts` (measurement loop) and `scripts/benchmark-final/benchmark_final.ts` (submit fn):
- `submit_time = performance.now()` is taken at **runner.ts L67**, immediately BEFORE calling `submit(i, nonce)`.
- `submit()` (benchmark_final.ts L197-227) calls `await c.issueCert(...)` / `c["safeTransferFrom(...)"]` / `blockCert` / `unblockCert` (encodes + dispatches the tx via ethers.js), then `await withTimeout(tx.wait(), ...)` to obtain the receipt.
- `receipt_time = performance.now()` is taken at **runner.ts L70**, immediately AFTER `submit()` returns (i.e., after `tx.wait()` resolves with the receipt).
- `latency_ms = receipt_time − submit_time`.

**Therefore the measured boundary = from just before RPC submission (including ethers encode+dispatch) to receipt availability at the client.** It does NOT include batch inclusion, proof generation, L1 submission, or L1 finality. The manuscript definition was written to match this exactly (start is *pre-submission*, not "after RPC send succeeds").

## 1. Sections changed (CC.tex)

| Section | Line(s) | Change |
|---------|---------|--------|
| Methods | ~294–316 | Added **Latency measurement boundary** paragraph + latency equation + **lifecycle timeline figure** (`fig:latency-timeline`, MEASURED vs NOT MEASURED). Renamed L2 metric = *L2 sequencer-receipt latency*, L1 = *L1 transaction-receipt latency*. |
| Methods metric list | ~325 | "Transaction latency (ms)" → "Transaction-receipt latency (ms)" |
| Results/config table | ~413 | Metric label "Confirmation latency" → "Transaction-receipt latency" |
| Results formal def | ~426 | "per-transaction confirmation latency" → "per-transaction transaction-receipt latency" |
| Latency Results | ~445 | "confirmation latency" → "transaction-receipt latency"; added caveat metric = submission-to-receipt, not settlement/finality |
| Latency Results | ~451 | "confirmation time does not scale" → "observed transaction-receipt latency did not scale"; softened to within-range |
| Latency Results | ~453 | "confirmation delay ... user-perceived confirmation latency" → "receipt latency ... user-perceived receipt latency" |
| L1 comparison | ~462 | "Ethereum Layer-1 ... higher confirmation delays ... execution and settlement" → "Ethereum Sepolia ... higher L1 transaction-receipt latency ... comparison is receipt-level, not finality/settlement" |
| fig:latency caption | ~458 | "Latency distribution" → "Transaction-receipt latency distribution ... does not include L2-to-L1 settlement or finality" |
| Throughput | ~487 | "per-transaction confirmation latency" → "per-transaction transaction-receipt latency" |
| Summary | ~504 | "low and stable confirmation latency" → "transaction-receipt latency" |
| Discussion | ~541,~555 | "confirmation latency" → "transaction-receipt latency" |
| O(1) para | ~564 | "confirmation latency under increasing batch sizes" → "transaction-receipt latency ..." (term only; O(1) logic untouched) |
| Implications | ~608 | "low and stable confirmation latency" → "transaction-receipt latency" |
| Conclusion | ~654 | "lower confirmation latency" → "lower transaction-receipt latency" |
| Abstract | ~49 | "low and stable confirmation latency" → "transaction-receipt latency (measured from RPC submission to receipt observation, not L1 settlement/finality)" |
| Introduction | ~69 | "confirmation latency" → "transaction-receipt latency (... not L1 settlement/finality)"; **also removed the retracted "throughput exceeding 2,000 TPS" + "95–99% cost reduction"** from the same sentence (it directly contradicted the corrected Abstract; removal was necessary to avoid a latency/throughput contradiction in the same clause). |
| Limitations | ~597 | Added new **Third** limitation: latency terminates at receipt observation; excludes batch/proof/L1 settlement/finality; same boundary both networks. Re-ordinated following items (Fourth/Fifth). |

## 2. Before → after terminology

| Before | After |
|--------|-------|
| confirmation latency (measured) | transaction-receipt latency |
| L2 confirmation latency | L2 sequencer-receipt latency |
| L1 confirmation delays | L1 transaction-receipt latency |
| confirmation time | (observed) transaction-receipt latency |
| "reflects execution and settlement" (as if measured) | receipt-level comparison; settlement/finality NOT measured |
| Latency (ms) [fig] | Transaction-receipt latency (ms) [fig, + boundary caveat] |

Unchanged (valid) uses of "settlement/finality": architectural discussion (L545, L566 — execution/settlement separation as a security/architecture point), background (L109 — how zkSync anchors to L1), and explicit NOT-measured statements (L303, L312, L315, L462, L597, Abstract, Intro).

## 3. Exact latency definition now used

> The start timestamp is taken with a monotonic clock immediately before the client submits the transaction via the RPC provider (immediately before the ethers.js contract-method call that encodes and dispatches the transaction); the end timestamp is taken when the corresponding transaction receipt becomes available to the client (when `tx.wait()` resolves). `latency = t_receipt_observed − t_pre-submission`. For zkSync = *L2 sequencer-receipt latency*; for Ethereum Sepolia = *L1 transaction-receipt latency*; identical boundary on both.

## 4. Timeline added

- **Figure `fig:latency-timeline`** in Methods (immediately after the boundary paragraph). Shows `[MEASURED] Submit → L2 receipt` and `[NOT MEASURED] L2 receipt → batch inclusion → proof generation → L1 submission → L1 confirmation/finality`. Caption states the benchmark terminates at receipt observation and downstream stages are not measured. No fabricated durations.

## 5. Remaining uses of "finality"/"settlement" and justification

| Line | Term | Justification |
|------|------|---------------|
| L109 | finality | Background: describes how zkSync submits proofs to Ethereum "for finality" — general protocol description, not our measurement. Valid. |
| L303, L312, L315 | finality/settlement | Explicit NOT-MEASURED boundary text + timeline. Valid. |
| L462 | finality | Explicitly states comparison is NOT finality/settlement. Valid. |
| L545, L566 | settlement | Architectural "execution vs settlement" separation (security/trust discussion), not a latency measurement claim. Valid. |
| L597 | finality | New limitation explicitly excluding settlement/finality. Valid. |
| Abstract, Intro | settlement/finality | In the phrase "not L1 settlement/finality" — explicit disclaimer. Valid. |

No occurrence now asserts that measured latency = finality, or that L2 reaches finality faster than L1.

## 6. Limitations text added (verbatim)

> Third, the latency measurements terminate at transaction-receipt observation. They are measured from RPC transaction submission to the availability of the corresponding transaction receipt, and do not include subsequent L2 batch inclusion, proof generation, submission to Layer-1, or Layer-1 confirmation/finality. Therefore the reported latency results characterize application-visible receipt latency under the evaluated environment, not end-to-end blockchain settlement or finality. The same submission-to-receipt boundary is applied to both the zkSync Era Sepolia and the Ethereum Sepolia measurements, so the cross-layer comparison is a comparison of benchmark-observed receipt latencies and not of L1 settlement times.

## 7. Draft R1-22 response

> **R1-22.** We thank the reviewer. We have clarified the latency semantics throughout the manuscript. The reported latency is a *transaction-receipt latency*, measured client-side from immediately before RPC transaction submission to the availability of the corresponding transaction receipt (`tx.wait()` resolution); we verified this boundary directly against the benchmark implementation. For zkSync Era Sepolia we now call this the *L2 sequencer-receipt latency*, and for the Ethereum Sepolia baseline the *L1 transaction-receipt latency*, using an identical submission-to-receipt boundary. We added an explicit transaction-lifecycle timeline (Fig.~\ref{fig:latency-timeline}) marking the measured segment (submit → receipt) and the unmeasured downstream stages (batch inclusion → proof generation → L1 submission → L1 finality), a precise latency definition in the Methods, and a limitation stating that the measurements do not represent end-to-end settlement/finality. We did not fabricate durations for any unmeasured stage.

## 8. Draft R2-08 response

> **R2-08.** The latency metric is now explicitly defined as an application-visible transaction-receipt latency and is no longer described as blockchain confirmation/finality. We distinguish the measured segment (RPC submission → transaction-receipt observation) from the unmeasured L2→L1 settlement path, both in a new lifecycle timeline figure and in the Methods definition. Comparisons between zkSync Era Sepolia and Ethereum Sepolia are stated as comparisons of benchmark-observed receipt latency under the same boundary and workload, and are explicitly not claims about L1 settlement time or protocol finality. A dedicated limitation was added to prevent interpretation as end-to-end finality.

*(Both responses are drafts; the reviewer concern is not marked resolved until the manuscript changes are independently verified/compiled.)*

## 9. Compile result

- Not compiled in this environment (no TeX engine in sandbox). Static checks: braces 578/578 balanced; `\begin/\end` matched for tabular (7/7), figure (10/10), equation (3/3), itemize (5/5). New `fig:latency-timeline` uses a plain `tabular` inside `figure` (no extra packages). **User must run `pdflatex CC.tex; bibtex CC; pdflatex CC; pdflatex CC` locally to confirm.**

## 10. Files changed

- `CC.tex` (latency terminology + Methods boundary + timeline figure + limitation; and removal of the retracted 2,000 TPS/95–99% clause in the Intro that shared the latency sentence).
- `docs/revision/step8/STEP8_1_LATENCY_SEMANTICS.md` (this file).
- **Not touched:** CC.bib, contracts, benchmark raw data, reviewer checklist xlsx, figures (image files — the img7 latency figure caption/label was updated in text; the raster itself is a separate regeneration task).

---
STEP 8.1 LATENCY SEMANTICS COMPLETE —
READY FOR INDEPENDENT AUDIT
