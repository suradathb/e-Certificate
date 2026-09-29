# Manuscript ↔ Repository Consistency Matrix (STEP 9B)

| Item | Manuscript | Repository/Evidence | Status |
|------|-----------|---------------------|--------|
| Lifecycle actions | issue/transfer/suspend/reinstate | contract issueCert/safeTransferFrom/blockCert/unblockCert | MATCH |
| Contract function bindings | φ 4-tuple per action | contract functions L73/L94/L100 | MATCH |
| Lifecycle events | CertIssued/CertBlocked/CertUnblocked + Transfer | contract events L40-46 | MATCH |
| No permanent revoke | conceptual extension only | no revoke in contract | MATCH |
| Local IPFS localhost:5001 | Table 3 + §6.3 | uploadToIPFS.ts | MATCH |
| metadataCID storage | on-chain Cert.metadataCID | contract L19/L80 | MATCH |
| CertIssued metadataCID | emitted | contract L90 | MATCH |
| tokenURI ipfs://CID | stated | contract L88 _setTokenURI | MATCH |
| IPFS content-addressing | content-addressed/tamper-evident | CID from ipfs.add | MATCH |
| No availability guarantee | stated limitation | no pinning in code | MATCH |
| Pinning not evaluated | production consideration | not implemented | MATCH (NOT EVALUATED) |
| Replication not evaluated | production consideration | not implemented | MATCH (NOT EVALUATED) |
| Redundant gateways not evaluated | production consideration | not implemented | MATCH (NOT EVALUATED) |
| zkSync contract address | 0x3D16…C0cF | evidence env.json chain 300 | VERIFIED |
| Ethereum contract address | 0xD56A…F549 | evidence env.json chain 11155111 | VERIFIED |
| Concurrency = 3 | Table 3 | batch records concurrency=3 | MATCH |
| L2 workload sizes | N=100/500/1000 | results/final L2 batches | MATCH |
| L1 mint-only baseline | mint N=100/500/1000 | results/final L1 3 experiments | MATCH |
| Latency measurement boundary | submit→receipt | runner.ts L67/L70 | MATCH |
| Gas source | receipts | attempts.jsonl gas_used | MATCH |
| Effective gas price source | receipts | attempts.jsonl effective_gas_price | MATCH |
| Fee-estimation equation | median(G)×egp | analysis + eq:fee | MATCH |
| TPS equation | N_success/T_batch | stats.ts tpsCompleted | MATCH |
| Replay event set | CertIssued/Transfer/Blocked/Unblocked | src/replay decoder | MATCH |
| Replay workload sizes | N=100/500/1000 | replay-artifacts | MATCH |
| Replay seed | fixed deterministic | runScaleConformance | MATCH |
| Repository release/tag | v2.0.0 (CC.tex) | no git clone provenance | NOT ESTABLISHED |
| Commit identifier | 0xe022… (CC.tex, 64-hex) | not a valid 40-hex git commit; ZIP not clone | MISMATCH / NOT ESTABLISHED |

tx_hash records in results/final: 8100.
