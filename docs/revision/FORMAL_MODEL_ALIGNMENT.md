# FORMAL MODEL ALIGNMENT — STEP 2

> Reviewer items addressed: **R1-14, R1-16, R2-01, R2-04**
> Basis: actual implementation in `contracts/NFTCowCert_v2.sol` (contract name `NFTCowCert`). Function/event/guard names below are copied verbatim from the source — none are guessed.

---

## 1. Original inconsistency

The manuscript (submission_fixed.pdf, Section 3) defines:

```
S = {Issued, Transferred, Revoked}
A = {issue, transfer, revoke}
```

But the prototype (Section 4) exposes operations: `issue`, `transfer`, `block`, `unblock`, `fetch`.

Two concrete mismatches:
1. **`revoke` does not exist in the contract.** There is no `revoke`/`revokeCert` function and no `CertRevoked` event. The manuscript's terminal `Revoked` state has **no implementation**.
2. **`block`/`unblock` (a reversible suspension pair) and the read-only `fetch` are absent from the formal model**, so five real operations are not represented by the three formal actions.

## 2. Reviewer concern
- **R1-14 / R2-04:** formal model has three actions while the contract implements five operations; the mapping is unspecified.
- **R1-16:** the mapping function φ is never instantiated.
- **R2-01:** lifecycle scope (states/actions) is not aligned with what the prototype actually supports; no expiry/renewal/appeal/multi-authority is implemented.

## 3. Revised canonical model (aligned to implementation)

**States**
```
S = { Active, Suspended }          # states realized by the current prototype
S_ext = { Revoked }                # framework-level extension, NOT implemented in the evaluated prototype
```
Plus a pre-existence condition `⊥` (Nonexistent/uninitialized), kept separate from lifecycle states so that `issue` is modeled as a creation transition rather than a transition out of a real state.

**Actions (prototype-supported)**
```
A = { issue, transfer, suspend, reinstate }
```
Read-only (NOT lifecycle transitions):
```
Q = { fetch }        # certs(tokenId), getCertStatus(tokenId), isCertBlocked(tokenId)
```

> `revoke` is **intentionally excluded** from the evaluated action set because the contract does not implement it. It is documented as a framework extension only (see §9). This is the honest resolution of R1-14; we do **not** invent a revoke path.

## 4. Transition relation δ

`δ : (S ∪ {⊥}) × A → (S ∪ {error})`

| Current state | issue | transfer | suspend | reinstate |
|---------------|-------|----------|---------|-----------|
| ⊥ (nonexistent) | → Active | error | error | error |
| Active | error (duplicate) | → Active | → Suspended | error (not suspended) |
| Suspended | error | **error (blocked)** | error (already suspended) | → Active |

Notes:
- **initial creation:** `⊥ --issue--> Active`
- **Active → Active** ownership transfer via `transfer`
- **Active → Suspended** via `suspend`
- **Suspended → Active** via `reinstate`
- **transfer while Suspended → rejected** (enforced on-chain, see §6)
- `Revoked` terminal state and its transitions are **not** part of δ for the evaluated prototype (extension only).
- Authorization guards apply to `issue`, `suspend`, `reinstate` (admin) and `transfer` (token owner/approved). See §5.

## 5. Formal-to-Code mapping (φ instantiation) — R1-16

φ(action, cert, actor, context) → (contract call, guard, event, resulting state)

| Formal Action | Guard / Precondition | Contract Function | Event | Prev State | Result State |
|---------------|----------------------|-------------------|-------|------------|--------------|
| issue | `onlyAdmin`; certificate id is newly created (`certCount++`) | `issueCert(address _to, string _metadataCID, string _cowId, bytes32 _cowHash)` | `CertIssued(id, to, metadataCID)` (plus ERC-721 `Transfer(0x0,to,tokenId)`) | ⊥ | Active |
| transfer | ERC-721 owner/approved; `require(!certs[tokenId].isBlocked)` in `_beforeTokenTransfer` | `safeTransferFrom(from, to, tokenId)` (inherited ERC721) | ERC-721 `Transfer(from,to,tokenId)` | Active | Active |
| suspend | `onlyAdmin`; `_existsPublic(tokenId)` | `blockCert(uint256 tokenId)` | `CertBlocked(id)` | Active | Suspended |
| reinstate | `onlyAdmin`; `_existsPublic(tokenId)` | `unblockCert(uint256 tokenId)` | `CertUnblocked(id)` | Suspended | Active |
| revoke | framework extension | `NOT IMPLEMENTED` | `NOT IMPLEMENTED` | (Active/Suspended) | (Revoked) |
| fetch (read) | `_existsPublic(tokenId)` | `certs(tokenId)` / `getCertStatus(tokenId)` / `isCertBlocked(tokenId)` | none (view) | unchanged | unchanged |

