import { redirect } from "next/navigation";
import { AppNav, MobileNav } from "@/components/shared/AppNav";
import { OfflineBanner } from "@/components/shared/OfflineBanner";
import { getCurrentProfile } from "@/lib/data";

export async function Shell({ children, role }: { children: React.ReactNode; role: "student" | "admin" }) {
  // getCurrentProfile throws NetworkError on a transient network failure —
  // the root error boundary then shows a retry UI instead of logging the
  // user out. It returns null only for a genuine auth/session failure.
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (role === "admin" && profile.role !== "admin") redirect("/dashboard");
  if (role === "student" && profile.role === "admin") redirect("/admin");

  // The `role` prop only gates the route (admin vs student area). The role
  // passed to the nav comes from the canonical database profile so the UI
  // always reflects public.profiles.role.
  const navUser = { role: profile.role, name: profile.full_name, track: profile.track, skill: profile.skill_level };

  return (
    <>
      <OfflineBanner />
      <main className="relative z-10 min-h-screen">
        <MobileNav {...navUser} />
        <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 md:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8">
          <AppNav {...navUser} />
          <div className="min-w-0 pb-10">{children}</div>
        </div>
      </main>
    </>
  );
}
