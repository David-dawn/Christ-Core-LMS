import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * Reveal is now a pure server component: the fade/slide-in is a CSS
 * animation (see .cc-reveal in globals.css) so it needs no client JS and no
 * GSAP. It honors prefers-reduced-motion via CSS media query.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  stagger = 0,
  y = 18
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  stagger?: boolean | number;
  y?: number;
}) {
  const staggerValue = stagger === true ? 0.08 : typeof stagger === "number" ? stagger : 0;

  const style = {
    "--cc-y": `${y}px`,
    ...(staggerValue
      ? { "--cc-base-delay": `${delay}s`, "--cc-stagger": `${staggerValue}s` }
      : { animationDelay: `${delay}s` })
  } as unknown as CSSProperties;

  // `min-w-0` lets the reveal wrapper (a grid item on every page's `grid
  // gap-6` root) shrink to the container instead of expanding the grid track
  // to its content's min-content width — the root cause of page-level
  // horizontal overflow from long unbreakable content.
  return (
    <div className={cn("cc-reveal min-w-0", staggerValue > 0 && "cc-reveal-stagger", className)} style={style}>
      {children}
    </div>
  );
}
