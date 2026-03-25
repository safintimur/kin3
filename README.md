# Family Tree MVP (Next.js + Supabase)

A simple MVP web app for a family tree: view relationships, add relatives, and edit existing records.

## Stack

- Next.js (App Router)
- TypeScript
- React + Tailwind CSS
- shadcn/ui-style UI components
- React Flow (pan/zoom family map)
- Zustand (client-side state)
- Supabase/Postgres (optional)

## Quick Start

```bash
npm install
npm run dev
```

Open: `http://localhost:3000`

## Supabase Setup (Optional)

If environment variables are not provided, the app automatically runs on browser demo data.

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Apply the schema from `sql/schema.sql` in your Supabase project.

## MVP Features

- Main screen: left sidebar + family tree canvas + right details panel
- Family tree view with React Flow (pan/zoom, MiniMap, connections)
- Person cards with name and life years
- Select a person and view full details
- Add/edit/delete a person
- Add parent/child/partner from the right panel
- Search by people
- Responsive layout for mobile and desktop

## Structure

- `app` - pages and layout
- `components` - UI and layout components
- `features` - domain blocks (tree/person)
- `lib` - utilities, data repository, mock/supabase
- `store` - Zustand store
- `types` - domain types
- `sql` - database schema

## Commands

```bash
npm run dev
npm run build
npm run start
npm run typecheck
```
