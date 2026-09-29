# NFTCowCert V2

NFTCowCert V2 is a research prototype for evaluating blockchain-based certificate
systems on Ethereum Layer-2 (zkSync Era) with an Ethereum Layer-1 (Sepolia) baseline.
It provides the smart contract, lifecycle scripts, a concurrent benchmark harness,
a deterministic event-replay conformance tool, and the frozen experimental evidence
used in the associated paper.

---

## Quick links
- **[GETTING_STARTED.md](GETTING_STARTED.md)** — step-by-step setup, run, and reproduce
- **[REPRODUCING.md](REPRODUCING.md)** — four reproduction levels
- **[DEPLOYED_CONTRACTS.md](DEPLOYED_CONTRACTS.md)** — on-chain contracts + transaction explorer links
- **[GIT_PUSH_GUIDE.md](GIT_PUSH_GUIDE.md)** — how to publish safely
---

## Supported Networks
- **zkSync Era Sepolia (Layer-2)** — chain ID 300 — primary
- **Ethereum Sepolia (Layer-1)** — chain ID 11155111 — baseline

Deployed contracts used in the reported experiments:
- zkSync Era Sepolia: `0x3D16641A759A4d524B5ec0a968595C7FF700C0cF`
- Ethereum Sepolia:   `0xD56ABA43273f9080BCA0Ea6CfCb200Ac38deF549`

---

## Repository layout
```
contracts/            NFTCowCert_v2.sol (contract name: NFTCowCert)
deploy/               deployment scripts (L1 + zkSync)
scripts/              lifecycle scripts (mint/transfer/block/unblock/fetch), uploadToIPFS
scripts/replay/       event-replay reconstruction + scale/conformance runners
scripts/benchmark-final/  concurrent benchmark runner (benchmark_final.ts)
src/benchmark/        benchmark modules (timing, concurrency, stats, checkpoint/resume)
src/replay/           replay decoder/reducer/compare
analysis/             analysis + figure-regeneration scripts (frozen-evidence based)
results/final/        authoritative raw evidence used by the paper
results/excluded/     failed/superseded/development runs (retained for transparency)
test/                 unit + replay + checkpoint tests
docs/                 methodology, revision, and reproduction documentation
```

---

## Quick Start

### Install dependencies
```bash
npm install
```

### Compile
```bash
npx hardhat compile
```

### Run tests
```bash
npm test              # all hardhat tests
npm run test:replay   # event-replay reducer + integration
npm run test:benchmark
```

---

## IPFS Metadata Storage and Availability

### Evaluated configuration
The evaluated prototype uses a **local IPFS node** via the HTTP API at
`localhost:5001` (through `ipfs-http-client`). No external pinning service,
gateway failover, or replication is part of the evaluated implementation.

### Upload
`scripts/uploadToIPFS.ts` reads a metadata JSON file, adds each certificate object
to the local IPFS node, and records the returned CIDs:
```bash
# requires a local IPFS daemon listening on localhost:5001
npx tsx scripts/uploadToIPFS.ts
```
Configurable via env: `IPFS_API_HOST`, `IPFS_API_PORT`, `IPFS_API_PROTOCOL`,
`IPFS_INPUT_FILE`, `IPFS_OUTPUT_FILE`.

### CID
The `add` call returns a **content identifier (CID)** that is a content-addressed
hash of the metadata object. Retrieved content can be checked against its CID.

### On-chain binding
`issueCert(_to, _metadataCID, _cowId, _cowHash)` stores `_metadataCID` in the on-chain
`Cert` record, emits it in the `CertIssued(id, to, metadataCID)` event, and sets the
ERC-721 token URI to `ipfs://<CID>` (`_setTokenURI`). The deterministic replay tool
reconstructs the `metadataCID` reference purely from `CertIssued`.

### Retrieval
Retrieval is performed against the configured IPFS node/CID. The repository
demonstrates CID/content verification at test time; it does not provide a hosted gateway.

### Availability limitation
Content addressing protects the **integrity** of retrieved metadata but does **not**
by itself guarantee long-term **availability**. If no reachable IPFS node retains the
object, the CID remains valid while the metadata may be temporarily or permanently
unavailable.

### Production deployment consideration (not evaluated)
Production deployments may add persistent pinning, replicated IPFS nodes, and redundant
gateway access to improve availability. **These mechanisms were not implemented or
evaluated in this study.**

---

## Reproduction

See [REPRODUCING.md](REPRODUCING.md) for the full reviewer-oriented path. Three distinct
modes are documented:

1. **Local functional reproduction** — compile, tests, replay (no credentials).
2. **Frozen-evidence analysis** — regenerate statistics/figures from `results/final/`
   (no network, no credentials).
3. **Public-testnet re-execution** — re-run the benchmark on zkSync Era Sepolia /
   Ethereum Sepolia (requires your own funded testnet wallet + RPC; timing/fees vary).

Frozen-evidence analysis does **not** require any private credentials.

---

## Benchmark (public-testnet re-execution)

Requires a funded **testnet** wallet and RPC endpoints in `.env` (see `.env.example`).
Never commit real keys.
```bash
# L2 (zkSync Era Sepolia)
BENCH_MODE=live BENCH_OP=mint BENCH_NS="100" BENCH_CONC="3" \
  npx hardhat run scripts/benchmark-final/benchmark_final.ts --network zkSyncTestnet

# L1 (Ethereum Sepolia)
BENCH_MODE=live BENCH_OP=mint BENCH_NS="100" BENCH_CONC="3" \
  npx hardhat run scripts/benchmark-final/benchmark_final.ts --network ethereumSepolia
```
Outputs are written under `benchmark-final-results/experiment_<id>/`. Public-testnet
conditions vary, so absolute timing/fees are not expected to be identical across runs.

---

## Event-replay conformance
```bash
npm run test:replay        # reducer + integration tests
npm run replay:scale       # scale/conformance runner (writes replay-artifacts/)
```

---

## Notes
- Benchmarks run on public testnets under live conditions; results vary with congestion.
- `.env`, logs, caches, and local credential files are excluded from version control.
- This repository is the reference implementation for the experimental results in the paper.

## License
MIT
