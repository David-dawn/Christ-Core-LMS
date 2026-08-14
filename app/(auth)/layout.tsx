import { ConstellationDynamic } from "@/components/visual/ConstellationDynamic";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative z-10 grid min-h-screen place-items-center overflow-hidden px-4 py-10">
      <ConstellationDynamic />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-80 w-[42rem] -translate-x-1/2 rounded-full bg-brand-bright/25 blur-3xl" />
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </main>
  );
}
