# STEP 6 — EVENT-REPLAY CONFORMANCE RESULTS

> Generated from real runs on the in-process Hardhat network. Not manually typed.
> Source artifacts: `replay-artifacts/replay_{100,500,1000}.json`, `replay-artifacts/replay_summary.csv`.

## Scale conformance (executed 2026-09-26)

| N | Events | Lifecycle ops | Reconstructed | Matches | Mismatches | Conformance | Replay time (ms) | Seed |
|---|--------|---------------|---------------|---------|-----------|-------------|------------------|------|
| 100 | 423 | 220 | 100 | 100 | 0 | 100% | 273 | 142 |
| 500 | 2068 | 1065 | 500 | 500 | 0 | 100% | 1330 | 542 |
| 1000 | 4176 | 2173 | 1000 | 1000 | 0 | 100% | 2425 | 1042 |

- Network: `hardhat` (in-process). Contract: `NFTCowCert` (unchanged).
- **unreconstructibleFields: [] at every scale** — owner, status, and metadataCID were all reconstructed from emitted events alone.
- Deterministic seed per N → reproducible. Op distribution: transfer 0.4, suspend 0.5, reinstate|suspend 0.6.
- Replay time is a secondary metric only (NOT a TPS/performance benchmark).

## Reproduce
```
cd e-Certificate
npx hardhat test test/replay.reducer.spec.ts       # unit T1–T12
npx hardhat test test/replay.integration.spec.ts   # integration + negative (real logs)
npx hardhat run scripts/replay/runScaleConformance.ts   # writes replay-artifacts/*
```

## Executed test results (confirmed 2026-09-26)
- Unit tests `test/replay.reducer.spec.ts` (T1–T12 + canonical sort): **13 passing, 0 failing** (33 ms).
- Integration `test/replay.integration.spec.ts`: **2 passing, 0 failing** (403 ms):
  - "reconstructs owner/status/metadata from real emitted logs and matches contract" — PASS (real Hardhat deploy + real logs, no contract query during reconstruction).
  - "negative test: dropping the last unblock event yields MISMATCH" — PASS (tamper detection confirms MATCH is meaningful).
- Scale conformance N=100/500/1000: **100% match, 0 mismatch, 0 unreconstructible fields**.

## Classification: **PASS**
Event history alone reconstructs all manuscript-claimed state (existence, owner, lifecycle
status, and metadata CID) and matches authoritative contract state at every tested scale.
`metadataCID` is emitted in `CertIssued`, so no field required a contract query to reconstruct.
Permanent revocation was neither present nor invented. The comparator provably detects
divergence (negative test), so the 100% conformance is meaningful rather than hard-coded.
