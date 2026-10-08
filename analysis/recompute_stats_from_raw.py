#!/usr/bin/env python3
"""
Recompute the per-cell statistics reported in Tables 4-7 of the manuscript
directly from the FROZEN raw evidence in results/final/. Read-only: does not
hit the network, does not re-run experiments, does not modify any evidence file.

Usage:   python analysis/recompute_stats_from_raw.py
Output:  analysis/out/recomputed_stats.json   (and a short table on stdout)

Method (one cell = one (experiment, run_id) batch):
  * Latency: latency_ms of attempt records with status == "success".
    mean, sample SD (ddof=1), median, Q1/Q3/P95 (numpy linear interpolation),
    maximum.
  * Within-batch bootstrap interval of the MEDIAN latency:
    non-parametric percentile bootstrap, 10,000 resamples with replacement
    of the N observed latencies, numpy.random.default_rng(42) re-seeded for
    every cell, interval = 2.5th / 97.5th percentiles of the resampled
    medians. This is a within-batch interval over transaction-level
    observations, NOT a confidence interval over independent repeated runs.
    (src/benchmark/stats.ts bootstrapMeanCI is a bootstrap of the MEAN and is
    not the method used for the manuscript tables.)
  * Fee: fee_i = gas_used_i * effective_gas_price_i (wei, from receipts);
    "Median native fee" = median(fee_i) / 1e18 ETH.
  * Attempt / retry counts: batches.jsonl counters, cross-checked against the
    maximum attempt_number in attempts.jsonl.
  * Timeouts: no dedicated timeout counter exists; the script only reports how
    many attempt records carry ANY error_type (all zero in results/final).
  * T_batch: batch_duration_ms as measured by the runner; TPS = success/T_batch.
"""
import glob
import json
import os

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
FINAL = os.path.join(os.path.dirname(HERE), "results", "final")
OUT = os.path.join(HERE, "out")
B, SEED = 10_000, 42
# Authoritative run selection (docs/revision/step8/STEP8_2_TPS_INTEGRATION.md):
# unblock N=100 also exists in experiment_pilot_1790553124954; the value used in
# the manuscript is taken from 1790562436815, which carries all three N values.
SUPPLEMENTARY = {"experiment_pilot_1790553124954"}


def load_jsonl(path):
    with open(path, encoding="utf-8") as f:
        return [json.loads(line) for line in f if line.strip()]


def main():
    os.makedirs(OUT, exist_ok=True)
    rows = []
    for d in sorted(glob.glob(os.path.join(FINAL, "experiment_pilot_*"))):
        exp = os.path.basename(d)
        env = json.load(open(os.path.join(d, "environment.json"), encoding="utf-8"))
        attempts = load_jsonl(os.path.join(d, "raw", "attempts.jsonl"))
        batches = load_jsonl(os.path.join(d, "batches", "batches.jsonl"))
        for b in batches:
            rid = b["run_id"]
            recs = [a for a in attempts if a["run_id"] == rid]
            ok = [a for a in recs if a["status"] == "success"]
            if not ok:
                continue
            lat = np.array([a["latency_ms"] for a in ok], float)
            fee = np.array([int(a["gas_used"]) * int(a["effective_gas_price"]) for a in ok], float) / 1e18
            rng = np.random.default_rng(SEED)
            boot = np.median(rng.choice(lat, (B, len(lat)), replace=True), axis=1)
            q1, q3 = np.percentile(lat, [25, 75])
            rows.append({
                "experiment": exp,
                "run_id": rid,
                "role": "supplementary" if exp in SUPPLEMENTARY else "primary",
                "network": "L2" if env.get("chain_id") == 300 else ("L1" if env.get("chain_id") == 11155111 else str(env.get("chain_id"))),
                "operation": b["operation"],
                "N": b["N"],
                "attempted": b.get("attempted_logical_operations"),
                "succeeded": b.get("final_success"),
                "failed": b.get("final_failure"),
                "retried_ops": b.get("operations_requiring_retry"),
                "total_retries": b.get("total_retry_attempts"),
                "max_attempt_number": max(a.get("attempt_number", 1) for a in recs),
                "records_with_error_type": sum(1 for a in recs if a.get("error_type")),
                "mean_ms": round(float(lat.mean()), 1),
                "sd_ms": round(float(lat.std(ddof=1)), 1),
                "median_ms": round(float(np.median(lat)), 1),
                "iqr_ms": round(float(q3 - q1), 1),
                "p95_ms": round(float(np.percentile(lat, 95)), 1),
                "max_ms": round(float(lat.max()), 1),
                "median_boot95_lo_ms": round(float(np.percentile(boot, 2.5)), 1),
                "median_boot95_hi_ms": round(float(np.percentile(boot, 97.5)), 1),
                "t_batch_s": round(b["batch_duration_ms"] / 1000, 1),
                "tps": b["final_success"] / (b["batch_duration_ms"] / 1000),
                "median_native_fee_eth": float(np.median(fee)),
            })
    with open(os.path.join(OUT, "recomputed_stats.json"), "w", encoding="utf-8") as f:
        json.dump(rows, f, indent=1)
    for r in rows:
        print(f"{r['network']} {r['operation']:8s} N={r['N']:<5} {r['role']:13s} "
              f"median={r['median_ms']:>8.1f} [{r['median_boot95_lo_ms']:.1f}, {r['median_boot95_hi_ms']:.1f}] "
              f"T_batch={r['t_batch_s']}s TPS={r['tps']:.3f} fee={r['median_native_fee_eth']:.4e}")


if __name__ == "__main__":
    main()
