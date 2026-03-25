create extension if not exists "pgcrypto";

create table if not exists family_trees (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  created_at timestamptz not null default now()
);

create table if not exists persons (
  id uuid primary key default gen_random_uuid(),
  tree_id uuid not null references family_trees(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  gender text not null check (gender in ('male', 'female', 'other', 'unknown')),
  birth_date date not null,
  death_date date,
  note text,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists relationships (
  id uuid primary key default gen_random_uuid(),
  tree_id uuid not null references family_trees(id) on delete cascade,
  type text not null check (type in ('parent_child', 'partner')),
  from_person_id uuid not null references persons(id) on delete cascade,
  to_person_id uuid not null references persons(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint relationships_diff_people check (from_person_id <> to_person_id)
);

create index if not exists idx_persons_tree_id on persons(tree_id);
create index if not exists idx_relationships_tree_id on relationships(tree_id);
create index if not exists idx_relationships_from on relationships(from_person_id);
create index if not exists idx_relationships_to on relationships(to_person_id);
