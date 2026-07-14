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
