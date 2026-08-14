import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { BrandMark } from "@/components/shared/BrandMark";

export default function RegisterPage() {
  return (
    <section className="glass relative overflow-hidden rounded-2xl p-7 sm:p-8">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-bright/20 blur-3xl" />
      <div className="relative">
        <BrandMark />
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-white">Create your account</h1>
        <p className="mt-2 text-sm text-white/60">Join the Frontend Beginners class and start building.</p>
        <RegisterForm />
        <p className="mt-6 border-t border-white/10 pt-5 text-sm text-white/62">
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-brand-light transition hover:text-white">
            Log in
          </Link>
        </p>
      </div>
    </section>
  );
}
