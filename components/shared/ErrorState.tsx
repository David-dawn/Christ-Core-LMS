"use client";

import { useSyncExternalStore } from "react";

function subscribeOnline(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getOnlineSnapshot() {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

function getOnlineServerSnapshot() {
  return true;
}

/**
 * Reusable error state for error.tsx boundaries.
 *
 * - Network failures (NetworkError or the browser being offline) get a
 *   "Connection problem" message and a retry button that re-runs the failed
 *   page/layout — it never logs the user out.
 * - Other errors get a generic message, still with retry.
 */
export function ErrorState({ error, reset }: { error: Error & { digest?: string }; reset?: () => void }) {
  const online = useSyncExternalStore(subscribeOnline, getOnlineSnapshot, getOnlineServerSnapshot);
  const isNetwork = error.name === "NetworkError" || !online;

  return (
    <div className="flex min-h-[45vh] items-center justify-center p-4">
      <div className="glass w-full max-w-md rounded-2xl p-8 text-center" role="alert">
        <p className="text-xl font-bold text-white">{isNetwork ? "Connection problem" : "Something went wrong"}</p>
        <p className="mt-2 text-sm leading-relaxed text-white/60">
          {isNetwork
            ? "We couldn't reach the server. Please check your internet connection and try again."
            : "An unexpected error occurred. Please try again."}
        </p>
        {reset ? (
          <button
            type="button"
            onClick={() => reset()}
            className="mt-6 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brand-bright to-brand px-5 py-2 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(75,111,239,0.35)] transition-all duration-200 hover:-translate-y-0.5"
          >
            Try again
          </button>
        ) : null}
      </div>
    </div>
  );
}
