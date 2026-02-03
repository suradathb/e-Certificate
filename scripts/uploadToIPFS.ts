import fs from "fs";
import path from "path";
// import { create } from "ipfs-http-client";

const ipfs = create({
  host: "localhost",
  port: 5001,
  protocol: "http",
});

async function uploadFiles() {
  // const data = JSON.parse(fs.readFileSync("./file_logs/brahman_certificates_30.json", "utf-8"));
  const data = JSON.parse(fs.readFileSync("./file_logs/TEST-001-B1_5certs.json", "utf-8"));

  const cids = [];

  for (let i = 0; i < data.length; i++) {
    const cert = data[i];
    const filename = `cert_${cert.cowId || i}.json`;
    fs.writeFileSync(`./tmp/${filename}`, JSON.stringify(cert, null, 2));

    try {
      const { cid } = await ipfs.add({
        path: filename,
        content: fs.readFileSync(`./tmp/${filename}`),
      });
      cids.push({ id: i + 1, cowId: cert.cowId, cid: cid.toString() });
      console.log(`✅ Uploaded ${filename}: ${cid}`);
    } catch (err) {
      console.error(`❌ Failed to upload ${filename}`, err);
    }
  }

  fs.writeFileSync("./output/cid_list_test01.json", JSON.stringify(cids, null, 2));
  console.log("🎉 All metadata uploaded to local IPFS.");
}

uploadFiles().catch(console.error);
