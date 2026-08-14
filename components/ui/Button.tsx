import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

const styles =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0";

export function Button(props: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" }) {
  const { className, variant = "primary", ...rest } = props;
  return (
    <button
      className={cn(
        styles,
        variant === "primary" &&
          "bg-gradient-to-r from-brand-bright to-brand text-white shadow-[0_8px_24px_rgba(75,111,239,0.35)] hover:shadow-[0_10px_34px_rgba(75,111,239,0.5)]",
        variant === "ghost" && "border border-white/15 bg-white/6 text-white/85 hover:bg-white/12",
        variant === "danger" && "bg-red-400 text-[#200d0d] hover:bg-red-300",
        className
      )}
      {...rest}
    />
  );
}

export function ButtonLink(
  props: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children: ReactNode; variant?: "primary" | "ghost" }
) {
  const { className, variant = "primary", href, ...rest } = props;
  return (
    <Link
      href={href}
      className={cn(
        styles,
        variant === "primary" &&
          "bg-gradient-to-r from-brand-bright to-brand text-white shadow-[0_8px_24px_rgba(75,111,239,0.35)] hover:shadow-[0_10px_34px_rgba(75,111,239,0.5)]",
        variant === "ghost" && "border border-white/15 bg-white/6 text-white/85 hover:bg-white/12",
        className
      )}
      {...rest}
    />
  );
}
