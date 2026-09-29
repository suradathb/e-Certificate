// STEP 6 — Decode ethers logs into NormalizedEvent[].
// Uses the contract interface to parse CertIssued / CertBlocked / CertUnblocked
// and the ERC-721 Transfer event. ethers v6 API.

import { ethers } from "ethers";
import { NormalizedEvent } from "./types";

// Minimal ABI fragments needed for decoding (matches NFTCowCert_v2.sol).
export const REPLAY_ABI = [
  "event CertIssued(uint256 indexed id, address indexed to, string metadataCID)",
  "event CertBlocked(uint256 indexed id)",
  "event CertUnblocked(uint256 indexed id)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
];

export function decodeLogs(
  logs: ReadonlyArray<ethers.Log>,
  iface?: ethers.Interface
): NormalizedEvent[] {
  const itf = iface ?? new ethers.Interface(REPLAY_ABI);
  const out: NormalizedEvent[] = [];

  for (const log of logs) {
    let parsed: ethers.LogDescription | null = null;
    try {
      parsed = itf.parseLog({ topics: [...log.topics], data: log.data });
    } catch {
      continue; // unrelated event
    }
    if (!parsed) continue;

    const base = {
      blockNumber: Number(log.blockNumber),
      transactionIndex: Number((log as any).transactionIndex ?? (log as any).index ?? 0),
      logIndex: Number((log as any).logIndex ?? (log as any).index ?? 0),
    };

    if (parsed.name === "CertIssued") {
      out.push({
        name: "CertIssued",
        tokenId: parsed.args.id.toString(),
        to: String(parsed.args.to).toLowerCase(),
        metadataCID: String(parsed.args.metadataCID),
        ...base,
      });
    } else if (parsed.name === "CertBlocked") {
      out.push({ name: "CertBlocked", tokenId: parsed.args.id.toString(), ...base });
    } else if (parsed.name === "CertUnblocked") {
      out.push({ name: "CertUnblocked", tokenId: parsed.args.id.toString(), ...base });
    } else if (parsed.name === "Transfer") {
      out.push({
        name: "Transfer",
        tokenId: parsed.args.tokenId.toString(),
        from: String(parsed.args.from).toLowerCase(),
        transferTo: String(parsed.args.to).toLowerCase(),
        ...base,
      });
    }
  }
  return out;
}
