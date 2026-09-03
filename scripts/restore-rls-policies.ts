// drizzle-kit push doesn't know about Postgres RLS/policies at all - src/db/schema.ts
// has no RLS declarations, so drizzle-kit's diff always wants to DISABLE ROW LEVEL
// SECURITY and DROP every policy on the tables it manages, treating them as
// "unmanaged state" to remove. Trying to make drizzle-kit's diff match the live
// policy text exactly (so it stops wanting to touch them) is fragile - Postgres
// re-normalizes policy expressions, so even a semantically-identical declaration
// can still trigger an unwanted ALTER. Instead: this script idempotently re-applies
// the RLS/policy state documented in supabase/schema.sql after every push. Run
// automatically as part of `npm run db:push` (see package.json) - never needs to be
// run standalone unless db:push was run some other way.
//
// Same problem, same fix, for three extra indexes that exist on the live DB but
// aren't declared in src/db/schema.ts (only in supabase/schema.sql) - drizzle-kit
// drops these on every push too, for the identical "not in my schema, must be
// unmanaged" reason.
//
// Source of truth for what "correct" RLS/index state looks like: supabase/schema.sql.
// Keep the two in sync if either changes.

import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.SQL_HOST,
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DB_NAME,
  ssl: process.env.SQL_SSL === 'false'
    ? false
    : {
        rejectUnauthorized: true,
        ...(process.env.SQL_CA_CERT ? { ca: process.env.SQL_CA_CERT } : {}),
      },
});

const TABLES = [
  'users', 'tips', 'creator_stats', 'pesapal_orders',
  'payout_requests', 'scrim_lobbies', 'live_predictions', 'mux_live_streams',
];

const POLICIES: Array<{ name: string; table: string; sql: string }> = [
  { name: 'users_owner_select', table: 'users', sql: `create policy users_owner_select on public.users for select using (uid = auth.uid()::text)` },
  { name: 'users_owner_insert', table: 'users', sql: `create policy users_owner_insert on public.users for insert with check (uid = auth.uid()::text)` },
  { name: 'users_owner_update', table: 'users', sql: `create policy users_owner_update on public.users for update using (uid = auth.uid()::text) with check (uid = auth.uid()::text)` },
  { name: 'tips_authenticated_read', table: 'tips', sql: `create policy tips_authenticated_read on public.tips for select to authenticated using (true)` },
  { name: 'tips_owner_insert', table: 'tips', sql: `create policy tips_owner_insert on public.tips for insert to authenticated with check (sender_uid = auth.uid()::text)` },
  { name: 'creator_stats_owner_read', table: 'creator_stats', sql: `create policy creator_stats_owner_read on public.creator_stats for select using (user_id = auth.uid()::text)` },
  { name: 'payment_orders_owner_read', table: 'pesapal_orders', sql: `create policy payment_orders_owner_read on public.pesapal_orders for select using (user_id = auth.uid()::text or creator_id = auth.uid()::text)` },
  { name: 'payouts_owner_read', table: 'payout_requests', sql: `create policy payouts_owner_read on public.payout_requests for select using (user_id = auth.uid()::text or creator_id = auth.uid()::text)` },
  { name: 'scrim_lobbies_authenticated_read', table: 'scrim_lobbies', sql: `create policy scrim_lobbies_authenticated_read on public.scrim_lobbies for select to authenticated using (true)` },
  { name: 'live_predictions_authenticated_read', table: 'live_predictions', sql: `create policy live_predictions_authenticated_read on public.live_predictions for select to authenticated using (true)` },
  { name: 'mux_live_streams_owner_read', table: 'mux_live_streams', sql: `create policy mux_live_streams_owner_read on public.mux_live_streams for select using (creator_uid = auth.uid()::text)` },
];

const EXTRA_INDEXES: Array<{ name: string; sql: string }> = [
  { name: 'payout_requests_creator_id_idx', sql: `create index if not exists payout_requests_creator_id_idx on public.payout_requests (creator_id)` },
  { name: 'pesapal_orders_creator_id_idx', sql: `create index if not exists pesapal_orders_creator_id_idx on public.pesapal_orders (creator_id)` },
  { name: 'pesapal_orders_user_id_idx', sql: `create index if not exists pesapal_orders_user_id_idx on public.pesapal_orders (user_id)` },
];

async function main() {
  console.log('Restoring RLS + policies + indexes per supabase/schema.sql...');

  for (const table of TABLES) {
    await pool.query(`alter table public.${table} enable row level security`);
  }
  console.log(`  RLS enabled on: ${TABLES.join(', ')}`);

  for (const policy of POLICIES) {
    await pool.query(`drop policy if exists ${policy.name} on public.${policy.table}`);
    await pool.query(policy.sql);
  }
  console.log(`  ${POLICIES.length} policies (re)created.`);

  for (const idx of EXTRA_INDEXES) {
    await pool.query(idx.sql);
  }
  console.log(`  ${EXTRA_INDEXES.length} extra indexes (re)created.`);

  const { rows } = await pool.query(
    `select relname, relrowsecurity from pg_class where relnamespace = 'public'::regnamespace and relname = any($1) order by relname`,
    [TABLES]
  );
  const stillOff = rows.filter((r) => !r.relrowsecurity);
  if (stillOff.length > 0) {
    console.error('RLS did NOT take effect on:', stillOff.map((r) => r.relname).join(', '));
    process.exitCode = 1;
  } else {
    console.log('Verified: RLS is enabled on all', TABLES.length, 'tables.');
  }

  await pool.end();
}

main().catch((err) => {
  console.error('restore-rls-policies failed:', err.message);
  process.exitCode = 1;
});
