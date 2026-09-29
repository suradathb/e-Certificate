# STEP 8.3 — COST / FEE SEMANTICS & EVIDENCE INTEGRATION

> CC.tex + Fig.8 (img9.png) only. All fee values regenerated from final STEP 7 raw evidence. No new experiments; latency (8.1), TPS (8.2), O(1), contracts untouched. Static LaTeX balance verified; user compiles locally.

## 1. Raw cost/fee fields found (per attempt)
`gas_used`, `effective_gas_price` (wei/gas), `transaction_cost_native` = **null/NOT CAPTURED** for both L1 and L2. No itemized fee, no L1-pubdata-fee field, no USD. So fee must be estimated as gas × effective_gas_price.

## 2. L1 fee semantics (Ethereum Sepolia)
`effective_gas_price` = base+priority gas fee (EIP-1559 style); fee ≈ gasUsed × effectiveGasPrice in wei. Standard L1 accounting.

## 3. L2 fee semantics (zkSync Era Sepolia)
zkSync Era folds L2 execution + L1 data-availability (pubdata) cost into the reported `gasUsed`×`effectiveGasPrice`; it is NOT the same base/priority model as L1 and does not expose pubdata separately in our records. Documented in the manuscript (Computation Model, `sec:computation-model-note`).

## 4. Is gas × effectiveGasPrice valid for each?
- **Estimate, both.** It is the client-observable native fee per tx. Labeled explicitly as an *estimated native-token fee* (Eq.~\ref{eq:fee}), not an exact protocol-charged fee, because `transaction_cost_native` was not captured and L1/L2 accounting differs. Comparison is client-observed testnet cost, not normalized identical accounting.

## 5. Matched L1/L2 mint values (from raw, per-tx medians)
| Quantity | Net | N=100 | N=500 | N=1000 |
|----------|-----|-------|-------|--------|
| gas (units) | L1 | 205,878 | 205,938 | 205,950 |
| | L2 | 161,370 | 161,581 | 161,587 |
| egp (Gwei) | L1 | 1.07 | 1.47 | 1.41 |
| | L2 | 0.025 | 0.025 | 0.025 |
| native fee (ETH) | L1 | 2.19e-4 | 3.04e-4 | 2.90e-4 |
| | L2 | 4.03e-6 | 4.04e-6 | 4.04e-6 |

## 6. Recalculated reduction (from fee, not gas)
- N=100: **98.2%**, N=500: **98.7%**, N=1000: **98.6%** → **range 98.2–98.7%** (mean 98.5%). The prior "~98%" was directionally correct but is now reported as a per-N range with testnet caveat. Gas-unit reduction alone (~22%) is explicitly NOT used as the cost claim.

## 7. Fig.8 (img9.png) changes
- Regenerated from `figs/regen/fig8_cost_data.json`. Was "Mint cost on Layer-2 (USD)" (single-series, USD, unsupported). Now: matched L1-vs-L2 mint **native-token fee (ETH, log scale)** across N; caption states fee = gas × egp, no fiat, testnet-only. Y-axis "Estimated native-token fee per mint (ETH, log scale)", X-axis "Workload size (N)".

## 8. Claims removed/softened
- USD everywhere: metric-list "USD equivalent" → native-token fee; Fig.8 "(USD)" removed. No USD survives (except V1 literature `$3–$8`/`$50–200`, attributed to prior work, not our measurement).
- "~98% lower cost" → "estimated native-token fee lower by ~98.2–98.7% (matched mint), testnet-specific, not mainnet-representative" (Abstract, Cost Results, Summary, Discussion).
- Causal overclaims removed: "pricing largely insensitive to application-level demand", "cost remains stable due to batch-based execution and reduced dependence on L1 fee dynamics" → descriptive "varied only modestly under tested testnet conditions; mechanisms not independently isolated".
- Gas vs fee separated into three explicit quantities (Table~\ref{tab:cost-matched}); gas-unit reduction not equated to cost reduction.

## 9. Remaining cost claims + evidence
| Claim | Evidence |
|-------|----------|
| Fee reduction 98.2–98.7% (matched mint) | Table cost-matched, from raw gas×egp medians |
| egp ~1.07–1.47 Gwei L1 / 0.025 Gwei L2 | receipts (raw) |
| gas ~205,900 L1 / ~161,500 L2 | receipts (raw) |
| V1 `$3–$8`, mainnet `$50–200` | prior-work literature (cited), not our measurement — left as literature |

## 10. Testnet limitation added
New **Third** limitation: all cost/fee from public testnets; egp/fee time-dependent, not mainnet cost; L1/L2 accounting differs; 98.2–98.7% is client-observed testnet, not permanent economic saving.

## 11. Reviewer mapping (not marked DONE)
- **R1-04 / R1-28 (cost figures, V1 cost inconsistency $50–200 vs $3–8):** partially — our experiment's cost now fully evidence-based + testnet-bounded. The V1-internal $50–200 vs $3–8 reconciliation is a prior-work-cost narrative issue, flagged for a separate targeted fix (not in 8.3 scope, which covers our measured cost semantics).
- **R2 cost/fee interpretation:** fee now defined, gas≠cost separated, testnet-bounded, no USD. Evidence = Table cost-matched + Eq. fee. Not marked DONE pending audit.

## 12. Files changed
- `CC.tex` (fee equation + semantics note; Cost Results rewrite + `tab:cost-matched`; Fig.8 caption; causal softening; Abstract/Summary/Discussion 98%→range; metric-list USD removal; testnet limitation; ordinals).
- `img9.png` (Fig.8 regenerated); `figs/regen/fig8_cost_data.json`, `figs/regen/fig8_cost.png`.
- `docs/revision/step8/STEP8_3_COST_INTEGRATION.md` (this file).
- **Not touched:** raw data, contracts, CC.bib, checklist, latency(8.1), TPS(8.2)/img8.png, O(1), Fig.3/Fig.4.

## 13. Compile result
- Not compiled here (no TeX engine). Static: braces 639/639; equation 3/3; table 8/8; tabular* 8/8; figure 10/10. New `tab:cost-matched` (tabular*), `eq:fee` label+ref, `sec:computation-model-note` label all present. **User must run `pdflatex CC.tex; bibtex CC; pdflatex CC; pdflatex CC`** and check Fig.8, cost table, equation, Abstract/Results/Summary/Discussion.

---
STEP 8.3 COST EVIDENCE INTEGRATION COMPLETE —
READY FOR INDEPENDENT AUDIT
