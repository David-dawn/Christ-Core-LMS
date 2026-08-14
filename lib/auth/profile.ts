import type { User } from "@supabase/supabase-js";
import type { SkillLevel, Track } from "@/types/database";

type SupabaseLike = {
  from: (table: string) => any;
};

function validTrack(value: unknown): Track {
  return value === "frontend" || value === "uiux" || value === "animation" ? value : "frontend";
}

function validSkillLevel(value: unknown): SkillLevel {
  return value === "beginner" || value === "intermediate" || value === "advanced" ? value : "beginner";
}

export async function getOrCreateProfile(supabase: SupabaseLike, user: User) {
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (profile) return { profile, error: null };

  const metadata = user.user_metadata ?? {};
  const fullName =
    typeof metadata.full_name === "string" && metadata.full_name.trim()
      ? metadata.full_name.trim()
      : user.email?.split("@")[0] ?? "Student";

  const { data: createdProfile, error } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      full_name: fullName,
      email: user.email ?? null,
      role: "student",
      track: validTrack(metadata.track),
      skill_level: validSkillLevel(metadata.skill_level)
    })
    .select("*")
    .single();

  if (error) return { profile: null, error };
  return { profile: createdProfile, error: null };
}
