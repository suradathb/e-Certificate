// STEP 6 — Canonical event ordering.
// Blockchain canonical order: blockNumber ASC, transactionIndex ASC, logIndex ASC.
// We deliberately DO NOT sort by timestamp and DO NOT rely on RPC response order.

import { NormalizedEvent } from "./types";

export function sortCanonical(events: NormalizedEvent[]): NormalizedEvent[] {
  return [...events].sort((a, b) => {
    if (a.blockNumber !== b.blockNumber) return a.blockNumber - b.blockNumber;
    if (a.transactionIndex !== b.transactionIndex)
      return a.transactionIndex - b.transactionIndex;
    return a.logIndex - b.logIndex;
  });
}
