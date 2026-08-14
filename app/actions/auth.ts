"use server";

import { redirect } from "next/navigation";
import { sendWelcomeEmail } from "@/lib/email";
import { isNetworkError } from "@/lib/network";
import { createClient } from "@/lib/supabase/server";
import type { SkillLevel, Track } from "@/types/database";

const NETWORK_RETRY_MESSAGE = "Connection problem. Please check your internet connection and try again.";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function signInAction(_prevState: string | null, formData: FormData) {
  const supabase = await createClient();
  const email = value(formData, "email");
  const password = value(formData, "password");

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    // A temporary network failure is NOT invalid credentials — show a retry
    // message instead of a confusing raw fetch error.
    if (isNetworkError(error)) return NETWORK_RETRY_MESSAGE;
    return error.message;
  }

  redirect("/dashboard");
}

export async function signUpAction(_prevState: string | null, formData: FormData) {
  const supabase = await createClient();
  const fullName = value(formData, "full_name");
  const email = value(formData, "email");
  const password = value(formData, "password");
  const confirmPassword = value(formData, "confirm_password");
  const track = value(formData, "track") as Track;
  const skillLevel = value(formData, "skill_level") as SkillLevel;

  if (!fullName || !email || !password || !track || !skillLevel) return "Please complete every required field.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (password !== confirmPassword) return "Passwords do not match.";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, track, skill_level: skillLevel } }
  });
  if (error) {
    if (isNetworkError(error)) return NETWORK_RETRY_MESSAGE;
    // Safe diagnostics only: error name/status/code/cause, never passwords or tokens.
    console.error("[auth] signUp failed", {
      name: error.name,
      message: error.message,
      status: error.status,
      code: error.code,
      cause: error.cause instanceof Error ? { name: error.cause.name, message: error.cause.message } : null
    });
    return error.message;
  }
  if (!data.user) return "Registration failed. Please try again.";

  // Only send the welcome email when this sign-up actually created a NEW user.
  // Supabase returns an empty `identities` array for an existing email (its
  // enumeration-protection behavior), so a retried/double-submitted request
  // never triggers a duplicate welcome email.
  const isNewUser = (data.user.identities?.length ?? 0) > 0;
  let welcomeEmailSent = true;
  if (isNewUser) {
    // The profile row is created by the auth.users trigger before signUp
    // resolves, so registration is already complete at this point. An email
    // failure must NOT undo or fail the registration.
    welcomeEmailSent = (await sendWelcomeEmail({ to: email, fullName, track, skillLevel })).ok;
  }

  if (!data.session) {
    if (!welcomeEmailSent) {
      return "Your account was created successfully. We couldn't send the confirmation email right now. Please confirm your email, then log in.";
    }
    return "Account created. Please confirm your email, then log in.";
  }

  redirect("/dashboard");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function forgotPasswordAction(_prevState: string | null, formData: FormData) {
  const supabase = await createClient();
  const email = value(formData, "email");
  const origin = value(formData, "origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`
  });
  if (error) {
    if (isNetworkError(error)) return NETWORK_RETRY_MESSAGE;
    return error.message;
  }
  return "Password reset email sent.";
}

export async function resetPasswordAction(_prevState: string | null, formData: FormData) {
  const supabase = await createClient();
  const password = value(formData, "password");
  const confirmPassword = value(formData, "confirm_password");
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (password !== confirmPassword) return "Passwords do not match.";
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    if (isNetworkError(error)) return NETWORK_RETRY_MESSAGE;
    return error.message;
  }
  redirect("/dashboard");
}
