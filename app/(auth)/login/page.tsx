import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { BrandMark } from "@/components/shared/BrandMark";
import { getOrCreateProfile } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  if (auth.user) {
    const { profile } = await getOrCreateProfile(supabase, auth.user);
    if (profile) redirect(profile.role === "admin" ? "/admin" : "/dashboard");
  }

  return (
    <section className="glass relative overflow-hidden rounded-2xl p-7 sm:p-8">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-bright/20 blur-3xl" />
      <div className="relative">
        <BrandMark />
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-white">Welcome back</h1>
        <p className="mt-2 text-sm text-white/60">Access your Christ-Core frontend class dashboard.</p>
        <LoginForm />
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5 text-sm">
          <Link href="/register" className="font-semibold text-brand-light transition hover:text-white">
            Create account
          </Link>
          <Link href="/forgot-password" className="text-white/60 transition hover:text-white">
            Forgot password?
          </Link>
        </div>
      </div>
    </section>
  );
}
