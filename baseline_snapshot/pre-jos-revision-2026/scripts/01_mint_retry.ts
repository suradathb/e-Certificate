import { ethers } from "ethers";
import * as fs from "fs";
import * as dotenv from "dotenv";

dotenv.config();

const ABI_PATH = "./artifacts/contracts/NFTCowCert_v2.sol/NFTCowCert.json";

const OUT_DIR = "./output/1000";
const IN_FAIL = `${OUT_DIR}/01_mint_failed.json`;
const IN_RESULTS = `${OUT_DIR}/01_mint_results.json`;

const OUT_RETRY_RESULTS = `${OUT_DIR}/01_mint_retry_results.json`;
const OUT_RETRY_FAIL = `${OUT_DIR}/01_mint_retry_failed.json`;

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
function nowISO() {
  return new Date().toISOString();
}
function safeReadArray(file: string): any[] {
  if (!fs.existsSync(file)) return [];
  const txt = fs.readFileSync(file, "utf-8").trim();
  if (!txt) return [];
  try {
    const data = JSON.parse(txt);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
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

function getTokenIdFromReceipt(
  contract: ethers.Contract,
  receipt: any,
): string | undefined {
  for (const log of receipt.logs ?? []) {
    try {
      const parsed = contract.interface.parseLog(log);
      if (parsed?.name === "Transfer") {
        const from = String(parsed.args?.from || "").toLowerCase();
        const tokenId = parsed.args?.tokenId;
        if (
          from === ethers.ZeroAddress.toLowerCase() &&
          tokenId !== undefined
        ) {
          return tokenId.toString();
        }
      }
    } catch {}
  }
  return undefined;
}

async function main() {
  ensureDir(OUT_DIR);

  const failedItems = safeReadArray(IN_FAIL);
  if (failedItems.length === 0) {
    console.log("ℹ️ No failed mint items found. Nothing to retry.");
    return;
  }

  const abiJson = JSON.parse(fs.readFileSync(ABI_PATH, "utf-8"));
  const provider = new ethers.JsonRpcProvider(process.env.ZKSYNC_RPC);
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  const contract = new ethers.Contract(
    process.env.ZKSYNC_CONTRACT_TEST!,
    abiJson.abi,
    signer,
  );

  // Load existing mint results (to append)
  const mintResults = safeReadArray(IN_RESULTS);

  const mintTo = process.env.MINT_TO || signer.address;

  const retryResults: any[] = [];
  const stillFailed: any[] = [];

  console.log(`🚀 [01_mint_retry] retryCount=${failedItems.length}`);
  console.log(`👤 signer=${signer.address}`);
  console.log(`🎯 mintTo=${mintTo}`);
  console.log(`🔗 contract=${process.env.ZKSYNC_CONTRACT_TEST}`);

  for (let i = 0; i < failedItems.length; i++) {
    // failed item structure from our scripts: { cowId, cid, mintTo?, ... }
    const item = failedItems[i];
    const cowId = item.cowId;
    const cid = item.cid;

    console.log(`\n[${i + 1}/${failedItems.length}] retry mint cowId=${cowId}`);

    const cowHash = ethers.keccak256(ethers.toUtf8Bytes(cowId));
    const start = Date.now();

    try {
      const tx = await contract.issueCert(mintTo, cid, cowId, cowHash);
      const rcpt = await tx.wait();
      const tokenId = getTokenIdFromReceipt(contract, rcpt);
      const end = Date.now();

      const row = {
        cowId,
        cid,
        cowHash,
        mintTo,
        tokenId,
        txHash: tx.hash,
        gasUsed: rcpt.gasUsed?.toString?.(),
        durationMs: end - start,
        status: "success",
        timestamp: nowISO(),
        note: "retry_success",
      };

      retryResults.push(row);
      mintResults.push(row);

      console.log(
        `✅ retry mint success tokenId=${tokenId ?? "UNKNOWN"} tx=${tx.hash}`,
      );
    } catch (err: any) {
      const end = Date.now();
      const e = extractError(err);

      const row = {
        cowId,
        cid,
        mintTo,
        durationMs: end - start,
        status: "failed",
        timestamp: nowISO(),
        error: e,
        note: "retry_failed",
      };

      retryResults.push(row);
      stillFailed.push(row);
      mintResults.push(row);

      console.error(`❌ retry mint failed: ${e.message}`);
    }

    // checkpoint ทุกใบ (กันสคริปต์ดับกลางทาง)
    safeWriteJSON(OUT_RETRY_RESULTS, retryResults);
    safeWriteJSON(OUT_RETRY_FAIL, stillFailed);
    safeWriteJSON(IN_RESULTS, mintResults); // append ลงไฟล์หลัก
    safeWriteJSON(IN_FAIL, stillFailed); // เหลือเฉพาะที่ยัง fail
  }

  console.log(`\n🎉 [01_mint_retry] done`);
  console.log(`📄 retry results -> ${OUT_RETRY_RESULTS}`);
  console.log(`🧾 retry failed   -> ${OUT_RETRY_FAIL}`);
  console.log(`🧩 updated mint results -> ${IN_RESULTS}`);
  console.log(`🔁 updated failed list  -> ${IN_FAIL}`);
}

main().catch((e) => {
  console.error("💥 fatal:", e);
  process.exit(1);
});

// npx ts-node 01_mint_retry.ts
// 01_mint_retry.ts
// เป้าหมาย

// อ่าน ./output/01_mint_failed.json

// “ลอง mint ใหม่” เฉพาะใบที่เคย fail

// ไม่หยุดทั้งชุด + log สาเหตุเหมือนเดิม

// อัปเดตไฟล์เดิมให้ใช้งานต่อได้:

// เพิ่มผล (success/fail) เข้า 01_mint_results.json

// ปรับ 01_mint_failed.json ให้เหลือเฉพาะใบที่ยัง fail จริง ๆ
