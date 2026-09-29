# STEP 3 — REVIEWER RESPONSE DRAFT (φ instantiation)

Covers reviewer items about the binding function φ and formal↔implementation mapping:
**R1-16** (φ never instantiated), **R1-14 / R2-04** (3 actions vs 5 ops; mapping unspecified),
**R2-01** (evaluated subset vs. framework claims).

---

## R1-16 — "The mapping function φ is never instantiated."

### Reviewer concern
The manuscript introduces φ only as an abstract arrow `φ : L_semantic → L_execution` and never shows how a lifecycle action is concretely bound to the smart-contract implementation.

### Revision performed
We redefined φ as an operational, verifiable binding:
`φ(action, certificate, actor, context) → (guard, contractCall, event, nextState)`
and instantiated it for every evaluated action (issue, transfer, suspend, reinstate), with a separate read-only binding `φ_read` for fetch. Semantic action names are explicitly distinguished from Solidity function names (e.g. `suspend` ↦ `blockCert`).

### Evidence
- Formal definition + per-action instantiation: `docs/revision/PHI_INSTANTIATION.md` §2, §6–§10
- Contract functions: `issueCert`, `safeTransferFrom` (ERC-721), `blockCert`, `unblockCert`; reads `certs`/`getCertStatus`/`isCertBlocked`
- Guards: `onlyAdmin`, ERC-721 owner/approved, `_beforeTokenTransfer` block-guard, `_existsPublic`
- Events: `CertIssued`, ERC-721 `Transfer`, `CertBlocked`, `CertUnblocked`
- Tests: 11 passed / 0 failed / 0 skipped (STEP 2)

### Scope clarification
`revoke` is not evaluated (no contract binding); `fetch` is read-only (no transition); no new performance experiment was introduced in this revision step.

---

## R1-14 / R2-04 — "Three formal actions vs. five contract operations; mapping unspecified."

### Reviewer concern
The formal model lists `{issue, transfer, revoke}` while the prototype exposes issue/transfer/block/unblock/fetch, with no explicit correspondence.

### Revision performed
We aligned the evaluated model to the implementation: `S_eval = {Active, Suspended}` (+ `⊥`), `A_eval = {issue, transfer, suspend, reinstate}`, with `fetch` as a read-only query and `revoke` moved to framework extensions. A full φ instantiation table binds each action to its guard, call, event, and resulting state.

### Evidence
- `docs/revision/FORMAL_MODEL_ALIGNMENT.md` §4 (δ), §5 (φ table), §6 (consistency cases)
- `docs/revision/PHI_INSTANTIATION.md` §6–§12 (instantiation + guard/event traceability)
- Executed tests (11/11) confirm each transition and the idempotent block/unblock behavior.

### Scope clarification
No `Transferred` state is introduced (transfer is Active→Active). Idempotent suspend/reinstate behavior is disclosed, not hidden. No dedicated `CertTransferred` event is invented.

---

## R2-01 — "Contribution appears to be migration; lifecycle scope overstated."

### Reviewer concern
The framework is presented as a full certificate lifecycle, but the evaluated prototype supports only a subset.

### Revision performed
We explicitly separate the **evaluated prototype subset** (issue/transfer/suspend/reinstate + fetch) from **framework extensions** (revoke, expiration, renewal, appeal, multi-authority) that are neither implemented nor evaluated. φ is instantiated only for the evaluated subset; extensions are represented as `φ_ext … NOT IMPLEMENTED / NOT EVALUATED`.

### Evidence
- `docs/revision/PHI_INSTANTIATION.md` §14 (subset vs. extensions), §5 (revoke excluded)
- `docs/revision/FORMAL_MODEL_ALIGNMENT.md` §3, §9

### Scope clarification
This step is formalization + traceability only. No lifecycle feature was added; no benchmark was run; contract semantics were unchanged.
