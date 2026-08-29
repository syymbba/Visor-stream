import { and, eq, sql } from 'drizzle-orm';
import { db } from './index.ts';
import { creatorStats, pesapalOrders } from './schema.ts';
import { toUSD, usdToCents, CREATOR_SHARE_RATE, PLATFORM_FEE_RATE } from '../lib/pricing.ts';
import { sumReservedPayoutUsdCents } from './payouts.ts';

interface CompletedOrderLike {
  creatorId: string | null;
  amount: string | number;
  currency: string;
  type: string;
}

function splitForOrderType(amountUSD: number, type: string): { creatorUSD: number; platformUSD: number } {
  // Tips go 100% to the creator; subscriptions/other types follow the
  // platform's standard 70/30 revenue split.
  if (type === 'tip') {
    return { creatorUSD: amountUSD, platformUSD: 0 };
  }
  return { creatorUSD: amountUSD * CREATOR_SHARE_RATE, platformUSD: amountUSD * PLATFORM_FEE_RATE };
}

/**
 * Idempotently applies a newly-COMPLETED order's earnings onto a creator's
 * running ledger (`creator_stats`), turning what used to be a full
 * `pesapal_orders` table scan on every /api/wallet/balance request into an
 * O(1) increment-on-write / read-on-request.
 *
 * IMPORTANT: callers MUST only invoke this on the transition INTO the
 * COMPLETED state (i.e. guard with `previousStatus !== 'COMPLETED'`). Calling
 * it again for an order that was already COMPLETED will double-count
 * earnings.
 */
export async function applyCompletedOrderToCreatorStats(order: CompletedOrderLike): Promise<void> {
  if (!order.creatorId) return;
  const rawAmount = typeof order.amount === 'string' ? parseFloat(order.amount) : order.amount;
  if (!Number.isFinite(rawAmount) || rawAmount <= 0) return;

  const amountUSD = toUSD(rawAmount, order.currency);
  const { creatorUSD, platformUSD } = splitForOrderType(amountUSD, order.type);

  const grossCents = usdToCents(amountUSD);
  const creatorCents = usdToCents(creatorUSD);
  const platformCents = usdToCents(platformUSD);
  const isTip = order.type === 'tip' ? 1 : 0;
  const isSubscription = order.type === 'subscription' ? 1 : 0;

  await db
    .insert(creatorStats)
    .values({
      userId: order.creatorId,
      totalGrossUsdCents: grossCents,
      totalCreatorEarningsUsdCents: creatorCents,
      totalPlatformFeesUsdCents: platformCents,
      totalTipsCount: isTip,
      totalSubscriptionsCount: isSubscription,
      completedOrdersCount: 1,
    })
    .onConflictDoUpdate({
      target: creatorStats.userId,
      set: {
        totalGrossUsdCents: sql`${creatorStats.totalGrossUsdCents} + ${grossCents}`,
        totalCreatorEarningsUsdCents: sql`${creatorStats.totalCreatorEarningsUsdCents} + ${creatorCents}`,
        totalPlatformFeesUsdCents: sql`${creatorStats.totalPlatformFeesUsdCents} + ${platformCents}`,
        totalTipsCount: sql`${creatorStats.totalTipsCount} + ${isTip}`,
        totalSubscriptionsCount: sql`${creatorStats.totalSubscriptionsCount} + ${isSubscription}`,
        completedOrdersCount: sql`${creatorStats.completedOrdersCount} + 1`,
        updatedAt: new Date(),
      },
    });
}

export interface CreatorStatsSnapshot {
  userId: string;
  totalGrossUsdCents: number;
  totalCreatorEarningsUsdCents: number;
  totalPlatformFeesUsdCents: number;
  totalTipsCount: number;
  totalSubscriptionsCount: number;
  completedOrdersCount: number;
  totalReservedPayoutUsdCents: number;
}

/**
 * Reads the creator's earnings ledger. If no ledger row exists yet (e.g. for
 * data written before this table was introduced), lazily computes it once
 * from the indexed `pesapal_orders` rows for that creator - a single,
 * correctly-filtered `WHERE creator_id = ? AND status = 'COMPLETED'` query,
 * not the previous unfiltered full-table scan - and persists it so every
 * subsequent read is O(1).
 */
export async function getOrBackfillCreatorStats(userId: string): Promise<CreatorStatsSnapshot> {
  const existing = await db
    .select()
    .from(creatorStats)
    .where(eq(creatorStats.userId, userId))
    .limit(1);
  if (existing[0]) {
    // Schema just gained `totalReservedPayoutUsdCents`. Heal existing rows
    // that still show 0 reserved while historical payouts exist, so those
    // withdrawals cannot be requested a second time.
    if ((existing[0].totalReservedPayoutUsdCents || 0) === 0) {
      const reserved = await sumReservedPayoutUsdCents(userId);
      if (reserved > 0) {
        await db
          .update(creatorStats)
          .set({ totalReservedPayoutUsdCents: reserved, updatedAt: new Date() })
          .where(eq(creatorStats.userId, userId));
        return { ...existing[0], totalReservedPayoutUsdCents: reserved };
      }
    }
    return existing[0];
  }

  const completedOrders = await db
    .select()
    .from(pesapalOrders)
    .where(and(eq(pesapalOrders.status, 'COMPLETED'), eq(pesapalOrders.creatorId, userId)));

  let totalGrossUsdCents = 0;
  let totalCreatorEarningsUsdCents = 0;
  let totalPlatformFeesUsdCents = 0;
  let totalTipsCount = 0;
  let totalSubscriptionsCount = 0;

  for (const order of completedOrders) {
    const rawAmount = parseFloat(order.amount) || 0;
    const amountUSD = toUSD(rawAmount, order.currency);
    const { creatorUSD, platformUSD } = splitForOrderType(amountUSD, order.type);
    totalGrossUsdCents += usdToCents(amountUSD);
    totalCreatorEarningsUsdCents += usdToCents(creatorUSD);
    totalPlatformFeesUsdCents += usdToCents(platformUSD);
    if (order.type === 'tip') totalTipsCount += 1;
    if (order.type === 'subscription') totalSubscriptionsCount += 1;
  }

  const totalReservedPayoutUsdCents = await sumReservedPayoutUsdCents(userId);

  const backfilled = {
    userId,
    totalGrossUsdCents,
    totalCreatorEarningsUsdCents,
    totalPlatformFeesUsdCents,
    totalTipsCount,
    totalSubscriptionsCount,
    completedOrdersCount: completedOrders.length,
    totalReservedPayoutUsdCents,
    statsBackfilledAt: new Date(),
  };

  const inserted = await db
    .insert(creatorStats)
    .values(backfilled)
    .onConflictDoUpdate({
      target: creatorStats.userId,
      set: backfilled,
    })
    .returning();

  return inserted[0] || backfilled;
}
