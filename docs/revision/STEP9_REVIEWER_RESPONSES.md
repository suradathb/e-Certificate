# STEP 9 — Reviewer Response Drafts (R2-06, R2-13)

> Drafts grounded in verified repository evidence. Not marked DONE until independent audit + local compile confirm.

## R2-06 — IPFS metadata availability / persistence

**Reviewer concern:** Does immutable metadata assume the IPFS gateway is always available? Metadata availability and persistence need clarification.

**Response (draft):**
We thank the reviewer and have clarified the metadata model, distinguishing integrity from availability. The evaluated prototype uses a **local IPFS node** (HTTP API at `localhost:5001`); we have corrected the manuscript, which previously named managed gateways that were not part of the evaluated implementation. Metadata is **content-addressed**: the returned CID is bound to the certificate on-chain — stored in the `Cert` record, emitted in `CertIssued(id, to, metadataCID)`, and encoded as the token URI `ipfs://<CID>` — and is reconstructible from `CertIssued` in our deterministic event-replay evaluation. Content addressing therefore provides a **content-addressed, tamper-evident** metadata reference: a retrieved object can be verified against its CID, and the certificate↔metadata binding is verifiable on-chain. We now state explicitly that this does **not** by itself guarantee long-term availability: a valid CID does not ensure that any node still hosts the object. We further note that production deployments may add persistent pinning, replication, and redundant gateway access to improve availability, and we explicitly mark these as **not evaluated** in this study. We have replaced "immutable metadata" with "content-addressed / tamper-evident metadata" where it referred to the IPFS object, while retaining legitimate statements about on-chain immutability. (Repository: `docs/ipfs/IPFS_IMPLEMENTATION_AUDIT.md`, README "IPFS Metadata Storage and Availability", `scripts/uploadToIPFS.ts`.)

We do **not** claim that IPFS guarantees persistence, nor that redundant gateways guarantee availability.

## R2-13 — Public repository / reproducibility / code quality

**Reviewer concern:** Repository organization, executable reproduction, English code comments, environment template, provenance.

**Response (draft):**
We have finalized the public repository for independent auditing:
- **Code comments** in all public source (contract + scripts + deploy + config) converted to professional English; non-English and emoji markers removed without altering behavior (0 remaining).
- **Reproducibility defect fixed:** `scripts/uploadToIPFS.ts` previously called `create()` with a commented-out import and no declared IPFS client; the import is restored and `ipfs-http-client` is now declared in `package.json`.
- **`REPRODUCING.md`** documents three modes: local functional reproduction, frozen-evidence analysis (no credentials), and public-testnet re-execution.
- **`results/final/`** holds the authoritative raw evidence used by the paper; **`results/excluded/`** retains failed/superseded runs for transparency (not deleted). A verified `SHA256SUMS.txt` (67 files) covers the evidence.
- **`analysis/regenerate_stats_and_figures.py`** regenerates latency/fee/TPS statistics and Fig.8/Fig.9 from frozen evidence, without hard-coding manuscript numbers.
- **Event-replay** tooling is exposed under `scripts/replay/` with tests.
- **`.env.example`** aligned to every variable actually consumed by the code; placeholders only, no secrets; IPFS variables reflect the local-node configuration.
- **Secret scan:** no secrets in tracked content; the local `.env` is git-ignored (`.env`, `.env.*`, `!.env.example`). If a real `.env` was ever committed historically, credential rotation and history cleanup are required (removing from HEAD does not remove from history).
- **Contract/network provenance** documented (zkSync Era Sepolia `0x3D16…C0cF`, Ethereum Sepolia `0xD56A…F549`).

We do not claim git commit/tag provenance that does not exist (the repository was distributed as a ZIP, not a clone); this is flagged in the consistency matrix.
