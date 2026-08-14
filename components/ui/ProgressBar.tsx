"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

function subscribeReducedMotion(callback: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

export function ProgressBar({
  value,
  className,
  barClassName,
  showLabel = false
}: {
  value: number;
  className?: string;
  barClassName?: string;
  showLabel?: boolean;
}) {
  const clamped = Math.min(Math.max(value, 0), 100);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotionSnapshot, getReducedMotionServerSnapshot);

  // idle → bar starts at 0, then animates to target via CSS transition.
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    if (reducedMotion) return;
    const timer = setTimeout(() => setAnimate(true), 150);
    return () => clearTimeout(timer);
  }, [reducedMotion]);

  const width = animate || reducedMotion ? `${clamped}%` : "0%";
  const transition = reducedMotion ? "none" : "width 1.1s cubic-bezier(0.22, 1, 0.36, 1)";

  return (
    <div className={cn("w-full", className)}>
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2.5 w-full overflow-hidden rounded-full bg-white/10 ring-1 ring-inset ring-white/10"
      >
        <div
          style={{ width, transition }}
          className={cn(
            "h-full rounded-full bg-gradient-to-r from-brand to-brand-bright shadow-[0_0_14px_rgba(75,111,239,0.65)]",
            barClassName
          )}
        />
      </div>
      {showLabel ? (
        <p className="mt-1.5 text-right text-xs font-semibold text-brand-light">{clamped}%</p>
      ) : null}
    </div>
  );
}
