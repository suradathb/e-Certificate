# Getting Started — NFTCowCert V2

A step-by-step guide to set up, run, and reproduce NFTCowCert V2, whether you want to
(a) verify the paper's results, (b) test the system, or (c) adapt it for other work.

---

## 1. What you need

| Requirement | Version / Source | Needed for |
|-------------|------------------|------------|
| Node.js | ≥ 18 LTS (tested on 22) — https://nodejs.org | everything |
| npm | ships with Node | everything |
| Git | https://git-scm.com | cloning |
| Python | ≥ 3.9 (+ `matplotlib`) — https://python.org | analysis / figures |
| A code editor | VS Code recommended | editing |
| IPFS daemon (optional) | https://docs.ipfs.tech/install/ | live metadata upload only |
| Testnet wallet + RPC (optional) | see §6 | live testnet re-execution only |

> To only **verify the paper's frozen results**, you need just Node + Python. No wallet, no RPC, no IPFS.

---

## 2. Get the code

```bash
git clone https://github.com/suradathb/e-Certificate.git
cd e-Certificate
npm install
```

---

## 3. Compile & test (local, no credentials)

```bash
npx hardhat compile          # compile the smart contract
npm test                     # run all tests (lifecycle, replay, checkpoint, benchmark units)
```
Expected: contract compiles; tests pass (lifecycle 11, replay 13+2, checkpoint 10, benchmark 11).

---

## 4. Verify the paper's results from frozen evidence (no network)

The repository ships the **actual experimental evidence** used in the paper under
`results/final/`. Regenerate the statistics and figures from it:

```bash
pip install matplotlib          # once
python analysis/regenerate_stats_and_figures.py
```
Outputs in `analysis/out/`:
- `regenerated_stats.json` — latency / TPS / gas / fee per batch
- `fig7_latency.png`, `fig8_fee.png`, `fig9_tps.png`

These reproduce the manuscript values (L2 mint ~0.95–1.14 TPS, L1 mint ~0.20–0.25 TPS,
L1 median latency ~12 s, ~98% fee reduction). See `audit/ANALYSIS_REGENERATION.md`.

---

## 5. Event-replay conformance (local)

```bash
npm run test:replay          # reducer + integration tests
npm run replay:scale         # scale/conformance runner -> replay-artifacts/
```
Reconstructs certificate state purely from emitted events and compares it to the
authoritative contract state.

---

## 6. (Optional) Re-run the benchmark on public testnets

Only needed if you want to produce **new** on-chain measurements. Timing/fees will vary.

### 6.1 Configure environment
```bash
cp .env.example .env
```
Then edit `.env` and fill in:
- `PRIVATE_KEY` — a **throwaway testnet** wallet private key (never a real-funds key)
- `ZKSYNC_RPC` — e.g. `https://sepolia.era.zksync.dev`
- `ETH_RPC` — an Ethereum Sepolia RPC URL (e.g. from Alchemy/Infura)
- `ZKSYNC_CONTRACT` / `SEPOLIA_CONTRACT` — deployed addresses (see `DEPLOYED_CONTRACTS.md`) or your own after deploy

### 6.2 Fund the wallet
Use the faucets listed in `DEPLOYED_CONTRACTS.md`.

### 6.3 (Optional) Deploy your own contracts
```bash
npx hardhat run deploy/deploy_NFTCowCer_v2.ts --network zkSyncTestnet   # L2
npx hardhat run deploy/deploy_L1.ts --network ethereumSepolia           # L1
```

### 6.4 Run a benchmark batch
```bash
# L2 mint, N=100, concurrency 3
BENCH_MODE=live BENCH_OP=mint BENCH_NS="100" BENCH_CONC="3" \
  npx hardhat run scripts/benchmark-final/benchmark_final.ts --network zkSyncTestnet
```
`BENCH_OP` ∈ mint|transfer|block|unblock. Output → `benchmark-final-results/experiment_<id>/`.

---

## 7. (Optional) IPFS metadata upload (local node)

```bash
# start a local IPFS daemon first (ipfs daemon), listening on localhost:5001
npx tsx scripts/uploadToIPFS.ts
```
Returns a CID per metadata object. **Note:** content addressing verifies integrity, not
long-term availability (see `docs/ipfs/IPFS_IMPLEMENTATION_AUDIT.md`).

---

## 8. Verify on-chain transactions

Every recorded `tx_hash` is verifiable on the public explorers — see `DEPLOYED_CONTRACTS.md`.

---

## 9. Adapting for other work

- **Contract:** `contracts/NFTCowCert_v2.sol` (contract name `NFTCowCert`). Lifecycle:
  issue / transfer / suspend(block) / reinstate(unblock); read-only fetch. Permanent revoke
  is a conceptual extension (not implemented).
- **Benchmark harness:** `src/benchmark/` + `scripts/benchmark-final/benchmark_final.ts`
  (timing, bounded concurrency, retry/error taxonomy, stats, crash-safe raw logging,
  checkpoint/resume). Reusable for other contracts by swapping the `submit` function.
- **Replay:** `src/replay/` + `scripts/replay/` — deterministic event → state reconstruction.

---

## 10. Troubleshooting

| Symptom | Fix |
|---------|-----|
| `create is not a function` (IPFS) | ensure `ipfs-http-client` installed (`npm install`) and a daemon runs on :5001 |
| benchmark all-fail on L1 | check `.env` key has no `0x` issues and wallet is funded |
| nonce/timeout on public RPC | lower `BENCH_CONC`, or set `BENCH_RECEIPT_TIMEOUT_MS` higher |
| figures not generated | `pip install matplotlib` |

---

## 11. Repository map
See `README.MD` → Repository layout, and `REPRODUCING.md` for the four reproduction levels.
