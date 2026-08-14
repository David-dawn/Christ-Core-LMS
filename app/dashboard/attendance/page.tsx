import { CalendarCheck, CalendarDays, UserCheck, UserX } from "lucide-react";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Card, StatCard } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/visual/Reveal";
import { attendancePercentage } from "@/lib/lms";
import { getCurrentUser } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

export default async function AttendancePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const supabase = await createClient();
  const { data } = await supabase.from("attendance").select("id, status, session_date").eq("student_id", user.id).order("session_date", { ascending: false });
  const records = data ?? [];
  const present = records.filter((r) => r.status === "present").length;

  return (
    <div className="grid gap-6">
      <Reveal>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Attendance" value={attendancePercentage(records)} suffix="%" icon={CalendarCheck} sub={`${records.length} sessions recorded`} />
          <StatCard label="Sessions Present" value={present} icon={UserCheck} sub="Marked present" />
          <StatCard label="Sessions Absent" value={Math.max(records.length - present, 0)} icon={UserX} sub="Marked absent" />
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <Card>
          <h1 className="text-2xl font-bold text-white">Session History</h1>
          <div className="mt-5 grid gap-2.5">
            {records.map((record) => (
              <div
                key={record.id}
                className="soft-panel flex items-center justify-between rounded-xl px-4 py-3.5 transition hover:border-brand-light/30"
              >
                <span className="inline-flex items-center gap-2.5 text-sm font-medium text-white/85">
                  <CalendarDays size={15} className="text-brand-light" aria-hidden />
                  {record.session_date}
                </span>
                <Badge tone={record.status === "present" ? "good" : "danger"} icon={record.status === "present" ? UserCheck : UserX}>
                  {record.status}
                </Badge>
              </div>
            ))}
            {!records.length ? (
              <EmptyState icon={CalendarDays} title="No attendance marked yet" hint="Your attendance records will appear here once sessions are marked." />
            ) : null}
          </div>
        </Card>
      </Reveal>
    </div>
  );
}
