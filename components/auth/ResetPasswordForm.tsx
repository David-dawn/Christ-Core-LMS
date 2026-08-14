"use client";

import { CheckCircle2, TriangleAlert } from "lucide-react";
import { useActionState, useState } from "react";
import { resetPasswordAction } from "@/app/actions/auth";
import { PasswordField, PasswordStrengthMeter } from "@/components/auth/PasswordField";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function ResetPasswordForm() {
  const [message, formAction, pending] = useActionState(resetPasswordAction, null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const hasConfirm = confirmPassword.length > 0;
  const matches = hasConfirm && confirmPassword === password;

  return (
    <form action={formAction} className="mt-6 grid gap-4">
      <PasswordField
        name="password"
        label="New Password"
        value={password}
        onChange={setPassword}
        visible={showPassword}
        onToggle={() => setShowPassword((v) => !v)}
        autoComplete="new-password"
      />

      <PasswordStrengthMeter password={password} />

      <PasswordField
        name="confirm_password"
        label="Confirm Password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        visible={showConfirm}
        onToggle={() => setShowConfirm((v) => !v)}
        autoComplete="new-password"
      />

      {hasConfirm ? (
        <p
          role="status"
          className={cn(
            "fade-slide-in -mt-2 flex items-center gap-1.5 text-xs font-medium",
            matches ? "text-emerald-300" : "text-red-300"
          )}
        >
          {matches ? <CheckCircle2 size={13} aria-hidden /> : <TriangleAlert size={13} aria-hidden />}
          {matches ? "Passwords match" : "Passwords do not match"}
        </p>
      ) : null}

      {message ? (
        <p className="fade-slide-in rounded-xl border border-brand-light/30 bg-brand-bright/12 p-3 text-sm text-brand-light">
          {message}
        </p>
      ) : null}

      <Button className="w-full" disabled={pending}>
        {pending ? "Working..." : "Update password"}
      </Button>
    </form>
  );
}
