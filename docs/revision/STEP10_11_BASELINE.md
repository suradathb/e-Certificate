# STEP 10 + 11 — BASELINE (authoritative artifacts)

Date: 2026-09-29T10:33:00
Scope: final manuscript consolidation (STEP 10) + claim audit gate (STEP 11). No new experiments; no frozen-evidence changes; prose→evidence only.

## Authoritative artifacts
| Artifact | Path | Status |
|----------|------|--------|
| Manuscript source | CC.tex (729 lines) | AUTHORITATIVE |
| Compiled PDF | CC.pdf | must recompile locally (no TeX engine in sandbox) |
| Bibliography | CC.bib | AUTHORITATIVE |
| Repository (STEP 9 final) | e-Certificate/ | AUTHORITATIVE |
| Frozen results | e-Certificate/results/final/ | AUTHORITATIVE (16 batches) |
| Replay evidence | e-Certificate/replay-artifacts/ | AUTHORITATIVE |
| Analysis | e-Certificate/analysis/ | AUTHORITATIVE |
| Reviewer checklist | outputs/reviewer_checklist/NFTCowCert_Reviewer_Revision_Checklist.xlsx | AUTHORITATIVE |
| Per-batch stats | results/final/per_batch_statistics.json | AUTHORITATIVE |

## Frozen evidence values (from STEP 7/8, for claim audit)
- L2 mint TPS: 0.946 / 1.144 / 0.976 (N=100/500/1000)
- L1 mint TPS: 0.198 / 0.248 / 0.245
- L2 median latency: ~1.9–3.1 s (state-changing ops); L1 mint median ~12 s
- Gas: L2 mint ~161,370; L1 mint ~205,878 (median)
- egp: L2 0.025 Gwei; L1 ~1.07–1.47 Gwei
- Fee reduction (matched mint): 98.2% / 98.7% / 98.6%
- Concurrency = 3; N ∈ {100,500,1000}; 0 failures observed
- Replay: N=100/500/1000 → 1,600/1,600 states matched, 100%, 0 unreconstructible
- Contracts: L2 0x3D16641A759A4d524B5ec0a968595C7FF700C0cF; L1 0xD56ABA43273f9080BCA0Ea6CfCb200Ac38deF549

## NOT AVAILABLE FOR VERIFICATION in sandbox
- git provenance (commit/tag) — RUN LOCALLY
- pdflatex compile + visual PDF audit — RUN LOCALLY
- LibreOffice docx/pdf render — unavailable

## Compile command (local)
pdflatex CC.tex && bibtex CC && pdflatex CC && pdflatex CC
