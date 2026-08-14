-- ============================================================================
-- REPAIR SCRIPT — Christ-Core LMS
-- Fixes the login redirect loop by adding the schema objects that are MISSING
-- from your live database. Does NOT create any tables (they already exist).
--
-- SAFE TO RE-RUN: every statement is idempotent (create or replace / drop
-- if exists / on conflict) and will NOT error with "already exists".
--
-- HOW TO RUN:
--   1. Supabase Dashboard -> SQL Editor -> New query
--   2. Paste this entire file -> Run
-- ============================================================================

-- 1. is_admin() helper (referenced by the policies below; safe to recreate)
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

-- 2. handle_new_user() — auto-creates a profile row on signup
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

-- 3. Trigger — fires handle_new_user() whenever a new auth user signs up
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- 4. RLS policies for profiles
--    (the missing INSERT policy was the direct cause of the redirect loop)
drop policy if exists "profiles insert own student" on public.profiles;
create policy "profiles insert own student"
on public.profiles for insert
to authenticated
with check (id = auth.uid() and role = 'student');

drop policy if exists "profiles read own or admin" on public.profiles;
create policy "profiles read own or admin"
on public.profiles for select
to authenticated
using (id = auth.uid() or public.is_admin());

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

-- 5. Make sure RLS is enabled on profiles
alter table public.profiles enable row level security;

-- 6. BACKFILL — the trigger only fires for NEW signups, so any accounts that
--    already exist (yours included) have no profile row yet. This creates one
--    for every auth user that is missing a profile. It will NOT touch rows
--    that already exist.
insert into public.profiles (id, full_name, email, role, track, skill_level)
select
  u.id,
  coalesce(nullif(u.raw_user_meta_data->>'full_name', ''), split_part(u.email, '@', 1)),
  u.email,
  'student',
  coalesce(u.raw_user_meta_data->>'track', 'frontend'),
  coalesce(u.raw_user_meta_data->>'skill_level', 'beginner')
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

-- 7. OPTIONAL: promote YOUR account to admin (run after the backfill)
--    Uncomment and replace YOUR-EMAIL:
-- update public.profiles set role = 'admin' where email = 'YOUR-EMAIL';

-- 8. VERIFY — every existing user should now have has_profile = true
select u.email, (p.id is not null) as has_profile, p.role
from auth.users u
left join public.profiles p on p.id = u.id
order by u.created_at desc;
