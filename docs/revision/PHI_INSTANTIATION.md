# PHI (φ) INSTANTIATION — STEP 3

> Formalization + implementation traceability. No new experiments. No contract changes.
> Basis: `contracts/NFTCowCert_v2.sol` (contract `NFTCowCert`), verified in STEP 1–2 (11 passing tests).
> Reviewer items: R1-16 (φ never instantiated), R1-14 / R2-04 (formal↔code mapping), R2-01 (evaluated subset vs. extension).

---

## 1. Problem with the original φ
The manuscript defines only:
```
φ : L_semantic → L_execution
```
This is a set-level arrow with no operational content: it does not say, for a given lifecycle action, *which* contract call runs, *what* guard must hold, *which* event is emitted, or *what* state results. It therefore cannot be traced to the implementation and cannot be validated by tests. R1-16 raises exactly this.

## 2. Revised definition (operational, verifiable)
```
φ : A_eval × Cert × Actor × Context  →  (Guard, ContractCall, Event, NextState)
```
For read-only operations we use a separate binding (they are not lifecycle transitions):
```
φ_read : Q × Cert × Actor × Context  →  (Guard, ReadCall, ReturnValue)     [state unchanged]
```
Framework extensions that are **not implemented** are represented only conceptually and never given a concrete contract binding:
```
φ_ext(revoke, …) = NOT IMPLEMENTED / NOT EVALUATED
```

## 3. Domain / codomain
- **L_semantic** = lifecycle *intent*: the abstract action a certificate authority expresses (issue, transfer, suspend, reinstate). Elements are members of `A_eval`.
- **L_execution** = concrete *realization* on zkSync Era via the deployed `NFTCowCert` contract: a guard (modifier/`require`/inherited check), a contract call, an emitted event, and the resulting lifecycle state in `S_eval = {Active, Suspended}` (plus pre-existence `⊥`).
- φ maps each semantic intent to its concrete execution realization. The **names differ on purpose** (e.g. semantic `suspend` ↦ contract `blockCert`), which is the whole point of φ (see §4).

## 4. Semantic action ≠ contract function
| Semantic action (L_semantic) | Contract realization (L_execution) |
|---|---|
| `suspend` | `blockCert(tokenId)` |
| `reinstate` | `unblockCert(tokenId)` |
| `transfer` | ERC-721 `safeTransferFrom(from,to,tokenId)` |
| `issue` | `issueCert(to,cid,cowId,cowHash)` |
φ is precisely the binding that connects the left column (intent) to the right column (realization).

## 5. Parameter definitions
- **action** ∈ `A_eval = {issue, transfer, suspend, reinstate}`
- **certificate (Cert)** — identified by `tokenId` (and associated `cowId`, `metadataCID`, `isBlocked` in `certs[tokenId]`)
- **actor (Actor)** — `msg.sender`; either an admin (`isAdmin[msg.sender]`) or the token owner/approved operator (ERC-721)
- **context (Context)** — only fields the implementation actually consumes:
  - issue: `to`, `metadataCID`, `cowId`, `cowHash`
  - transfer: `from`, `to`, `tokenId`
  - suspend/reinstate: `tokenId`
- **Guard** — the enforced precondition (modifier / `require` / inherited ERC-721 auth)
- **ContractCall** — the exact function invoked
- **Event** — the exact event emitted (or ERC-721 `Transfer`)
- **NextState** — resulting element of `S_eval` (or `⊥→Active` for creation)

## 6. φ(issue)
```
φ(issue, C, A, {to, metadataCID, cowId, cowHash}) →
  Guard        : onlyAdmin  →  require(isAdmin[msg.sender], "Not authorized")
  ContractCall : issueCert(address to, string metadataCID, string cowId, bytes32 cowHash)
  Event        : CertIssued(id, to, metadataCID)  +  ERC-721 Transfer(address(0), to, tokenId)
  PrevState    : ⊥ (nonexistent)   NextState : Active   (certs[id].isBlocked = false)
```

## 7. φ(transfer)
```
φ(transfer, C, A, {from, to, tokenId}) →
  Guard        : ERC-721 owner/approved  AND  require(!certs[tokenId].isBlocked,
                 "This certificate is blocked and cannot be transferred")  [in _beforeTokenTransfer]
  ContractCall : safeTransferFrom(from, to, tokenId)   [inherited ERC721URIStorage]
  Event        : ERC-721 Transfer(from, to, tokenId)   [NO dedicated CertTransferred event]
  PrevState    : Active   NextState : Active   (ownership changes; lifecycle state stays Active)
```
Note: there is **no** `Transferred` lifecycle state — transfer is an Active→Active ownership change.

## 8. φ(suspend)
```
φ(suspend, C, A, {tokenId}) →
  Guard        : onlyAdmin  +  _existsPublic(tokenId) (via require "Token does not exist")
                 NO current-state guard (does NOT require state==Active)
  ContractCall : blockCert(tokenId)
  Event        : CertBlocked(id)
  PrevState    : Active (or already Suspended)   NextState : Suspended
  Idempotency  : calling on an already-Suspended cert succeeds and re-emits CertBlocked (no revert)
```

## 9. φ(reinstate)
```
φ(reinstate, C, A, {tokenId}) →
  Guard        : onlyAdmin  +  _existsPublic(tokenId)
                 NO current-state guard (does NOT require state==Suspended)
  ContractCall : unblockCert(tokenId)
  Event        : CertUnblocked(id)
  PrevState    : Suspended (or already Active)   NextState : Active
  Idempotency  : calling when not Suspended succeeds as a no-op (no revert)
```
> Semantic expectation vs. enforcement: semantically `reinstate` is meaningful only from `Suspended`, but the **contract does not enforce** this. We disclose both, and never claim the contract enforces a guard it does not.

