// STEP 6 — Public API of the replay engine.
// Reconstruct certificate state from a set of ethers logs, without querying the contract.

import { ethers } from "ethers";
import { decodeLogs } from "./eventDecoder";
import { reduceAll } from "./reducer";
import { ReconstructedCertificate } from "./types";

export { reduceCertificate, reduceAll } from "./reducer";
export { sortCanonical } from "./eventSorter";
export { compareState } from "./compareContractState";
export { decodeLogs, REPLAY_ABI } from "./eventDecoder";
export * from "./types";

/** Reconstruct all certificate states from raw ethers logs. */
export function reconstructFromLogs(
  logs: ReadonlyArray<ethers.Log>,
  iface?: ethers.Interface
): Map<string, ReconstructedCertificate> {
  const normalized = decodeLogs(logs, iface);
  return reduceAll(normalized);
}
