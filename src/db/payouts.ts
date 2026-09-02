import { and, eq, inArray, sql } from 'drizzle-orm';
import { db } from './index.ts';
import { creatorStats, payoutRequests } from './schema.ts';
import { centsToUsd, usdToCents } from '../lib/pricing.ts';

const RESERVED_PAYOUT_STATUSES = ['PENDING', 'PROCESSING', 'COMPLETED'] as const;

export function availableBalanceUsd(stats: {
  totalCreatorEarningsUsdCents: number;
  totalReservedPayoutUsdCents?: number | null;
}): number {
  const earnings = stats.totalCreatorEarningsUsdCents || 0;
  const reserved = stats.totalReservedPayoutUsdCents || 0;
  return centsToUsd(Math.max(0, earnings - reserved));
}

export async function sumReservedPayoutUsdCents(userId: string): Promise<number> {
  const rows = await db
    .select({
      amountUsd: payoutRequests.amountUsd,
    })
    .from(payoutRequests)
    .where(
      and(
        eq(payoutRequests.creatorId, userId),
        inArray(payoutRequests.status, [...RESERVED_PAYOUT_STATUSES]),
      ),
    );

  return rows.reduce((sum, row) => sum + usdToCents(Number(row.amountUsd) || 0), 0);
}

export type PayoutInsertValues = typeof payoutRequests.$inferInsert;

export async function reservePayoutAndInsert(args: {
  userId: string;
  amountUSD: number;
  payoutValues: PayoutInsertValues;
}): Promise<
  | { ok: true; inserted: typeof payoutRequests.$inferSelect }
  | { ok: false; error: string; availableUSD: number }
> {
  const requestedCents = usdToCents(args.amountUSD);
  if (requestedCents <= 0) {
    return { ok: false, error: 'Invalid payout amount.', availableUSD: 0 };
  }

  return db.transaction(async (tx) => {
    await tx
      .insert(creatorStats)
      .values({ userId: args.userId })
      .onConflictDoNothing();

    await tx.execute(sql`SELECT 1 FROM creator_stats WHERE user_id = ${args.userId} FOR UPDATE`);

    const locked = await tx
      .select()
      .from(creatorStats)
      .where(eq(creatorStats.userId, args.userId))
      .limit(1);
    const stats = locked[0];
    if (!stats) {
      return { ok: false as const, error: 'Unable to lock creator earnings ledger.', availableUSD: 0 };
    }

    const availableCents = Math.max(
      0,
      (stats.totalCreatorEarningsUsdCents || 0) - (stats.totalReservedPayoutUsdCents || 0),
    );
    if (requestedCents > availableCents) {
      return {
        ok: false as const,
        error: `Requested payout exceeds available balance ($${centsToUsd(availableCents).toFixed(2)} USD).`,
        availableUSD: centsToUsd(availableCents),
      };
    }

    await tx
      .update(creatorStats)
      .set({
        totalReservedPayoutUsdCents: sql`${creatorStats.totalReservedPayoutUsdCents} + ${requestedCents}`,
        updatedAt: new Date(),
      })
      .where(eq(creatorStats.userId, args.userId));

    const rows = await tx.insert(payoutRequests).values(args.payoutValues).returning();
    return { ok: true as const, inserted: rows[0] };
  });
}

// Inverse of reservePayoutAndInsert's reservation bookkeeping: decrements
// totalReservedPayoutUsdCents when a payout transitions to FAILED, so the
// creator's available balance reflects that the reserved funds never left
// the platform. Never call this for COMPLETED payouts - those funds stay
// reserved permanently since they've actually been disbursed (see the
// schema comment on creatorStats.totalReservedPayoutUsdCents).
export async function releaseReservedPayout(args: {
  userId: string;
  amountUSD: number;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const releasedCents = usdToCents(args.amountUSD);
  if (releasedCents <= 0) {
    return { ok: false, error: 'Invalid payout amount.' };
  }

  return db.transaction(async (tx) => {
    await tx.execute(sql`SELECT 1 FROM creator_stats WHERE user_id = ${args.userId} FOR UPDATE`);

    const locked = await tx
      .select()
      .from(creatorStats)
      .where(eq(creatorStats.userId, args.userId))
      .limit(1);
    const stats = locked[0];
    if (!stats) {
      return { ok: false as const, error: 'Unable to lock creator earnings ledger.' };
    }

    await tx
      .update(creatorStats)
      .set({
        // GREATEST guards against ever going negative, mirroring the
        // Math.max(0, ...) clamp used when computing available balance.
        totalReservedPayoutUsdCents: sql`GREATEST(0, ${creatorStats.totalReservedPayoutUsdCents} - ${releasedCents})`,
        updatedAt: new Date(),
      })
      .where(eq(creatorStats.userId, args.userId));

    return { ok: true as const };
  });
}
