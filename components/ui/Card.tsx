import type { LucideIcon } from "lucide-react";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
  hover = false
}: {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
}) {
  return <section className={cn("glass rounded-2xl p-5", hover && "glass-hover", className)}>{children}</section>;
}

export function StatCard({
  label,
  value,
  sub,
  suffix = "",
  icon: Icon,
  animate = true
}: {
  label: string;
  value: string | number;
  sub?: string;
  suffix?: string;
  icon?: LucideIcon;
  animate?: boolean;
}) {
  return (
    <Card className="relative overflow-hidden">
      {Icon ? (
        <div className="absolute -right-4 -top-4 rounded-full bg-brand-bright/15 p-4 ring-1 ring-brand-light/20">
          <Icon size={26} className="text-brand-light/70" aria-hidden />
        </div>
      ) : null}
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-brand-light/60 to-transparent" />
      <p className="text-sm font-medium text-white/62">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight">
        {typeof value === "number" && animate ? <AnimatedNumber value={value} suffix={suffix} /> : `${value}${suffix}`}
      </p>
      {sub ? <p className="mt-1 text-xs text-white/58">{sub}</p> : null}
    </Card>
  );
}
