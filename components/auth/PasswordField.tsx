"use client";

import { Eye, EyeOff, TriangleAlert } from "lucide-react";
import { useId } from "react";
import { Input } from "@/components/ui/Field";
import { cn } from "@/lib/utils";

export type StrengthLabel = "Weak" | "Medium" | "Strong";

const STRENGTH_META: Record<StrengthLabel, { bar: string; text: string }> = {
  Weak: { bar: "bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.45)]", text: "text-red-300" },
  Medium: { bar: "bg-amber-300 shadow-[0_0_10px_rgba(252,211,77,0.4)]", text: "text-amber-200" },
  Strong: { bar: "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.45)]", text: "text-emerald-300" }
};

function assessStrength(password: string): { label: StrengthLabel | null; segments: number } {
  if (!password) return { label: null, segments: 0 };
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  const label: StrengthLabel = score <= 2 ? "Weak" : score <= 4 ? "Medium" : "Strong";
  const segments = label === "Weak" ? 1 : label === "Medium" ? 2 : 3;
  return { label, segments };
}

export function PasswordField({
  name,
  label,
  value,
  onChange,
  visible,
  onToggle,
  placeholder,
  autoComplete
}: {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
  placeholder?: string;
  autoComplete: string;
}) {
  const inputId = useId();
  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium text-white/88">
        {label}
      </label>
      <div className="relative mt-2">
        <Input
          id={inputId}
          name={name}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required
          minLength={8}
          autoComplete={autoComplete}
          placeholder={placeholder}
          style={{ marginTop: 0, paddingRight: "2.75rem" }}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={visible}
          className="absolute right-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-white/45 transition-colors duration-200 hover:bg-white/10 hover:text-white/90 focus-visible:bg-white/10"
        >
          {visible ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
        </button>
      </div>
    </div>
  );
}

export function PasswordStrengthMeter({ password }: { password: string }) {
  const strength = assessStrength(password);
  const { label, segments } = strength;

  return (
    <div aria-live="polite" className="grid gap-1.5">
      {label ? (
        <div className="flex items-center gap-3">
          <div
            role="meter"
            aria-label="Password strength"
            aria-valuemin={0}
            aria-valuemax={3}
            aria-valuenow={segments}
            className="flex flex-1 gap-1.5"
          >
            {[1, 2, 3].map((segment) => (
              <span
                key={segment}
                className={cn(
                  "h-1 flex-1 rounded-full transition-all duration-300",
                  segment <= segments ? STRENGTH_META[label].bar : "bg-white/10"
                )}
              />
            ))}
          </div>
          <span
            className={cn(
              "w-14 text-right text-xs font-semibold transition-colors duration-300",
              STRENGTH_META[label].text
            )}
          >
            {label}
          </span>
        </div>
      ) : null}
      {label === "Weak" ? (
        <p className="fade-slide-in flex items-center gap-1.5 text-xs text-red-300/90">
          <TriangleAlert size={13} aria-hidden />
          Password is not strong enough.
        </p>
      ) : null}
    </div>
  );
}
