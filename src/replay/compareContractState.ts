// STEP 6 — Compare replayed state (from events) against authoritative contract state.
// The contract is queried ONLY here, AFTER reconstruction.

import { ComparisonRow, LifecycleStatus, ReconstructedCertificate } from "./types";

export interface ContractState {
  exists: boolean;
  owner: string | null;
  status: LifecycleStatus | null;
  metadataCID: string | null;
}

/** Pure comparator — no I/O, fully unit-testable. */
export function compareState(
  replayed: ReconstructedCertificate,
  contract: ContractState,
  opts: { compareMetadata: boolean } = { compareMetadata: true }
): ComparisonRow {
  const norm = (s: string | null) => (s == null ? null : s.toLowerCase());

  const existsMatch = replayed.exists === contract.exists;
  const ownerMatch = norm(replayed.owner) === norm(contract.owner);
  const statusMatch = replayed.status === contract.status;
  const metadataMatch: boolean | "N/A" = opts.compareMetadata
    ? replayed.metadataCID === contract.metadataCID
    : "N/A";

  const overall =
    existsMatch &&
    ownerMatch &&
    statusMatch &&
    (metadataMatch === "N/A" ? true : metadataMatch);

  return {
    tokenId: replayed.tokenId,
    existsMatch,
    ownerMatch,
    statusMatch,
    metadataMatch,
    overall,
    replayed,
    contract,
  };
}
