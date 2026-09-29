// STEP 7 — Stable error classification. Only assign a category the actual error supports.
import { ErrorType } from "./types";

export function classifyError(err: any): ErrorType {
  const msg = String(err?.message || err || "").toLowerCase();
  const code = String(err?.code || "").toLowerCase();

  if (msg.includes("timeout") && msg.includes("receipt")) return "RECEIPT_TIMEOUT";
  if (msg.includes("timeout") || code === "timeout") return "RPC_TIMEOUT";
  if (msg.includes("rate limit") || msg.includes("too many requests") || code === "429") return "RPC_RATE_LIMIT";
  if (msg.includes("nonce")) return "NONCE_ERROR";
  if (msg.includes("replacement") || msg.includes("already known")) return "REPLACEMENT_ERROR";
  if (msg.includes("insufficient funds")) return "INSUFFICIENT_FUNDS";
  if (msg.includes("gas") && (msg.includes("estimate") || msg.includes("estimation"))) return "GAS_ESTIMATION";
  if (msg.includes("revert") || msg.includes("execution reverted")) return "CONTRACT_REVERT";
  if (msg.includes("econnrefused") || msg.includes("network") || msg.includes("connection")) return "RPC_CONNECTION";
  return "UNKNOWN";
}

export function isRetryable(t: ErrorType): boolean {
  // Transient/infra errors are retryable; deterministic contract errors are not.
  return [
    "RPC_TIMEOUT",
    "RPC_RATE_LIMIT",
    "RPC_CONNECTION",
    "NONCE_ERROR",
    "REPLACEMENT_ERROR",
    "RECEIPT_TIMEOUT",
  ].includes(t);
}

// Remove anything secret-looking from an error message before persisting.
export function sanitizeError(msg: string): string {
  return String(msg)
    .replace(/0x[a-fA-F0-9]{64}/g, "0x<redacted-32byte>")     // private keys / hashes that look like secrets
    .replace(/(api[_-]?key|apikey|key)=[^&\s]+/gi, "$1=<redacted>")
    .replace(/\/v2\/[A-Za-z0-9_-]+/g, "/v2/<redacted>")        // alchemy/infura path key
    .slice(0, 500);
}
