import { Megaphone, Newspaper } from "lucide-react";
import { saveAnnouncementAction } from "@/app/actions/lms";
import { Card } from "@/components/ui/Card";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { ActionForm } from "@/components/ui/SubmitMessage";
import { Reveal } from "@/components/visual/Reveal";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export default async function AnnouncementsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("announcements").select("id, title, content, created_at").order("created_at", { ascending: false }).limit(100);

  return (
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <Reveal>
        <Card>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-bright/15 ring-1 ring-brand-light/25">
              <Megaphone size={19} className="text-brand-light" aria-hidden />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Create Announcement</h1>
              <p className="text-sm text-white/55">Broadcast a message to all students.</p>
            </div>
          </div>
          <ActionForm action={saveAnnouncementAction} buttonLabel="Publish announcement" className="mt-6 grid gap-4">
            <Field label="Title">
              <Input name="title" placeholder="Class update" required />
            </Field>
            <Field label="Content">
              <Textarea name="content" placeholder="Write the announcement..." required />
            </Field>
          </ActionForm>
        </Card>
      </Reveal>

      <Reveal delay={0.1}>
        <Card>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-bright/15 ring-1 ring-brand-light/25">
              <Newspaper size={19} className="text-brand-light" aria-hidden />
            </div>
            <h2 className="text-2xl font-bold text-white">Announcements</h2>
          </div>
          <div className="mt-5 grid gap-3">
            {(data ?? []).map((item) => (
              <article key={item.id} className="soft-panel rounded-xl p-4 transition hover:border-brand-light/30">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-semibold text-white">{item.title}</h3>
                  <span className="text-xs text-white/45">{formatDate(item.created_at)}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-white/62">{item.content}</p>
              </article>
            ))}
            {!data?.length ? (
              <p className="rounded-xl border border-dashed border-brand-light/25 bg-white/[0.03] px-4 py-10 text-center text-sm text-white/55">
                No announcements published yet.
              </p>
            ) : null}
          </div>
        </Card>
      </Reveal>
    </div>
  );
}
