import { BrandMark } from "@/components/shared/BrandMark";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <section className="glass relative overflow-hidden rounded-2xl p-7 sm:p-8">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-bright/20 blur-3xl" />
      <div className="relative">
        <BrandMark />
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-white">Choose a new password</h1>
        <p className="mt-2 text-sm text-white/60">Make it at least 8 characters and something you&apos;ll remember.</p>
        <ResetPasswordForm />
      </div>
    </section>
  );
}
