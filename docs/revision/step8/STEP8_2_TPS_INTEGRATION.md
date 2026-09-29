# STEP 8.2 — TPS / THROUGHPUT EVIDENCE INTEGRATION

> CC.tex edits only. TPS values regenerated from final STEP 7 raw evidence (authoritative). No new experiments, no contract/latency(8.1)/cost/O(1) changes. Static LaTeX balance verified; user must compile locally (no TeX engine in sandbox).

## ARTIFACT COMPLETION (Fig.9 regenerated + equation fix)

**Six matched mint TPS values (regenerated from raw, authoritative):**

| Mint | N=100 | N=500 | N=1000 |
|------|-------|-------|--------|
| L2 (zkSync Era Sepolia) | 0.946 | 1.144 | 0.976 |
| L1 (Ethereum Sepolia) | 0.1976 | 0.2479 | 0.2453 |

**Fig.9 regenerated** from `figs/regen/fig9_tps_data.json` → `img8.png` (and copy `figs/regen/fig9_tps.png`). Plots L2 mint/transfer/block/unblock + matched L1 mint baseline; fetch excluded. Y-axis = Completed application-level throughput (TPS); X-axis = Workload size (N); title notes concurrency=3. Values verified against evidence (visual + numeric).

**TPS equation fixed (§4):** `\mathrm{TPS} = \frac{N}{T_{batch}}` → `\frac{N_{\mathrm{success}}}{T_{\mathrm{batch}}}`; prose already said $N_{\mathrm{success}}$, now notation matches. Also moved `\label{eq:tps}` inside the equation (was after `\end{equation}`, which mislabeled the cross-reference).

**Summary de-duplicated:** removed the leftover "higher throughput via multi-signer … future work" TPS-implying phrase; future work now stated without a throughput estimate.

**Consistency verified:** matched values 0.20/0.25/0.95/1.14/0.98 present in text + table + figure; no obsolete 2037/2000+/2121/15 TPS anywhere; braces 598/598, equation 3/3, table 7/7, tabular* 7/7, figure 10/10.

**Artifact SHA-256 (16-char prefix):** CC.tex `040821e74a72f90c`; img8.png `81b5ee266ad0166c`; fig9_tps_data.json `2d2aa804502d7434`.

**Still requires local action:** compile `pdflatex CC.tex; bibtex CC; pdflatex CC; pdflatex CC` (no TeX engine here). `git diff` for STEP 8.2 must be captured locally (git unavailable in sandbox).

---

## 1. Final TPS definition (code-verified)
`tps_completed = final_success / (batch_duration_ms / 1000)` — from `src/benchmark/stats.ts` L79-82; `batch_duration_ms = batch_end − batch_start` measured around the measured phase only (setup excluded), `runner.ts` L58/L110. NOT computed from latency. Boundary re-verified against code before writing.

## 2. Final run inventory used (authoritative experiments)
- L2: mint `1790486476823`, transfer `1790514765259`, block `1790521581795`, unblock `1790562436815` (unblock N=100 also has `1790553124954`; authoritative single value taken from the experiment that carries all three N — `...562436815`).
- L1 mint: N=100 `1790574934218`, N=500 `1790585831611`, N=1000 `1790587924129`.
- Selection rule: the experiment containing the full N-series for that operation, concurrency=3, correct contract, 0 failure. Development/failed transfer runs (`1790499507788`, `1790514046147`) excluded (all-fail, pre-bugfix).

## 3. Exact L1 TPS (recomputed from raw)
| N | success | dur (s) | TPS |
|---|---------|---------|-----|
| 100 | 100/100 | 506.1 | 0.198 |
| 500 | 500/500 | 2017.0 | 0.248 |
| 1000 | 1000/1000 | 4076.9 | 0.245 |

## 4. Exact L2 TPS (recomputed from raw)
| op | N=100 | N=500 | N=1000 |
|----|-------|-------|--------|
| mint | 0.946 | 1.144 | 0.976 |
| transfer | 1.060 | 1.047 | 1.108 |
| block | 1.020 | 1.072 | 1.099 |
| unblock | 1.174 | 1.187 | 1.018 |

All recomputed values match stored `tps_completed` to floating-point precision.

## 5. Matched L1/L2 mint table (added as Table~\ref{tab:tps-matched})
| Mint | N=100 | N=500 | N=1000 |
|------|-------|-------|--------|
| L2 (zkSync Era Sepolia) | 0.95 | 1.14 | 0.98 |
| L1 (Ethereum Sepolia) | 0.20 | 0.25 | 0.25 |

