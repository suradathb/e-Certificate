// STEP 7 — Crash-safe raw writer + receipt timeout + resume support.
// Every attempt is appended to a JSONL file the moment it completes, so a crash/timeout
// mid-run never loses already-collected evidence.

import * as fs from "fs";
import * as path from "path";
import { AttemptRecord, BatchRecord } from "./types";

/** Append one attempt record immediately (crash-safe). */
export class AttemptSink {
  private stream: fs.WriteStream;
  constructor(private file: string) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    // append mode so re-runs/resumes do not truncate prior evidence
    this.stream = fs.createWriteStream(file, { flags: "a" });
  }
  write(rec: AttemptRecord) {
    this.stream.write(JSON.stringify(rec) + "\n");
  }
  async close(): Promise<void> {
    await new Promise<void>((res) => this.stream.end(res));
  }
}

/** Append one batch record immediately after a run completes. */
export function appendBatch(file: string, rec: BatchRecord) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.appendFileSync(file, JSON.stringify(rec) + "\n");
}

/** Which run_ids are already completed (present in the batches jsonl) — enables resume. */
export function completedRuns(batchFile: string): Set<string> {
  const done = new Set<string>();
  if (!fs.existsSync(batchFile)) return done;
  for (const line of fs.readFileSync(batchFile, "utf-8").split("\n")) {
    const t = line.trim();
    if (!t) continue;
    try { const b = JSON.parse(t); if (b.run_id) done.add(b.run_id); } catch {}
  }
  return done;
}

/**
 * Wrap a promise with a timeout. On timeout the promise is abandoned and the caller
 * proceeds to the next item (prevents a hung tx.wait() from stalling the whole run).
 */
export function withTimeout<T>(p: Promise<T>, ms: number, label = "operation"): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`receipt timeout after ${ms}ms (${label})`)), ms);
    p.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); }
    );
  });
}
