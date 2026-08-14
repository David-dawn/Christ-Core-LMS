import { AtSign, CalendarDays, GraduationCap, UserRound } from "lucide-react";
import { redirect } from "next/navigation";
import { updateProfileAction } from "@/app/actions/profile";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/ui/Field";
import { ActionForm } from "@/components/ui/SubmitMessage";
import { Reveal } from "@/components/visual/Reveal";
import { getCurrentProfile, getCurrentUser } from "@/lib/data";
import { formatDate, initials, roleLabel, skillLabels, trackLabels } from "@/lib/utils";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  // Cached per-request: deduped with the Shell's profile fetch.
  const profile = await getCurrentProfile();


  return (
    <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">      
      <Reveal>
        <Card className="relative overflow-hidden">
          <div className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-brand-bright/20 blur-3xl" />
          <div className="relative flex flex-col items-center text-center">
            <div className="grid h-20 w-20 place-items-center rounded-2xl bg-linear-to-br from-brand-bright to-brand text-2xl font-bold text-white ring-2 ring-white/20 shadow-[0_8px_30px_rgba(75,111,239,0.4)]">
              {initials(profile?.full_name)}
            </div>
            <h1 className="mt-4 text-2xl font-bold text-white">{profile?.full_name}</h1>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <Badge tone="info">{trackLabels[profile?.track ?? ""] ?? profile?.track ?? "No track"}</Badge>
              <Badge tone="neutral">{skillLabels[profile?.skill_level ?? ""] ?? profile?.skill_level ?? "No level"}</Badge>
            </div>
          </div>
          <div className="relative mt-6 grid gap-2.5 border-t border-white/10 pt-5 text-sm text-white/65">
            <p className="flex min-w-0 items-center gap-2.5">
              <AtSign size={14} className="shrink-0 text-brand-light" aria-hidden />
              <span className="min-w-0 wrap-break-word">{profile?.email ?? "No email"}</span>
            </p>
            <p className="flex items-center gap-2.5">
              <CalendarDays size={14} className="text-brand-light" aria-hidden />
              Joined {profile?.created_at ? formatDate(profile.created_at) : "—"}
            </p>
            <p className="flex items-center gap-2.5">
              <GraduationCap size={14} className="text-brand-light" aria-hidden />
              {roleLabel(profile?.role)}
            </p>
          </div>
        </Card>
      </Reveal>

      <Reveal delay={0.1}>
        <Card>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-bright/15 ring-1 ring-brand-light/25">
              <UserRound size={19} className="text-brand-light" aria-hidden />
            </div>
            <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
          </div>
          <ActionForm action={updateProfileAction} buttonLabel="Update profile" className="mt-6 grid gap-5">
            <Field label="Full Name">
              <Input name="full_name" defaultValue={profile?.full_name} required />
            </Field>
            <Field label="Avatar URL">
              <Input name="avatar_url" type="url" defaultValue={profile?.avatar_url ?? ""} placeholder="https://example.com/avatar.png" />
            </Field>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Track">
                <Select name="track" defaultValue={profile?.track ?? "frontend"}>
                  <option value="frontend">Frontend Development</option>
                  <option value="uiux">UI/UX Design</option>
                  <option value="animation">Animation</option>
                </Select>
              </Field>
              <Field label="Skill Level">
                <Select name="skill_level" defaultValue={profile?.skill_level ?? "beginner"}>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </Select>
              </Field>
            </div>
          </ActionForm>
        </Card>
      </Reveal>
    </div>
  );
}
