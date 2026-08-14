import { Search, UsersRound } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/visual/Reveal";
import { attendancePercentage, averageScore, certificateEligibility, completedTaskCount } from "@/lib/lms";
import { createClient } from "@/lib/supabase/server";
import { initials, skillLabels, trackLabels } from "@/lib/utils";

export default async function StudentsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; track?: string; skill?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const [{ data: students }, { data: tasks }, { data: submissions }, { data: attendance }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, email, track, skill_level, created_at").eq("role", "student").order("created_at", { ascending: false }),
    supabase.from("tasks").select("id, title, status").eq("status", "published"),
    // Bounded guardrails — only fields the summary table needs.
    supabase.from("submissions").select("id, task_id, student_id, status, score").limit(500),
    supabase.from("attendance").select("id, student_id, status, session_date").limit(500)
  ]);

  const filtered = (students ?? []).filter((student) => {
    const matchesSearch = !params.q || `${student.full_name} ${student.email}`.toLowerCase().includes(params.q.toLowerCase());
    const matchesTrack = !params.track || student.track === params.track;
    const matchesSkill = !params.skill || student.skill_level === params.skill;
    return matchesSearch && matchesTrack && matchesSkill;
  });

  return (
    <div className="grid gap-6">
      <Reveal>
        <PageHeader title="Students" subtitle={`${filtered.length} of ${students?.length ?? 0} enrolled learners`} />
      </Reveal>

      <Reveal>
        <Card>
          <form className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
            <label className="relative block">
              <Search size={12} className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-white/40" aria-hidden />
              <input
                name="q"
                placeholder="Search by name or email"
                defaultValue={params.q ?? ""}
                className="field-input mt-0! pl-9"
              />
            </label>
            <select name="track" defaultValue={params.track ?? ""} className="field-input mt-0! md:w-40">
              <option value="">All tracks</option>
              <option value="frontend">Frontend</option>
              <option value="uiux">UI/UX</option>
              <option value="animation">Animation</option>
            </select>
            <select name="skill" defaultValue={params.skill ?? ""} className="field-input mt-0! md:w-40">
              <option value="">All levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <Button type="submit">Filter</Button>
          </form>

          <div className="mt-6 overflow-x-auto">
            {filtered.length ? (
              <table className="w-full min-w-240 text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/45">
                    <th scope="col" className="py-3 pl-1 pr-3">Student</th>
                    <th scope="col" className="px-3 py-3">Track</th>
                    <th scope="col" className="px-3 py-3">Level</th>
                    <th scope="col" className="px-3 py-3">Completed</th>
                    <th scope="col" className="px-3 py-3">Avg Score</th>
                    <th scope="col" className="px-3 py-3">Attendance</th>
                    <th scope="col" className="px-3 py-3">Certificate</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((student) => {
                    const studentSubmissions = (submissions ?? []).filter((item) => item.student_id === student.id);
                    const studentAttendance = (attendance ?? []).filter((item) => item.student_id === student.id);
                    const att = attendancePercentage(studentAttendance);
                    const eligibility = certificateEligibility({ attendance: att, publishedTasks: tasks ?? [], submissions: studentSubmissions });
                    return (
                      <tr key={student.id} className="border-b border-white/8 transition last:border-0 hover:bg-white/4">
                        <td className="py-4 pl-1 pr-3">
                          <Link href={`/admin/students/${student.id}`} className="group flex items-center gap-3">
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-linear-to-br from-brand-bright to-brand text-xs font-bold text-white">
                              {initials(student.full_name)}
                            </span>
                            <span>
                              <span className="font-medium text-white group-hover:text-brand-light">{student.full_name}</span>
                              <br />
                              <span className="text-xs text-white/45">{student.email}</span>
                            </span>
                          </Link>
                        </td>
                        <td className="px-3 py-4">
                          <Badge tone="info">{trackLabels[student.track ?? ""] ?? student.track ?? "—"}</Badge>
                        </td>
                        <td className="px-3 py-4 capitalize text-white/70">{skillLabels[student.skill_level ?? ""] ?? student.skill_level ?? "—"}</td>
                        <td className="px-3 py-4 font-semibold text-white">
                          {completedTaskCount(studentSubmissions)}/{tasks?.length ?? 0}
                        </td>
                        <td className="px-3 py-4 text-white/70">{averageScore(studentSubmissions)}%</td>
                        <td className="px-3 py-4 text-white/70">{att}%</td>
                        <td className="px-3 py-4">
                          <Badge tone={eligibility.eligible ? "good" : "warn"}>{eligibility.status}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="pt-2">
                <EmptyState icon={UsersRound} title="No students match your filters" hint="Try clearing the search or changing the track and level filters." />
              </div>
            )}
          </div>
        </Card>
      </Reveal>
    </div>
  );
}
