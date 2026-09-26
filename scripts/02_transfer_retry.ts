// 02_transfer_retry.ts
// เป้าหมาย (แบบเดียวกับ 01_mint_retry.ts):
// - อ่าน ./output/500/02_transfer_failed.json
// - “ลอง transfer ใหม่” เฉพาะใบที่เคย fail
// - ไม่หยุดทั้งชุด + log สาเหตุ
// - อัปเดตไฟล์เดิมให้ใช้งานต่อได้
//   - append ผล (success/fail/skip) เข้า 02_transfer_results.json (master log)
//   - append ประวัติ retry เข้า 02_transfer_retry_results.json
//   - append ประวัติ retry fail เข้า 02_transfer_retry_failed.json
//   - ปรับ 02_transfer_failed.json ให้เหลือเฉพาะใบที่ยัง fail จริง ๆ (backlog รอบถัดไป)

import { ethers } from "ethers";
import * as fs from "fs";
import * as dotenv from "dotenv";

dotenv.config();

const ABI_PATH = "./artifacts/contracts/NFTCowCert_v2.sol/NFTCowCert.json";

const OUT_DIR = "./output/1000";
const IN_FAIL = `${OUT_DIR}/02_transfer_failed.json`;
const IN_RESULTS = `${OUT_DIR}/02_transfer_results.json`;

const OUT_RETRY_RESULTS = `${OUT_DIR}/02_transfer_retry_results.json`;
const OUT_RETRY_FAIL = `${OUT_DIR}/02_transfer_retry_failed.json`;

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
    JSON.stringify(data, (_, v) => (typeof v === "bigint" ? v.toString() : v), 2),
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
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  ensureDir(OUT_DIR);

  // backlog ที่ต้อง retry (เฉพาะที่ยัง fail)
  const failedItems = safeReadArray(IN_FAIL);
  if (failedItems.length === 0) {
    console.log("ℹ️ No failed transfer items found. Nothing to retry.");
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

  const mintTo = (process.env.ADDRESS_SIGN || signer.address).toLowerCase();
  const transferTo = (process.env.TRANSFER_TO || signer.address).toLowerCase();

  // master results (สะสม)
  const transferResults = safeReadArray(IN_RESULTS);

  // retry logs (สะสม ไม่เขียนทับ)
  const retryResults = safeReadArray(OUT_RETRY_RESULTS);
  const retryFailedLog = safeReadArray(OUT_RETRY_FAIL);

  // backlog ใหม่สำหรับรอบถัดไป (fresh, ไม่สะสมซ้ำ)
  const remainingFailed: any[] = [];

  console.log(`🚀 [02_transfer_retry] retryCount=${failedItems.length}`);
  console.log(`👤 signer=${signer.address}`);
  console.log(`from(mintTo)=${mintTo}`);
  console.log(`to(transferTo)=${transferTo}`);
  console.log(`🔗 contract=${process.env.ZKSYNC_CONTRACT_TEST}`);

  for (let i = 0; i < failedItems.length; i++) {
    const item = failedItems[i];
    const cowId = item.cowId;
    const cid = item.cid;
    const tokenId = String(item.tokenId);

    console.log(
      `\n[${i + 1}/${failedItems.length}] retry transfer cowId=${cowId} tokenId=${tokenId}`,
    );

    const start = Date.now();

    try {
      // ✅ เช็ค owner ก่อนยิง tx (กันยิงซ้ำ)
      const owner = String(await contract.ownerOf(tokenId)).toLowerCase();

      if (owner === transferTo) {
        // เคยโอนสำเร็จแล้วบน chain แต่รอบนั้นอาจบันทึกไม่ทัน
        const end = Date.now();
        const row = {
          cowId,
          cid,
          tokenId,
          from: mintTo,
          to: transferTo,
          durationMs: end - start,
          status: "success",
          timestamp: nowISO(),
          note: "retry_skip_already_transferred_onchain",
        };

        retryResults.push(row);
        transferResults.push(row);

        console.log(`✅ skip: already transferred on-chain`);
      } else if (owner !== mintTo) {
        // signer โอนให้ไม่ได้ เพราะไม่ใช่ owner (หรือยังไม่ได้รับ approval)
        const end = Date.now();
        const row = {
          cowId,
          cid,
          tokenId,
          from: mintTo,
          to: transferTo,
          durationMs: end - start,
          status: "failed",
          timestamp: nowISO(),
          note: `owner_mismatch currentOwner=${owner} (need owner/approval)`,
        };

        retryResults.push(row);
        retryFailedLog.push(row);
        remainingFailed.push(item); // เก็บ item เดิมไว้ retry รอบหน้า
        transferResults.push(row);

        console.error(`❌ owner mismatch: ${row.note}`);
      } else {
        // ✅ โอนจริง
        const tx = await contract.safeTransferFrom(mintTo, transferTo, tokenId);
        const rcpt = await tx.wait();
        const end = Date.now();

        const row = {
          cowId,
          cid,
          tokenId,
          from: mintTo,
          to: transferTo,
          txHash: tx.hash,
          gasUsed: rcpt.gasUsed?.toString?.(),
          durationMs: end - start,
          status: "success",
          timestamp: nowISO(),
          note: "retry_success",
        };

        retryResults.push(row);
        transferResults.push(row);

        console.log(`✅ retry transfer success tx=${tx.hash}`);
      }
    } catch (err: any) {
      const end = Date.now();
      const e = extractError(err);

      const row = {
        cowId,
        cid,
        tokenId,
        from: mintTo,
        to: transferTo,
        durationMs: end - start,
        status: "failed",
        timestamp: nowISO(),
        error: e,
        note: "retry_failed",
      };

      retryResults.push(row);
      retryFailedLog.push(row);
      remainingFailed.push(item); // เก็บ item เดิมไว้ retry รอบหน้า
      transferResults.push(row);

      console.error(`❌ retry transfer failed: ${e.message}`);
    }

    // checkpoint ทุกใบ (กันสคริปต์ดับกลางทาง)
    safeWriteJSON(OUT_RETRY_RESULTS, retryResults); // ✅ append log (โดยการอ่านของเดิมมาแล้วเขียนรวม)
    safeWriteJSON(OUT_RETRY_FAIL, retryFailedLog); // ✅ append fail history
    safeWriteJSON(IN_RESULTS, transferResults);    // ✅ master log สะสม
    safeWriteJSON(IN_FAIL, remainingFailed);       // ✅ backlog รอบถัดไป (fresh)

    await sleep(250); // กัน RPC rate limit
  }

  console.log(`\n🎉 [02_transfer_retry] done`);
  console.log(`📄 retry results (append) -> ${OUT_RETRY_RESULTS}`);
  console.log(`🧾 retry failed (append)  -> ${OUT_RETRY_FAIL}`);
  console.log(`🧩 updated transfer results -> ${IN_RESULTS}`);
  console.log(`🔁 updated failed backlog   -> ${IN_FAIL}`);
}

main().catch((e) => {
  console.error("💥 fatal:", e);
  process.exit(1);
});

// run: npx ts-node 02_transfer_retry.ts
