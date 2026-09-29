// STEP 7 — Statistics derived from RAW data only. No hard-coded results.

export interface SummaryStats {
  count: number;
  mean: number | null;
  std: number | null;
  median: number | null;
  q1: number | null;
  q3: number | null;
  iqr: number | null;
  p95: number | null;
  max: number | null;
}

function sorted(xs: number[]): number[] {
  return [...xs].sort((a, b) => a - b);
}

/** Linear-interpolation percentile (type-7, like numpy default). */
export function percentile(xs: number[], p: number): number | null {
  if (xs.length === 0) return null;
  const s = sorted(xs);
  if (s.length === 1) return s[0];
  const idx = (p / 100) * (s.length - 1);
  const lo = Math.floor(idx), hi = Math.ceil(idx);
  if (lo === hi) return s[lo];
  const frac = idx - lo;
  return s[lo] + (s[hi] - s[lo]) * frac;
}

export function summarize(xs: number[]): SummaryStats {
  const n = xs.length;
  if (n === 0) return { count: 0, mean: null, std: null, median: null, q1: null, q3: null, iqr: null, p95: null, max: null };
  const mean = xs.reduce((a, b) => a + b, 0) / n;
  const variance = n > 1 ? xs.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1) : 0;
  const q1 = percentile(xs, 25)!;
  const q3 = percentile(xs, 75)!;
  return {
    count: n,
    mean,
    std: Math.sqrt(variance),
    median: percentile(xs, 50),
    q1, q3, iqr: q3 - q1,
    p95: percentile(xs, 95),
    max: Math.max(...xs),
  };
}

/** Deterministic percentile-bootstrap CI for the mean (seeded PRNG). */
export function bootstrapMeanCI(
  xs: number[],
  resamples: number,
  seed: number,
  alpha = 0.05
): { lower: number; upper: number; resamples: number; seed: number } | null {
  if (xs.length === 0) return null;
  let s = seed >>> 0;
  const rnd = () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const n = xs.length;
  const means: number[] = [];
  for (let r = 0; r < resamples; r++) {
    let sum = 0;
    for (let i = 0; i < n; i++) sum += xs[Math.floor(rnd() * n)];
    means.push(sum / n);
  }
  return {
    lower: percentile(means, (alpha / 2) * 100)!,
    upper: percentile(means, (1 - alpha / 2) * 100)!,
    resamples,
    seed,
  };
}

/**
 * Application-level completed throughput.
 * TPS_completed = successful logical operations / batch wall-clock seconds.
 * NEVER computed from median latency.
 */
export function tpsCompleted(finalSuccess: number, batchDurationMs: number): number {
  if (batchDurationMs <= 0) return 0;
  return finalSuccess / (batchDurationMs / 1000);
}
