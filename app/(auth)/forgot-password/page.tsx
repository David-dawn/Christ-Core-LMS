import Link from "next/link";
import { forgotPasswordAction } from "@/app/actions/auth";
import { BrandMark } from "@/components/shared/BrandMark";
import { Field, Input } from "@/components/ui/Field";
import { ActionForm } from "@/components/ui/SubmitMessage";

export default function ForgotPasswordPage() {
  return (
    <section className="glass relative overflow-hidden rounded-2xl p-7 sm:p-8">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-bright/20 blur-3xl" />
      <div className="relative">
        <BrandMark />
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-white">Reset password</h1>
        <p className="mt-2 text-sm text-white/60">We&apos;ll send a secure reset link to your email.</p>
        <ActionForm action={forgotPasswordAction} buttonLabel="Send reset link" className="mt-6 grid gap-4">
          <Field label="Email">
            <Input name="email" type="email" required placeholder="you@example.com" />
          </Field>
        </ActionForm>
        <Link href="/login" className="mt-6 block border-t border-white/10 pt-5 text-sm text-white/62 transition hover:text-white">
          ← Back to login
        </Link>
      </div>
    </section>
  );
}
