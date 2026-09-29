// STEP 7B.1 — On-chain verification + operation preconditions.
// Chain state is AUTHORITATIVE; checkpoint is only a recovery hint.
// Pure logic: the caller injects async chain-query fns so this is unit-testable
// without a network.

export interface ChainView {
  // returns owner (lowercased) or null if token does not exist
  ownerOf(tokenId: string): Promise<string | null>;
  // returns true if suspended (isBlocked), false if active, null if not exist
  isBlocked(tokenId: string): Promise<boolean | null>;
}

export interface TokenExpectation {
  tokenId: string;
  expectedOwner?: string;          // lowercased
  expectedState?: "Active" | "Suspended";
}

export interface VerifyResult {
  ok: boolean;
  verified: number;
  mismatches: { tokenId: string; reason: string }[];
}

/** Verify a set of tokens against authoritative chain state. */
export async function verifyTokens(chain: ChainView, expects: TokenExpectation[]): Promise<VerifyResult> {
  const mismatches: { tokenId: string; reason: string }[] = [];
  let verified = 0;
  for (const e of expects) {
    const owner = await chain.ownerOf(e.tokenId);
    if (owner === null) { mismatches.push({ tokenId: e.tokenId, reason: "TOKEN_NOT_EXIST" }); continue; }
    if (e.expectedOwner && owner.toLowerCase() !== e.expectedOwner.toLowerCase()) {
      mismatches.push({ tokenId: e.tokenId, reason: `OWNER_MISMATCH(${owner}!=${e.expectedOwner})` }); continue;
    }
    if (e.expectedState) {
      const blk = await chain.isBlocked(e.tokenId);
      if (blk === null) { mismatches.push({ tokenId: e.tokenId, reason: "TOKEN_NOT_EXIST" }); continue; }
      const state = blk ? "Suspended" : "Active";
      if (state !== e.expectedState) { mismatches.push({ tokenId: e.tokenId, reason: `STATE_MISMATCH(${state}!=${e.expectedState})` }); continue; }
    }
    verified++;
  }
  return { ok: mismatches.length === 0, verified, mismatches };
}

/**
 * Preconditions per measured operation (checked AFTER setup, BEFORE measurement).
 * - transfer: all tokens exist, owner == source (admin)
 * - block:    all tokens exist, all Active
 * - unblock:  all tokens exist, all Suspended
 */
export function preconditionExpectations(
  operation: "transfer" | "block" | "unblock",
  tokenIds: string[],
  sourceOwner: string
): TokenExpectation[] {
  if (operation === "transfer") return tokenIds.map(t => ({ tokenId: t, expectedOwner: sourceOwner }));
  if (operation === "block")    return tokenIds.map(t => ({ tokenId: t, expectedOwner: sourceOwner, expectedState: "Active" as const }));
  return tokenIds.map(t => ({ tokenId: t, expectedOwner: sourceOwner, expectedState: "Suspended" as const })); // unblock
}
