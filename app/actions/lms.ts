"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isNetworkError } from "@/lib/network";
import { createClient } from "@/lib/supabase/server";
import { isValidUrl } from "@/lib/utils";
import type { AttendanceStatus, TaskStatus } from "@/types/database";
import type { User } from "@supabase/supabase-js";

type AuthOk = { supabase: Awaited<ReturnType<typeof createClient>>; user: User };
type AuthErr = { error: string };

const NETWORK_RETRY_MESSAGE = "Connection problem. Please check your internet connection and try again.";

async function requireUser(): Promise<AuthOk | AuthErr> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    // A transient network failure is NOT an auth failure — surface a retry
    // message instead of redirecting to /login.
    if (isNetworkError(error)) return { error: NETWORK_RETRY_MESSAGE };
    redirect("/login");
  }
  if (!data.user) redirect("/login");
  return { supabase, user: data.user };
}

async function requireAdmin(): Promise<AuthOk | AuthErr> {
  const auth = await requireUser();
  if ("error" in auth) return auth;
  const { supabase, user } = auth;
  const { data, error } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (error) {
    if (isNetworkError(error)) return { error: NETWORK_RETRY_MESSAGE };
    return { error: "You don't have permission to do that." };
  }
  if (data?.role !== "admin") redirect("/dashboard");
  return { supabase, user };
}

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function submitTaskAction(taskId: string, _prevState: string | null, formData: FormData) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { supabase, user } = auth;
  const githubUrl = text(formData, "github_url");
  const deploymentUrl = text(formData, "deployment_url");
  const comment = text(formData, "comment");

  if (!isValidUrl(githubUrl) || !githubUrl.includes("github.com")) return "Enter a valid GitHub repository URL.";
  if (!isValidUrl(deploymentUrl)) return "Enter a valid live deployment URL.";

  const { error } = await supabase.from("submissions").insert({
    task_id: taskId,
    student_id: user.id,
    github_url: githubUrl,
    deployment_url: deploymentUrl,
    comment: comment || null,
    status: "submitted"
  });
  if (error) {
    if (isNetworkError(error)) return NETWORK_RETRY_MESSAGE;
    return error.message;
  }
  revalidatePath(`/dashboard/tasks/${taskId}`);
  revalidatePath("/dashboard");
  return "Submission received. It is now under review.";
}

export async function saveTaskAction(_prevState: string | null, formData: FormData) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { supabase, user } = auth;
  const id = text(formData, "id");
  const title = text(formData, "title");
  const description = text(formData, "description");
  const instructions = text(formData, "instructions");
  const requirements = text(formData, "requirements");
  const resourcesText = text(formData, "resources");
  const deadline = text(formData, "deadline");
  const maxScore = Number(text(formData, "max_score") || 100);
  const status = text(formData, "status") as TaskStatus;

  if (!title || !description) return "Title and description are required.";
  if (!["draft", "published", "closed"].includes(status)) return "Choose a valid task status.";

  const resources = resourcesText
    ? resourcesText.split("\n").filter(Boolean).map((line) => ({ label: line, url: line }))
    : [];

  const payload = {
    title,
    description,
    instructions: instructions || null,
    requirements: requirements || null,
    resources,
    deadline: deadline ? new Date(deadline).toISOString() : null,
    max_score: Number.isFinite(maxScore) ? maxScore : 100,
    status,
    created_by: user.id
  };

  const query = id ? supabase.from("tasks").update(payload).eq("id", id) : supabase.from("tasks").insert(payload);
  const { error } = await query;
  if (error) {
    if (isNetworkError(error)) return NETWORK_RETRY_MESSAGE;
    return error.message;
  }

  revalidatePath("/admin/tasks");
  revalidatePath("/dashboard/tasks");
  redirect("/admin/tasks");
}

export async function gradeSubmissionAction(submissionId: string, _prevState: string | null, formData: FormData) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { supabase, user } = auth;
  const score = Number(text(formData, "score"));
  const feedback = text(formData, "feedback");

  if (!Number.isFinite(score) || score < 0) return "Enter a valid score.";
  if (!feedback) return "Feedback is required.";

  const { error } = await supabase
    .from("submissions")
    .update({
      score,
      feedback,
      status: "graded",
      graded_by: user.id,
      graded_at: new Date().toISOString()
    })
    .eq("id", submissionId);

  if (error) {
    if (isNetworkError(error)) return NETWORK_RETRY_MESSAGE;
    return error.message;
  }
  revalidatePath("/admin/submissions");
  revalidatePath(`/admin/submissions/${submissionId}`);
  revalidatePath("/dashboard");
  return "Grade published.";
}

export async function markAttendanceAction(_prevState: string | null, formData: FormData) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { supabase, user } = auth;
  const sessionDate = text(formData, "session_date");
  const studentIds = formData.getAll("student_id").map(String);

  if (!sessionDate) return "Choose a session date.";
  if (!studentIds.length) return "No students selected.";

  const rows = studentIds.map((studentId) => ({
    student_id: studentId,
    session_date: sessionDate,
    status: (text(formData, `status_${studentId}`) || "absent") as AttendanceStatus,
    marked_by: user.id
  }));

  const { error } = await supabase.from("attendance").upsert(rows, { onConflict: "student_id,session_date" });
  if (error) {
    if (isNetworkError(error)) return NETWORK_RETRY_MESSAGE;
    return error.message;
  }
  revalidatePath("/admin/attendance");
  revalidatePath("/dashboard/attendance");
  return "Attendance saved.";
}

export async function saveAnnouncementAction(_prevState: string | null, formData: FormData) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { supabase, user } = auth;
  const id = text(formData, "id");
  const title = text(formData, "title");
  const content = text(formData, "content");
  if (!title || !content) return "Title and content are required.";
  const payload = { title, content, created_by: user.id };
  const query = id ? supabase.from("announcements").update(payload).eq("id", id) : supabase.from("announcements").insert(payload);
  const { error } = await query;
  if (error) {
    if (isNetworkError(error)) return NETWORK_RETRY_MESSAGE;
    return error.message;
  }
  revalidatePath("/admin/announcements");
  revalidatePath("/dashboard");
  return "Announcement saved.";
}
