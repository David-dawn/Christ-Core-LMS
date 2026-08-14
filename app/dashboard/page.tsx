import {
  Award,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  Clock,
  Megaphone,
  Sparkles,
  Trophy
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { TaskStatusBadge } from "@/components/tasks/TaskStatusBadge";
import { Badge } from "@/components/ui/Badge";
import { Card, StatCard } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Reveal } from "@/components/visual/Reveal";
import { attendancePercentage, averageScore, certificateEligibility, completedTaskCount, progressPercentage } from "@/lib/lms";
import { getCurrentProfile, getCurrentUser } from "@/lib/data";
import { taskVisualState } from "@/lib/task-status";
import { createClient } from "@/lib/supabase/server";
import { formatDate, greeting, skillLabels, trackLabels } from "@/lib/utils";

export default async function DashboardPage() {
  // getCurrentUser/getCurrentProfile throw a NetworkError on transient
  // failures (retry UI) and return null only for genuine auth failure.
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const supabase = await createClient();
  const userId = user.id;
  const [profile, { data: tasks }, { data: submissions }, { data: attendance }, { data: announcements }] =
    await Promise.all([
      // Cached per-request: deduped with the Shell's profile fetch.
      getCurrentProfile(),
      supabase.from("tasks").select("id, title, status, deadline, max_score").eq("status", "published").order("deadline", { ascending: true }),
      supabase.from("submissions").select("id, task_id, status, score").eq("student_id", userId),
      supabase.from("attendance").select("id, status, session_date").eq("student_id", userId),
      supabase.from("announcements").select("id, title, content, created_at").order("created_at", { ascending: false }).limit(4)
    ]);

  const publishedTasks = tasks ?? [];
  const mySubmissions = submissions ?? [];
  const attendanceValue = attendancePercentage(attendance ?? []);
  const completed = completedTaskCount(mySubmissions);
  const progress = progressPercentage(publishedTasks.length, mySubmissions);
  const eligibility = certificateEligibility({ attendance: attendanceValue, publishedTasks, submissions: mySubmissions });
  const firstName = profile?.full_name?.split(" ")[0] ?? "builder";
  const track = profile?.track ? trackLabels[profile.track] ?? profile.track : null;
  const skill = profile?.skill_level ? skillLabels[profile.skill_level] ?? profile.skill_level : null;

  return (
    <div className="grid gap-6">
      {/* Hero */}
      <Reveal>
        <section className="glass relative overflow-hidden rounded-2xl p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-brand-bright/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-brand/40 blur-3xl" />
          <div className="relative flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-brand-light">
                <Sparkles size={15} aria-hidden />
                {greeting()}, {firstName}
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-4xl">
                Keep learning. <span className="text-gradient">Keep building.</span>
              </h1>
              {(track || skill) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {track ? <Badge tone="info">{track}</Badge> : null}
                  {skill ? <Badge tone="neutral">{skill}</Badge> : null}
                </div>
              )}
            </div>
            <div className="glass-strong w-full rounded-2xl p-5 sm:w-72">
              <div className="flex items-baseline justify-between">
                <p className="text-sm font-medium text-white/70">Overall progress</p>
                <p className="text-2xl font-bold text-white">{progress}%</p>
              </div>
              <ProgressBar value={progress} className="mt-3" />
              <p className="mt-2.5 text-xs text-white/55">
                {completed} of {publishedTasks.length} published task{publishedTasks.length === 1 ? "" : "s"} completed
              </p>
            </div>
          </div>
        </section>
      </Reveal>

      {/* Stats */}
      <Reveal stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tasks Completed" value={completed} icon={CheckCircle2} sub={`${publishedTasks.length} published total`} />
        <StatCard label="Tasks Pending" value={Math.max(publishedTasks.length - completed, 0)} icon={ClipboardList} sub="Awaiting your submission" />
        <StatCard label="Average Score" value={averageScore(mySubmissions)} suffix="%" icon={Trophy} sub="Across graded tasks" />
        <StatCard label="Attendance" value={attendanceValue} suffix="%" icon={CalendarCheck} sub="Present across sessions" />
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        {/* Recent tasks */}
        <Reveal>
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Recent Tasks</h2>
              <Link href="/dashboard/tasks" className="text-sm font-semibold text-brand-light transition hover:text-white">
                View all →
              </Link>
            </div>
            <div className="grid gap-2.5">
              {publishedTasks.slice(0, 5).map((task) => {
                const submission = mySubmissions.find((item) => item.task_id === task.id);
                const state = taskVisualState(task, submission);
                return (
                  <Link
                    key={task.id}
                    href={`/dashboard/tasks/${task.id}`}
                    className="soft-panel group rounded-xl p-4 transition hover:border-brand-light/35 hover:bg-brand-bright/10"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="min-w-0 break-words font-semibold text-white">{task.title}</h3>
                      <TaskStatusBadge state={state} className="shrink-0" />
                    </div>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-white/50">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock size={12} aria-hidden />
                        Deadline {formatDate(task.deadline)}
                      </span>
                      <span className="text-white/45 transition group-hover:text-brand-light">View task →</span>
                    </div>
                  </Link>
                );
              })}
              {!publishedTasks.length ? (
                <EmptyState icon={ClipboardList} title="No published tasks yet" hint="New tasks will appear here as soon as they are published." />
              ) : null}
            </div>
          </Card>
        </Reveal>

        <div className="grid gap-6">
          {/* Certificate status */}
          <Reveal>
            <Card className="relative overflow-hidden">
              <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-brand-bright/20 blur-2xl" />
              <div className="relative flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-bright/20 ring-1 ring-brand-light/30">
                  <Award size={22} className="text-brand-light" aria-hidden />
                </div>
                <h2 className="text-xl font-bold text-white">Certificate Status</h2>
              </div>
              <div className="relative mt-4 flex items-center gap-2">
                <Badge tone={eligibility.eligible ? "good" : "warn"} icon={eligibility.eligible ? Award : Clock}>
                  {eligibility.status}
                </Badge>
              </div>
              <div className="relative mt-5 grid gap-2.5 text-sm">
                <div>
                  <div className="flex justify-between text-xs text-white/55">
                    <span>Attendance</span>
                    <span className="font-semibold text-white/85">{attendanceValue}%</span>
                  </div>
                  <ProgressBar value={attendanceValue} className="mt-1.5" barClassName="from-brand-light to-brand-bright" />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-white/55">
                    <span>Tasks completed</span>
                    <span className="font-semibold text-white/85">
                      {completed}/{publishedTasks.length}
                    </span>
                  </div>
                  <ProgressBar
                    value={publishedTasks.length ? (completed / publishedTasks.length) * 100 : 0}
                    className="mt-1.5"
                    barClassName="from-brand-light to-brand-bright"
                  />
                </div>
              </div>
              <p className="relative mt-4 text-sm text-white/60">{eligibility.reason}</p>
            </Card>
          </Reveal>

          {/* Announcements */}
          <Reveal delay={0.1}>
            <Card>
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-bright/20 ring-1 ring-brand-light/30">
                  <Megaphone size={22} className="text-brand-light" aria-hidden />
                </div>
                <h2 className="text-xl font-bold text-white">Announcements</h2>
              </div>
              <div className="mt-4 grid gap-3">
                {(announcements ?? []).map((item) => (
                  <article key={item.id} className="border-b border-white/10 pb-3 last:border-0 last:pb-0">
                    <h3 className="font-medium text-white">{item.title}</h3>
                    <p className="mt-1 text-sm text-white/58">{item.content}</p>
                    <p className="mt-1.5 text-[11px] text-white/40">{formatDate(item.created_at)}</p>
                  </article>
                ))}
                {!announcements?.length ? (
                  <p className="text-sm text-white/55">No announcements yet.</p>
                ) : null}
              </div>
            </Card>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
