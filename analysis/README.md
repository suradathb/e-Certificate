# Analysis

Regenerate manuscript statistics and figures from FROZEN evidence in `../results/final/`.
No network access; no public-testnet re-execution.

```bash
python analysis/regenerate_stats_and_figures.py
```

Outputs (analysis/out/):
- `regenerated_stats.json` — per-batch latency/TPS/gas/fee (median, P95, etc.)
- `fig7_latency.png` — median transaction-receipt latency vs N (L2 ops + L1 mint)
- `fig8_fee.png` — median native-token fee per mint vs N (L1 vs L2, log scale)
- `fig9_tps.png` — completed application-level throughput vs N (L2 ops + L1 mint)

Regenerated values match manuscript (see ../audit/ANALYSIS_REGENERATION.md):
L2 mint TPS 0.95/1.14/0.98; L1 mint TPS 0.20/0.25/0.25; L1 median latency ~12s;
gas ~161k (L2) / ~206k (L1); fee reduction ~98.2–98.7%.
