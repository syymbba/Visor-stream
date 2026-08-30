-- Visor Stream: client-facing Supabase schema (queried directly by the
-- browser via @supabase/supabase-js + PostgREST, unlike supabase/schema.sql
-- which mirrors tables the trusted server accesses through a direct `pg`
-- connection that bypasses RLS entirely).
--
-- Run this once in Supabase Dashboard > SQL Editor, after schema.sql.
--
-- IMPORTANT (auth bridge): this app authenticates with Firebase, not
-- Supabase Auth, so auth.uid() only resolves inside RLS policies below if
-- Firebase is configured as a Third-Party Auth provider in this Supabase
-- project (Dashboard > Authentication > Sign In / Providers > Firebase,
-- entering the Firebase project ID from firebase-applet-config.json) AND
-- src/lib/supabase.ts is passing the Firebase ID token as the access token
-- on every request. Until that's configured, auth.uid() is null for every
-- client request and every owner-scoped policy below denies access.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- profiles: public-facing user info, keyed by Firebase Auth UID.
-- Deliberately separate from public.users (schema.sql) - that table holds
-- two_factor_secret and other server-only fields that must never be
-- reachable via PostgREST, so it has no public read policy. profiles holds
-- only what's safe to expose to any viewer.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id text primary key, -- Firebase Auth UID
  username text unique,
  display_name text,
  avatar_url text,
  banner_url text,
  bio text,
  country text,
  country_code text,
  is_verified boolean not null default false,
  subscribers_count integer not null default 0,
  mobile_money_supported boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy profiles_public_read on public.profiles
  for select using (true);
create policy profiles_owner_insert on public.profiles
  for insert with check (id = auth.uid()::text);
create policy profiles_owner_update on public.profiles
  for update using (id = auth.uid()::text) with check (id = auth.uid()::text);

-- ---------------------------------------------------------------------------
-- streams: live broadcast metadata.
-- stream_key is an RTMP ingest credential, not just "private profile data" -
-- anyone who reads it can hijack the broadcast. RLS on the base table only
-- grants the owner select/insert/update/delete, so stream_key never reaches
-- another user's queries. Public viewers read through streams_public below,
-- a view that simply never selects the column - the same column-exclusion
-- approach schema.sql already documents for two_factor_secret.
-- ---------------------------------------------------------------------------
create table if not exists public.streams (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.profiles (id) on delete cascade,
  stream_key text not null unique default encode(gen_random_bytes(24), 'hex'),
  title text not null,
  description text,
  thumbnail_url text,
  game text,
  category text,
  status text not null default 'offline' check (status in ('live', 'offline', 'ended')),
  viewer_count integer not null default 0,
  started_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists streams_user_id_idx on public.streams (user_id);
create index if not exists streams_status_idx on public.streams (status) where status = 'live';

alter table public.streams enable row level security;

create policy streams_owner_select on public.streams
  for select using (user_id = auth.uid()::text);
create policy streams_owner_insert on public.streams
  for insert with check (user_id = auth.uid()::text);
create policy streams_owner_update on public.streams
  for update using (user_id = auth.uid()::text) with check (user_id = auth.uid()::text);
create policy streams_owner_delete on public.streams
  for delete using (user_id = auth.uid()::text);

-- No stream_key column - safe to expose to anyone. View uses definer
-- privileges by default (security_invoker is left off), so its WHERE
-- clause is the access gate, not the caller's row-level policies above.
create or replace view public.streams_public as
select
  id, user_id, title, description, thumbnail_url, game, category,
  status, viewer_count, started_at, created_at
from public.streams
where status = 'live';

grant select on public.streams_public to anon, authenticated;

-- ---------------------------------------------------------------------------
-- videos: uploaded VOD media.
-- No secret-equivalent column here, so (unlike streams) a straightforward
-- public row-select policy is enough: Postgres OR-combines permissive
-- policies for the same command, so a request sees rows where it owns the
-- video OR the video is published - no view needed.
-- ---------------------------------------------------------------------------
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  video_url text not null,
  thumbnail_url text,
  duration_seconds integer,
  views_count integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists videos_user_id_idx on public.videos (user_id);
create index if not exists videos_published_idx on public.videos (is_published) where is_published = true;

alter table public.videos enable row level security;

create policy videos_owner_select on public.videos
  for select using (user_id = auth.uid()::text);
create policy videos_public_read on public.videos
  for select using (is_published = true);
create policy videos_owner_insert on public.videos
  for insert with check (user_id = auth.uid()::text);
create policy videos_owner_update on public.videos
  for update using (user_id = auth.uid()::text) with check (user_id = auth.uid()::text);
create policy videos_owner_delete on public.videos
  for delete using (user_id = auth.uid()::text);

-- ---------------------------------------------------------------------------
-- transactions: READ-ONLY ledger view over the tables the trusted server
-- already writes (public.pesapal_orders, public.tips - see schema.sql).
-- Deliberately not a table: those rows are only ever created by server.ts
-- after a verified Pesapal IPN callback, so the client must never be able
-- to insert/update a "transaction" directly - that would let it forge a
-- completed payment. security_invoker = on makes this view enforce each
-- underlying table's own RLS as the calling user, rather than the view
-- owner's - so it can't accidentally expose more than pesapal_orders /
-- tips already allow on their own.
-- ---------------------------------------------------------------------------
create or replace view public.transactions
  with (security_invoker = on)
as
select
  'pesapal_' || id::text as id,
  'pesapal' as source,
  type,
  user_id,
  creator_id,
  amount,
  currency,
  status,
  created_at
from public.pesapal_orders
union all
select
  'tip_' || id::text as id,
  'tip' as source,
  'tip' as type,
  sender_uid as user_id,
  null as creator_id,
  amount,
  currency,
  'COMPLETED' as status,
  created_at
from public.tips;

grant select on public.transactions to authenticated;
