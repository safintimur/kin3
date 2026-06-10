# Kin3 — Vision, Roadmap & Backlog

> Living document. Reconstructed from the codebase and README on 2026-06-09.
> Keep this in sync when scope changes — it is the single source of truth for "what are we building and what's left".

## Vision

Kin3 is a **lightweight, private family tree editor** for a single family to collaboratively
record people, relationships, and family history. Priorities, in order:

1. **Simple** — a relative can sign in and add a person in under a minute.
2. **Private** — family data is not public; access is controlled.
3. **Accurate** — relationships and derived kinship are correct and hard to corrupt.
4. **Pleasant** — works well on phone and desktop.

Non-goals (for now): public/multi-family SaaS, deep genealogy research tooling, social features.

## Current state (MVP core — DONE ✅)

- Supabase magic-link auth + user profiles
- Person CRUD: first/last/maiden name, gender, birth/death dates, note; name search
- Relationships: `parent_child`, `partner`; auto union nodes; auto partner-linking
- Kinship engine (`lib/kinship.ts`): siblings (full/half), grandparents→great-grandparents,
  grandchildren, aunts/uncles
- React Flow canvas: zoom/pan, drag, link-mode, fit-view, mini-map
- Responsive: mobile people list + swipes, tablet split view
- Activity audit: DB triggers → `activity_events`, profiles

## Backlog

Status legend: `[ ]` todo · `[~]` partial · `[x]` done

### Now (next stop)
- [~] **Photo upload for a person** — `photo_url` exists in schema, no UI. Add Supabase Storage
  bucket + upload/crop control in person form + avatar in node/list. Self-contained, high
  user-visible value.

### Next
- [ ] **Activity log UI** — audit data is written but only queryable via SQL. Add a read-only
  in-app view (admin/all members).
- [ ] **Invite-only access & real RLS** — README promises this. Disable public signup,
  membership table + membership-based RLS policies (currently all-authenticated = full access).
- [ ] **Relationship sanity checks** — warn on impossible links (child older than parent,
  self/cycle, duplicate partner).

### Later
- [ ] GEDCOM import/export
- [ ] Arbitrary life events / timeline (beyond birth/death)
- [ ] Multiple trees / multi-family support (tree_id is currently hardcoded)
- [ ] i18n (UI is Russian-only)
- [ ] Rich notes / attachments
- [ ] Edit history / versioning per person

## Branch & release model

- `main` — production. `dev` — integration. Feature work on short-lived `feat/*` branches → PR into `dev` → `dev` into `main`.
- Keep stale/merged branches pruned (no long-lived `vercel/*`, `codex/*`, `claude/*` branches).