## 10. Read-only binding φ_read(fetch)
```
φ_read(fetch, C, A, {tokenId}) →
  Guard        : _existsPublic(tokenId) for getCertStatus/isCertBlocked ("Token does not exist")
                 (certs(tokenId) is the auto-generated public getter)
  ReadCall     : certs(tokenId) | getCertStatus(tokenId) | isCertBlocked(tokenId)   [all `view`]
  ReturnValue  : (id, metadataCID/URI, isBlocked[, owner])
  State        : state_before == state_after   (no event, no transition)
```
`fetch ∉ A_eval` because it is a `view` query: it cannot alter `certs[]`, ownership, or emit lifecycle events. It belongs to `L_execution` as a query, not to the lifecycle transition set.

## 11. Guard Traceability Table
| Guard ID | Semantic meaning | Enforcement location | Actual mechanism | Verified |
|---|---|---|---|---|
| G1 | admin authorization | NFTCowCert (direct) | `modifier onlyAdmin { require(isAdmin[msg.sender],"Not authorized"); }` on `issueCert/blockCert/unblockCert` | ✅ tests 5 (+ shared by 7,8) |
| G2 | owner/approved to transfer | inherited OZ ERC-721 | `_isApprovedOrOwner` in `safeTransferFrom` | ✅ test 6 |
| G3 | cannot transfer while suspended | NFTCowCert (direct, override) | `_beforeTokenTransfer` → `require(!certs[tokenId].isBlocked, …)` | ✅ test 5 |
| G4 | certificate must exist | NFTCowCert (direct) | `_existsPublic(tokenId)` → `require(…, "Token does not exist")` | ✅ test 7 |
| G5 | (semantic-only) suspend from Active / reinstate from Suspended | **NOT enforced** in implementation | none — idempotent no-ops | ✅ tests 8,9 (documents absence) |

## 12. Event Traceability Table
| Semantic action | Execution event | Event source | Lifecycle meaning |
|---|---|---|---|
| issue | `CertIssued(id,to,cid)` + `Transfer(0x0,to,tokenId)` | NFTCowCert + ERC-721 | creation → Active |
| transfer | `Transfer(from,to,tokenId)` | ERC-721 (inherited) | ownership change, stays Active |
| suspend | `CertBlocked(id)` | NFTCowCert | Active → Suspended |
| reinstate | `CertUnblocked(id)` | NFTCowCert | Suspended → Active |
| transfer | **no `CertTransferred`** | — | dedicated event does not exist |
| revoke | **NOT IMPLEMENTED** | — | extension only |

## 13. Test Traceability Table
STEP 2 result: **11 passed / 0 failed / 0 skipped** (`npx hardhat test test/lifecycle.spec.ts`).
| φ Binding | Supporting test(s) | Result |
|---|---|---|
| φ(issue) → Active, CertIssued | "issue creates a certificate in Active…" | ✅ |
| φ(transfer) Active→Active, ERC-721 Transfer | "issue -> transfer … succeeds" | ✅ |
| φ(transfer) blocked-guard | "transfer while Suspended is rejected" | ✅ |
| φ(suspend) → Suspended, CertBlocked | "issue -> suspend -> reinstate …" | ✅ |
| φ(reinstate) → Active, CertUnblocked | "issue -> suspend -> reinstate …" | ✅ |
| G1 admin guard | "unauthorized (non-admin) issue is rejected" | ✅ |
| G2 owner guard | "unauthorized transfer … rejected" | ✅ |
| G4 existence guard | "suspend on nonexistent token reverts" | ✅ |
| suspend idempotent | "repeated suspend keeps Suspended" | ✅ |
| reinstate idempotent | "reinstate when not suspended keeps Active" | ✅ |
| φ_read(fetch) no mutation | "certs()/getCertStatus()/isCertBlocked() do not change state" | ✅ |
| revoke ∉ A_eval | "no revoke function exists on the contract ABI" | ✅ |

No new tests were added in STEP 3; all bindings are covered by the existing executed suite.

## 14. Evaluated subset vs. framework extensions
- **Evaluated (φ):** issue, transfer, suspend, reinstate (+ read-only fetch).
- **Extensions (φ_ext, NOT implemented / NOT evaluated):** revoke/terminal Revoked, expiration, renewal, appeal, multi-authority governance. No concrete contract binding exists for these; they must be labeled as future work.

## 15. Limitations
- Semantic precondition for `reinstate` (from Suspended) and for `suspend` (from Active) is **not** enforced on-chain → idempotent no-ops (G5).
- No dedicated `CertTransferred` event; ownership transfer observed only via ERC-721 `Transfer`.
- `issueCert` does not prevent duplicate `cowId` (overwrites `cowIdToToken`); disclosed limitation, out of φ scope.

## 16. Manuscript-ready replacement (for later insertion into CC.tex — NOT applied here)
Replace the abstract `φ : L_semantic → L_execution` with:

> We instantiate the binding function φ operationally as
> φ(a, c, α, κ) = (g, f, e, s′), where a ∈ A_eval = {issue, transfer, suspend, reinstate} is a
> lifecycle action, c a certificate (token), α the actor, and κ the action context; g is the
> on-chain guard, f the contract call, e the emitted event, and s′ ∈ {Active, Suspended} the
> resulting state (with issue creating a certificate from the pre-existence condition ⊥).
> Read operations are modeled separately by φ_read and induce no state transition. The action
> `revoke` is defined only as a framework extension φ_ext and is not part of the evaluated
> prototype.

Accompany with the φ instantiation table (§6–§10), the guard table (§11), and event table (§12).
