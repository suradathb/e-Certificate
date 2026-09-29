// STEP 6 — CLI runner for a LIVE network (reads logs from a deployed contract).
// Reconstructs certificate state from emitted events, then queries the contract to compare.
//
// Run (against a configured network):
//   npx hardhat run scripts/replay/reconstructCertificateState.ts --network zkSyncTestnet
//
// Config via env (reuses repo conventions):
//   ZKSYNC_RPC / ZKSYNC_CONTRACT_TEST / PRIVATE_KEY (read-only queries need only RPC+addr)
//   REPLAY_FROM_BLOCK (default 0), REPLAY_TO_BLOCK (default "latest")
//   REPLAY_TOKENS="1,2,3" (optional; default: all tokens seen in CertIssued events)

import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import { reconstructFromLogs } from "../../src/replay/reconstructCertificateState";
import { compareState, ContractState } from "../../src/replay/compareContractState";

dotenv.config();

const ABI = [
  "function ownerOf(uint256) view returns (address)",
  "function certs(uint256) view returns (uint256 id, string metadataCID, bool isBlocked)",
  "function isCertBlocked(uint256) view returns (bool)",
];

async function contractStateOf(c: any, tokenId: string): Promise<ContractState> {
  try {
    const owner = await c.ownerOf(tokenId);
    const cert = await c.certs(tokenId);
    return { exists: true, owner: String(owner).toLowerCase(),
             status: cert.isBlocked ? "Suspended" : "Active", metadataCID: String(cert.metadataCID) };
  } catch { return { exists: false, owner: null, status: null, metadataCID: null }; }
}

async function main() {
  const rpc = process.env.ZKSYNC_RPC;
  const addr = process.env.ZKSYNC_CONTRACT_TEST;
  if (!rpc || !addr) throw new Error("Set ZKSYNC_RPC and ZKSYNC_CONTRACT_TEST in .env");
  const fromBlock = parseInt(process.env.REPLAY_FROM_BLOCK || "0", 10);
  const toBlock = process.env.REPLAY_TO_BLOCK || "latest";

  const provider = new ethers.JsonRpcProvider(rpc);
  const logs = await provider.getLogs({ address: addr, fromBlock, toBlock: toBlock as any });
  const reconstructed = reconstructFromLogs(logs as any);

  const c = new ethers.Contract(addr, ABI, provider);
  const tokens = process.env.REPLAY_TOKENS
    ? process.env.REPLAY_TOKENS.split(",").map((s) => s.trim())
    : [...reconstructed.keys()];

  let matches = 0, mismatches = 0;
  const rows: any[] = [];
  for (const tokenId of tokens) {
    const replayed = reconstructed.get(tokenId);
    const cs = await contractStateOf(c, tokenId);
    if (!replayed) { mismatches++; continue; }
    const row = compareState(replayed, cs, { compareMetadata: true });
    rows.push(row);
    if (row.overall) matches++; else mismatches++;
    console.log(`Token ${tokenId}  Owner ${row.ownerMatch?"MATCH":"MISMATCH"}  Status ${row.statusMatch?"MATCH":"MISMATCH"}  Metadata ${row.metadataMatch==="N/A"?"N/A":(row.metadataMatch?"MATCH":"MISMATCH")}  Overall ${row.overall?"MATCH":"MISMATCH"}`);
  }

  const outDir = path.join(process.cwd(), "replay-artifacts");
  fs.mkdirSync(outDir, { recursive: true });
  const out = {
    network: rpc, contractAddress: addr, blockRange: { fromBlock, toBlock },
    tokenCount: tokens.length, eventCount: logs.length,
    matchCount: matches, mismatchCount: mismatches,
    conformanceRate: tokens.length ? matches / tokens.length : 0,
    timestamp: new Date().toISOString(), rows,
  };
  fs.writeFileSync(path.join(outDir, "replay_live.json"), JSON.stringify(out, null, 2));
  console.log(`\nmatch=${matches} mismatch=${mismatches} -> artifacts/replay/replay_live.json`);
}

main().catch((e) => { console.error(e); process.exit(1); });
