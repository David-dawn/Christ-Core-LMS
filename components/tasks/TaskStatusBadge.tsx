import { AlertTriangle, CheckCircle2, Circle, Clock, Lock } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { TaskVisualState } from "@/lib/task-status";

const icons = {
  graded: CheckCircle2,
  under_review: Clock,
  not_started: Circle,
  closed: Lock,
  overdue: AlertTriangle
} as const;

export function TaskStatusBadge({ state, className }: { state: TaskVisualState; className?: string }) {
  const Icon = icons[state.key];
  return (
    <Badge tone={state.tone} icon={Icon} className={className}>
      {state.label}
    </Badge>
  );
}
