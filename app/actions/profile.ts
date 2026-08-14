"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isNetworkError } from "@/lib/network";
import { createClient } from "@/lib/supabase/server";
import type { SkillLevel, Track } from "@/types/database";

const NETWORK_RETRY_MESSAGE = "Connection problem. Please check your internet connection and try again.";

export async function updateProfileAction(_prevState: string | null, formData: FormData) {
  const supabase = await createClient();
  const { data, error: authError } = await supabase.auth.getUser();
  if (authError) {
    if (isNetworkError(authError)) return NETWORK_RETRY_MESSAGE;
    redirect("/login");
  }
  if (!data.user) redirect("/login");

  const fullName = String(formData.get("full_name") ?? "").trim();
  const track = String(formData.get("track") ?? "").trim() as Track;
  const skillLevel = String(formData.get("skill_level") ?? "").trim() as SkillLevel;
  const avatarUrl = String(formData.get("avatar_url") ?? "").trim();

  if (!fullName) return "Full name is required.";

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      track,
      skill_level: skillLevel,
      avatar_url: avatarUrl || null
    })
    .eq("id", data.user.id);

  if (error) {
    if (isNetworkError(error)) return NETWORK_RETRY_MESSAGE;
    return error.message;
  }
  revalidatePath("/dashboard/profile");
  return "Profile updated.";
}
