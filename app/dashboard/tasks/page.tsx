import { BookOpen } from "lucide-react";
import { redirect } from "next/navigation";
import { TaskCard } from "@/components/tasks/TaskCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/visual/Reveal";
import { getCurrentUser } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

export default async function TasksPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const supabase = await createClient();
  const [{ data: tasks }, { data: submissions }] = await Promise.all([
    supabase.from("tasks").select("id, title, description, status, deadline, max_score").eq("status", "published").order("deadline", { ascending: true }),
    supabase.from("submissions").select("id, task_id, status, score").eq("student_id", user.id)
  ]);

  return (
    <div className="grid gap-6">
      <Reveal>
        <PageHeader
          title="Tasks"
          subtitle="Your published assignments — submit before the deadline to earn your score."
        />
      </Reveal>

      {tasks?.length ? (
        <Reveal stagger className="grid gap-4 md:grid-cols-2">
          {(tasks ?? []).map((task) => {
            const submission = submissions?.find((item) => item.task_id === task.id);
            return <TaskCard key={task.id} task={task} submission={submission} />;
          })}
        </Reveal>
      ) : (
        <Reveal>
          <EmptyState
            icon={BookOpen}
            title="No published tasks yet"
            hint="Your instructor hasn't published any tasks. Check back soon."
          />
        </Reveal>
      )}
    </div>
  );
}
