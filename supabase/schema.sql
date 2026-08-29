-- Visor Stream PostgreSQL schema for Supabase.
-- Run this once in Supabase Dashboard > SQL Editor.
--
-- SOURCE OF TRUTH: src/db/schema.ts (Drizzle) is what the running server
-- actually uses (via `npm run db:push`). This file is a hand-maintained
-- mirror for provisioning a fresh Supabase Postgres instance / documenting
-- the RLS policies; whenever a column is added to schema.ts, mirror it here
-- too so the two don't drift apart.
--
-- NOTE: the running server (src/db/index.ts) connects with a direct `pg`
-- connection string (SQL_HOST/SQL_USER/SQL_PASSWORD), not the Supabase
-- client/PostgREST, so the RLS policies below are not currently in the
-- request path. If Supabase's client/PostgREST access to `public.users` is
-- ever enabled, the `two_factor_secret` / `two_factor_pending_secret`
-- columns MUST be excluded from whatever the client can select/update
-- (e.g. via column-level REVOKE or a restricted view) - they are meant to be
-- readable/writable only by the trusted backend via /api/auth/2fa/*, never
-- directly by the row's own owner, or a compromised session could read its
-- own TOTP secret and bypass 2FA verification entirely.

create table if not exists public.users (
  id serial primary key,
  uid text not null unique,
  email text not null,
  display_name text,
  gamer_tag text,
  photo_url text,
  bio text,
  currency text default 'USD',
  momo_phone text,
  momo_provider text,
  data_saver text default 'auto',
  two_factor_enabled boolean not null default false,
  two_factor_secret text,
  two_factor_pending_secret text,
  two_factor_enabled_at timestamp,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table if not exists public.tips (
  id serial primary key,
  stream_id text not null,
  sender text not null,
  sender_uid text,
  amount text not null,
  currency text not null,
  message text,
  provider text,
  created_at timestamp default now()
);

-- Also doubles as an incremental per-creator earnings ledger (see
-- src/db/creatorStats.ts) so /api/wallet/balance reads are O(1) instead of
-- scanning every completed order on the platform. Monetary aggregates are
-- stored in integer USD cents to avoid floating point drift.
create table if not exists public.creator_stats (
  id serial primary key,
  user_id text not null unique,
  stream_title text,
  stream_key text,
  revenue_this_month_usd integer default 0,
  subscribers_count integer default 0,
  total_gross_usd_cents integer not null default 0,
  total_creator_earnings_usd_cents integer not null default 0,
  total_platform_fees_usd_cents integer not null default 0,
  total_tips_count integer not null default 0,
  total_subscriptions_count integer not null default 0,
  completed_orders_count integer not null default 0,
  total_reserved_payout_usd_cents integer not null default 0,
  stats_backfilled_at timestamp,
  updated_at timestamp default now()
);

create table if not exists public.pesapal_orders (
  id serial primary key,
  merchant_reference text not null unique,
  order_tracking_id text,
  type text not null,
  plan_id text,
  user_id text,
  creator_id text,
  stream_id text,
  amount text not null,
  currency text not null,
  status text not null default 'PENDING',
  payment_method text,
  description text,
  email text,
  phone text,
  creator_earnings text,
  platform_earnings text,
  pesapal_confirmation_code text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table if not exists public.payout_requests (
  id serial primary key,
  reference text not null unique,
  user_id text not null,
  creator_id text not null,
  amount_usd text not null,
  local_amount text not null,
  currency text not null,
  provider text not null,
  phone text not null,
  recipient_name text not null,
  fee_usd text not null default '0',
  net_payout_usd text not null,
  status text not null default 'PENDING',
  kyc_tier text default 'Tier 2 (Verified)',
  receipt_number text,
  notes text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table if not exists public.scrim_lobbies (
  id serial primary key,
  lobby_code text not null unique,
  title text not null,
  game text not null,
  format text not null,
  host_user_id text not null,
  host_name text not null,
  max_teams integer not null default 8,
  current_teams integer not null default 1,
  entry_fee text default 'Free',
  prize_pool_usd text default '50',
  status text not null default 'OPEN',
  server_region text default 'Kampala East-1',
  created_at timestamp default now()
);

create table if not exists public.live_predictions (
  id serial primary key,
  stream_id text not null,
  question text not null,
  option_a text not null,
  option_b text not null,
  pool_a integer default 0,
  pool_b integer default 0,
  status text not null default 'ACTIVE',
  winning_option text,
  total_participants integer default 0,
  created_at timestamp default now()
);

create index if not exists pesapal_orders_user_id_idx on public.pesapal_orders (user_id);
create index if not exists pesapal_orders_creator_id_idx on public.pesapal_orders (creator_id);
create index if not exists pesapal_orders_user_created_idx on public.pesapal_orders (user_id, created_at);
create index if not exists pesapal_orders_creator_status_idx on public.pesapal_orders (creator_id, status);
create index if not exists pesapal_orders_tracking_idx on public.pesapal_orders (order_tracking_id);
create index if not exists payout_requests_creator_id_idx on public.payout_requests (creator_id);
create index if not exists payout_requests_creator_status_idx on public.payout_requests (creator_id, status);
create index if not exists payout_requests_user_created_idx on public.payout_requests (user_id, created_at);
create index if not exists tips_stream_created_idx on public.tips (stream_id, created_at);

-- Keep direct Supabase API access isolated to the authenticated owner.
alter table public.users enable row level security;
alter table public.tips enable row level security;
alter table public.creator_stats enable row level security;
alter table public.pesapal_orders enable row level security;
alter table public.payout_requests enable row level security;
alter table public.scrim_lobbies enable row level security;
alter table public.live_predictions enable row level security;

create policy users_owner_select on public.users
  for select using (uid = auth.uid()::text);
create policy users_owner_insert on public.users
  for insert with check (uid = auth.uid()::text);
create policy users_owner_update on public.users
  for update using (uid = auth.uid()::text) with check (uid = auth.uid()::text);

create policy tips_authenticated_read on public.tips
  for select to authenticated using (true);
create policy tips_owner_insert on public.tips
  for insert to authenticated with check (sender_uid = auth.uid()::text);

create policy creator_stats_owner_read on public.creator_stats
  for select using (user_id = auth.uid()::text);
create policy payment_orders_owner_read on public.pesapal_orders
  for select using (user_id = auth.uid()::text or creator_id = auth.uid()::text);
create policy payouts_owner_read on public.payout_requests
  for select using (user_id = auth.uid()::text or creator_id = auth.uid()::text);

create policy scrim_lobbies_authenticated_read on public.scrim_lobbies
  for select to authenticated using (true);
create policy live_predictions_authenticated_read on public.live_predictions
  for select to authenticated using (true);
