# BASELINE — NFTCowCert V2 Revision (Cluster Computing / JOS 2026)

> STEP 1 — Freeze Current Baseline
> Frozen at: **2026-09-26**

## 0. Status update (post-freeze)
- **git is now available** on the author's machine (after `xcode-select --install`). The author should create branch `revision-jos-2026` and tag `pre-jos-revision-2026` using the commands in §5. The original baseline commit SHA is still `NOT AVAILABLE` (the ZIP export had no `.git`) and must not be fabricated.
- **Lifecycle tests executed: 11 passing, 0 failing, 0 skipped** (`npx hardhat test test/lifecycle.spec.ts`).
- Files changed AFTER the freeze snapshot (tracked, not part of the frozen baseline):
  - `hardhat.config.ts` — added `hardhat` network + dummy-key fallback + chai-matchers import (enables compile/test; no contract change)
  - `package.json`, `package-lock.json` — added dev dep `@nomicfoundation/hardhat-chai-matchers@^2.0.0`
  - added `test/lifecycle.spec.ts` and `docs/revision/*`
  - The frozen copy in `baseline_snapshot/pre-jos-revision-2026/` remains the untouched pre-revision reference.

## 1. Provenance summary

| Field | Value |
|-------|-------|
| Repository | `suradathb/e-Certificate` |
| Acquisition method | Downloaded as ZIP (`refs/heads/main`) on 2026-09-26 — **not** a live `git clone` |
| Baseline commit SHA | `NOT AVAILABLE IN CURRENT BASELINE` (no `.git` metadata in ZIP export) |
| Revision branch | `revision-jos-2026` — **NOT CREATED IN GIT** (git unavailable in this environment; see §5) |
| Baseline tag | `pre-jos-revision-2026` — realized as a **file snapshot**, not a git tag (see §4) |
| Manuscript version | `submission_fixed.pdf` (SHA-256 `7a9fc7dc…`, 6,059,967 bytes) — identical to `clean_submission/submission_fixed.pdf` |
| Reviewer matrix version | `NFTCowCert_Reviewer_Revision_Checklist.xlsx` (Reviewer 1 = R1-01..R1-28; Reviewer 2 = R2-01..R2-13; ประเด็นร่วม = COM-01..COM-10) |

## 2. Environment / toolchain (declared, from repo config)

| Item | Value (from `hardhat.config.ts` / `package.json`) |
|------|-------|
| Default network | `zkSyncTestnet` (`ZKSYNC_RPC`) |
| Also configured | `opSepolia`, `zkCustom` (localhost:3050), `ethereumSepolia` (chainId 11155111), `bnbTestnet` (chainId 97) |
| Solidity | `0.8.20` |
| zksolc | `1.5.1`, optimizer enabled, runs=200 |
| OpenZeppelin | `@openzeppelin/contracts ^4.9.2` |
| ethers | `^6.16.0` |
| hardhat | `^2.24.3` |
| Node types | `@types/node ^25` |
| Runtime env (machine/OS/Node version used for the reported experiments) | `NOT AVAILABLE IN CURRENT BASELINE` |

## 3. Relevant files at baseline

**Contract**
- `contracts/NFTCowCert_v2.sol` — contract name `NFTCowCert` (ERC721URIStorage + Ownable)

**Deployment scripts**
- `deploy/deploy_NFTCowCer_v2.ts` — zkSync deploy (`deployer.loadArtifact("NFTCowCert_v2")`, ctor arg = `wallet.address`)
- `deploy/deploy_L1.ts` — L1 deploy via `ethers.ContractFactory`

**Benchmark / experiment scripts** (all sequential `for … await tx.wait()`)
- `scripts/01_mint.ts`, `scripts/01_mint_retry.ts`
- `scripts/02_transfer.ts`, `scripts/02_transfer_retry.ts`
- `scripts/03_block.ts`
- `scripts/04_unblock.ts`
- `scripts/05_fetch.ts` (read-only `certs(tokenId)`)
- `scripts/06_summary_to_csv.ts` (merges `output/1000/0X_*_results.json` → `summary_1000.csv`)
- `scripts/uploadToIPFS.ts`, `scripts/uploadToIPFS.mjs`

**Tests**
- `NOT AVAILABLE IN CURRENT BASELINE` — no `test/` or `tests/` directory existed at freeze time. (New tests added under STEP 2 are clearly separated; see FORMAL_MODEL_ALIGNMENT.md.)

**Historical experiment results**
- `output/` is git-ignored and **not present** in the ZIP export → historical raw results (`output/1000/*.json`, `summary_1000.csv`) are `NOT AVAILABLE IN CURRENT BASELINE`. They must be located from the author's original machine before any re-run comparison. **No existing results were overwritten because none are present.**

## 4. Baseline snapshot (git tag replacement)

Because git is unavailable, the frozen baseline is preserved as an immutable file snapshot with a SHA-256 manifest:

- Snapshot directory: `baseline_snapshot/pre-jos-revision-2026/`
- Manifest: `baseline_snapshot/pre-jos-revision-2026/MANIFEST.sha256.json` (21 files, per-file SHA-256 + byte size)

This snapshot is the authoritative "pre-revision" reference. Do not modify files inside it.

## 5. Git limitation (declared honestly)

`git` cannot run in this environment (`xcode-select` developer tools unavailable). Therefore:
- No real branch `revision-jos-2026` or tag `pre-jos-revision-2026` was created in git history.
- Commit SHA is `NOT AVAILABLE IN CURRENT BASELINE`.

**Recommended action on the author's machine** (to be executed by the author, outside this environment):
```bash
cd e-Certificate
git init            # if not already a repo
git add -A && git commit -m "baseline: pre-JOS-2026 revision snapshot"
git tag pre-jos-revision-2026
git checkout -b revision-jos-2026
```
The file snapshot in §4 lets the author verify that nothing changed between freeze and the first commit.

## 6. Integrity rules honored
- Historical experiment results: not modified (none present).
- Benchmark evidence: not overwritten.
- Experimental values: not altered to match the manuscript.
- New experimental results (future steps) will be written to separate directories (e.g. `output/revision-jos-2026/…`) so they never mix with historical data.
