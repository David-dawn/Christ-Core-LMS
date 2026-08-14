import { notFound } from "next/navigation";
import { TaskForm } from "@/components/admin/TaskForm";
import { createClient } from "@/lib/supabase/server";

export default async function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: task } = await supabase.from("tasks").select("id, title, description, status, instructions, requirements, resources, deadline, max_score").eq("id", id).single();
  if (!task) notFound();
  return <TaskForm task={task} />;
}
