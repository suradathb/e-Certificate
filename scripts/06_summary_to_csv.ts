import * as fs from "fs";
import * as path from "path";

// ---------------- Config ----------------
const OUT_DIR = "./output/1000";

const FILES = {
  mint: path.join(OUT_DIR, "01_mint_results.json"),
  transfer: path.join(OUT_DIR, "02_transfer_results.json"),
  block: path.join(OUT_DIR, "03_block_results.json"),
  unblock: path.join(OUT_DIR, "04_unblock_results.json"),
  fetch: path.join(OUT_DIR, "05_fetch_results.json"),
};

const OUT_CSV = path.join(OUT_DIR, "summary_1000.csv");

// ---------------- Helpers ----------------
function readJsonIfExists(filePath: string): any[] {
  if (!fs.existsSync(filePath)) return [];
  const txt = fs.readFileSync(filePath, "utf-8").trim();
  if (!txt) return [];
  try {
    const data = JSON.parse(txt);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function pickErrorMsg(row: any): string {
  const e = row?.error;
  if (!e) return "";
  return String(e.shortMessage || e.reason || e.message || "");
}

function csvEscape(value: any): string {
  const s = value === null || value === undefined ? "" : String(value);
  // Escape quotes by doubling them; wrap in quotes if special chars
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsv(rows: Record<string, any>[], headers: string[]): string {
  const lines: string[] = [];
  lines.push(headers.map(csvEscape).join(","));
  for (const r of rows) {
    lines.push(headers.map((h) => csvEscape(r[h])).join(","));
  }
  return lines.join("\n");
}

// ---------------- Main ----------------
function main() {
  const mintRows = readJsonIfExists(FILES.mint);
  const transferRows = readJsonIfExists(FILES.transfer);
  const blockRows = readJsonIfExists(FILES.block);
  const unblockRows = readJsonIfExists(FILES.unblock);
  const fetchRows = readJsonIfExists(FILES.fetch);

  // Index by tokenId (best key after mint), fallback by cowId
  // We'll merge into one record per token/cowId
  const map = new Map<string, Record<string, any>>();

  function keyOf(row: any): string {
    // Prefer tokenId if exists
    if (row?.tokenId) return `token:${row.tokenId}`;
    if (row?.cowId) return `cow:${row.cowId}`;
    // ultimate fallback: cid
    if (row?.cid) return `cid:${row.cid}`;
    return `row:${Math.random().toString(16).slice(2)}`;
  }

  function ensureBase(row: any) {
    const key = keyOf(row);
    if (!map.has(key)) {
      map.set(key, {
        cowId: row?.cowId || "",
        cid: row?.cid || "",
        tokenId: row?.tokenId || "",

        // mint fields
        mint_status: "",
        mint_txHash: "",
        mint_gasUsed: "",
        mint_durationMs: "",
        mint_error: "",

        // transfer fields
        transfer_status: "",
        transfer_txHash: "",
        transfer_gasUsed: "",
        transfer_durationMs: "",
        transfer_error: "",

        // block fields
        block_status: "",
        block_txHash: "",
        block_gasUsed: "",
        block_durationMs: "",
        block_error: "",

        // unblock fields
        unblock_status: "",
        unblock_txHash: "",
        unblock_gasUsed: "",
        unblock_durationMs: "",
        unblock_error: "",

        // fetch fields
        fetch_status: "",
        fetch_durationMs: "",
        fetch_error: "",
        fetch_cert_id: "",
        fetch_metadataCID: "",
        fetch_isBlocked: "",

        // optional context
        mintTo: row?.mintTo || "",
        from: "",
        to: "",
      });
    }
    const base = map.get(key)!;

    // keep best-known IDs
    if (!base.cowId && row?.cowId) base.cowId = row.cowId;
    if (!base.cid && row?.cid) base.cid = row.cid;
    if (!base.tokenId && row?.tokenId) base.tokenId = row.tokenId;
    if (!base.mintTo && row?.mintTo) base.mintTo = row.mintTo;

    return base;
  }

  function mergeStep(
    rows: any[],
    step: "mint" | "transfer" | "block" | "unblock" | "fetch",
  ) {
    for (const r of rows) {
      const base = ensureBase(r);

      // In case transfer/block/unblock/fetch have tokenId but map key created earlier by cowId,
      // we also try to re-key by tokenId after it becomes available.
      if (r?.tokenId && !base.tokenId) base.tokenId = r.tokenId;

      if (step === "mint") {
        base.mint_status = r.status || "";
        base.mint_txHash = r.txHash || "";
        base.mint_gasUsed = r.gasUsed || "";
        base.mint_durationMs = r.durationMs ?? "";
        base.mint_error = pickErrorMsg(r);
        if (r?.mintTo) base.mintTo = r.mintTo;
      }

      if (step === "transfer") {
        base.transfer_status = r.status || "";
        base.transfer_txHash = r.txHash || "";
        base.transfer_gasUsed = r.gasUsed || "";
        base.transfer_durationMs = r.durationMs ?? "";
        base.transfer_error = pickErrorMsg(r);
        base.from = r.from || base.from;
        base.to = r.to || base.to;
      }

      if (step === "block") {
        base.block_status = r.status || "";
        base.block_txHash = r.txHash || "";
        base.block_gasUsed = r.gasUsed || "";
        base.block_durationMs = r.durationMs ?? "";
        base.block_error = pickErrorMsg(r);
      }

      if (step === "unblock") {
        base.unblock_status = r.status || "";
        base.unblock_txHash = r.txHash || "";
        base.unblock_gasUsed = r.gasUsed || "";
        base.unblock_durationMs = r.durationMs ?? "";
        base.unblock_error = pickErrorMsg(r);
      }

      if (step === "fetch") {
        base.fetch_status = r.status || "";
        base.fetch_durationMs = r.durationMs ?? "";
        base.fetch_error = pickErrorMsg(r);
        base.fetch_cert_id = r?.data?.id ?? "";
        base.fetch_metadataCID = r?.data?.metadataCID ?? "";
        base.fetch_isBlocked = r?.data?.isBlocked ?? "";
      }

      // Update tokenId / cowId / cid if present
      if (r?.cowId) base.cowId = r.cowId;
      if (r?.cid) base.cid = r.cid;
      if (r?.tokenId) base.tokenId = r.tokenId;
    }
  }

  // Merge all steps
  mergeStep(mintRows, "mint");
  mergeStep(transferRows, "transfer");
  mergeStep(blockRows, "block");
  mergeStep(unblockRows, "unblock");
  mergeStep(fetchRows, "fetch");

  // Convert map to rows and sort by cowId then tokenId
  const rows = Array.from(map.values()).sort((a, b) => {
    const c = String(a.cowId).localeCompare(String(b.cowId));
    if (c !== 0) return c;
    return String(a.tokenId).localeCompare(String(b.tokenId));
  });

  const headers = [
    "cowId",
    "cid",
    "tokenId",
    "mintTo",
    "from",
    "to",

    "mint_status",
    "mint_txHash",
    "mint_gasUsed",
    "mint_durationMs",
    "mint_error",

    "transfer_status",
    "transfer_txHash",
    "transfer_gasUsed",
    "transfer_durationMs",
    "transfer_error",

    "block_status",
    "block_txHash",
    "block_gasUsed",
    "block_durationMs",
    "block_error",

    "unblock_status",
    "unblock_txHash",
    "unblock_gasUsed",
    "unblock_durationMs",
    "unblock_error",

    "fetch_status",
    "fetch_durationMs",
    "fetch_error",
    "fetch_cert_id",
    "fetch_metadataCID",
    "fetch_isBlocked",
  ];

  const csv = toCsv(rows, headers);

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_CSV, csv, "utf-8");

  console.log(" CSV summary generated:", OUT_CSV);
  console.log(` rows=${rows.length}`);
  console.log(" sources:", FILES);
}

main();

// npx ts-node 06_summary_to_csv.ts
// 06_summary_to_csv.ts
// Purpose

// Read results from files:

// ./output/01_mint_results.json

// ./output/02_transfer_results.json

// ./output/03_block_results.json

// ./output/04_unblock_results.json

// ./output/05_fetch_results.json

// Summarize into a single CSV table: one row per certificate (cowId/cid/tokenId)

// includes all step columns: status/txHash/gasUsed/duration/error

// includes fetch-data columns: metadataCID/isBlocked/id (if present)
