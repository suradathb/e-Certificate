# STEP 6 BASELINE

- Date: 2026-09-26
- Git: **NOT AVAILABLE in this environment** (ZIP export has no `.git`; `git` not runnable here). Author must record `git rev-parse HEAD` / branch on their machine. Do not fabricate.
- Node: v22.x (author machine; used for hardhat test in STEP 2)
- Hardhat: 2.24.3 (from package.json / STEP 2 run)
- Solidity: 0.8.20 (contract pragma / hardhat.config)
- Contract: `NFTCowCert` in `contracts/NFTCowCert_v2.sol` (unchanged; SHA in `baseline_snapshot/pre-jos-revision-2026/MANIFEST.sha256.json`)
- Network for STEP 6 evidence: **in-process Hardhat network** (event-replay conformance; no live testnet or private key needed)
- Live-network CLI is also provided (`scripts/replay/reconstructCertificateState.ts`) for optional zkSync Era replay using `.env` RPC + contract address.

Integrity: STEP 6 adds replay code + tests + a scale runner. It does NOT modify the contract, the manuscript, CC.bib, the reviewer checklist, or any prior experimental results.
