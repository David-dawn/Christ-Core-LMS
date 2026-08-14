"use client";

import { CheckCircle2, TriangleAlert } from "lucide-react";
import { useActionState, useState } from "react";
import { signUpAction } from "@/app/actions/auth";
import { PasswordField, PasswordStrengthMeter } from "@/components/auth/PasswordField";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { cn } from "@/lib/utils";

export function RegisterForm() {
  const [message, formAction, pending] = useActionState(signUpAction, null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const hasConfirm = confirmPassword.length > 0;
  const matches = hasConfirm && confirmPassword === password;

  return (
    <form action={formAction} className="mt-6 grid gap-4">
      <Field label="Full Name">
        <Input name="full_name" required autoComplete="name" placeholder="Ada Lovelace" />
      </Field>

      <Field label="Email">
        <Input name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
      </Field>

      <PasswordField
        name="password"
        label="Password"
        value={password}
        onChange={setPassword}
        visible={showPassword}
        onToggle={() => setShowPassword((v) => !v)}
        placeholder="8+ characters"
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

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Track">
          <Select name="track" defaultValue="frontend" required>
            <option value="frontend">Frontend Development</option>
            <option value="uiux">UI/UX Design</option>
            <option value="animation">Animation</option>
          </Select>
        </Field>
        <Field label="Skill Level">
          <Select name="skill_level" defaultValue="beginner" required>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </Select>
        </Field>
      </div>

      {message ? (
        <p className="fade-slide-in rounded-xl border border-brand-light/30 bg-brand-bright/12 p-3 text-sm text-brand-light">
          {message}
        </p>
      ) : null}

      <Button className="w-full" disabled={pending}>
        {pending ? "Working..." : "Register"}
      </Button>
    </form>
  );
}
