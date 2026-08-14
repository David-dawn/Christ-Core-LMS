import { ArrowRight, CalendarDays, Trophy } from "lucide-react";
import Link from "next/link";
import { TaskStatusBadge } from "@/components/tasks/TaskStatusBadge";
import { Card } from "@/components/ui/Card";
import { taskVisualState } from "@/lib/task-status";
import { formatDate } from "@/lib/utils";
import type { Submission, Task } from "@/types/database";

export function TaskCard({
  task,
  submission
}: {
  task: Pick<Task, "id" | "title" | "description" | "status" | "deadline" | "max_score">;
  submission?: Pick<Submission, "status" | "score"> | null;
}) {
  const state = taskVisualState(task, submission);
  const graded = state.key === "graded";
  const cta = graded ? "View result" : "Open task";

  return (
    <Link href={`/dashboard/tasks/${task.id}`} className="group block h-full min-w-0">
      <Card hover className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-3">
          <h2 className="min-w-0 flex-1 break-words text-lg font-semibold leading-snug text-white">{task.title}</h2>
          <TaskStatusBadge state={state} className="shrink-0" />
        </div>

        <p className="mt-2.5 line-clamp-2 text-sm text-white/60">{task.description}</p>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs text-white/55">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={13} aria-hidden />
            {formatDate(task.deadline)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Trophy size={13} aria-hidden />
            {task.max_score} pts max
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-white/45">{state.description}</span>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-light transition-all group-hover:gap-2.5 group-hover:text-white">
            {cta}
            <ArrowRight size={15} aria-hidden />
          </span>
        </div>
      </Card>
    </Link>
  );
}
