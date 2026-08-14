import {
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  FileText,
  GitBranch,
  Globe,
  ListChecks,
  MessageSquare,
  Send,
  Trophy,
  Undo2
} from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { submitTaskAction } from "@/app/actions/lms";
import { TaskStatusBadge } from "@/components/tasks/TaskStatusBadge";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { ActionForm } from "@/components/ui/SubmitMessage";
import { Reveal } from "@/components/visual/Reveal";
import { taskResources, taskVisualState } from "@/lib/task-status";
import { getCurrentUser } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const supabase = await createClient();
  const [{ data: task }, { data: submission }] = await Promise.all([
    supabase.from("tasks").select("id, title, description, status, instructions, requirements, resources, deadline, max_score").eq("id", id).eq("status", "published").single(),
    supabase.from("submissions").select("id, task_id, status, submitted_at, github_url, deployment_url, comment, score, feedback").eq("task_id", id).eq("student_id", user.id).maybeSingle()
  ]);
  if (!task) notFound();

  const state = taskVisualState(task, submission);
  const resources = taskResources(task);

  return (
    <div className="grid gap-6">
      <Reveal>
        <Card className="relative overflow-hidden">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-brand-bright/20 blur-3xl" />
          <div className="relative">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Badge tone="info">Published</Badge>
                <TaskStatusBadge state={state} />
              </div>
              <Link href="/dashboard/tasks" className="inline-flex items-center gap-1.5 text-sm text-white/55 transition hover:text-white">
                <Undo2 size={14} aria-hidden />
                All tasks
              </Link>
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">{task.title}</h1>
            <p className="mt-3 max-w-3xl text-white/64">{task.description}</p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Badge tone="neutral" icon={CalendarDays}>
                Deadline {formatDate(task.deadline)}
              </Badge>
              <Badge tone="neutral" icon={Trophy}>
                Maximum score {task.max_score}
              </Badge>
            </div>
          </div>
        </Card>
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.85fr]">
        <div className="grid gap-6">
          <Reveal delay={0.05}>
            <Card>
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-bright/15 ring-1 ring-brand-light/25">
                  <FileText size={19} className="text-brand-light" aria-hidden />
                </div>
                <h2 className="text-xl font-bold text-white">Instructions</h2>
              </div>
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-white/66">
                {task.instructions || "Follow the task description carefully."}
              </p>
            </Card>
          </Reveal>

          <Reveal delay={0.1}>
            <Card>
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-bright/15 ring-1 ring-brand-light/25">
                  <ListChecks size={19} className="text-brand-light" aria-hidden />
                </div>
                <h2 className="text-xl font-bold text-white">Requirements</h2>
              </div>
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-white/66">
                {task.requirements || "Submit a GitHub repository and a live deployment."}
              </p>
            </Card>
          </Reveal>

          {resources.length ? (
            <Reveal delay={0.15}>
              <Card>
                <h2 className="text-xl font-bold text-white">Resources</h2>
                <ul className="mt-4 grid gap-2">
                  {resources.map((resource, index) => (
                    <li key={`${resource.url}-${index}`}>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="soft-panel flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm text-brand-light transition hover:border-brand-light/40 hover:bg-brand-bright/10"
                      >
                        <span className="truncate">{resource.label || resource.url}</span>
                        <ExternalLink size={14} className="shrink-0" aria-hidden />
                      </a>
                    </li>
                  ))}
                </ul>
              </Card>
            </Reveal>
          ) : null}
        </div>

        <Reveal delay={0.1}>
          {submission ? (
            <Card className="relative overflow-hidden">
              <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-brand-bright/20 blur-2xl" />
              <div className="relative flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-bright/15 ring-1 ring-brand-light/25">
                  <CheckCircle2 size={19} className="text-brand-light" aria-hidden />
                </div>
                <h2 className="text-xl font-bold text-white">Your Submission</h2>
              </div>

              <div className="relative mt-4 flex flex-wrap items-center gap-2">
                <TaskStatusBadge state={state} />
                <Badge tone="neutral">Submitted {formatDate(submission.submitted_at)}</Badge>
              </div>

              <div className="relative mt-5 grid gap-2.5 text-sm">
                <a
                  href={submission.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="soft-panel flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-brand-light transition hover:border-brand-light/40 hover:bg-brand-bright/10"
                >
                  <span className="inline-flex items-center gap-2">
                    <GitBranch size={15} aria-hidden />
                    <span className="truncate">GitHub repository</span>
                  </span>
                  <ExternalLink size={14} className="shrink-0" aria-hidden />
                </a>
                <a
                  href={submission.deployment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="soft-panel flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-brand-light transition hover:border-brand-light/40 hover:bg-brand-bright/10"
                >
                  <span className="inline-flex items-center gap-2">
                    <Globe size={15} aria-hidden />
                    <span className="truncate">Live deployment</span>
                  </span>
                  <ExternalLink size={14} className="shrink-0" aria-hidden />
                </a>
                {submission.comment ? (
                  <p className="soft-panel mt-1 whitespace-pre-line rounded-xl px-4 py-3 text-sm text-white/65">
                    <span className="font-semibold text-white/80">Comment:</span> {submission.comment}
                  </p>
                ) : null}
              </div>

              {submission.status === "graded" ? (
                <div className="relative mt-5 rounded-2xl border border-brand-light/30 bg-brand-bright/12 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white/80">Your score</p>
                    <p className="text-2xl font-bold text-white">
                      {submission.score ?? "—"}
                      <span className="text-sm font-medium text-white/55"> / {task.max_score}</span>
                    </p>
                  </div>
                  {submission.feedback ? (
                    <p className="mt-3 whitespace-pre-line border-t border-white/10 pt-3 text-sm text-white/72">
                      {submission.feedback}
                    </p>
                  ) : null}
                </div>
              ) : (
                <div className="relative mt-5 rounded-2xl border border-amber-300/25 bg-amber-300/8 p-4 text-sm text-amber-100/85">
                  Your submission is under review. You&apos;ll see your score and feedback here once it&apos;s graded.
                </div>
              )}
            </Card>
          ) : (
            <Card className="relative overflow-hidden">
              <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-brand-bright/20 blur-2xl" />
              <div className="relative flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-bright/15 ring-1 ring-brand-light/25">
                  <Send size={19} className="text-brand-light" aria-hidden />
                </div>
                <h2 className="text-xl font-bold text-white">Submit Your Work</h2>
              </div>

              <div className="relative mt-5 grid gap-3">
                {[
                  { icon: GitBranch, title: "GitHub repository URL", hint: "The repo containing your code" },
                  { icon: Globe, title: "Live deployment URL", hint: "Your working site or preview" },
                  { icon: MessageSquare, title: "Comment (optional)", hint: "A note for the reviewer" }
                ].map((step, index) => (
                  <div key={step.title} className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand-bright/15 text-xs font-bold text-brand-light ring-1 ring-brand-light/25">
                      {index + 1}
                    </span>
                    <div>
                      <p className="flex items-center gap-1.5 text-sm font-semibold text-white/85">
                        <step.icon size={14} aria-hidden />
                        {step.title}
                      </p>
                      <p className="text-xs text-white/50">{step.hint}</p>
                    </div>
                  </div>
                ))}
              </div>

              <ActionForm action={submitTaskAction.bind(null, task.id)} buttonLabel="Submit task" className="relative mt-6 grid gap-4">
                <Field label="GitHub Repository URL">
                  <Input name="github_url" type="url" required placeholder="https://github.com/username/repo" />
                </Field>
                <Field label="Live Deployment URL">
                  <Input name="deployment_url" type="url" required placeholder="https://your-project.vercel.app" />
                </Field>
                <Field label="Comment">
                  <Textarea name="comment" placeholder="Optional note for the reviewer" />
                </Field>
              </ActionForm>
            </Card>
          )}
        </Reveal>
      </div>
    </div>
  );
}
