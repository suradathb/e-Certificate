# STEP 6A — INDEPENDENT AUDIT PACKAGE

All artifacts below are the actual files produced by the STEP 6 run. Results were
regenerated (not hand-edited) after relocating output to `replay-artifacts/` so
Hardhat's `artifacts/` auto-clean no longer deletes them.

## Package contents (paths)
1. `src/replay/` — types.ts, eventSorter.ts, reducer.ts, eventDecoder.ts, compareContractState.ts, reconstructCertificateState.ts
2. `test/replay.reducer.spec.ts`
3. `test/replay.integration.spec.ts`
4. `scripts/replay/reconstructCertificateState.ts` (live CLI)
5. `scripts/replay/runScaleConformance.ts` (scale runner)
6. `docs/revision/step6/STEP6_BASELINE.md`
7. `docs/revision/step6/ARTIFACT_MAPPING.md`
8. `docs/revision/step6/STEP6_RESULTS.md`
9–12. `replay-artifacts/replay_100.json`, `replay_500.json`, `replay_1000.json`, `replay_summary.csv`
13. `package.json`  14. `tsconfig.json`

## RAW execution output (as run on author machine, 2026-09-26)
```
$ npx hardhat test test/replay.reducer.spec.ts
  STEP 6 — replay reducer
    ✔ T1 … ✔ T12 + canonical sort
  13 passing (33ms)

$ npx hardhat test test/replay.integration.spec.ts
  STEP 6 — replay integration (real logs vs contract)
    ✔ reconstructs owner/status/metadata from real emitted logs and matches contract (380ms)
    ✔ negative test: dropping the last unblock event yields MISMATCH
  2 passing (403ms)

$ npx hardhat run scripts/replay/runScaleConformance.ts
  N=100:  events=423  reconstructed=100  match=100  mismatch=0 conformance=100.00% time=321ms
  N=500:  events=2068 reconstructed=500  match=500  mismatch=0 conformance=100.00% time=1436ms
  N=1000: events=4176 reconstructed=1000 match=1000 mismatch=0 conformance=100.00% time=2662ms
```

## Auditor checklist verification
- **A. Replay independence** — VERIFIED: `src/replay/{types,eventSorter,reducer,eventDecoder,reconstructCertificateState}.ts` contain none of `certs(`, `ownerOf(`, `getCertStatus(`, `isCertBlocked(`.
- **B. Comparison independence** — VERIFIED: authoritative queries appear only in `test/replay.integration.spec.ts`, `scripts/replay/*` (after reconstruction). `compareState` is pure (no I/O).
- **C. Event authenticity** — VERIFIED: integration test deploys `NFTCowCert`, performs real ops, reads `ethers.provider.getLogs(...)`, reconstructs from those logs.
- **D. Event mapping** — CertIssued, ERC-721 Transfer, CertBlocked, CertUnblocked. No Revoked event/state.
- **E. Metadata reconstruction** — `eventDecoder.ts`: `metadataCID: String(parsed.args.metadataCID)` from `CertIssued`; `reducer.ts`: `cert.metadataCID = ev.metadataCID`. No contract read.
- **F. Canonical ordering** — `eventSorter.ts`: blockNumber → transactionIndex → logIndex; not timestamp; not RPC order.
- **G. Scale authenticity** — deterministic seeded workload (mulberry32, seed=SEED+N); issue→(transfer 0.4)→(suspend 0.5→reinstate 0.6). Reproduces 423/2068/4176 events.
- **H. Aggregate arithmetic** — 100+500+1000 = 1600 reconstructed; 1600 matches; 0 mismatches (verified from JSON).
- **I. Negative test** — integration test drops the last `CertUnblocked` log ⇒ replayed=Suspended, contract=Active ⇒ statusMatch=false, overall=MISMATCH.
- **J. Contract integrity** — `contracts/NFTCowCert_v2.sol` SHA-256 `1da0348de590…` unchanged vs frozen baseline; `git diff -- contracts/` empty.
- **K. Git** — NOW AVAILABLE (author machine). `git status`: branch `main`; modified: `.gitignore`, `docs/revision/MANUSCRIPT_CHANGE_PLAN.md`, `package.json`, `tsconfig.json`; untracked: `src/`, `test/replay.*`, `scripts/replay/`, `docs/revision/step6/`, `replay-artifacts/`, `baseline_snapshot/pre-step5/`, STEP3–5 docs. `git diff --stat` = 4 files, +26/−3. `git diff -- contracts/` = empty (no contract change).

## Classification: PASS
Event history alone reconstructs existence, owner, status, and metadataCID, matching
authoritative contract state at N=100/500/1000 with 100% conformance and 0 unreconstructible
fields; tamper/negative test confirms the comparator detects divergence.

## Reviewer coverage
- R1-17: DONE (deterministic event replay implemented, tested, validated).
- R1-15: PARTIAL (L_offchain↔replay module mapped; full architecture-layer→component table still pending).
- R2-06: PARTIAL (content-addressed metadata CID reconstructible from events; IPFS availability not tested).
