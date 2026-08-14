import { CalendarClock, FileText, ListChecks, Link2, Settings2, Type } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { saveTaskAction } from "@/app/actions/lms";
import { Card } from "@/components/ui/Card";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { ActionForm } from "@/components/ui/SubmitMessage";
import type { Task } from "@/types/database";

function SectionHeader({ icon: Icon, title, hint }: { icon: LucideIcon; title: string; hint: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-bright/15 ring-1 ring-brand-light/25">
        <Icon size={17} className="text-brand-light" aria-hidden />
      </div>
      <div>
        <h2 className="font-bold text-white">{title}</h2>
        <p className="text-xs text-white/50">{hint}</p>
      </div>
    </div>
  );
}

export function TaskForm({ task }: { task?: Partial<Task> }) {
  const resources = Array.isArray(task?.resources)
    ? task.resources.map((item: any) => item.url || item.label || "").join("\n")
    : "";
  const deadline = task?.deadline ? task.deadline.slice(0, 16) : "";

  return (
    <Card>
      <h1 className="text-2xl font-bold text-white sm:text-3xl">{task ? "Edit Task" : "Create Task"}</h1>
      <p className="mt-1.5 text-sm text-white/55">
        {task ? "Update the assignment details below." : "Set up a new assignment for your class."}
      </p>

      <ActionForm action={saveTaskAction} buttonLabel={task ? "Save changes" : "Create task"} className="mt-7 grid gap-8">
        <input type="hidden" name="id" value={task?.id ?? ""} />

        <section className="grid gap-5">
          <SectionHeader icon={Type} title="Basics" hint="What students see at a glance" />
          <Field label="Title">
            <Input name="title" defaultValue={task?.title} placeholder="Build a landing page" required />
          </Field>
          <Field label="Description" hint="A short summary shown on the task card">
            <Textarea name="description" defaultValue={task?.description} placeholder="Briefly describe what this task is about" required />
          </Field>
          <Field label="Status">
            <Select name="status" defaultValue={task?.status ?? "draft"}>
              <option value="draft">Draft — hidden from students</option>
              <option value="published">Published — visible to students</option>
              <option value="closed">Closed — no more submissions</option>
            </Select>
          </Field>
        </section>

        <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        <section className="grid gap-5">
          <SectionHeader icon={FileText} title="Brief" hint="The full assignment students must read" />
          <Field label="Instructions" hint="Step-by-step guidance for completing the task">
            <Textarea name="instructions" defaultValue={task?.instructions ?? ""} placeholder="Step 1: ..." />
          </Field>
          <Field label="Requirements" hint="What must be included for full marks">
            <Textarea name="requirements" defaultValue={task?.requirements ?? ""} placeholder="- Responsive layout&#10;- Working links" />
          </Field>
          <Field label="Resources" hint="One URL or label per line — links students may find useful">
            <Textarea name="resources" defaultValue={resources} placeholder="https://developer.mozilla.org" />
          </Field>
        </section>

        <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        <section className="grid gap-5">
          <SectionHeader icon={Settings2} title="Grading" hint="Deadline and scoring settings" />
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Deadline">
              <Input name="deadline" type="datetime-local" defaultValue={deadline} />
            </Field>
            <Field label="Maximum Score">
              <Input name="max_score" type="number" min={1} defaultValue={task?.max_score ?? 100} />
            </Field>
          </div>
        </section>

        <div className="grid gap-4 rounded-2xl border border-brand-light/20 bg-brand-bright/8 p-4 sm:grid-cols-3 sm:items-center">
          <p className="flex items-center gap-2 text-sm text-white/70">
            <ListChecks size={15} className="text-brand-light" aria-hidden />
            Students submit a GitHub repo + live URL.
          </p>
          <p className="flex items-center gap-2 text-sm text-white/70">
            <Link2 size={15} className="text-brand-light" aria-hidden />
            Resources become clickable links.
          </p>
          <p className="flex items-center gap-2 text-sm text-white/70">
            <CalendarClock size={15} className="text-brand-light" aria-hidden />
            Overdue tasks flag automatically.
          </p>
        </div>
      </ActionForm>
    </Card>
  );
}
