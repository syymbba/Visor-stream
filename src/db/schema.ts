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