## 6. Table 3 changes
- Workloads row: `L1 baseline: mint, N=100` → `L1 baseline: mint, N=100, 500, 1{,}000`.

## 7. Fig. 9 (fig:tps) changes
- Caption rewritten: "Observed completed application-level throughput across workload sizes under client concurrency = 3 (single admin signer)… shows L2 measured lifecycle operations and matched L1 mint baseline; read-only fetch excluded… do not represent maximum network or protocol throughput."
- **NOTE:** the raster `img8.png` itself is a separate regeneration task (image file). The caption/interpretation now matches final evidence; the plotted series must be regenerated from `per_batch_statistics.json` to remove any obsolete series before final submission. Flagged, not silently left.

## 8. TPS claims removed/softened
- **Intro L69:** removed "throughput exceeding 2,000 TPS" + "95–99% cost" (done in 8.1; confirmed gone).
- **§5.5 L485:** rewrote to bounded ranges + explicit "not protocol/sequencer/network capacity"; added matched L1 values for all three N.
- **L487:** removed "throughput is dominated by receipt latency … which is why it remains constant" → descriptive bounded wording; removed implied future-work TPS.
- **L493:** removed "high application-level throughput is enabled by off-chain execution … batch-oriented processing" → "does not independently isolate the network-level mechanisms."
- **Summary L522:** removed "governed by execution-layer decoupling … throughput" → bounded observed-stability wording + explicit not-capacity.
- **Discussion L559:** removed "fundamentally alters scalability … governed by sequencer-driven processing" → architectural-consistency + not-isolated + bounded.
- **Conclusion L672:** "high application-level throughput under increasing workloads" → bounded (~1 TPS L2, single-signer conc=3).
- **Metric list L328 + §5 intro L387:** "Sustained application-level throughput" → "Completed application-level throughput".

## 9. Remaining TPS/throughput claims and why supported
| Loc | Statement | Why valid |
|-----|-----------|-----------|
| L65 | L1 has "limited throughput" (background) | General literature framing, not our measurement. |
| L109 | zkSync "reporting substantial throughput" (background) | Attributed to zkSync whitepaper literature, not our result. |
| §5.5, Table tps-matched, Summary, Conclusion | ~0.9–1.2 TPS L2 / ~0.2–0.25 TPS L1 | Directly from final raw evidence; labeled observed application-level, concurrency=3, not capacity. |

No surviving claim states protocol/network/sequencer maximum capacity as a measured result.

## 10. Reviewer mapping (not marked DONE — evidence stated)
- **R1-19 / R2-07 (workload + methodology + not-fixed-15-TPS):** L1 workload now reported for N={100,500,1000} in Table 3 + matched table; TPS defined as completed application-level throughput; evidence = final raw. Strengthened; final DONE pending audit.
- **R2-11 (throughput reporting / error rate):** completed TPS + success/failure preserved per batch; 0 failures. Evidence-backed.
- **R1-24 (formal L1-vs-L2 test):** UNCHANGED — remains PENDING EVIDENCE/REQUIREMENT AUDIT (no between-batch test introduced; only descriptive matched values). Not touched here.
- No item marked DONE solely due to text change.

## 11. Files changed
- `CC.tex` (Table 3 workloads; §5.5 throughput results + new matched TPS table; fig:tps caption; summary; discussion L559; conclusion; metric list; §5 intro; causal softening).
- `docs/revision/step8/STEP8_2_TPS_INTEGRATION.md` (this file).
- **Not touched:** raw data, contracts, CC.bib, reviewer checklist, latency semantics (8.1), cost text, O(1) text, Fig.3/Fig.4. `img8.png` raster flagged for regeneration (not edited).

## 12. Compile result
- Not compiled here (no TeX engine in sandbox). Static: braces 596/596; table 7/7; tabular* 7/7; figure 10/10; equation 3/3. New `tab:tps-matched` uses `tabular*` (consistent with other tables). **User must run `pdflatex CC.tex; bibtex CC; pdflatex CC; pdflatex CC` to confirm Fig.9 + table render and cross-refs resolve.**

---
STEP 8.2 TPS EVIDENCE INTEGRATION COMPLETE —
READY FOR INDEPENDENT AUDIT
