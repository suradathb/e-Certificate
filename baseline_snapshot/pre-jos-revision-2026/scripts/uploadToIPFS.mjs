// scripts/uploadToIPFS.mjs
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ✅ ช่วยจัดการ __dirname แบบ ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ ใช้ path ตรงนี้ (เหมือนเดิม) เปลี่ยนแปลงได้ตามต้องการ
const inputPath = path.join(__dirname, "../file_logs/TEST-001-B3_5certs.json");
const outputPath = path.join(__dirname, "../output/cid_list_B3.json");
const tmpDir = path.join(__dirname, "../tmp");

// ✅ IPFS HTTP API (local)
const IPFS_API = "http://127.0.0.1:5001";

// ---- helpers ----
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function parseIpfsAddResponse(text) {
  // ipfs /api/v0/add often returns NDJSON (JSON per line)
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) throw new Error("Empty response from IPFS /add");

  const last = JSON.parse(lines[lines.length - 1]);
  const cid = last.Hash || last.Cid || last.CID;
  if (!cid) throw new Error(`IPFS response has no CID/Hash: ${JSON.stringify(last)}`);
  return String(cid);
}

async function ipfsAddFile(filename, fileBytes) {
  // multipart/form-data -> /api/v0/add
  const form = new FormData();
  const blob = new Blob([fileBytes], { type: "application/json" });
  form.append("file", blob, filename);

  const res = await fetch(`${IPFS_API}/api/v0/add?pin=true`, {
    method: "POST",
    body: form,
  });

  const text = await res.text();
  if (!res.ok) throw new Error(`IPFS add failed (${res.status}): ${text}`);

  return parseIpfsAddResponse(text);
}

// ✅ ฟังก์ชันหลัก
async function uploadFiles() {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`❌ Input file not found: ${inputPath}`);
  }

  ensureDir(tmpDir);
  ensureDir(path.dirname(outputPath));

  const data = JSON.parse(fs.readFileSync(inputPath, "utf-8"));
  const cids = [];

  for (let i = 0; i < data.length; i++) {
    const cert = data[i];
    const filename = `cert_${cert.cowId || i}.json`;
    const filePath = path.join(tmpDir, filename);

    fs.writeFileSync(filePath, JSON.stringify(cert, null, 2));

    try {
      const fileContent = fs.readFileSync(filePath);
      const cid = await ipfsAddFile(filename, fileContent);

      cids.push({ id: i + 1, cowId: cert.cowId, cid });
      console.log(`✅ Uploaded ${filename}: ${cid}`);
    } catch (err) {
      console.error(`❌ Failed to upload ${filename}`, err?.message || err);
      // ✅ ไม่หยุดทั้งชุด
    }
  }

  fs.writeFileSync(outputPath, JSON.stringify(cids, null, 2));
  console.log("🎉 All metadata uploaded to IPFS successfully.");
}

// ✅ เรียกใช้
uploadFiles().catch((err) => {
  console.error("❌ Upload error:", err.message || err);
});


// node scripts/uploadToIPFS.mjs