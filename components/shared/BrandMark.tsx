import Image from "next/image";
import { cn } from "@/lib/utils";

const sizes = {
  sm: { box: "h-8 w-8", title: "text-xs" },
  md: { box: "h-9 w-9", title: "text-sm" },
  lg: { box: "h-11 w-11", title: "text-base" }
};

export function BrandMark({ size = "md", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const { box, title } = sizes[size];

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Image
        src="/logo-transparent.png"
        alt="Christ-Core"
        width={44}
        height={44}
        priority
        sizes="44px"
        className={cn(
          "shrink-0 rounded-md object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]",
          box
        )}
      />
      <div className="min-w-0 leading-tight">
        <p className={cn("truncate font-bold tracking-tight text-white", title)}>Christ-Core</p>
        <p className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-light">Learning Hub</p>
      </div>
    </div>
  );
}
