# Kin3

Kin3 is a lightweight family tree editor built with Next.js and Supabase.

## Stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- React Flow for the tree canvas
- Zustand for UI state
- Supabase Auth + Postgres

## Local development

```bash
nvm use
npm install
npm run dev
```

Open `http://localhost:3000`.

The app needs Supabase environment variables to show the working interface:

```bash
NEXT_PUBLIC_SUPABASE_URL=<project-url>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Use `.env.local` for local values. Do not commit real project URLs, keys, passwords, or `.local` files.

## Supabase setup

Create or link a Supabase project:

```bash
supabase link --project-ref <project-ref>
npm run db:push
```

If you prefer to push with a direct database URL, put it in `.local/supabase.env`:

```bash
export SUPABASE_DB_URL="postgresql://..."
```

Then run:

```bash
npm run db:push
```

## Private deployment

Kin3 is designed for private family data. A public repository should not contain a live Supabase project URL, service role key, database password, or personal family records.

For the simplest family deployment, keep live URLs out of the public repository and configure the production URL only in your hosting provider and Supabase dashboard.

If you later need invite-only access:

1. Disable public signups in Supabase Auth settings.
2. Invite users from the Supabase dashboard or through a trusted server-side admin flow.
3. Add membership-based RLS policies before exposing write access.

The current migrations keep the app easy for relatives to join, while activity tables record who signed in and who changed family data.

## Activity audit

Recent sign-ins and edits are stored in Supabase:

```sql
select email, display_name, first_seen_at, last_seen_at
from public.user_profiles
order by last_seen_at desc;

select occurred_at, actor_email, actor_name, action, entity_type, entity_id, metadata
from public.activity_events
order by occurred_at desc
limit 100;
```

`activity_events` records session activity from the app and database-triggered changes to people, relationships, and family tree rows.

## Auth configuration

For local magic-link testing, the app redirects to the current `localhost` origin. Configure Supabase redirect URLs for every environment you use, for example:

```text
http://localhost:3000
http://localhost:3000/**
https://your-domain.example
https://your-domain.example/**
```

For hosted deployments, set:

```bash
NEXT_PUBLIC_SUPABASE_URL=<project-url>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
NEXT_PUBLIC_SITE_URL=https://your-domain.example
```

## Commands

```bash
npm run dev
npm run build
npm run start
npm run typecheck
npm run db:push
```

## Project structure

- `app` - pages and app layout
- `components` - UI, auth, and layout components
- `features` - domain UI for people and tree editing
- `lib` - Supabase client and data repository
- `store` - Zustand store
- `types` - domain types
- `supabase/migrations` - database migrations
