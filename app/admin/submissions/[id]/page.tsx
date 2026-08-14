import {
  AtSign,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  GitBranch,
  Globe,
  MessageSquare,
  Trophy,
  UserRound
} from "lucide-react";
import { notFound } from "next/navigation";
import { gradeSubmissionAction } from "@/app/actions/lms";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { ActionForm } from "@/components/ui/SubmitMessage";
import { Reveal } from "@/components/visual/Reveal";
import { createClient } from "@/lib/supabase/server";
import { formatDate, initials } from "@/lib/utils";

export default async function ReviewSubmissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("submissions")
    .select("id, task_id, status, submitted_at, score, feedback, comment, github_url, deployment_url, profiles!submissions_student_id_fkey(full_name,email), tasks(title,max_score)")
    .eq("id", id)
    .single();
  const submission = data as any;
  if (!submission) notFound();

  const graded = submission.status === "graded";
  const maxScore = submission.tasks?.max_score ?? 100;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <Reveal>
        <Card className="relative overflow-hidden">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-brand-bright/20 blur-3xl" />
          <div className="relative">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Badge tone={graded ? "good" : "warn"} icon={graded ? CheckCircle2 : undefined}>
                {graded ? "Graded" : "Pending Review"}
              </Badge>
              {graded ? (
                <Badge tone="good" icon={Trophy}>
                  Score {submission.score}/{maxScore}
                </Badge>
              ) : null}
            </div>
            <h1 className="mt-4 text-2xl font-bold text-white sm:text-3xl">{submission.tasks?.title ?? "Submission"}</h1>

            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-bright to-brand text-sm font-bold text-white ring-2 ring-white/20">
                {initials(submission.profiles?.full_name)}
              </div>
              <div className="min-w-0 text-sm">
                <p className="break-words font-semibold text-white">{submission.profiles?.full_name ?? "Unknown student"}</p>
                <p className="mt-0.5 flex min-w-0 flex-wrap gap-x-4 gap-y-1 text-white/55">
                  <span className="inline-flex min-w-0 items-center gap-1.5">
                    <AtSign size={12} aria-hidden /> <span className="break-words">{submission.profiles?.email}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays size={12} aria-hidden /> Submitted {formatDate(submission.submitted_at)}
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-2.5">
              <a
                href={submission.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="soft-panel flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm text-brand-light transition hover:border-brand-light/40 hover:bg-brand-bright/10"
              >
                <span className="inline-flex items-center gap-2">
                  <GitBranch size={15} aria-hidden /> <span className="truncate">GitHub repository</span>
                </span>
                <ExternalLink size={14} className="shrink-0" aria-hidden />
              </a>
              <a
                href={submission.deployment_url}
                target="_blank"
                rel="noopener noreferrer"
                className="soft-panel flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm text-brand-light transition hover:border-brand-light/40 hover:bg-brand-bright/10"
              >
                <span className="inline-flex items-center gap-2">
                  <Globe size={15} aria-hidden /> <span className="truncate">Live deployment</span>
                </span>
                <ExternalLink size={14} className="shrink-0" aria-hidden />
              </a>
              {submission.comment ? (
                <p className="soft-panel mt-1 break-words whitespace-pre-line rounded-xl px-4 py-3 text-sm text-white/65">
                  <span className="font-semibold text-white/80">Student comment:</span> {submission.comment}
                </p>
              ) : null}
            </div>
          </div>
        </Card>
      </Reveal>

      <Reveal delay={0.1}>
        <Card className="relative overflow-hidden">
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-brand-bright/20 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-bright/15 ring-1 ring-brand-light/25">
              <UserRound size={19} className="text-brand-light" aria-hidden />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Grade Submission</h2>
              <p className="text-xs text-white/50">{graded ? "Update the grade for this submission." : "Score this student's work."}</p>
            </div>
          </div>

          {graded ? (
            <div className="relative mt-5 rounded-2xl border border-brand-light/30 bg-brand-bright/12 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-light">Current grade</p>
              <p className="mt-1 text-2xl font-bold text-white">
                {submission.score}
                <span className="text-sm font-medium text-white/55"> / {maxScore}</span>
              </p>
            </div>
          ) : null}

          <ActionForm action={gradeSubmissionAction.bind(null, submission.id)} buttonLabel={graded ? "Update grade" : "Publish grade"} className="relative mt-6 grid gap-5">
            <Field label={`Score (out of ${maxScore})`}>
              <Input
                name="score"
                type="number"
                min={0}
                max={maxScore}
                step={0.5}
                defaultValue={submission.score ?? ""}
                placeholder={`0 – ${maxScore}`}
                required
              />
            </Field>
            <Field label="Feedback" hint="Explain the score — strengths and what to improve">
              <Textarea name="feedback" defaultValue={submission.feedback ?? ""} placeholder="Great work on the layout! Next time..." required />
            </Field>
            <div className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/55">
              <MessageSquare size={14} className="mt-0.5 shrink-0 text-brand-light" aria-hidden />
              Feedback is shown to the student on the task page alongside their score.
            </div>
          </ActionForm>
        </Card>
      </Reveal>
    </div>
  );
}
