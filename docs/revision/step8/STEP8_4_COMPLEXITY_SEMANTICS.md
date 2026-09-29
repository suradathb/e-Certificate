# STEP 8.4 — O(1) / COMPLEXITY SEMANTICS CORRECTION

> CC.tex only. No experiments, no contracts, no latency(8.1)/TPS(8.2)/cost(8.3) numeric changes, no Fig.3/Fig.4. Static LaTeX balance verified; user compiles locally.

## 1. Previous O(1)/O(n) claims
- §3.3 "Verification Complexity Analysis": `C_{L1}=O(n)`, `C_{L2}=O(1) (amortized per batch)`, "on-chain verification overhead is asymptotically constant", "amortizing on-chain verification into a constant-time proof verification step"; proof construction "typically exhibiting execution complexity proportional to the number of aggregated transactions" (unsupported "typically O(n)").
- Security §: "results in an O(1) on-chain verification cost per batch … This asymptotic efficiency **directly explains** the observed reductions in gas cost and transaction-receipt latency" (causal overclaim linking O(1) to empirical results).

## 2. Final complexity definitions
- Renamed §3.3 → **"Architectural Verification-Cost Model"** (`sec:verification-cost-model`), restructured into: direct-L1 model / validity-rollup proof-verification model / what is NOT constant / scope+limitations.
- Opening sentence states it is a conceptual model, **not** an empirically validated asymptotic experiment.

## 3. Final equations
- `C_{\mathrm{exec},L1}(n) = O(n)` — count of independent on-chain application-transaction executions in the direct-L1 model.
- `C_{\mathrm{verify},L1}(\text{batch}) = O(1)` (one succinct proof per batch, w.r.t. n) — number of L1 proof-verification invocations for a single-proof batch.

## 4. Meaning of n
`n` = number of application-level lifecycle operations (transactions) represented; explicitly an application-level count, not an Ethereum-consensus-wide complexity variable.

## 5. Exact scope of O(1)
ONLY the number of Layer-1 proof-verification invocations for a single-proof batch, with respect to n, under the paper's architectural abstraction. Explicitly "one succinct proof per batch."

## 6. What is explicitly NOT O(1)
Proof generation; transaction execution; state-transition computation; data publication (pubdata/DA); networking; sequencer processing; prover implementation; **and** application-visible latency, transaction fee, and completed throughput. Total L1 resource usage per batch is NOT claimed constant (pubdata depends on batch contents).

## 7. Proof-generation treatment
Stated as workload-dependent and outside the constant-verification abstraction; cost depends on proving system/circuit/batch/implementation. Removed the unsupported "typically O(n)"; **no specific asymptotic proof-generation complexity is asserted**.

## 8. Data-availability / pubdata treatment
Explicit: representing L1 proof verification as constant per proof does NOT imply total L1 resource use per batch is constant; pubdata/DA may depend on batch contents/workload — cross-referenced to the cost section (`sec:computation-model-note`) so it does not contradict STEP 8.3.

## 9. Causal performance claims removed
- Security §: "This asymptotic efficiency directly explains the observed reductions in gas cost and transaction-receipt latency" → removed; replaced with explicit "not claimed to explain the observed latency, fee, or throughput results; reported separately as descriptive measurements."
- §3.3: removed "constant-time proof verification step / relocating linear execution cost" framing that implied a performance guarantee; replaced with bounded architectural statement + scope note.
- Added explicit separation: three workload sizes (100/500/1000, conc=3) are insufficient to establish asymptotics; stable latency/fee/TPS are NOT used to infer O(1).

## 10. "Amortized" audit
Removed "amortized per batch" from the equation. A batch already corresponds to one proof-verification event, so "amortized" was imprecise. Now: constant number of verifier invocations per single-proof batch (not "amortized"). Where per-transaction burden is discussed, it is framed as one proof representing n transactions, not an amortization claim.

## 11. Abstract / Intro / Discussion / Conclusion
No O(1)/constant-time/asymptotic performance claims present in those sections (none introduced; none remained). Verified by full-manuscript scan. Numeric latency/TPS/cost results untouched.

## 12. Figures
Fig.3/Fig.4 not modified (backlog). Neither contains an O(1) statement that becomes incorrect. img04.png caption already generic ("Layered architectural decomposition").

## 13. Remaining O(1)/O(n)/complexity occurrences + justification
| Loc | Occurrence | Valid? |
|-----|-----------|--------|
| §3.3 L225/L232 | `C_exec,L1=O(n)`, `C_verify,L1(batch)=O(1)` | Bounded architectural model with explicit scope. ✅ |
| §3.3 L220/227/244/247 | "asymptotic-complexity … not empirically validated", "does not assert every component… O(n)", "does not apply to proof generation" | Bounding/limiting statements. ✅ |
| Security L605 | "one succinct proof per batch … not claimed to explain latency/fee/throughput" | Causal claim removed; bounded. ✅ |
| L107 | Polygon zkEVM literature (proof verification) | Literature, not our claim. ✅ |
| L307/315/640 | proof generation in latency-boundary (NOT MEASURED) | STEP 8.1 boundary; valid. ✅ |
| L615 | "user-level operational complexity" | Different sense of "complexity". ✅ |

## 14. Reviewer mapping (not marked DONE)
- **R1-18** (link between O(1) and actual batch behavior unclear): previous problem = O(1) presented as explaining empirical batch performance. Correction = narrowed to L1 proof-verification-invocation count per single-proof batch; separated from empirical results; scope/limitations added. Evidence = §3.3 (`sec:verification-cost-model`). Remaining limitation = asymptotics not experimentally tested (stated).
- **R2-05** (constant-time omits validation, consensus rounds, N transactions; applies only to settlement cost): correction = O(1) restricted to per-batch single-proof verification invocations; execution/proving/DA/consensus/finality explicitly outside scope; pubdata dependence stated. Evidence = §3.3 "what is not constant" + scope note.
- **COM-05** (O(1) complexity clarity, pairs R1-18/R2-05): addressed by the same restructure. Not marked DONE pending audit/compile.

## 15. Files changed
- `CC.tex` (§3.3 rename+rewrite; proof-gen/pubdata/scope paragraphs; Security §605 causal removal).
- `docs/revision/step8/STEP8_4_COMPLEXITY_SEMANTICS.md` (this file).
- Not touched: raw data, contracts, CC.bib, checklist, latency/TPS/cost numerics + their figures (img7/img8/img9), Fig.3/Fig.4.

## Compile result
- Not compiled here (no TeX engine in sandbox). Static: braces 644/644; `\[`/`\]` 7/7; equation 3/3; table 8/8; figure 10/10. New label `sec:verification-cost-model` + ref present; `sec:computation-model-note` cross-ref present. **User must run `pdflatex CC.tex; bibtex CC; pdflatex CC; pdflatex CC`** and verify §3.3 equations render, refs resolve, no overflow, no contradiction with 8.1/8.2/8.3.

---
STEP 8.4 COMPLEXITY SEMANTICS COMPLETE —
READY FOR INDEPENDENT AUDIT
