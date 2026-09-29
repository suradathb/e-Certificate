// Upload certificate metadata JSON files to a local IPFS node and record their CIDs.
//
// Evaluated configuration: a local IPFS node exposed over the HTTP API at
// http://localhost:5001 (ipfs-http-client). Each metadata object is written to a
// temporary file, added to IPFS, and the returned CID is recorded. The CID is later
// bound on-chain via issueCert(..., metadataCID) and emitted in the CertIssued event.
//
// Scope note: content addressing provides content identity / tamper evidence for the
// retrieved object. It does NOT by itself guarantee long-term availability. No external
// pinning service, gateway failover, or replication is implemented here; those are
// production-deployment considerations that were not evaluated in this study.

import fs from "fs";
import path from "path";
import { create } from "ipfs-http-client";

// Local IPFS node HTTP API (evaluated prototype configuration).
const ipfs = create({
  host: process.env.IPFS_API_HOST || "localhost",
  port: parseInt(process.env.IPFS_API_PORT || "5001", 10),
  protocol: process.env.IPFS_API_PROTOCOL || "http",
});

const INPUT_FILE =
  process.env.IPFS_INPUT_FILE || "./file_logs/TEST-001-B1_5certs.json";
const OUTPUT_FILE =
  process.env.IPFS_OUTPUT_FILE || "./output/cid_list_test01.json";
const TMP_DIR = "./tmp";

async function uploadFiles() {
  const data = JSON.parse(fs.readFileSync(INPUT_FILE, "utf-8"));
  fs.mkdirSync(TMP_DIR, { recursive: true });
  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });

  const cids: { id: number; cowId: string | undefined; cid: string }[] = [];

  for (let i = 0; i < data.length; i++) {
    const cert = data[i];
    const filename = `cert_${cert.cowId || i}.json`;
    const tmpPath = path.join(TMP_DIR, filename);
    fs.writeFileSync(tmpPath, JSON.stringify(cert, null, 2));

    try {
      const { cid } = await ipfs.add({
        path: filename,
        content: fs.readFileSync(tmpPath),
      });
      cids.push({ id: i + 1, cowId: cert.cowId, cid: cid.toString() });
      console.log(`[ok] uploaded ${filename}: ${cid}`);
    } catch (err) {
      console.error(`[fail] upload ${filename}`, err);
    }
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(cids, null, 2));
  console.log(`[done] wrote ${cids.length} CIDs -> ${OUTPUT_FILE}`);
}

uploadFiles().catch(console.error);
