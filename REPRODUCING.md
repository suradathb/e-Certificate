# REPRODUCING.md

Reviewer-oriented reproduction paths for NFTCowCert V2. Three independent modes; only mode C needs a funded testnet wallet.

## Prerequisites
```bash
npm install
npx hardhat compile
```

## A. Local functional reproduction (no credentials)
```bash
npm test                 # unit + replay + checkpoint tests
npm run test:replay      # event-replay reducer + integration
```

## B. Frozen-evidence analysis (no network, no credentials)
Regenerate latency/fee/TPS statistics and Fig.8/Fig.9 from `results/final/`:
```bash
python analysis/regenerate_stats_and_figures.py
# outputs: analysis/out/regenerated_stats.json, fig8_fee.png, fig9_tps.png
```
This reads only frozen raw evidence; it does not hit the network. Matched mint values
(TPS: L2 0.95/1.14/0.98, L1 0.20/0.25/0.25; median latency ~2-3s L2 / ~12s L1;
fee reduction ~98.2-98.7%) are recomputed from `results/final/.../raw/attempts.jsonl`.

## C. Public-testnet re-execution (requires your own funded testnet wallet + RPC)
Configure `.env` from `.env.example` (NEVER commit real keys). Then e.g.:
```bash
BENCH_MODE=live BENCH_OP=mint BENCH_NS="100" BENCH_CONC="3" \
  npx hardhat run scripts/benchmark-final/benchmark_final.ts --network zkSyncTestnet
```
Public-testnet conditions vary; absolute timing/fees will not match exactly.

## D. IPFS live upload (requires a local IPFS daemon on localhost:5001)
```bash
npx tsx scripts/uploadToIPFS.ts
```
Content addressing provides integrity/identity of retrieved metadata; it does not
guarantee long-term availability (see docs/ipfs/IPFS_IMPLEMENTATION_AUDIT.md).

## Contract / network provenance
- zkSync Era Sepolia: 0x3D16641A759A4d524B5ec0a968595C7FF700C0cF
- Ethereum Sepolia:   0xD56ABA43273f9080BCA0Ea6CfCb200Ac38deF549
Inspect with scripts/benchmark-final/diagnose.ts (requires RPC).

## Mapping to manuscript
- Table (matched mint TPS) + Fig.9 ← analysis/out (from results/final)
- Cost table + Fig.8 ← analysis/out fee series
- Event-replay conformance ← npm run replay:scale (writes replay-artifacts/)
