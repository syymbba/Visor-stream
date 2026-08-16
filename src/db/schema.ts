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
