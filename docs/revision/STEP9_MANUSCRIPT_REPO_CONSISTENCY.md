# STEP 9 — Manuscript <-> Repository Consistency Matrix

| Item | Manuscript | Repository/Code | Status |
|------|-----------|-----------------|--------|
| IPFS implementation | Local IPFS node (localhost:5001) | uploadToIPFS.ts local node | MATCH (after correction) |
| Web3.Storage | (removed) | not in code | REMOVED unsupported claim |
| Cloudflare primary | (removed) | not in code | REMOVED unsupported claim |
| Infura fallback | (removed) | not in code | REMOVED unsupported claim |
| Persistent pinning | labeled NOT EVALUATED | not implemented | PRODUCTION CONSIDERATION / NOT EVALUATED |
| Replicated IPFS nodes | labeled NOT EVALUATED | not implemented | PRODUCTION CONSIDERATION / NOT EVALUATED |
| Redundant gateways | labeled NOT EVALUATED | not implemented | PRODUCTION CONSIDERATION / NOT EVALUATED |
| CID on-chain binding | Cert.metadataCID + tokenURI ipfs://CID | contract L80/L86-89 | MATCH |
| CertIssued metadataCID | emitted | contract L90 event CertIssued | MATCH |
| tokenURI ipfs://CID | stated | _setTokenURI(ipfs://<CID>) | MATCH |
| Metadata integrity/tamper evidence | content-addressed | CID-based | SUPPORTED (content addressing) |
| Long-term metadata availability | NOT established | no pinning | NOT ESTABLISHED |
| zkSync contract 0x3D16...C0cF | Table/Repro | .env.example placeholder; used in evidence env | MATCH (evidence env.json chain 300) |
| Ethereum contract 0xD56A...F549 | Table/Repro | evidence env.json chain 11155111 | MATCH |
| Workloads N=100/500/1000 | Table 3 | results/final batches | MATCH |
| Concurrency = 3 | Table 3 | batch records concurrency=3 | MATCH |
| L1 mint N=100/500/1000 | Table 3 (corrected) | results/final 3 L1 experiments | MATCH |
| Commit hash / release tag | v2.0.0 + 0xe022... (in CC.tex reproducibility) | NO git clone provenance | MISMATCH / NOT ESTABLISHED (flagged; ZIP not clone) |

Note: the CC.tex Reproducibility commit hash `0xe022...` (64 hex) is not a valid 40-hex git commit and cannot be backed by repository provenance; flagged for correction in the figure/consistency backlog (outside STEP 9 IPFS/repo scope but recorded here).
