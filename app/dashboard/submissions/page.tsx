import { ClipboardList } from "lucide-react";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/visual/Reveal";
import { getCurrentUser } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export default async function SubmissionsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const supabase = await createClient();
  const { data } = await supabase
    .from("submissions")
    .select("id, status, submitted_at, score, feedback, task_id, tasks(title,max_score)")
    .eq("student_id", user.id)
    .order("submitted_at", { ascending: false });
  const submissions = (data ?? []) as any[];

  return (
    <div className="grid gap-6">
      <Reveal>
        <PageHeader
          title="Submissions"
          subtitle="Track everything you've submitted and every grade you've earned."
        />
      </Reveal>

      <Reveal>
        <Card className="overflow-hidden p-0!">
          {submissions.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/45">
                    <th scope="col" className="py-4 pl-5 pr-3">Task</th>
                    <th scope="col" className="px-3 py-4">Status</th>
                    <th scope="col" className="px-3 py-4">Submitted</th>
                    <th scope="col" className="px-3 py-4">Score</th>
                    <th scope="col" className="px-5 py-4">Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((item) => (
                    <tr key={item.id} className="border-b border-white/8 transition last:border-0 hover:bg-white/[0.04]">
                      <td className="py-4 pl-5 pr-3 font-medium text-white">{item.tasks?.title ?? "Unknown task"}</td>
                      <td className="px-3 py-4">
                        <Badge tone={item.status === "graded" ? "good" : "warn"}>
                          {item.status === "graded" ? "Graded" : "Under Review"}
                        </Badge>
                      </td>
                      <td className="px-3 py-4 text-white/60">{formatDate(item.submitted_at)}</td>
                      <td className="px-3 py-4 font-semibold text-white">
                        {item.status === "graded" ? `${item.score}/${item.tasks?.max_score}` : "—"}
                      </td>
                      <td className="max-w-sm px-5 py-4 text-white/58">
                        {item.status === "graded" ? (item.feedback || "No feedback provided.") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-5">
              <EmptyState
                icon={ClipboardList}
                title="No submissions yet"
                hint="Head to the Tasks page, open a task, and submit your first project."
              />
            </div>
          )}
        </Card>
      </Reveal>
    </div>
  );
}
