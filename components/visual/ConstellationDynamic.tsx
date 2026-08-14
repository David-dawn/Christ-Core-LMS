"use client";

import dynamic from "next/dynamic";

// Three.js is heavy (~150KB gzip). This client wrapper defers the chunk to
// after the initial render so auth pages paint first and the dashboard/admin
// bundles never include it.
const Constellation = dynamic(() => import("@/components/visual/Constellation").then((m) => m.Constellation), {
  ssr: false,
  loading: () => null
});

export function ConstellationDynamic() {
  return <Constellation />;
}
