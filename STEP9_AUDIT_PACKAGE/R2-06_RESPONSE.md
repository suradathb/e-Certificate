# STEP 9 — Reviewer Response Drafts (R2-06, R2-13)

> Drafts grounded in verified repository evidence. Not marked DONE until independent audit + local compile confirm.

## R2-06 — IPFS metadata availability / persistence

**Reviewer concern:** Does immutable metadata assume the IPFS gateway is always available? Metadata availability and persistence need clarification.

**Response (draft):**
We thank the reviewer and have clarified the metadata model, distinguishing integrity from availability. The evaluated prototype uses a **local IPFS node** (HTTP API at `localhost:5001`); we have corrected the manuscript, which previously named managed gateways that were not part of the evaluated implementation. Metadata is **content-addressed**: the returned CID is bound to the certificate on-chain — stored in the `Cert` record, emitted in `CertIssued(id, to, metadataCID)`, and encoded as the token URI `ipfs://<CID>` — and is reconstructible from `CertIssued` in our deterministic event-replay evaluation. Content addressing therefore provides a **content-addressed, tamper-evident** metadata reference: a retrieved object can be verified against its CID, and the certificate↔metadata binding is verifiable on-chain. We now state explicitly that this does **not** by itself guarantee long-term availability: a valid CID does not ensure that any node still hosts the object. We further note that production deployments may add persistent pinning, replication, and redundant gateway access to improve availability, and we explicitly mark these as **not evaluated** in this study. We have replaced "immutable metadata" with "content-addressed / tamper-evident metadata" where it referred to the IPFS object, while retaining legitimate statements about on-chain immutability. (Repository: `docs/ipfs/IPFS_IMPLEMENTATION_AUDIT.md`, README "IPFS Metadata Storage and Availability", `scripts/uploadToIPFS.ts`.)

We do **not** claim that IPFS guarantees persistence, nor that redundant gateways guarantee availability.

