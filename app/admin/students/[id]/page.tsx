import { AtSign, Award, CalendarCheck, ClipboardList, GraduationCap, Trophy, Undo2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Card, StatCard } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/visual/Reveal";
import { attendancePercentage, averageScore, certificateEligibility, completedTaskCount } from "@/lib/lms";
import { createClient } from "@/lib/supabase/server";
import { formatDate, initials, skillLabels, trackLabels } from "@/lib/utils";

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: student }, { data: tasks }, { data: submissions }, { data: attendance }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, email, track, skill_level, role, created_at").eq("id", id).eq("role", "student").single(),
    supabase.from("tasks").select("id, title, status").eq("status", "published"),
    supabase.from("submissions").select("id, task_id, status, score, submitted_at, tasks(title,max_score)").eq("student_id", id),
    supabase.from("attendance").select("id, status, session_date").eq("student_id", id)
  ]);
  if (!student) notFound();
  const att = attendancePercentage(attendance ?? []);
  const eligibility = certificateEligibility({ attendance: att, publishedTasks: tasks ?? [], submissions: submissions ?? [] });

  return (
    <div className="grid gap-6">
      <Reveal>
        <Card className="relative overflow-hidden">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-brand-bright/20 blur-3xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-5">
            <div className="flex min-w-0 items-center gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-brand-bright to-brand text-xl font-bold text-white ring-2 ring-white/20 shadow-[0_8px_30px_rgba(75,111,239,0.4)]">
                {initials(student.full_name)}
              </div>
              <div className="min-w-0">
                <h1 className="wrap-break-word text-2xl font-bold text-white sm:text-3xl">{student.full_name}</h1>
                <p className="mt-1.5 flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/58">
                  <span className="inline-flex min-w-0 items-center gap-1.5">
                    <AtSign size={13} aria-hidden /> <span className="wrap-break-word">{student.email}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <GraduationCap size={13} aria-hidden /> Joined {formatDate(student.created_at)}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="info">{trackLabels[student.track ?? ""] ?? student.track ?? "No track"}</Badge>
              <Badge tone="neutral">{skillLabels[student.skill_level ?? ""] ?? student.skill_level ?? "No level"}</Badge>
            </div>
          </div>
        </Card>
      </Reveal>

      <Reveal stagger>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Completed" value={`${completedTaskCount(submissions ?? [])}/${tasks?.length ?? 0}`} icon={ClipboardList} sub="Published tasks" />
          <StatCard label="Average Score" value={averageScore(submissions ?? [])} suffix="%" icon={Trophy} sub="Across graded work" />
          <StatCard label="Attendance" value={att} suffix="%" icon={CalendarCheck} sub={`${attendance?.length ?? 0} sessions`} />
          <StatCard label="Certificate" value={eligibility.status} icon={Award} sub={eligibility.reason} animate={false} />
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Submissions</h2>
            <Link href="/admin/students" className="inline-flex items-center gap-1.5 text-sm text-white/55 transition hover:text-white">
              <Undo2 size={14} aria-hidden /> All students
            </Link>
          </div>
          <div className="grid gap-2.5">
            {((submissions ?? []) as any[]).map((item) => (
              <div key={item.id} className="soft-panel flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3.5">
                <div className="min-w-0">
                  <p className="wrap-break-word font-medium text-white">{item.tasks?.title ?? "Unknown task"}</p>
                  <p className="text-xs text-white/50">Score {item.score ?? "—"} / {item.tasks?.max_score ?? 100}</p>
                </div>
                <Badge tone={item.status === "graded" ? "good" : "warn"}>{item.status}</Badge>
              </div>
            ))}
            {!submissions?.length ? (
              <EmptyState icon={ClipboardList} title="No submissions yet" hint="This student hasn't submitted any work." />
            ) : null}
          </div>
        </Card>
      </Reveal>
    </div>
  );
}
