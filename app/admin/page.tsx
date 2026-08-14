import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  ClipboardCheck,
  Megaphone,
  Plus,
  Trophy,
  UsersRound
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card, StatCard } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/visual/Reveal";
import { attendancePercentage, averageScore } from "@/lib/lms";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export default async function AdminPage() {
  const supabase = await createClient();
  const [
    { count: studentsCount },
    { count: tasksCount },
    { data: recentSubmissions },
    { data: attendance },
    { data: gradedScores },
    { count: pendingCount },
    { count: announcementsCount }
  ] = await Promise.all([
    // Count-only queries — no need to download every row just for a number.
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("tasks").select("id", { count: "exact", head: true }),
    supabase.from("submissions").select("id, status, submitted_at, profiles!submissions_student_id_fkey(full_name), tasks(title)").order("submitted_at", { ascending: false }).limit(6),
    supabase.from("attendance").select("status, session_date").limit(500),
    supabase.from("submissions").select("score").eq("status", "graded"),
    supabase.from("submissions").select("id", { count: "exact", head: true }).eq("status", "submitted"),
    supabase.from("announcements").select("id", { count: "exact", head: true })
  ]);
  const allRecent = (recentSubmissions ?? []) as any[];

  return (
    <div className="grid gap-6">
      <Reveal>
        <PageHeader
          title="Admin Dashboard"
          subtitle="Manage your class: students, tasks, reviews, and attendance at a glance."
          actions={<ButtonLink href="/admin/tasks/create"><Plus size={15} aria-hidden /> New task</ButtonLink>}
        />
      </Reveal>

      <Reveal stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Students" value={studentsCount ?? 0} icon={UsersRound} sub="Enrolled learners" />
        <StatCard label="Total Tasks" value={tasksCount ?? 0} icon={BookOpen} sub="Drafts, published & closed" />
        <StatCard label="Pending Reviews" value={pendingCount ?? 0} icon={ClipboardCheck} sub="Awaiting grading" />
        <StatCard label="Average Score" value={averageScore(gradedScores ?? [])} suffix="%" icon={Trophy} sub="Across graded work" />
      </Reveal>

      <Reveal stagger className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Average Attendance" value={attendancePercentage(attendance ?? [])} suffix="%" icon={CalendarCheck} sub="Across all sessions" />
        <StatCard label="Graded Submissions" value={gradedScores?.length ?? 0} icon={ClipboardCheck} sub="Completed reviews" />
        <StatCard label="Announcements" value={announcementsCount ?? 0} icon={Megaphone} sub="Published to students" />
      </Reveal>

      <Reveal>
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Recent Submissions</h2>
            <Link href="/admin/submissions" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-light transition hover:text-white">
              Review queue <ArrowRight size={14} aria-hidden />
            </Link>
          </div>
          <div className="grid gap-2.5">
            {allRecent.map((item) => (
              <Link
                key={item.id}
                href={`/admin/submissions/${item.id}`}
                className="soft-panel group flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3.5 transition hover:border-brand-light/35 hover:bg-brand-bright/10"
              >
                <div className="min-w-0">
                  <p className="font-medium text-white">
                    {item.profiles?.full_name ?? "Student"}
                    <span className="text-white/45"> submitted </span>
                    {item.tasks?.title ?? "a task"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-xs text-white/50">{formatDate(item.submitted_at)}</span>
                  <Badge tone={item.status === "graded" ? "good" : "warn"}>{item.status === "graded" ? "Graded" : "Pending"}</Badge>
                </div>
              </Link>
            ))}
            {!allRecent.length ? (
              <p className="rounded-xl border border-dashed border-brand-light/25 bg-white/[0.03] px-4 py-8 text-center text-sm text-white/55">
                No submissions yet. Submissions will appear here for review.
              </p>
            ) : null}
          </div>
        </Card>
      </Reveal>
    </div>
  );
}
