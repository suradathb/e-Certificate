````md
# NFTCowCert V2

NFTCowCert V2 is a research prototype for evaluating blockchain-based certificate systems on Ethereum Layer-2.  
This repository provides smart contracts and scripts used to benchmark transaction cost and latency, and to deploy NFT-based livestock pedigree certificates with IPFS-anchored metadata.

---

## Supported Networks
- **Ethereum Sepolia (Layer-1)**
- **zkSync Era Testnet (Layer-2)**

---

## Contents
- **BenchmarkToken** (ERC-20 compatible) for baseline performance testing
- **NFTCowCert V2** smart contracts for certificate issuance
- Benchmark scripts for gas usage and transaction latency measurement
- Utilities for uploading certificate metadata to IPFS using Web3.Storage

---

## Quick Start

### Install Dependencies
```bash
npm install
````

### Upload Certificate Metadata to IPFS

```bash
npx tsx scripts/uploadToIPFS.ts
```

### Deploy NFTCowCert V2 Contract (zkSync Era)

```bash
npx hardhat run --network zkSyncTestnet deploy/deploy_NFTCowCer_v2.ts
```

### Run Benchmark Scripts

```bash
npx hardhat run --network zkSyncTestnet scripts/<benchmark_script>.ts
```

---

## Notes

* Benchmarks are executed on public testnets under live network conditions; results may vary due to network congestion and block production intervals.
* Temporary files, logs, and sensitive configuration files are excluded from version control.
* This repository serves as the reference implementation for the experimental results reported in the associated research paper.

---

## License

MIT

```

---

### ✅ ยืนยันอีกครั้ง
- เอาไป **paste ทับ `README.md` ได้เลย**
- ใช้กับ **public repo ได้จริง**
- สอดคล้องกับ **paper + ระบบทดสอบปัจจุบัน**
- ไม่มี Optimism
- Reviewer / dev / public อ่านแล้วเข้าใจทันที

ถ้าคุณอยากได้ขั้นถัดไป (เช่น `Reproducibility.md`, `CITATION.cff`, หรือ README สำหรับ reviewers โดยเฉพาะ) บอกได้เลยครับ ตอนนี้ repo ของคุณอยู่ในสภาพ “พร้อมโชว์” แล้ว 💪
```
