# Christ-Core Mini LMS

Phase 1 MVP for Christ-Core Digital Services' cohort-based frontend beginners class.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env.local` and set:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

3. Run `supabase/schema.sql` in the Supabase SQL Editor.

4. Start the app:

```bash
npm run dev
```

## First Admin

Register normally through `/register`, then run this SQL in Supabase SQL Editor:

```sql
update public.profiles
set role = 'admin'
where id = (
  select id from auth.users
  where email = 'your-email@example.com'
);
```

Replace the email with your own account email. There is no public admin registration route.

## Deploy To Vercel

1. Push the project to a Git repository.
2. Import it in Vercel as a Next.js app.
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
4. Ensure the Supabase Auth Site URL and redirect URLs include your Vercel domain.
5. Deploy.

## Notes

RLS is enabled on all application tables. Student private data is scoped to the signed-in user, while admin access is enforced through the `public.is_admin()` database function.
