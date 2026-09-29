# Results

## final/
Authoritative evidence used by the paper. 16 valid batches (L2: mint/transfer/block/unblock x N{100,500,1000}, incl. an extra unblock N=100; L1: mint N{100,500,1000}). Each `experiment_pilot_*` dir contains environment.json, experiment_config.json, raw/attempts.jsonl (source of truth), batches/batches.jsonl, summary/. Regenerated summaries: per_batch_statistics.json, L1_L2_matched_mint.json, reliability_summary.json, gas_summary.json, STEP7_EVIDENCE_INVENTORY.json.

## excluded/
Failed/superseded development runs, retained for transparency (NOT used by the paper): two pre-bugfix L2 transfer experiments (all attempts failed before the safeTransferFrom-overload + signer fix). Preserved, not deleted.

Raw experimental values are never altered. Statistics are regenerated from raw by `analysis/regenerate_stats_and_figures.py`.
