"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";

export function ActionForm({
  action,
  children,
  buttonLabel = "Save",
  className
}: {
  action: (state: string | null, formData: FormData) => Promise<string | null>;
  children: React.ReactNode;
  buttonLabel?: string;
  className?: string;
}) {
  const [message, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className={className}>
      {children}
      {message ? (
        <p className="mt-3 rounded-xl border border-brand-light/30 bg-brand-bright/12 p-3 text-sm text-brand-light">
          {message}
        </p>
      ) : null}
      <Button className="mt-4 w-full" disabled={pending}>
        {pending ? "Working..." : buttonLabel}
      </Button>
    </form>
  );
}
