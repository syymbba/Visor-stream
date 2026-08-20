import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';

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
});

// Creator stream dashboard stats & telemetry
export const creatorStats = pgTable('creator_stats', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  streamTitle: text('stream_title'),
  streamKey: text('stream_key'),
  revenueThisMonthUsd: integer('revenue_this_month_usd').default(0),
  subscribersCount: integer('subscribers_count').default(0),
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
});

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
  status: text('status').notNull().default('COMPLETED'), // 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  kycTier: text('kyc_tier').default('Tier 2 (Verified)'),
  receiptNumber: text('receipt_number'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

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


