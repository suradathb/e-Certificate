// STEP 7 — Bounded concurrency pool + monotonic-nonce manager.
// Real concurrency: up to `limit` tasks run at once (not a sequential loop).

/** Run tasks with a bounded worker pool. Returns results in input order. */
export async function runBounded<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const n = items.length;
  const workers: Promise<void>[] = [];
  const k = Math.max(1, Math.min(limit, n));

  async function runOne(): Promise<void> {
    while (true) {
      const i = next++;
      if (i >= n) return;
      results[i] = await worker(items[i], i);
    }
  }
  for (let w = 0; w < k; w++) workers.push(runOne());
  await Promise.all(workers);
  return results;
}

/**
 * Nonce manager for a single signer under concurrency.
 * Pre-allocates sequential nonces so concurrent submissions from one admin
 * wallet do not collide. Call next() to reserve the next nonce atomically.
 */
export class NonceManager {
  private current: number;
  constructor(startNonce: number) {
    this.current = startNonce;
  }
  next(): number {
    return this.current++;
  }
  peek(): number {
    return this.current;
  }
}

/** Measure whether tasks actually overlapped (max simultaneous in-flight). */
export class OverlapTracker {
  private inFlight = 0;
  private maxInFlight = 0;
  enter() { this.inFlight++; if (this.inFlight > this.maxInFlight) this.maxInFlight = this.inFlight; }
  exit() { this.inFlight--; }
  get maxObserved() { return this.maxInFlight; }
}
