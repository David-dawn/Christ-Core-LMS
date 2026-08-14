import type { Submission, Task } from "@/types/database";

export type TaskVisualState =
  | { key: "not_started"; label: string; tone: "info"; description: string }
  | { key: "under_review"; label: string; tone: "warn"; description: string }
  | { key: "graded"; label: string; tone: "good"; description: string }
  | { key: "closed"; label: string; tone: "neutral"; description: string }
  | { key: "overdue"; label: string; tone: "danger"; description: string };

type TaskLike = Pick<Task, "status" | "deadline" | "max_score">;
type SubmissionLike = Pick<Submission, "status" | "score"> | null | undefined;

export function taskVisualState(task: TaskLike, submission?: SubmissionLike): TaskVisualState {
  if (submission?.status === "graded") {
    return {
      key: "graded",
      label: `Graded · ${submission.score ?? "—"}/${task.max_score}`,
      tone: "good",
      description: "Scored and reviewed. Check your feedback."
    };
  }

  if (submission) {
    return {
      key: "under_review",
      label: "Under Review",
      tone: "warn",
      description: "Submitted. Awaiting grading."
    };
  }

  if (task.status === "closed") {
    return {
      key: "closed",
      label: "Closed",
      tone: "neutral",
      description: "This task is no longer accepting submissions."
    };
  }

  if (task.deadline && new Date(task.deadline).getTime() < Date.now()) {
    return {
      key: "overdue",
      label: "Overdue",
      tone: "danger",
      description: "The deadline has passed."
    };
  }

  return {
    key: "not_started",
    label: "Open",
    tone: "info",
    description: "Ready to build."
  };
}

export function taskResources(task: Pick<Task, "resources">): { label: string; url: string }[] {
  const raw = task.resources;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === "string") return { label: item, url: item };
      if (item && typeof item === "object") {
        const url = String((item as { url?: unknown }).url ?? (item as { label?: unknown }).label ?? "");
        const label = String((item as { label?: unknown }).label ?? url ?? "");
        return url ? { label, url } : null;
      }
      return null;
    })
    .filter((item): item is { label: string; url: string } => Boolean(item?.url));
}
