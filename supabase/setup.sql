-- Run this once in the Supabase SQL Editor (Project → SQL Editor → New query).

create table if not exists public.feeds (
  id uuid primary key default gen_random_uuid(),
  time bigint not null,        -- epoch milliseconds of the feed
  type text not null check (type in ('breast', 'bottle')),
  ml integer,                  -- amount in ml for bottle feeds; null for breast
  is_formula boolean,          -- true/false for bottle feeds; null for breast
  duration_sec integer,        -- seconds for breast feeds; null for bottle
  created_at timestamptz not null default now()
);

-- Migrating a table created before these columns existed? Run just these lines:
-- alter table public.feeds add column if not exists is_formula boolean;
-- alter table public.feeds add column if not exists duration_sec integer;

-- No login: table is open to anyone with the project's anon key.
alter table public.feeds enable row level security;

create policy "anon full access" on public.feeds
  for all
  to anon
  using (true)
  with check (true);

-- Required for the app's live cross-device sync.
alter publication supabase_realtime add table public.feeds;

-- ============================================================
-- PHASE 2: Accounts + child profiles (multi-user auth)
-- ============================================================

-- ============================================================
-- STEP 1a — Additive schema only. Safe to run with live old build.
-- This section can be run immediately, *before* deploying the new auth build.
-- The live old app sees only the columns it knows, so this is invisible to it.
-- ============================================================

create table if not exists public.children (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Baby',
  birthdate date,
  height_cm numeric,
  weight_kg numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists children_user_id_idx on public.children(user_id);

alter table public.children enable row level security;

create policy "select own children" on public.children
  for select to authenticated using (user_id = auth.uid());
create policy "insert own children" on public.children
  for insert to authenticated with check (user_id = auth.uid());
create policy "update own children" on public.children
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "delete own children" on public.children
  for delete to authenticated using (user_id = auth.uid());

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists children_set_updated_at on public.children;
create trigger children_set_updated_at
  before update on public.children
  for each row execute function public.set_updated_at();

-- Add child_id to feeds (nullable, for backfill in Step 2)
alter table public.feeds add column if not exists child_id uuid references public.children(id) on delete cascade;
create index if not exists feeds_child_id_idx on public.feeds(child_id);

-- ============================================================
-- STEP 1b — Lock down RLS policies on feeds.
-- Run this ONLY after all pre-existing feeds have been backfilled
-- with child_id (see Step 2 below). This drops the old anon policy
-- and replaces it with authenticated-only, child-scoped access.
-- Coordinate timing: run immediately before deploying the new build,
-- so the window between "old policy drops" and "new build is live" is minimal.
-- ============================================================

-- IMPORTANT: Only uncomment and run this after Step 2 migration is complete.
-- drop policy if exists "anon full access" on public.feeds;

-- create policy "select own feeds" on public.feeds
--   for select to authenticated
--   using (exists (select 1 from public.children c where c.id = child_id and c.user_id = auth.uid()));
-- create policy "insert own feeds" on public.feeds
--   for insert to authenticated
--   with check (exists (select 1 from public.children c where c.id = child_id and c.user_id = auth.uid()));
-- create policy "update own feeds" on public.feeds
--   for update to authenticated
--   using (exists (select 1 from public.children c where c.id = child_id and c.user_id = auth.uid()))
--   with check (exists (select 1 from public.children c where c.id = child_id and c.user_id = auth.uid()));
-- create policy "delete own feeds" on public.feeds
--   for delete to authenticated
--   using (exists (select 1 from public.children c where c.id = child_id and c.user_id = auth.uid()));

-- ============================================================
-- STEP 2 — One-time data migration.
-- Run this ONLY after:
--   1) Deploying the new auth-gated build, and
--   2) Creating the real user's account in the new app (via AuthScreen signup).
-- This backfills all pre-existing feeds to that user's child profile and locks child_id to NOT NULL.
-- ============================================================

-- Find YOUR_USER_ID:
--   select id from auth.users where email = 'your-email@example.com';
-- Find YOUR_CHILD_ID (after the new app auto-creates it):
--   select id, name from public.children where user_id = 'YOUR_USER_ID';
-- Then run this with your actual IDs:

-- update public.feeds
-- set child_id = 'YOUR_CHILD_ID'::uuid
-- where child_id is null;
--
-- -- Verify all rows are migrated (expect 0):
-- -- select count(*) from public.feeds where child_id is null;
--
-- -- Lock the column to prevent future unmigrated rows:
-- -- alter table public.feeds alter column child_id set not null;
