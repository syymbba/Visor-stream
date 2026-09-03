import { pgTable, serial, text, timestamp, integer, boolean, index } from 'drizzle-orm/pg-core';

// Users table (maps Firebase Auth UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name'),
  gamerTag: text('gamer_tag'),
  photoUrl: text('photo_url'),
  bio: text('bio'),
  currency: text('currency').default('USD'),
  momoPhone: text('momo_phone'),
  momoProvider: text('momo_provider'),
  dataSaver: text('data_saver').default('auto'),
  // Server-authoritative TOTP-based two-factor auth. Never exposed to or
  // writable by the client directly - only via the /api/auth/2fa/* endpoints.
  twoFactorEnabled: boolean('two_factor_enabled').notNull().default(false),
  twoFactorSecret: text('two_factor_secret'),
  twoFactorPendingSecret: text('two_factor_pending_secret'),
  twoFactorEnabledAt: timestamp('two_factor_enabled_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Stream tips and donations
export const tips = pgTable('tips', {
  id: serial('id').primaryKey(),
  streamId: text('stream_id').notNull(),
  sender: text('sender').notNull(),
  senderUid: text('sender_uid'),
  amount: text('amount').notNull(),
  currency: text('currency').notNull(),
  message: text('message'),
  provider: text('provider'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('tips_stream_created_idx').on(table.streamId, table.createdAt),
]);

// Creator stream dashboard stats & telemetry.
//
// This also doubles as an incremental earnings ledger for /api/wallet/balance:
// rather than re-scanning every pesapal_orders row on every balance check
// (O(all orders) per request), completed orders increment these counters once,
// at the moment they transition to COMPLETED, so reads are O(1). All monetary
// aggregates are stored in integer USD cents to avoid floating point drift.
export const creatorStats = pgTable('creator_stats', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().unique(),
  streamTitle: text('stream_title'),
  streamKey: text('stream_key'),
  revenueThisMonthUsd: integer('revenue_this_month_usd').default(0),
  subscribersCount: integer('subscribers_count').default(0),
  totalGrossUsdCents: integer('total_gross_usd_cents').notNull().default(0),
  totalCreatorEarningsUsdCents: integer('total_creator_earnings_usd_cents').notNull().default(0),
  totalPlatformFeesUsdCents: integer('total_platform_fees_usd_cents').notNull().default(0),
  totalTipsCount: integer('total_tips_count').notNull().default(0),
  totalSubscriptionsCount: integer('total_subscriptions_count').notNull().default(0),
  completedOrdersCount: integer('completed_orders_count').notNull().default(0),
  // Reserved as soon as a payout is requested (PENDING/PROCESSING) and kept
  // reserved after COMPLETED so those earnings can never be withdrawn again.
  // FAILED/CANCELLED payouts must decrement this (see reservePayoutAndInsert).
  totalReservedPayoutUsdCents: integer('total_reserved_payout_usd_cents').notNull().default(0),
  statsBackfilledAt: timestamp('stats_backfilled_at'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Pesapal v3 Orders and Transaction Records (70/30 Split Tracking)
export const pesapalOrders = pgTable('pesapal_orders', {
  id: serial('id').primaryKey(),
  merchantReference: text('merchant_reference').notNull().unique(),
  orderTrackingId: text('order_tracking_id'),
  type: text('type').notNull(), // 'subscription' | 'tip'
  planId: text('plan_id'),
  userId: text('user_id'),
  creatorId: text('creator_id'),
  streamId: text('stream_id'),
  amount: text('amount').notNull(),
  currency: text('currency').notNull(),
  status: text('status').notNull().default('PENDING'), // 'PENDING' | 'COMPLETED' | 'FAILED' | 'INVALID'
  paymentMethod: text('payment_method'),
  description: text('description'),
  email: text('email'),
  phone: text('phone'),
  creatorEarnings: text('creator_earnings'), // 70% share
  platformEarnings: text('platform_earnings'), // 30% share
  pesapalConfirmationCode: text('pesapal_confirmation_code'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('pesapal_orders_user_created_idx').on(table.userId, table.createdAt),
  index('pesapal_orders_creator_status_idx').on(table.creatorId, table.status),
  index('pesapal_orders_tracking_idx').on(table.orderTrackingId),
]);

// Creator Payout & Mobile Money Withdrawal Requests
export const payoutRequests = pgTable('payout_requests', {
  id: serial('id').primaryKey(),
  reference: text('reference').notNull().unique(),
  userId: text('user_id').notNull(),
  creatorId: text('creator_id').notNull(),
  amountUsd: text('amount_usd').notNull(),
  localAmount: text('local_amount').notNull(),
  currency: text('currency').notNull(),
  provider: text('provider').notNull(), // 'MTN MoMo' | 'Airtel Money' | 'M-Pesa' | 'Bank'
  phone: text('phone').notNull(),
  recipientName: text('recipient_name').notNull(),
  feeUsd: text('fee_usd').notNull().default('0'),
  netPayoutUsd: text('net_payout_usd').notNull(),
  status: text('status').notNull().default('PENDING'), // 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  kycTier: text('kyc_tier').default('Tier 2 (Verified)'),
  receiptNumber: text('receipt_number'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('payout_requests_creator_status_idx').on(table.creatorId, table.status),
  index('payout_requests_user_created_idx').on(table.userId, table.createdAt),
]);

// Community Scrim Lobbies & Custom Matches
export const scrimLobbies = pgTable('scrim_lobbies', {
  id: serial('id').primaryKey(),
  lobbyCode: text('lobby_code').notNull().unique(),
  title: text('title').notNull(),
  game: text('game').notNull(), // 'Free Fire' | 'EA FC 24' | 'PUBG Mobile' | 'COD Mobile'
  format: text('format').notNull(), // '4v4 Squads' | '1v1 Knockout' | 'Battle Royale'
  hostUserId: text('host_user_id').notNull(),
  hostName: text('host_name').notNull(),
  maxTeams: integer('max_teams').notNull().default(8),
  currentTeams: integer('current_teams').notNull().default(1),
  entryFee: text('entry_fee').default('Free'),
  prizePoolUsd: text('prize_pool_usd').default('50'),
  status: text('status').notNull().default('OPEN'), // 'OPEN' | 'IN_PROGRESS' | 'COMPLETED'
  serverRegion: text('server_region').default('Kampala East-1'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Creator Live Streams (Mux Live Streams backend). One persistent live
// stream per creator (created once via GET /api/streams/me, key
// regenerable) rather than a new stream resource per broadcast.
//
// Table name is `mux_live_streams`, NOT `streams` - a pre-existing,
// differently-shaped `public.streams` table (uuid PK, user_id/stream_key
// columns, RLS policies) already exists in this database from
// supabase/client_schema.sql, a separate, currently-unwired direct-client
// schema. Keeping this JS export named `streams` for code ergonomics since
// nothing in this codebase imports the client_schema.sql tables.
export const streams = pgTable('mux_live_streams', {
  id: serial('id').primaryKey(),
  creatorUid: text('creator_uid').notNull().unique(),
  muxLiveStreamId: text('mux_live_stream_id').notNull().unique(),
  // Server-only secret, never returned except to the owning creator.
  muxStreamKey: text('mux_stream_key').notNull(),
  muxPlaybackId: text('mux_playback_id'),
  status: text('status').notNull().default('idle'), // 'idle' | 'active' | 'disabled'
  title: text('title'),
  game: text('game'),
  // Real, Mux-backed per-live-stream latency setting (LiveStreamUpdateParams
  // `latency_mode`), applied via mux.video.liveStreams.update() in PATCH
  // /api/streams/me. Unlike a client-side OBS bitrate cap, this genuinely
  // changes stream playback behavior on Mux's side.
  latencyMode: text('latency_mode').default('standard'), // 'low' | 'reduced' | 'standard'
  lastLiveAt: timestamp('last_live_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('mux_live_streams_status_idx').on(table.status),
]);

// Live Match Community Predictions
export const livePredictions = pgTable('live_predictions', {
  id: serial('id').primaryKey(),
  streamId: text('stream_id').notNull(),
  question: text('question').notNull(),
  optionA: text('option_a').notNull(),
  optionB: text('option_b').notNull(),
  poolA: integer('pool_a').default(0),
  poolB: integer('pool_b').default(0),
  status: text('status').notNull().default('ACTIVE'), // 'ACTIVE' | 'LOCKED' | 'RESOLVED'
  winningOption: text('winning_option'),
  totalParticipants: integer('total_participants').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});