Guard mapping detail:
- `onlyAdmin` = `modifier onlyAdmin { require(isAdmin[msg.sender], "Not authorized"); _; }`
- transfer-while-blocked guard = `_beforeTokenTransfer(...) { require(!certs[tokenId].isBlocked, "This certificate is blocked and cannot be transferred"); }`
- existence check = `_existsPublic(tokenId)` (wraps `ownerOf` in try/catch)

## 6. Implementation-consistency check (R1-14 evidence) — §2.4 cases

| Case | Expected | Contract mechanism | Actual |
|------|----------|--------------------|--------|
| duplicate issue | rejected/creates distinct id | `certCount++` always creates a **new** id (no dedup on cowId) | issue never reuses an id; a repeated cowId silently remaps `cowIdToToken` → documented limitation |
| unauthorized transfer | rejected | ERC-721 ownership/approval checks | rejected |
| transfer while suspended | rejected | `_beforeTokenTransfer` require | **rejected** ✅ |
| transfer after revoked | N/A | revoke not implemented | N/A (extension) |
| suspend from Active | allowed | `blockCert` sets `isBlocked=true` | allowed |
| repeated suspend | idempotent (stays Suspended) | `blockCert` re-sets true (no guard on current value) | allowed, idempotent effect |
| reinstate when not suspended | idempotent → Active | `unblockCert` sets false unconditionally | allowed, idempotent effect |
| reinstate after revoked | N/A | revoke not implemented | N/A |
| revoke from Active/Suspended | N/A | `NOT IMPLEMENTED` | N/A |
| repeated revoke | N/A | `NOT IMPLEMENTED` | N/A |
| fetch changes state | must NOT | `certs`/`getCertStatus`/`isCertBlocked` are `view` | no state change ✅ |

Two honest findings (do not hide):
- `blockCert`/`unblockCert` have **no guard on the current value**, so `suspend` on an already-suspended cert and `reinstate` on a non-suspended cert both succeed as no-ops (idempotent) rather than reverting. The formal model treats these as idempotent rather than invalid.
- `issueCert` does **not** prevent duplicate `cowId`; it overwrites `cowIdToToken[_cowId]`. This is a real limitation to disclose (§9).

## 7. Event mapping
- `CertIssued(uint256 indexed id, address indexed to, string metadataCID)`
- ERC-721 `Transfer(address from, address to, uint256 tokenId)` (used for both mint detection and ownership transfer)
- `CertBlocked(uint256 indexed id)`
- `CertUnblocked(uint256 indexed id)`
- `AdminAdded(uint256 indexed id, address indexed account, string username)`
- Certificate transfer has **no dedicated `CertTransferred` event** — only the ERC-721 `Transfer`. (Disclose in manuscript.)
- `CertRevoked` — `NOT IMPLEMENTED`.

## 8. Test mapping
See `test/lifecycle.spec.ts` (added under STEP 2). Each δ transition and each §6 case maps to at least one test. **Executed on the author's machine: 11 passing, 0 failing, 0 skipped** (Hardhat 2.24.3, Solidity 0.8.20). All mappings in §5 are confirmed by passing tests; idempotent block/unblock (§6) confirmed by tests 10–11; `fetch` read-only confirmed; `revoke` absence confirmed via ABI check.

## 9. Remaining limitations
- `revoke`, expiration, renewal, appeal, multi-authority governance = **framework extensions, not evaluated**. Must be clearly labeled as such (R2-01, STEP 2.6).
- Duplicate-`cowId` handling and missing current-value guards on block/unblock are disclosed limitations.
- Historical experiment results are not present in the baseline, so consistency of the *reported* numbers with this model cannot be re-derived until experiments are re-run in a later step.

## 10. Manuscript sections that must be revised
(Full detail in `MANUSCRIPT_CHANGE_PLAN.md`.)
- Section 3.1 state set `S` and action set `A`
- Section 3.2/3.3 transition definition δ and φ instantiation
- Section 4 mapping of operations (add block/unblock/fetch; mark revoke as extension)
- Any Abstract/Intro/Conclusion sentence claiming a working `revoke`/terminal `Revoked` state
