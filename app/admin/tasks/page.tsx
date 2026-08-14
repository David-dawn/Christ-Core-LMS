import { CalendarDays, FilePlus2, Pencil, Trophy } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/visual/Reveal";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

const toneForStatus = (status: string) =>
  status === "published" ? "good" : status === "closed" ? "danger" : "neutral";

export default async function AdminTasksPage() {
  const supabase = await createClient();
  const [{ data: tasks }, { data: submissions }] = await Promise.all([
    supabase.from("tasks").select("id, title, status, deadline, max_score, created_at").order("created_at", { ascending: false }),
    supabase.from("submissions").select("task_id, status")
  ]);

  const submissionCounts = new Map<string, number>();
  (submissions ?? []).forEach((item) => {
    submissionCounts.set(item.task_id, (submissionCounts.get(item.task_id) ?? 0) + 1);
  });

  return (
    <div className="grid gap-6">
      <Reveal>
        <PageHeader
          title="Task Management"
          subtitle="Create, publish, and track every assignment in the class."
          actions={
            <ButtonLink href="/admin/tasks/create">
              <FilePlus2 size={15} aria-hidden /> Create task
            </ButtonLink>
          }
        />
      </Reveal>

      <Reveal>
        <Card className="overflow-hidden p-0!">
          {tasks?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/45">
                    <th scope="col" className="py-4 pl-5 pr-3">Title</th>
                    <th scope="col" className="px-3 py-4">Status</th>
                    <th scope="col" className="px-3 py-4">Deadline</th>
                    <th scope="col" className="px-3 py-4">Max Score</th>
                    <th scope="col" className="px-3 py-4">Submissions</th>
                    <th scope="col" className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(tasks ?? []).map((task) => (
                    <tr key={task.id} className="border-b border-white/8 transition last:border-0 hover:bg-white/[0.04]">
                      <td className="py-4 pl-5 pr-3 font-medium text-white">{task.title}</td>
                      <td className="px-3 py-4">
                        <Badge tone={toneForStatus(task.status)}>{task.status}</Badge>
                      </td>
                      <td className="px-3 py-4 text-white/60">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays size={13} aria-hidden /> {formatDate(task.deadline)}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-white/70">
                        <span className="inline-flex items-center gap-1.5">
                          <Trophy size={13} className="text-brand-light" aria-hidden /> {task.max_score}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-white/70">{submissionCounts.get(task.id) ?? 0}</td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/admin/tasks/${task.id}/edit`}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-light transition hover:text-white"
                        >
                          <Pencil size={13} aria-hidden /> Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-5">
              <p className="rounded-xl border border-dashed border-brand-light/25 bg-white/[0.03] px-4 py-10 text-center text-sm text-white/55">
                No tasks yet. Create your first task to get started.
              </p>
            </div>
          )}
        </Card>
      </Reveal>
    </div>
  );
}
