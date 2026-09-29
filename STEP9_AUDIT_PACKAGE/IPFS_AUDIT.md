# IPFS Implementation Audit (STEP 9)

Source of truth: repository code (`scripts/uploadToIPFS.ts`, `contracts/NFTCowCert_v2.sol`, `scripts/05_fetch.ts`, `src/benchmark/types.ts`), not documentation.

| Property | Status | Evidence |
|----------|--------|----------|
| A. Metadata upload mechanism | IMPLEMENTED | `scripts/uploadToIPFS.ts` → `ipfs.add({path, content})` against local node |
| B. Component performing upload | IMPLEMENTED | `uploadToIPFS.ts` using `ipfs-http-client` `create()` |
| C. CID returned/stored | IMPLEMENTED | `add()` returns `cid`; written to `output/cid_list_*.json` |
| D. CID on-chain / event | IMPLEMENTED | `issueCert(..., _metadataCID)` stores in `Cert.metadataCID`; emits `CertIssued(id,to,metadataCID)`; `_setTokenURI(id, "ipfs://"+CID)` |
| E. Gateway/provider | LOCAL ONLY | `create({host:"localhost", port:5001, protocol:"http"})` — NO Cloudflare/Infura/Web3.Storage in code |
| F. Fallback | NOT IMPLEMENTED | no failover logic present |
| G. Explicit pinning | NOT IMPLEMENTED | no pin/pinning call anywhere |
| H. Pinning account/service control | NOT ESTABLISHED | n/a — no pinning |
| I. Persistence/availability guarantee | NOT ESTABLISHED | local node only; no persistence mechanism |
| J. Behavior if gateway/object unavailable | NOT ESTABLISHED | not handled; CID remains valid but object may be unretrievable |

## Defect found and fixed
`uploadToIPFS.ts` previously called `create()` while its `import { create } from "ipfs-http-client"` was commented out, and no IPFS client was declared in `package.json` → the script could not run. Fixed by: (1) restoring the import, (2) adding `ipfs-http-client` to `package.json` dependencies, (3) making host/port/paths env-configurable, (4) replacing emoji log markers with plain English. Architecture unchanged (still local `localhost:5001`).

## Three-way contradiction resolved
- CODE: local IPFS node — kept (authoritative).
- OLD README: "Web3.Storage" — REMOVED (unsupported).
- OLD MANUSCRIPT (Table 3): "Cloudflare primary / Infura fallback" — REMOVED (unsupported), replaced with "Local IPFS node (HTTP API, localhost:5001)".

## Integrity vs availability (established position)
- CONTENT INTEGRITY/IDENTITY: content → CID; a retrieved object is checkable against its CID. Supported.
- ON-CHAIN BINDING: CID → metadataCID → CertIssued/tokenURI. Supported (and replay-reconstructible per STEP 6).
- AVAILABILITY: CID does NOT guarantee a node still hosts the object. NOT ESTABLISHED.

## Live validation
- CODE/BUILD VALIDATION: import restored, dependency declared — PASS (compile/typecheck to be confirmed locally).
- LIVE IPFS UPLOAD: NOT EXECUTED — local IPFS node required (no daemon in analysis sandbox). No CID fabricated.
