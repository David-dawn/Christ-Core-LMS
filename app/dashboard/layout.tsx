import { Shell } from "@/components/shared/Shell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <Shell role="student">{children}</Shell>;
}
