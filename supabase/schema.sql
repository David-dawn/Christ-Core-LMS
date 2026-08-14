create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text,
  role text not null default 'student' check (role in ('student', 'admin')),
  track text check (track in ('frontend', 'uiux', 'animation')),
  skill_level text check (skill_level in ('beginner', 'intermediate', 'advanced')),
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  instructions text,
  requirements text,
  resources jsonb default '[]'::jsonb,
  deadline timestamptz,
  max_score integer default 100 check (max_score > 0),
  status text default 'draft' check (status in ('draft', 'published', 'closed')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  github_url text not null,
  deployment_url text not null,
  comment text,
  status text default 'submitted' check (status in ('submitted', 'graded')),
  score integer,
  feedback text,
  submitted_at timestamptz default now(),
  graded_at timestamptz,
  graded_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz default now(),
  unique (task_id, student_id)
);

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  session_date date not null,
  status text not null check (status in ('present', 'absent')),
  marked_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  unique (student_id, session_date)
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_track_skill on public.profiles(track, skill_level);
create index if not exists idx_tasks_status_deadline on public.tasks(status, deadline);
create index if not exists idx_submissions_student on public.submissions(student_id);
create index if not exists idx_submissions_task on public.submissions(task_id);
create index if not exists idx_submissions_status on public.submissions(status);
create index if not exists idx_attendance_student_date on public.attendance(student_id, session_date);
create index if not exists idx_announcements_created_at on public.announcements(created_at desc);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at before update on public.profiles
for each row execute function public.touch_updated_at();

drop trigger if exists tasks_touch_updated_at on public.tasks;
create trigger tasks_touch_updated_at before update on public.tasks
for each row execute function public.touch_updated_at();

drop trigger if exists submissions_touch_updated_at on public.submissions;
create trigger submissions_touch_updated_at before update on public.submissions
for each row execute function public.touch_updated_at();

create or replace function public.is_admin(uid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = uid and role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role, track, skill_level)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), split_part(new.email, '@', 1)),
    new.email,
    'student',
    case
      when new.raw_user_meta_data->>'track' in ('frontend', 'uiux', 'animation')
      then new.raw_user_meta_data->>'track'
      else 'frontend'
    end,
    case
      when new.raw_user_meta_data->>'skill_level' in ('beginner', 'intermediate', 'advanced')
      then new.raw_user_meta_data->>'skill_level'
      else 'beginner'
    end
  )
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    email = excluded.email,
    track = excluded.track,
    skill_level = excluded.skill_level,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.submissions enable row level security;
alter table public.attendance enable row level security;
alter table public.announcements enable row level security;

drop policy if exists "profiles read own or admin" on public.profiles;
create policy "profiles read own or admin"
on public.profiles for select
to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles insert own student" on public.profiles;
create policy "profiles insert own student"
on public.profiles for insert
to authenticated
with check (id = auth.uid() and role = 'student');

drop policy if exists "profiles update own safe fields" on public.profiles;
create policy "profiles update own safe fields"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid() and role = 'student');

drop policy if exists "profiles admin update" on public.profiles;
create policy "profiles admin update"
on public.profiles for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

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
