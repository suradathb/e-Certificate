# MANUSCRIPT CHANGE PLAN — driven by STEP 2

> Scope of this round: **identify** what must change (no full rewrite).
> Base file: `submission_ClusterComputing/CC.tex` (authoritative). PDF ref: `submission_fixed.pdf`.
> No new experimental result is asserted here; items needing experiments are marked **[needs experiment]**.

| # | Reviewer | Current statement (manuscript) | Problem | Required revision | Implementation evidence | Section / location |
|---|----------|-------------------------------|---------|-------------------|-------------------------|--------------------|
| M1 | R1-14, R2-04 | `S = {Issued, Transferred, Revoked}` | `Transferred` is not a distinct persistent state; `Revoked` is not implemented | Replace with `S = {Active, Suspended}` (+ `⊥` pre-existence); mark `Revoked` as extension | `NFTCowCert_v2.sol` has no revoke; `isBlocked` boolean = Active/Suspended | Sec. 3.1 |
| M2 | R1-14 | `A = {issue, transfer, revoke}` | Missing suspend/reinstate; revoke unimplemented | Use `A = {issue, transfer, suspend, reinstate}`; `fetch` = read-only query set `Q` | `blockCert`/`unblockCert`/`certs` | Sec. 3.1 |
| M3 | R1-16 | φ described but never instantiated | No concrete guard/call/event per action | Insert φ instantiation table (from FORMAL_MODEL_ALIGNMENT §5) | contract functions/events | Sec. 3.3 / 3.4 |
| M4 | R1-14, R2-04 | δ transition diagram uses 3 states | Does not match reversible block/unblock | Redraw δ per FORMAL_MODEL_ALIGNMENT §4 (Fig. of state machine) | `_beforeTokenTransfer` guard | Sec. 3.2 + state-machine figure |
| M5 | R2-04 | Transfer implies a `CertTransferred` semantic event | Only ERC-721 `Transfer` exists | State that ownership transfer is observed via ERC-721 `Transfer`; no bespoke event | events list in contract | Sec. 4 |
| M6 | R2-01 | Framework presented as full lifecycle (issue→…→revoke) | Prototype supports a subset only | Add explicit "Evaluated prototype subset vs. framework extensibility" paragraph; list revoke/expiry/renewal/appeal/multi-authority as **future extensions** | no such functions in contract | Sec. 3 / Sec. 6 |
| M7 | R1-14 | (implicit) block/unblock treated as invalid-guarded | Contract has no current-value guard (idempotent no-ops) | Note idempotent semantics of repeated suspend/reinstate | `blockCert`/`unblockCert` set boolean unconditionally | Sec. 3.2 note |
| M8 | R2-04 | (implicit) duplicate issue prevented | `cowIdToToken` is overwritten on duplicate cowId | Disclose duplicate-cowId limitation | `issueCert` remaps mapping | Sec. 4 limitations |

## Cross-references to other planned steps (not done in this round)
- TPS/parallel claim, latency = "L2 sequencer-receipt", cost = "scenario-based estimate", ablation, event-replay test, statistical tests → tracked in the reviewer matrix; **[needs experiment]** and handled in later steps. This document only records the formal-model-driven manuscript edits.

## Figures/tables to update
- State-machine figure (Sec. 3.2): redraw to Active/Suspended with reversible edges + creation edge; remove/relabel `Revoked` as dashed "extension".
- New table: φ instantiation (Sec. 3.3/3.4) — reuse FORMAL_MODEL_ALIGNMENT §5.
- New/updated table: layer-to-artifact mapping (R1-15) — *pending STEP for architecture layers (not this round)*.

## STEP 3 additions — φ instantiation (R1-16, R1-14, R2-04, R2-01)

| # | Reviewer | Current statement | Problem | Required revision | Evidence | Section |
|---|----------|-------------------|---------|-------------------|----------|---------|
| P1 | R1-16 | `φ : L_semantic → L_execution` (abstract arrow) | Not operational; cannot be traced/tested | Replace with `φ(action,cert,actor,context) → (guard,contractCall,event,nextState)` + φ_read for fetch | PHI_INSTANTIATION.md §2 | Sec. 3.3/3.4 (φ definition) |
| P2 | R1-16 | φ described in prose only | No per-action binding | Insert φ instantiation table for issue/transfer/suspend/reinstate | PHI_INSTANTIATION.md §6–§10 | Sec. 3.4 (new table) |
| P3 | R1-14, R2-04 | semantic names implied = function names | `suspend`≠`blockCert` etc. not explained | Add explicit semantic-action ↔ contract-function mapping | PHI_INSTANTIATION.md §4 | Sec. 3.4 / Sec. 4 |
| P4 | R1-16 | guards unspecified | Reader cannot tell enforced vs. intended | Add Guard Traceability Table; mark G5 as semantic-only (not enforced) | PHI_INSTANTIATION.md §11 | Sec. 3.4 (new table) |
| P5 | R2-04 | events unspecified | `CertTransferred` implied | Add Event Traceability Table; state no dedicated transfer event | PHI_INSTANTIATION.md §12 | Sec. 4 |
| P6 | R2-01 | φ implies full lifecycle incl. revoke | revoke not implemented | State φ instantiated only for evaluated subset; revoke = φ_ext (not evaluated) | PHI_INSTANTIATION.md §5,§14 | Sec. 3 / Sec. 6 |

Manuscript-ready replacement text for the φ paragraph is provided in `PHI_INSTANTIATION.md` §16.
Terminology to fix: do not call ownership transfer a state `Transferred`; use "Active→Active ownership change".
Equation to change: the single-line φ definition → operational 4-tuple codomain.
Tables to add: φ instantiation (§6–10), guard traceability (§11), event traceability (§12).
