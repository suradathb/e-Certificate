# STEP 7 — EXISTING BENCHMARK AUDIT

> Audit of the benchmark code/claims that currently back the manuscript's performance numbers.
> Basis: actual inspection of `scripts/*.ts` and the contract. No claim is assumed valid because it is in CC.tex.

## Existing benchmark implementation — what actually exists
| Script | Signer model | Concurrency | Timing | Gas | Output |
|--------|--------------|-------------|--------|-----|--------|
| `01_mint.ts` | single `PRIVATE_KEY`, 1 wallet | **sequential** `for … await tx.wait()` | `Date.now()` submit→receipt | `rcpt.gasUsed` | `output/1000/01_mint_results.json` + `_failed.json` |
| `02_transfer.ts` | single wallet | sequential | Date.now() | gasUsed | 02_*_results |
| `03_block.ts` / `04_unblock.ts` | single wallet (admin) | sequential | Date.now() | gasUsed | 03/04_*_results |
| `05_fetch.ts` | single wallet | sequential | Date.now() | none (read) | 05_fetch_results |
| `01_mint_retry.ts` / `02_transfer_retry.ts` | single wallet | sequential; re-runs `*_failed.json` | Date.now() | gasUsed | *_retry_results |
| `06_summary_to_csv.ts` | — | merges JSON → CSV | — | — | summary_1000.csv |

## Claim-by-claim audit
| Manuscript claim | Current source | Reproducible? | Evidence present? | Disposition |
|---|---|---|---|---|
| N=100/500/1000 workloads | scripts run over `cid_list` | partially (scripts exist) | historical `output/` NOT in repo | **Re-run** |
| "parallel execution" / "concurrent submission" | — | **NO** — all scripts are sequential `await tx.wait()` | contradicts claim | **Replace** (implement real concurrency) |
| RPC submit→receipt latency | `Date.now()` diff | yes (method exists) | historical results absent | **Re-run** (with monotonic timer) |
| median / IQR / P95 | not in scripts (no stats code found) | **NO stats script exists** | none | **Replace** (implement stats pipeline) |
| bootstrap 95% CI / BCa 10,000 resamples | **not found in code** | **NO** | none | **Replace or remove** (implement or drop claim) |
| gas / cost | `rcpt.gasUsed` captured | yes | historical absent | **Re-run** (separate measured gas from assumed price) |
| >2,000 TPS / 2,037 TPS | **no TPS computation code found**; sequential runner cannot yield 2,037 TPS | **NO** | none | **Replace** (define TPS, real concurrency, measure) |
| Ethereum L1 comparison | `deploy_L1.ts` + same scripts | partially | historical absent | **Re-run** (L1 Sepolia) |
| 95–99% cost reduction | derived from assumed 25/0.25 Gwei + \$3200 ETH | assumptions only | no market-price source | **Re-run / relabel** as scenario-based |

## Key findings (must not hide)
1. **No real concurrency exists.** Every script is sequential. The "2,037 TPS / parallel submission" claims are not reproducible from current code.
2. **No statistics code exists** (median/IQR/P95/BCa). These manuscript numbers have no in-repo derivation.
3. **No TPS computation code exists.** TPS denominator is undefined in code.
4. **Historical `output/` results are absent** from the repo export (git-ignored) → prior numbers cannot be re-derived; must re-run.
5. Contract role gating (verified): `issueCert`, `blockCert`, `unblockCert` are `onlyAdmin`; `addAdmin` is `onlyOwner`; `safeTransferFrom` is ERC-721 owner/approved. Therefore mint/suspend/reinstate concurrency must come from **one admin signer with managed nonces**, not multiple wallets. Multiple wallets (owner1/2/3) are only useful as transfer counterparties.

## Consequence for STEP 7 design
- Build a **new** benchmark harness with real bounded concurrency + nonce management + explicit TPS definition + statistics from raw data.
- Admin (`ADDRESS_SIGN` = 0x2a01…afEe) is the primary gas-paying signer for mint/block/unblock.
- Do not reuse the sequential scripts to substantiate parallel/TPS claims.
