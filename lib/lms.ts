import type { Attendance, Submission, Task } from "@/types/database";

export const CERTIFICATE_ATTENDANCE_THRESHOLD = 75;

export function attendancePercentage(records: Pick<Attendance, "status" | "session_date">[]) {
  const uniqueSessions = new Map<string, "present" | "absent">();
  records.forEach((record) => uniqueSessions.set(record.session_date, record.status));
  const total = uniqueSessions.size;
  if (!total) return 0;
  const present = [...uniqueSessions.values()].filter((status) => status === "present").length;
  return Math.round((present / total) * 100);
}

export function completedTaskCount(submissions: Pick<Submission, "task_id">[]) {
  return new Set(submissions.map((submission) => submission.task_id)).size;
}

export function progressPercentage(totalTasks: number, submissions: Pick<Submission, "task_id">[]) {
  if (!totalTasks) return 0;
  return Math.round((completedTaskCount(submissions) / totalTasks) * 100);
}

export function averageScore(submissions: Pick<Submission, "score">[]) {
  const graded = submissions.filter((submission) => typeof submission.score === "number");
  if (!graded.length) return 0;
  return Math.round(graded.reduce((sum, submission) => sum + (submission.score ?? 0), 0) / graded.length);
}

export function certificateEligibility(args: {
  attendance: number;
  publishedTasks: Pick<Task, "id">[];
  submissions: Pick<Submission, "task_id">[];
  threshold?: number;
}) {
  const threshold = args.threshold ?? CERTIFICATE_ATTENDANCE_THRESHOLD;
  const completed = completedTaskCount(args.submissions);
  const remaining = Math.max(args.publishedTasks.length - completed, 0);

  if (args.attendance < threshold) {
    return { eligible: false, status: "Not Yet Eligible", reason: `Attendance must reach ${threshold}%` };
  }

  if (remaining > 0) {
    return {
      eligible: false,
      status: "Not Yet Eligible",
      reason: `Complete ${remaining} remaining task${remaining === 1 ? "" : "s"}`
    };
  }

  return { eligible: true, status: "Eligible", reason: "All Phase 1 requirements met" };
}
