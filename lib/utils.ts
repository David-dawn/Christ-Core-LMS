import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(value?: string | null) {
  if (!value) return "No deadline";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function isValidUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export const trackLabels: Record<string, string> = {
  frontend: "Frontend Development",
  uiux: "UI/UX Design",
  animation: "Animation"
};

export const skillLabels: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced"
};

/**
 * Canonical display labels for the database role. This is the single source
 * of truth for what a user's role is CALLED in the UI. Authorization always
 * uses the raw database role ("admin" / "student"); this map only affects
 * presentation. To display admins as "Tutor" in the UI, change the admin
 * entry below — authorization and RLS stay untouched.
 */
export const roleLabels: Record<string, string> = {
  student: "Student",
  admin: "Admin"
};

export function roleLabel(role?: string | null): string {
  return role ? (roleLabels[role] ?? "Student") : "Student";
}

export function initials(name?: string | null) {
  if (!name) return "CC";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
