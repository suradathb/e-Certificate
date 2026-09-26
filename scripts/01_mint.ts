import { ethers } from "ethers";
import * as fs from "fs";
import * as dotenv from "dotenv";

dotenv.config();

const ABI_PATH = "./artifacts/contracts/NFTCowCert_v2.sol/NFTCowCert.json";
const CID_LIST_PATH = "./output/cid_list_1000.json";

const OUT_DIR = "./output/1000";
const OUT_RESULTS = `${OUT_DIR}/01_mint_results.json`;
const OUT_FAIL = `${OUT_DIR}/01_mint_failed.json`;

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

  const abiJson = JSON.parse(fs.readFileSync(ABI_PATH, "utf-8"));
  const provider = new ethers.JsonRpcProvider(process.env.ZKSYNC_RPC);
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  const contract = new ethers.Contract(
    process.env.ZKSYNC_CONTRACT_TEST!,
    abiJson.abi,
    signer,
  );

  const list: Array<{ cowId: string; cid: string }> = JSON.parse(
    fs.readFileSync(CID_LIST_PATH, "utf-8"),
  );
  const mintTo = process.env.ADDRESS_SIGN || signer.address;

  const results: any[] = [];
  const failed: any[] = [];

  console.log(`🚀 [01_mint] items=${list.length}`);
  console.log(`👤 signer=${signer.address}`);
  console.log(`🎯 mintTo=${mintTo}`);
  console.log(`🔗 contract=${process.env.ZKSYNC_CONTRACT_TEST}`);

  for (let i = 0; i < list.length; i++) {
    const { cowId, cid } = list[i];
    const cowHash = ethers.keccak256(ethers.toUtf8Bytes(cowId));

    console.log(`\n[${i + 1}/${list.length}] mint cowId=${cowId}`);

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
      };

      results.push(row);
      console.log(`✅ minted tokenId=${tokenId ?? "UNKNOWN"} tx=${tx.hash}`);
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
      };

      failed.push(row);
      results.push(row);
      console.error(`❌ mint failed: ${e.message}`);
    }

    // checkpoint ทุกใบ
    safeWriteJSON(OUT_RESULTS, results);
    safeWriteJSON(OUT_FAIL, failed);
  }

  console.log(`\n🎉 [01_mint] done -> ${OUT_RESULTS}`);
  console.log(`🧾 failed -> ${OUT_FAIL}`);
}

main().catch((e) => {
  console.error("💥 fatal:", e);
  process.exit(1);
});

// npx ts-node scripts/01_mint.ts 
