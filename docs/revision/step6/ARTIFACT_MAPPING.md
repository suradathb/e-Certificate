# STEP 6 — ARTIFACT MAPPING (verified against contracts/NFTCowCert_v2.sol)

## Actual contract event inventory (verified)
- `CertIssued(uint256 indexed id, address indexed to, string metadataCID)` — emitted by `issueCert`
- `CertBlocked(uint256 indexed id)` — emitted by `blockCert`
- `CertUnblocked(uint256 indexed id)` — emitted by `unblockCert`
- ERC-721 `Transfer(address indexed from, address indexed to, uint256 indexed tokenId)` — mint (from=0) + ownership changes
- `AdminAdded(...)` — not lifecycle-relevant (ignored by replay)
- **No `CertRevoked` / revoke** — permanent revocation is NOT implemented.

## Mapping table

| Semantic action | Contract function | Emitted event(s) | Relevant event fields | Replay effect | Authoritative query | Expected state |
|---|---|---|---|---|---|---|
| issue | `issueCert(to,cid,cowId,cowHash)` | `CertIssued(id,to,metadataCID)` + ERC-721 `Transfer(0,to,id)` | id, to, metadataCID | ⊥→Active; owner=to; metadataCID set | `certs(id)`, `ownerOf(id)` | Active |
| transfer | `safeTransferFrom(from,to,id)` | ERC-721 `Transfer(from,to,id)` | from, to, id | owner=to; status unchanged | `ownerOf(id)` | Active (unchanged) |
| suspend | `blockCert(id)` | `CertBlocked(id)` | id | Active|Suspended→Suspended (idempotent) | `isCertBlocked(id)` | Suspended |
| reinstate | `unblockCert(id)` | `CertUnblocked(id)` | id | Active|Suspended→Active (idempotent) | `isCertBlocked(id)` | Active |
| fetch (read-only) | `certs/getCertStatus/isCertBlocked` | none | — | no transition | — | unchanged |
| revoke (permanent) | NOT IMPLEMENTED | none | — | not part of evaluated replay | — | N/A |

## Field reconstructibility from events
| Field | Source | Reconstructible from events? |
|---|---|---|
| tokenId / cert id | `CertIssued.id` / `Transfer.tokenId` | Yes |
| exists (⊥ vs present) | `CertIssued` / mint `Transfer` | Yes |
| owner | ERC-721 `Transfer.to` (latest) | Yes |
| status (Active/Suspended) | `CertBlocked` / `CertUnblocked` sequence | Yes |
| metadataCID | `CertIssued.metadataCID` (non-indexed, in event data) | **Yes** (emitted in event) |

Because `metadataCID` is emitted in `CertIssued`, all manuscript-claimed fields
(owner, status, metadata) are reconstructible from events alone — supporting a potential PASS,
subject to the actual test/scale runs.

## Canonical ordering rule
Sort events by `blockNumber` ASC, then `transactionIndex` ASC, then `logIndex` ASC.
Not by timestamp; not by RPC response order. (Implemented in `src/replay/eventSorter.ts`.)
Note on ethers v6: log fields are read defensively (`transactionIndex`/`index`, `logIndex`/`index`).
