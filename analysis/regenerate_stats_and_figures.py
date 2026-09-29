#!/usr/bin/env python3
"""
Regenerate latency/fee/TPS statistics and Fig.8/Fig.9 from FROZEN evidence
under results/final/. Does NOT hit the network and does NOT re-run experiments.

Usage:  python analysis/regenerate_stats_and_figures.py
Outputs: analysis/out/ (stats JSON + figures)
"""
import os, json, statistics

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
FINAL = os.path.join(REPO, "results", "final")
OUT = os.path.join(HERE, "out")
os.makedirs(OUT, exist_ok=True)

L2A = "0x3d16641a759a4d524b5ec0a968595c7ff700c0cf"
L1A = "0xd56aba43273f9080bca0ea6cfcb200ac38def549"

def pct(xs, p):
    xs = sorted(xs); k = (len(xs)-1)*p/100; f = int(k); c = min(f+1, len(xs)-1)
    return xs[f] + (xs[c]-xs[f])*(k-f)

def load_exp(d):
    raw = [json.loads(l) for l in open(os.path.join(d,"raw","attempts.jsonl")).read().split("\n") if l.strip()]
    batches = [json.loads(l) for l in open(os.path.join(d,"batches","batches.jsonl")).read().split("\n") if l.strip()]
    env = json.load(open(os.path.join(d,"environment.json")))
    return raw, batches, env

rows = []
for name in sorted(os.listdir(FINAL)):
    d = os.path.join(FINAL, name)
    if not (os.path.isdir(d) and name.startswith("experiment_pilot_")): continue
    raw, batches, env = load_exp(d)
    for b in batches:
        rid = b.get("run_id")
        if not rid: continue
        rr = [a for a in raw if a.get("run_id")==rid and a.get("status")=="success"]
        lat = [a["latency_ms"] for a in rr if a.get("latency_ms") is not None]
        gas = [int(a["gas_used"]) for a in rr if a.get("gas_used")]
        egp = [int(a["effective_gas_price"]) for a in rr if a.get("effective_gas_price")]
        fees = [int(a["gas_used"])*int(a["effective_gas_price"]) for a in rr if a.get("gas_used") and a.get("effective_gas_price")]
        net = "L2" if env.get("chain_id")==300 else ("L1" if env.get("chain_id")==11155111 else str(env.get("chain_id")))
        rows.append({
            "network": net, "operation": b["operation"], "N": b["N"],
            "success": b["final_success"], "failure": b["final_failure"],
            "batch_duration_ms": b["batch_duration_ms"],
            "tps_completed": b["final_success"]/(b["batch_duration_ms"]/1000) if b["batch_duration_ms"] else None,
            "lat_median_ms": statistics.median(lat) if lat else None,
            "lat_p95_ms": pct(lat,95) if lat else None,
            "lat_max_ms": max(lat) if lat else None,
            "gas_median": int(statistics.median(gas)) if gas else None,
            "egp_gwei_median": (statistics.median(egp)/1e9) if egp else None,
            "fee_native_eth_median": (statistics.median(fees)/1e18) if fees else None,
        })

json.dump(rows, open(os.path.join(OUT,"regenerated_stats.json"),"w"), indent=2)
print(f"wrote regenerated_stats.json ({len(rows)} batches)")

# Figures (matplotlib optional)
try:
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    Ns=[100,500,1000]
    def series(net,op):
        return [next((r["tps_completed"] for r in rows if r["network"]==net and r["operation"]==op and r["N"]==N), None) for N in Ns]
    # Fig.9 TPS
    fig,ax=plt.subplots(figsize=(7,4.5))
    for op in ["mint","transfer","block","unblock"]:
        ys=series("L2",op)
        if any(y is not None for y in ys): ax.plot(Ns,ys,"o-",label=f"L2 {op}")
    l1=series("L1","mint")
    if any(y is not None for y in l1): ax.plot(Ns,l1,"x--",label="L1 mint (baseline)")
    ax.set_xlabel("Workload size (N)"); ax.set_ylabel("Completed application-level throughput (TPS)")
    ax.set_xticks(Ns); ax.grid(True,alpha=0.3); ax.legend()
    plt.tight_layout(); plt.savefig(os.path.join(OUT,"fig9_tps.png"),dpi=200); plt.close()
    # Fig.8 fee
    fig,ax=plt.subplots(figsize=(7,4.5))
    def fee_series(net):
        return [next((r["fee_native_eth_median"] for r in rows if r["network"]==net and r["operation"]=="mint" and r["N"]==N), None) for N in Ns]
    ax.plot(Ns,fee_series("L1"),"x--",label="L1 mint")
    ax.plot(Ns,fee_series("L2"),"o-",label="L2 mint")
    ax.set_yscale("log"); ax.set_xlabel("Workload size (N)"); ax.set_ylabel("Estimated native-token fee per mint (ETH, log)")
    ax.set_xticks(Ns); ax.grid(True,alpha=0.3,which="both"); ax.legend()
    plt.tight_layout(); plt.savefig(os.path.join(OUT,"fig8_fee.png"),dpi=200); plt.close()
    print("wrote fig8_fee.png + fig9_tps.png")
except ImportError:
    print("matplotlib not available; stats JSON written, figures skipped")
