/**
 * Error classification helpers.
 *
 * A transient network failure (fetch failed, timeout, DNS, offline, server
 * unreachable) is NOT an authentication failure. These helpers let callers
 * distinguish "the network is down, retry" from "this user is genuinely
 * unauthenticated / unauthorized" so the app never logs a user out just
 * because a request failed.
 */

export class NetworkError extends Error {
  constructor(message = "Connection problem") {
    super(message);
    this.name = "NetworkError";
  }
}

const NETWORK_PATTERNS = /fetch failed|failed to fetch|network (error|request failed)|load failed|networkerror|econnreset|econnrefused|enotfound|etimedout|eai_again|timeout|aborted|socket hang up|offline|unreachable|temporary failure|read econnreset/i;

export function isNetworkError(error: unknown): boolean {
  if (!error) return false;
  if (error instanceof TypeError) return true;
  if (error instanceof NetworkError) return true;

  const name =
    typeof error === "object" && error !== null && "name" in error
      ? String((error as { name?: unknown }).name ?? "")
      : "";
  const message =
    typeof error === "object" && error !== null && "message" in error
      ? String((error as { message?: unknown }).message ?? "")
      : String(error);

  if (name === "AuthRetryableFetchError") return true;

  return NETWORK_PATTERNS.test(`${name} ${message}`);
}

/** Human-friendly message for an error, without exposing internal details. */
export function networkMessage(error: unknown, fallback = "Something went wrong."): string {
  if (isNetworkError(error)) return "Connection problem. Please check your internet connection and try again.";
  return error instanceof Error && error.message ? error.message : fallback;
}
