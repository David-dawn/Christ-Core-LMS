import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  hint
}: {
  icon: LucideIcon;
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-brand-light/25 bg-white/[0.03] px-6 py-12 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-bright/15 ring-1 ring-brand-light/25">
        <Icon size={26} className="text-brand-light" aria-hidden />
      </div>
      <p className="font-semibold text-white/85">{title}</p>
      {hint ? <p className="max-w-sm text-sm text-white/50">{hint}</p> : null}
    </div>
  );
}
