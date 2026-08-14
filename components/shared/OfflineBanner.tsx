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
 * Slim banner shown while the browser reports it is offline. Uses
 * navigator.onLine only as an additional signal — data-layer network errors
 * are handled separately (see lib/network.ts + error boundaries).
 */
export function OfflineBanner() {
  const online = useSyncExternalStore(subscribeOnline, getOnlineSnapshot, getOnlineServerSnapshot);

  if (online) return null;

  return (
    <div className="sticky top-0 z-50 border-b border-amber-300/25 bg-amber-400/15 px-4 py-2 text-center text-xs font-medium text-amber-100 backdrop-blur-md">
      You&apos;re offline. Your session and data are safe — this page will reload when the connection returns.
    </div>
  );
}
