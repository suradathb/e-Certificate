// STEP 6 — Deterministic replay reducer (the core state machine).
// Reconstructs certificate state from emitted events ONLY.
// It NEVER queries the contract. Comparison happens elsewhere.
//
// Transition model (matches actual contract behavior, incl. idempotent block/unblock):
//   ⊥ --CertIssued--> Active (owner from paired mint Transfer or CertIssued.to; CID from event)
//   Transfer(from==0) : mint — initialize/confirm owner
//   Transfer(from!=0) : ownership change (status unchanged)
//   CertBlocked   : Active|Suspended -> Suspended (idempotent)
//   CertUnblocked : Active|Suspended -> Active   (idempotent)
// No revoke: not implemented in the evaluated contract.

import { NormalizedEvent, ReconstructedCertificate } from "./types";
import { sortCanonical } from "./eventSorter";

const ZERO = "0x0000000000000000000000000000000000000000";

function emptyCert(tokenId: string): ReconstructedCertificate {
  return { tokenId, exists: false, owner: null, status: null, metadataCID: null };
}

/** Reduce a single certificate's events (already filtered to one tokenId). */
export function reduceCertificate(
  tokenId: string,
  events: NormalizedEvent[]
): ReconstructedCertificate {
  const ordered = sortCanonical(events);
  let cert = emptyCert(tokenId);

  for (const ev of ordered) {
    switch (ev.name) {
      case "CertIssued":
        cert.exists = true;
        cert.status = "Active";
        if (ev.metadataCID !== undefined) cert.metadataCID = ev.metadataCID;
        // owner may be set here (CertIssued.to) but the paired ERC-721 Transfer is authoritative
        if (ev.to) cert.owner = ev.to.toLowerCase();
        break;
      case "Transfer":
        // mint (from == zero) initializes existence/owner; otherwise ownership change
        if (ev.from && ev.from.toLowerCase() === ZERO) {
          cert.exists = true;
          if (cert.status === null) cert.status = "Active";
        }
        if (ev.transferTo) cert.owner = ev.transferTo.toLowerCase();
        break;
      case "CertBlocked":
        // idempotent: Active|Suspended -> Suspended (only if the cert exists)
        if (cert.exists) cert.status = "Suspended";
        break;
      case "CertUnblocked":
        // idempotent: Active|Suspended -> Active
        if (cert.exists) cert.status = "Active";
        break;
      default:
        // unknown/unrelated events must not mutate lifecycle state
        break;
    }
  }
  return cert;
}

/** Reduce a mixed event stream for many certificates, independently per tokenId. */
export function reduceAll(
  events: NormalizedEvent[]
): Map<string, ReconstructedCertificate> {
  const byToken = new Map<string, NormalizedEvent[]>();
  for (const ev of events) {
    if (!byToken.has(ev.tokenId)) byToken.set(ev.tokenId, []);
    byToken.get(ev.tokenId)!.push(ev);
  }
  const result = new Map<string, ReconstructedCertificate>();
  for (const [tokenId, evs] of byToken.entries()) {
    result.set(tokenId, reduceCertificate(tokenId, evs));
  }
  return result;
}
