// STEP 6 — Unit tests for the deterministic replay reducer (T1–T12).
// Pure logic tests: no contract, no network. Run: npx hardhat test test/replay.reducer.spec.ts
// (Uses chai; mocha is provided by hardhat's test runner.)

import { expect } from "chai";
import { reduceCertificate, reduceAll } from "../src/replay/reducer";
import { sortCanonical } from "../src/replay/eventSorter";
import { compareState } from "../src/replay/compareContractState";
import { NormalizedEvent } from "../src/replay/types";

const ZERO = "0x0000000000000000000000000000000000000000";
const A = "0x00000000000000000000000000000000000000a1";
const B = "0x00000000000000000000000000000000000000b2";
const CID = "bafkreiexamplecid";

let seq = 0;
function ev(partial: Partial<NormalizedEvent> & { name: NormalizedEvent["name"]; tokenId: string }): NormalizedEvent {
  // auto-increment ordering keys unless provided
  const s = seq++;
  return {
    blockNumber: partial.blockNumber ?? Math.floor(s / 3) + 1,
    transactionIndex: partial.transactionIndex ?? 0,
    logIndex: partial.logIndex ?? s,
    ...partial,
  } as NormalizedEvent;
}
function mint(tokenId: string, to: string): NormalizedEvent[] {
  return [
    ev({ name: "Transfer", tokenId, from: ZERO, transferTo: to }),
    ev({ name: "CertIssued", tokenId, to, metadataCID: CID }),
  ];
}

describe("STEP 6 — replay reducer", () => {
  beforeEach(() => { seq = 0; });

  it("T1: issue -> exists, owner correct, Active", () => {
    const c = reduceCertificate("1", mint("1", A));
    expect(c.exists).to.equal(true);
    expect(c.owner).to.equal(A);
    expect(c.status).to.equal("Active");
    expect(c.metadataCID).to.equal(CID);
  });

  it("T2: issue -> transfer -> owner changes, still Active", () => {
    const evs = [...mint("1", A), ev({ name: "Transfer", tokenId: "1", from: A, transferTo: B })];
    const c = reduceCertificate("1", evs);
    expect(c.owner).to.equal(B);
    expect(c.status).to.equal("Active");
  });

  it("T3: issue -> suspend -> Suspended", () => {
    const evs = [...mint("1", A), ev({ name: "CertBlocked", tokenId: "1" })];
    expect(reduceCertificate("1", evs).status).to.equal("Suspended");
  });

  it("T4: issue -> suspend -> reinstate -> Active", () => {
    const evs = [...mint("1", A), ev({ name: "CertBlocked", tokenId: "1" }), ev({ name: "CertUnblocked", tokenId: "1" })];
    expect(reduceCertificate("1", evs).status).to.equal("Active");
  });

  it("T5: issue -> transfer -> suspend -> reinstate -> final owner B, Active", () => {
    const evs = [
      ...mint("1", A),
      ev({ name: "Transfer", tokenId: "1", from: A, transferTo: B }),
      ev({ name: "CertBlocked", tokenId: "1" }),
      ev({ name: "CertUnblocked", tokenId: "1" }),
    ];
    const c = reduceCertificate("1", evs);
    expect(c.owner).to.equal(B);
    expect(c.status).to.equal("Active");
  });

  it("T6: repeated suspend stays Suspended", () => {
    const evs = [...mint("1", A), ev({ name: "CertBlocked", tokenId: "1" }), ev({ name: "CertBlocked", tokenId: "1" })];
    expect(reduceCertificate("1", evs).status).to.equal("Suspended");
  });

  it("T7: repeated reinstate stays Active", () => {
    const evs = [...mint("1", A), ev({ name: "CertUnblocked", tokenId: "1" }), ev({ name: "CertUnblocked", tokenId: "1" })];
    expect(reduceCertificate("1", evs).status).to.equal("Active");
  });

  it("T8: read-only fetch produces no event => state unchanged (no fetch event exists)", () => {
    // fetch is not an event; a stream with only mint remains Active with no extra transitions
    const c = reduceCertificate("1", mint("1", A));
    expect(c.status).to.equal("Active");
  });

  it("T9: multiple certificates reconstructed independently", () => {
    const evs = [
      ...mint("1", A),
      ...mint("2", B),
      ev({ name: "CertBlocked", tokenId: "2" }),
    ];
    const all = reduceAll(evs);
    expect(all.get("1")!.status).to.equal("Active");
    expect(all.get("2")!.status).to.equal("Suspended");
    expect(all.get("1")!.owner).to.equal(A);
    expect(all.get("2")!.owner).to.equal(B);
  });

  it("T10: unsorted input still yields correct state after canonical sort", () => {
    // Build correct order then shuffle by messing with ordering keys
    const mintEvs = mint("1", A);
    const blocked = ev({ name: "CertBlocked", tokenId: "1", blockNumber: 5, logIndex: 50 });
    const unblocked = ev({ name: "CertUnblocked", tokenId: "1", blockNumber: 9, logIndex: 90 });
    // feed in wrong order: unblock first, then block, then mint
    const scrambled = [unblocked, blocked, ...[...mintEvs].reverse().map((e, i) => ({ ...e, blockNumber: 1, logIndex: i }))];
    const c = reduceCertificate("1", scrambled);
    // canonical order => mint(block1) -> block(block5) -> unblock(block9) => Active
    expect(c.status).to.equal("Active");
    expect(c.exists).to.equal(true);
  });

  it("T11: comparator detects MISMATCH when replayed value altered (test-only)", () => {
    const c = reduceCertificate("1", mint("1", A));
    const row = compareState(
      { ...c, owner: B }, // tamper replayed owner
      { exists: true, owner: A, status: "Active", metadataCID: CID }
    );
    expect(row.ownerMatch).to.equal(false);
    expect(row.overall).to.equal(false);
  });

  it("T12: unknown/unrelated event does not mutate lifecycle", () => {
    const evs: NormalizedEvent[] = [
      ...mint("1", A),
      // @ts-expect-error intentional unknown event name
      ev({ name: "AdminAdded", tokenId: "1" }),
    ];
    const c = reduceCertificate("1", evs);
    expect(c.status).to.equal("Active");
    expect(c.owner).to.equal(A);
  });

  it("canonical sort orders by block, txIndex, logIndex", () => {
    const a = ev({ name: "CertBlocked", tokenId: "1", blockNumber: 2, transactionIndex: 0, logIndex: 0 });
    const b = ev({ name: "CertBlocked", tokenId: "1", blockNumber: 1, transactionIndex: 5, logIndex: 9 });
    const c = ev({ name: "CertBlocked", tokenId: "1", blockNumber: 1, transactionIndex: 5, logIndex: 3 });
    const sorted = sortCanonical([a, b, c]);
    expect(sorted[0]).to.equal(c);
    expect(sorted[1]).to.equal(b);
    expect(sorted[2]).to.equal(a);
  });
});
