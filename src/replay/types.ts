// STEP 6 — Replay engine types.
// Reconstructed certificate state derived ONLY from emitted on-chain events.
// Fields are limited to what the actual contract/events can supply:
//   - CertIssued(uint256 indexed id, address indexed to, string metadataCID)
//   - ERC-721 Transfer(address from, address to, uint256 tokenId)
//   - CertBlocked(uint256 indexed id)
//   - CertUnblocked(uint256 indexed id)
// No permanent-revocation semantics exist in the evaluated contract.

export type LifecycleStatus = "Active" | "Suspended";

export interface ReconstructedCertificate {
  tokenId: string;              // decimal string (token id == cert id in this contract)
  exists: boolean;              // false == ⊥ (pre-existence)
  owner: string | null;         // lowercased address, from ERC-721 Transfer
  status: LifecycleStatus | null;
  metadataCID: string | null;   // from CertIssued.metadataCID (reconstructible from events)
}

// Canonical, decoder-agnostic representation of a relevant log.
export interface NormalizedEvent {
  name: "CertIssued" | "Transfer" | "CertBlocked" | "CertUnblocked";
  tokenId: string;              // decimal string
  // ordering keys (blockchain canonical order)
  blockNumber: number;
  transactionIndex: number;
  logIndex: number;
  // event-specific payload
  to?: string;                  // CertIssued.to (lowercased)
  from?: string;                // Transfer.from (lowercased)
  transferTo?: string;          // Transfer.to (lowercased)
  metadataCID?: string;         // CertIssued.metadataCID
}

export interface ComparisonRow {
  tokenId: string;
  ownerMatch: boolean;
  statusMatch: boolean;
  metadataMatch: boolean | "N/A";
  existsMatch: boolean;
  overall: boolean;
  replayed: ReconstructedCertificate;
  contract: {
    exists: boolean;
    owner: string | null;
    status: LifecycleStatus | null;
    metadataCID: string | null;
  };
}
