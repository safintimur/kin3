create table if not exists user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists activity_events (
  id bigserial primary key,
  occurred_at timestamptz not null default now(),
  actor_id uuid references auth.users(id) on delete set null,
  actor_email text,
  actor_name text,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  tree_id uuid references family_trees(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists idx_user_profiles_email on user_profiles(email);
create index if not exists idx_activity_events_occurred_at on activity_events(occurred_at desc);
create index if not exists idx_activity_events_actor_id on activity_events(actor_id);
create index if not exists idx_activity_events_tree_id on activity_events(tree_id);
create index if not exists idx_activity_events_action on activity_events(action);

alter table user_profiles enable row level security;
alter table activity_events enable row level security;

drop policy if exists "Authenticated users can read profiles" on user_profiles;
drop policy if exists "Users can create own profile" on user_profiles;
drop policy if exists "Users can update own profile" on user_profiles;
drop policy if exists "Authenticated users can read activity" on activity_events;
drop policy if exists "Users can record own activity" on activity_events;

create policy "Authenticated users can read profiles"
  on user_profiles for select
  to authenticated
  using (true);

create policy "Users can create own profile"
  on user_profiles for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can update own profile"
  on user_profiles for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Authenticated users can read activity"
  on activity_events for select
  to authenticated
  using (true);

create policy "Users can record own activity"
  on activity_events for insert
  to authenticated
  with check (actor_id = auth.uid());

create schema if not exists app_private;

create or replace function app_private.current_actor_name()
returns text
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select nullif(
    coalesce(
      auth.jwt()->'user_metadata'->>'display_name',
      auth.jwt()->'user_metadata'->>'full_name',
      auth.jwt()->'user_metadata'->>'name',
      (select up.display_name from public.user_profiles up where up.user_id = auth.uid()),
      split_part(coalesce(auth.jwt()->>'email', ''), '@', 1)
    ),
    ''
  );
$$;

create or replace function app_private.log_family_change()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  row_tree_id uuid;
  row_id uuid;
  audit_action text;
  audit_entity text;
begin
  if tg_op = 'DELETE' then
    row_id := old.id;
  else
    row_id := new.id;
  end if;

  if tg_table_name = 'family_trees' then
    row_tree_id := row_id;
  elsif tg_op = 'DELETE' then
    row_tree_id := old.tree_id;
  else
    row_tree_id := new.tree_id;
  end if;

  audit_entity := case tg_table_name
    when 'persons' then 'person'
    when 'relationships' then 'relationship'
    when 'family_trees' then 'family_tree'
    else tg_table_name
  end;
  audit_action := audit_entity || '_' || case tg_op
    when 'INSERT' then 'created'
    when 'UPDATE' then 'updated'
    when 'DELETE' then 'deleted'
  end;

  insert into public.activity_events (
    actor_id,
    actor_email,
    actor_name,
    action,
    entity_type,
    entity_id,
    tree_id,
    metadata
  )
  values (
    auth.uid(),
    auth.jwt()->>'email',
    app_private.current_actor_name(),
    audit_action,
    audit_entity,
    row_id,
    row_tree_id,
    jsonb_build_object(
      'old', case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
      'new', case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end
    )
  );

  return coalesce(new, old);
end;
$$;

revoke all on schema app_private from public;
revoke all on function app_private.current_actor_name() from public;
revoke all on function app_private.log_family_change() from public;

drop trigger if exists trg_audit_persons on persons;
drop trigger if exists trg_audit_relationships on relationships;
drop trigger if exists trg_audit_family_trees on family_trees;

create trigger trg_audit_persons
  after insert or update or delete on persons
  for each row execute function app_private.log_family_change();

create trigger trg_audit_relationships
  after insert or update or delete on relationships
  for each row execute function app_private.log_family_change();

create trigger trg_audit_family_trees
  after insert or update or delete on family_trees
  for each row execute function app_private.log_family_change();
