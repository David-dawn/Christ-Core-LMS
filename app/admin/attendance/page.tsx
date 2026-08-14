import { CalendarDays, Check, X } from "lucide-react";
import { markAttendanceAction } from "@/app/actions/lms";
import { Card } from "@/components/ui/Card";
import { ActionForm } from "@/components/ui/SubmitMessage";
import { Reveal } from "@/components/visual/Reveal";
import { createClient } from "@/lib/supabase/server";
import { initials } from "@/lib/utils";

export default async function AdminAttendancePage() {
  const supabase = await createClient();
  const { data: students } = await supabase.from("profiles").select("id, full_name, email").eq("role", "student").order("full_name");
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="grid gap-6">
      <Reveal>
        <Card>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-bright/15 ring-1 ring-brand-light/25">
              <CalendarDays size={19} className="text-brand-light" aria-hidden />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Attendance</h1>
              <p className="text-sm text-white/55">Mark who was present in this session.</p>
            </div>
          </div>

          <ActionForm action={markAttendanceAction} buttonLabel="Save attendance" className="mt-6 grid gap-4">
            <label className="block text-sm font-medium text-white/88">
              Session Date
              <input
                name="session_date"
                type="date"
                defaultValue={today}
                required
                className="field-input mt-2! md:w-64"
              />
            </label>

            {students?.length ? (
              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-wider text-white/45">
                      <th scope="col" className="py-3 pl-4 pr-3">Student</th>
                      <th scope="col" className="px-3 py-3 text-center">Present</th>
                      <th scope="col" className="px-3 py-3 text-center">Absent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(students ?? []).map((student) => (
                      <tr key={student.id} className="border-b border-white/8 transition last:border-0 hover:bg-white/[0.04]">
                        <td className="py-3.5 pl-4 pr-3">
                          <input type="hidden" name="student_id" value={student.id} />
                          <span className="flex items-center gap-3">
                            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-bright to-brand text-[10px] font-bold text-white">
                              {initials(student.full_name)}
                            </span>
                            <span>
                              <span className="block font-medium text-white">{student.full_name}</span>
                              <span className="block text-xs text-white/45">{student.email}</span>
                            </span>
                          </span>
                        </td>
                        <td className="px-3 py-3.5 text-center">
                          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-white/75">
                            <input
                              type="radio"
                              name={`status_${student.id}`}
                              value="present"
                              defaultChecked
                              className="h-4 w-4 accent-brand-bright"
                            />
                            <Check size={14} className="text-brand-light" aria-hidden />
                          </label>
                        </td>
                        <td className="px-3 py-3.5 text-center">
                          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-white/75">
                            <input
                              type="radio"
                              name={`status_${student.id}`}
                              value="absent"
                              className="h-4 w-4 accent-brand-bright"
                            />
                            <X size={14} className="text-white/45" aria-hidden />
                          </label>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-brand-light/25 bg-white/[0.03] px-4 py-10 text-center text-sm text-white/55">
                No students enrolled yet.
              </p>
            )}
          </ActionForm>
        </Card>
      </Reveal>
    </div>
  );
}
