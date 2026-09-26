import { ethers } from "ethers";
import * as fs from "fs";
import * as dotenv from "dotenv";

dotenv.config();
const OUT_DIR = "./output/1000";
const ABI_PATH = "./artifacts/contracts/NFTCowCert_v2.sol/NFTCowCert.json";
const IN_MINT = `${OUT_DIR}/01_mint_results.json`;


const OUT_RESULTS = `${OUT_DIR}/04_unblock_results.json`;
const OUT_FAIL = `${OUT_DIR}/04_unblock_failed.json`;

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
function nowISO() {
  return new Date().toISOString();
}
function safeWriteJSON(file: string, data: any) {
  fs.writeFileSync(
    file,
    JSON.stringify(
      data,
      (_, v) => (typeof v === "bigint" ? v.toString() : v),
      2,
    ),
  );
}
function extractError(err: any) {
  return {
    message: String(err?.message || err),
    code: err?.code,
    reason: err?.reason,
    shortMessage: err?.shortMessage,
  };
}

async function main() {
  ensureDir(OUT_DIR);

  const abiJson = JSON.parse(fs.readFileSync(ABI_PATH, "utf-8"));
  const provider = new ethers.JsonRpcProvider(process.env.ZKSYNC_RPC);
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  const contract = new ethers.Contract(
    process.env.ZKSYNC_CONTRACT_TEST!,
    abiJson.abi,
    signer,
  );

  const mintRows: any[] = JSON.parse(fs.readFileSync(IN_MINT, "utf-8"));
  const items = mintRows.filter((r) => r.status === "success" && r.tokenId);

  const results: any[] = [];
  const failed: any[] = [];

  console.log(`🚀 [04_unblock] items=${items.length}`);

  for (let i = 0; i < items.length; i++) {
    const r = items[i];
    const tokenId = r.tokenId;

    console.log(
      `\n[${i + 1}/${items.length}] unblock cowId=${r.cowId} tokenId=${tokenId}`,
    );

    const start = Date.now();
    try {
      const tx = await contract.unblockCert(tokenId);
      const rcpt = await tx.wait();
      const end = Date.now();

      const row = {
        cowId: r.cowId,
        cid: r.cid,
        tokenId,
        txHash: tx.hash,
        gasUsed: rcpt.gasUsed?.toString?.(),
        durationMs: end - start,
        status: "success",
        timestamp: nowISO(),
      };

      results.push(row);
      console.log(`✅ unblock ok tx=${tx.hash}`);
    } catch (err: any) {
      const end = Date.now();
      const e = extractError(err);

      const row = {
        cowId: r.cowId,
        cid: r.cid,
        tokenId,
        durationMs: end - start,
        status: "failed",
        timestamp: nowISO(),
        error: e,
      };

      failed.push(row);
      results.push(row);
      console.error(`❌ unblock failed: ${e.message}`);
    }

    safeWriteJSON(OUT_RESULTS, results);
    safeWriteJSON(OUT_FAIL, failed);
  }

  console.log(`\n🎉 [04_unblock] done -> ${OUT_RESULTS}`);
  console.log(`🧾 failed -> ${OUT_FAIL}`);
}

main().catch((e) => {
  console.error("💥 fatal:", e);
  process.exit(1);
});
// npx ts-node 04_unblock.ts
