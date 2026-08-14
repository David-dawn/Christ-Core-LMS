import { ClipboardCheck } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/visual/Reveal";
import { createClient } from "@/lib/supabase/server";
import { formatDate, initials } from "@/lib/utils";

export default async function AdminSubmissionsPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase
    .from("submissions")
    .select("id, status, submitted_at, score, task_id, student_id, profiles!submissions_student_id_fkey(full_name,email), tasks(title,max_score)")
    .order("submitted_at", { ascending: false })
    .limit(100);
  const submissions = (data ?? []) as any[];
  const filtered = status && status !== "all" ? submissions.filter((item) => item.status === status) : submissions;
  const pendingCount = submissions.filter((item) => item.status === "submitted").length;

  return (
    <div className="grid gap-6">
      <Reveal>
        <PageHeader
          title="Submission Reviews"
          subtitle={`${pendingCount} submission${pendingCount === 1 ? "" : "s"} awaiting grading`}
        />
      </Reveal>

      <Reveal>
        <Card>
          <form className="flex flex-wrap items-center gap-3">
            <select name="status" defaultValue={status ?? "all"} className="field-input mt-0! w-52">
              <option value="all">All statuses</option>
              <option value="submitted">Pending review</option>
              <option value="graded">Graded</option>
            </select>
            <Button type="submit" variant="ghost">Apply filter</Button>
          </form>

          <div className="mt-6 overflow-x-auto">
            {filtered.length ? (
              <table className="w-full min-w-[880px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/45">
                    <th scope="col" className="py-3 pl-1 pr-3">Student</th>
                    <th scope="col" className="px-3 py-3">Task</th>
                    <th scope="col" className="px-3 py-3">Status</th>
                    <th scope="col" className="px-3 py-3">Submitted</th>
                    <th scope="col" className="px-3 py-3">Score</th>
                    <th scope="col" className="px-3 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.id} className="border-b border-white/8 transition last:border-0 hover:bg-white/[0.04]">
                      <td className="py-4 pl-1 pr-3">
                        <span className="flex items-center gap-3">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-bright to-brand text-[10px] font-bold text-white">
                            {initials(item.profiles?.full_name)}
                          </span>
                          <span>
                            <span className="block font-medium text-white">{item.profiles?.full_name ?? "Unknown"}</span>
                            <span className="block text-xs text-white/45">{item.profiles?.email}</span>
                          </span>
                        </span>
                      </td>
                      <td className="px-3 py-4 text-white/80">{item.tasks?.title ?? "—"}</td>
                      <td className="px-3 py-4">
                        <Badge tone={item.status === "graded" ? "good" : "warn"}>
                          {item.status === "graded" ? "Graded" : "Pending"}
                        </Badge>
                      </td>
                      <td className="px-3 py-4 text-white/60">{formatDate(item.submitted_at)}</td>
                      <td className="px-3 py-4 font-semibold text-white">
                        {item.score != null ? `${item.score}/${item.tasks?.max_score ?? "—"}` : "—"}
                      </td>
                      <td className="px-3 py-4 text-right">
                        <Link href={`/admin/submissions/${item.id}`} className="text-sm font-semibold text-brand-light transition hover:text-white">
                          {item.status === "graded" ? "View review" : "Review →"}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState
                icon={ClipboardCheck}
                title={status && status !== "all" ? "No submissions in this status" : "No submissions yet"}
                hint="Submissions will appear here when students hand in their work."
              />
            )}
          </div>
        </Card>
      </Reveal>
    </div>
  );
}
