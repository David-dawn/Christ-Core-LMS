-- ============================================================================
-- REPAIR SCRIPT — Christ-Core LMS
-- Installs the MISSING RLS policies for tasks / submissions / attendance /
-- announcements in your live database.
--
-- WHY: RLS is enabled on all four tables, but none of their policies were
-- ever installed in the live project (only the profiles policies exist, added
-- by fix_missing_schema.sql). That is why every admin write fails with:
--     new row violates row-level security policy for table "tasks"
-- (and the same for announcements / attendance / submissions).
--
-- SAFE TO RE-RUN: every statement is idempotent (drop policy if exists).
-- Does NOT disable RLS. Does NOT weaken any policy:
--   - Students: read published tasks / own submissions / own attendance only
--   - Admins:   create / update / delete tasks, grade submissions, manage
--               attendance and announcements
--
-- HOW TO RUN:
--   1. Supabase Dashboard -> SQL Editor -> New query
--   2. Paste this entire file -> Run
-- ============================================================================

-- ---------------------------------------------------------------------------
-- TASKS
-- ---------------------------------------------------------------------------
drop policy if exists "tasks students read published" on public.tasks;
create policy "tasks students read published"
on public.tasks for select
to authenticated
using (status = 'published' or public.is_admin());

drop policy if exists "tasks admin insert" on public.tasks;
create policy "tasks admin insert"
on public.tasks for insert
to authenticated
with check (public.is_admin());

drop policy if exists "tasks admin update" on public.tasks;
create policy "tasks admin update"
on public.tasks for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "tasks admin delete" on public.tasks;
create policy "tasks admin delete"
on public.tasks for delete
to authenticated
using (public.is_admin());

-- ---------------------------------------------------------------------------
-- SUBMISSIONS
-- ---------------------------------------------------------------------------
drop policy if exists "submissions read own or admin" on public.submissions;
create policy "submissions read own or admin"
on public.submissions for select
to authenticated
using (student_id = auth.uid() or public.is_admin());

drop policy if exists "submissions student insert own" on public.submissions;
create policy "submissions student insert own"
on public.submissions for insert
to authenticated
with check (
  student_id = auth.uid()
  and status = 'submitted'
  and score is null
  and feedback is null
  and graded_at is null
  and graded_by is null
  and exists (select 1 from public.tasks where id = task_id and status = 'published')
);

drop policy if exists "submissions admin update grading" on public.submissions;
create policy "submissions admin update grading"
on public.submissions for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- ATTENDANCE
-- ---------------------------------------------------------------------------
drop policy if exists "attendance read own or admin" on public.attendance;
create policy "attendance read own or admin"
on public.attendance for select
to authenticated
using (student_id = auth.uid() or public.is_admin());

drop policy if exists "attendance admin insert" on public.attendance;
create policy "attendance admin insert"
on public.attendance for insert
to authenticated
with check (public.is_admin());

drop policy if exists "attendance admin update" on public.attendance;
create policy "attendance admin update"
on public.attendance for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "attendance admin delete" on public.attendance;
create policy "attendance admin delete"
on public.attendance for delete
to authenticated
using (public.is_admin());

-- ---------------------------------------------------------------------------
-- ANNOUNCEMENTS
-- ---------------------------------------------------------------------------
drop policy if exists "announcements authenticated read" on public.announcements;
create policy "announcements authenticated read"
on public.announcements for select
to authenticated
using (true);

drop policy if exists "announcements admin insert" on public.announcements;
create policy "announcements admin insert"
on public.announcements for insert
to authenticated
with check (public.is_admin());

drop policy if exists "announcements admin update" on public.announcements;
create policy "announcements admin update"
on public.announcements for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "announcements admin delete" on public.announcements;
create policy "announcements admin delete"
on public.announcements for delete
to authenticated
using (public.is_admin());

-- ---------------------------------------------------------------------------
-- VERIFY — after running, every table should list its policies:
-- ---------------------------------------------------------------------------
select tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
order by tablename, cmd;
