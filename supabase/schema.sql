-- Visor Stream PostgreSQL schema for Supabase.
-- Run this once in Supabase Dashboard > SQL Editor.

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

create table if not exists public.creator_stats (
  id serial primary key,
  user_id text not null,
  stream_title text,
  stream_key text,
  revenue_this_month_usd integer default 0,
  subscribers_count integer default 0,
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
create index if not exists payout_requests_creator_id_idx on public.payout_requests (creator_id);
