# FINAL CORRECTIVE PASS — STEP 10 + 11

> CC.tex only. No experiments/evidence/figures/contract/methodology changes. Four audited issues fixed + provenance cross-check + final claim search.

## Issue 1 — §5.1 experiment scope (three → four operations)
**Before:** "We evaluate three certificate lifecycle operations … issuance (minting), ownership transfer, and metadata retrieval via IPFS."
**After:** "The Layer-2 evaluation covers four state-changing lifecycle operations---mint (issue), transfer, block (suspend), and unblock (reinstate)---at N ∈ {100,500,1{,}000}, together with read-only metadata fetch. Metadata fetch is a read-only query and is not a lifecycle transition. The Ethereum Sepolia Layer-1 baseline is restricted to matched mint workloads at the same N values."

## Issue 2 — §6.4 L1 baseline limitation (workload size → operation coverage)
**Before:** "Layer-1 baseline experiments were conducted under smaller workload volumes … normalized at the per-transaction level rather than by matching identical batch sizes."
**After:** "the Ethereum Sepolia baseline is limited in operation coverage rather than workload size: only mint was evaluated on Layer-1, whereas the Layer-2 evaluation includes mint, transfer, block, and unblock. Both layers use matched mint workloads at N ∈ {100,500,1{,}000}. Consequently, cross-layer comparisons are restricted to matched mint workloads … the study does not establish L1/L2 comparisons for transfer, suspension, or reinstatement."
(Frozen evidence confirms L1 mint AND L2 mint both at N=100/500/1000 — the old "smaller workload" claim was factually wrong.)

## Issue 3 — Conclusion claim bounding
**Before (L701):** "… it is sufficient to establish the architectural soundness and operational efficiency of the proposed framework."
**After:** "… the results support the feasibility of implementing the lifecycle-aware framework and provide empirical measurements of application-level receipt latency, native-token fee estimates, and completed throughput … The evaluation is intentionally scoped and does not by itself establish production readiness or protocol-level scalability."
**Before (L707):** "… delivering measurable improvements in cost efficiency, performance stability, and scalability. These findings provide a concrete pathway toward deploying high-volume, trust-minimized certification systems beyond experimental settings."
**After:** "Overall, this work provides a reproducible and empirically grounded basis for further evaluation of lifecycle-aware certification on Layer-2 infrastructures. The reported results characterize the evaluated prototype under the tested public-testnet workloads; broader claims regarding production scalability, fault tolerance, cross-domain generalizability, and long-term deployment require further study."

## Issue 4 — Repository provenance cross-check
| Claim | STEP 9 status | Manuscript action |
|-------|---------------|-------------------|
| Release v2.0.0 | tag created locally (user) | RETAINED (tag exists after push) |
| Commit identifier `0xe022…` (64-hex) | **NOT ESTABLISHED / MISMATCH** (not a valid 40-hex git SHA; repo was ZIP) | **CORRECTED** → placeholder "[to be inserted from git rev-parse HEAD at camera-ready]" |
| Complete source availability | VERIFIED (repo pushed) | retained |
| Benchmark scripts | VERIFIED (scripts/benchmark-final) | retained |
| Seed datasets | VERIFIED (deterministic cowId/token generation documented) | retained |
| Transaction hashes | VERIFIED (8,100 tx_hash in results/final) | retained |
| Replay artifacts | VERIFIED (replay-artifacts/) | retained |
| zkSync address 0x3D16…C0cF | VERIFIED (evidence env.json chain 300) | retained |
| Ethereum address 0xD56A…F549 | VERIFIED (evidence env.json chain 11155111) | retained |

The fake 64-hex commit hash was removed (the only NOT ESTABLISHED/MISMATCH item). All other reproducibility claims are backed by STEP 9 evidence.

## Issue 5 — Final claim search (post-correction)
| Term | Occurrences | Disposition |
|------|-------------|-------------|
| production | 8 | all bounded (public-testnet / future-work / literature); none claim production-ready |
| scalability / scalable | 16 | bounded (architecture/ trade-offs / "rather than emphasizing"); no protocol-capacity claim |
| real-world | 4 | real Brahman cattle metadata / V1 context |
| finality | 8 | NOT-measured caveats + literature background |
| immutable | 0 | removed (content-addressed used) |
| O(1) | 0 | (only §3.3 uses \mathcal{O}, not literal "O(1)" string here) |
| domain-agnostic | 0 | removed |
| revoke / revocation | 11 | table column + "not implemented/evaluated" + literature |
| trust-minimized | 0 | removed |
| soundness | 1 | zk-SNARK trusted-setup security discussion (valid) |
| high-volume | 1 | "Rather than emphasizing high-volume …" (explicitly not claimed) |

**ZERO UNJUSTIFIED OCCURRENCES.**

## Compile
Environment balance: table 8/8, tabular* 8/8, figure 10/10, equation 3/3, itemize 5/5. Section refs resolve (0 unresolved). User must run `pdflatex CC.tex && bibtex CC && pdflatex CC && pdflatex CC` and confirm 0 errors / 0 undefined.
