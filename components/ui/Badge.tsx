import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const tones = {
  neutral: "border-white/15 bg-white/10 text-white/75",
  info: "border-brand-light/40 bg-brand-bright/15 text-brand-light",
  good: "border-brand-light/60 bg-brand-bright/25 text-white",
  warn: "border-amber-300/40 bg-amber-300/12 text-amber-200",
  danger: "border-red-300/40 bg-red-300/12 text-red-200"
} as const;

export function Badge({
  children,
  tone = "neutral",
  icon: Icon,
  className
}: {
  children: React.ReactNode;
  tone?: keyof typeof tones;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold",
        tones[tone],
        className
      )}
    >
      {Icon ? <Icon size={12} aria-hidden /> : null}
      {children}
    </span>
  );
}
