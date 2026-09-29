// STEP 7 — Unit tests for benchmark core (pure logic; no network).
// Run: npx hardhat test test/benchmark.unit.spec.ts
import { expect } from "chai";
import { percentile, summarize, bootstrapMeanCI, tpsCompleted } from "../src/benchmark/stats";
import { runBounded, NonceManager, OverlapTracker } from "../src/benchmark/concurrency";
import { classifyError, isRetryable, sanitizeError } from "../src/benchmark/errorTaxonomy";
import { rpcHostOnly } from "../src/benchmark/environment";

describe("STEP 7 — stats", () => {
  it("percentile P50/P95 on known data", () => {
    const xs = [1,2,3,4,5,6,7,8,9,10];
    expect(percentile(xs, 50)).to.be.closeTo(5.5, 1e-9);
    expect(percentile(xs, 95)).to.be.closeTo(9.55, 1e-9);
  });
  it("summarize computes median/IQR/P95/max", () => {
    const s = summarize([10,20,30,40,50]);
    expect(s.count).to.equal(5);
    expect(s.median).to.equal(30);
    expect(s.q1).to.equal(20);
    expect(s.q3).to.equal(40);
    expect(s.iqr).to.equal(20);
    expect(s.max).to.equal(50);
  });
  it("summarize handles empty", () => {
    expect(summarize([]).count).to.equal(0);
    expect(summarize([]).median).to.equal(null);
  });
  it("bootstrap CI is deterministic for a fixed seed", () => {
    const xs = [2,4,4,4,5,5,7,9];
    const a = bootstrapMeanCI(xs, 2000, 123);
    const b = bootstrapMeanCI(xs, 2000, 123);
    expect(a!.lower).to.equal(b!.lower);
    expect(a!.upper).to.equal(b!.upper);
    expect(a!.lower).to.be.lessThan(a!.upper);
  });
  it("TPS is successes / seconds, NOT from latency", () => {
    expect(tpsCompleted(100, 2000)).to.equal(50);   // 100 ok / 2s
    expect(tpsCompleted(0, 1000)).to.equal(0);
    expect(tpsCompleted(10, 0)).to.equal(0);
  });
});

describe("STEP 7 — concurrency & nonce", () => {
  it("runBounded runs at most `limit` at once and preserves order", async () => {
    const tracker = new OverlapTracker();
    const items = Array.from({ length: 20 }, (_, i) => i);
    const out = await runBounded(items, 4, async (x) => {
      tracker.enter();
      await new Promise((r) => setTimeout(r, 5));
      tracker.exit();
      return x * 2;
    });
    expect(out).to.deep.equal(items.map((x) => x * 2));
    expect(tracker.maxObserved).to.be.at.most(4);
    expect(tracker.maxObserved).to.be.at.least(2); // actually overlapped
  });
  it("NonceManager hands out sequential nonces", () => {
    const nm = new NonceManager(7);
    expect(nm.next()).to.equal(7);
    expect(nm.next()).to.equal(8);
    expect(nm.next()).to.equal(9);
    expect(nm.peek()).to.equal(10);
  });
});

describe("STEP 7 — error taxonomy & redaction", () => {
  it("classifies representative errors", () => {
    expect(classifyError({ message: "nonce too low" })).to.equal("NONCE_ERROR");
    expect(classifyError({ message: "execution reverted: Not authorized" })).to.equal("CONTRACT_REVERT");
    expect(classifyError({ message: "request timeout" })).to.equal("RPC_TIMEOUT");
    expect(classifyError({ message: "too many requests", code: "429" })).to.equal("RPC_RATE_LIMIT");
    expect(classifyError({ message: "insufficient funds for gas" })).to.equal("INSUFFICIENT_FUNDS");
    expect(classifyError({ message: "weird" })).to.equal("UNKNOWN");
  });
  it("retryable vs non-retryable", () => {
    expect(isRetryable("RPC_TIMEOUT")).to.equal(true);
    expect(isRetryable("NONCE_ERROR")).to.equal(true);
    expect(isRetryable("CONTRACT_REVERT")).to.equal(false);
    expect(isRetryable("INSUFFICIENT_FUNDS")).to.equal(false);
  });
  it("sanitizeError redacts secrets and api-key paths", () => {
    const red = sanitizeError("failed key=SUPERSECRET at /v2/abcdef123 hash 0x" + "a".repeat(64));
    expect(red).to.not.contain("SUPERSECRET");
    expect(red).to.not.contain("abcdef123");
    expect(red).to.contain("<redacted");
  });
  it("rpcHostOnly drops api-key path", () => {
    expect(rpcHostOnly("https://eth-sepolia.g.alchemy.com/v2/SECRETKEY")).to.equal("eth-sepolia.g.alchemy.com");
  });
});
