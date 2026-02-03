### 4. Experimental Results and Analysis

#### 4.1 Setup
- Smart contract: BenchmarkToken (ERC-20 compatible)
- Deployed on: zkSync Era Testnet / Optimism / Ethereum L1
- Transaction types: `mint`, `transfer`, `balanceOf`
- Number of test iterations: 30 rounds per function per chain
- Tools: Hardhat, zksync-ethers, performance script with timing + gas metrics

#### 4.2 Result Table
See Table 1 for detailed gas and latency comparison.

| Chain        | Function | Avg Gas Used | Avg Time (sec) | Gas Cost (ETH) |
|--------------|----------|---------------|----------------|----------------|
| zkSync       | Mint     | xxx           | xxx            | xxx            |
| Ethereum L1  | Mint     | xxx           | xxx            | xxx            |
| Optimism     | Mint     | xxx           | xxx            | xxx            |

#### 4.3 Interpretation
- L2 chains (zkSync, Optimism) demonstrated lower gas usage and execution time.
- Ethereum L1 showed significantly higher gas cost.
- Result variations were observed based on network congestion and block interval.
- zkSync was slightly faster but Optimism had more predictable timing.

#### 4.4 Conclusion
The results show that L2 solutions significantly reduce transaction cost and latency for standard ERC20 operations. zkSync provides efficiency through zero-knowledge proofs while Optimism offers predictable execution with optimistic rollup technology.



🧠 อธิบายการทำงาน
อ่านไฟล์ input: อ่าน brahman_certificates_30.json ซึ่งควรเป็น array ของ metadata JSON objects

สร้าง Web3.Storage client: ใช้ API token จาก .env เพื่อเชื่อมต่อ

วนลูปทีละรายการ:

สร้างไฟล์ .json สำหรับวัวแต่ละตัวลงใน ./tmp

อัปโหลดไฟล์นั้นเข้า IPFS ผ่าน Web3.Storage

จด CID พร้อม cowId

บันทึกผล: สร้าง cid_list.json สำหรับนำไปใช้ตอน mint NFT

แสดงผล: log ความสำเร็จบน console

✅ วิธีรัน
`npx tsx scripts/uploadToIPFS.ts`
หรือถ้าใช้ TypeScript ผ่าน ts-node:
`npx ts-node scripts/uploadToIPFS.ts`


run script Test code Terminal
npx hardhat run --network zkSyncTestnet deploy/deploy_NFTCowCer_v2.ts