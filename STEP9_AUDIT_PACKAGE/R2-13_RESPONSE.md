# R2-13 Response

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
