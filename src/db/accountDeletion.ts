import { and, eq, inArray, or } from 'drizzle-orm';
import { db } from './index.ts';
import { creatorStats, payoutRequests, tips, users } from './schema.ts';

// Payout statuses that mean money is still in flight - an account can't be
// deleted while one of these is outstanding (see reservePayoutAndInsert /
// releaseReservedPayout in payouts.ts for the reservation bookkeeping this
// would otherwise orphan).
const NON_TERMINAL_PAYOUT_STATUSES = ['PENDING', 'PROCESSING'] as const;

/**
 * Cascading-deletes a user's Postgres footprint, mirroring the ownership
 * fields used everywhere else in this codebase (`/api/payouts/history`,
 * `/api/payouts/request`, etc.), where `payoutRequests.userId` is always the
 * requesting account's uid.
 *
 * Order of operations, and why:
 *   1. Refuse if a non-terminal payout (PENDING/PROCESSING) exists - don't
 *      delete an account with money mid-disbursement; the admin lifecycle in
 *      server.ts (`/api/payouts/:reference/admin-update`) has nowhere to
 *      land a status update on a payout whose owning account is gone.
 *   2. Delete payoutRequests rows for this uid (only terminal-status rows
 *      remain once step 1 has passed).
 *   3. Delete the creatorStats row (dashboard stats / earnings ledger).
 *   4. Null out tips.senderUid on rows sent by this uid - the tip rows
 *      themselves stay, since they belong to the recipient creator's
 *      ledger/history, not the sender's.
 *   5. pesapalOrders rows are intentionally left untouched (not deleted, not
 *      anonymized). They're a financial audit trail; whether/how to redact
 *      PII on them after account deletion is a retention-policy decision
 *      that's explicitly out of scope here.
 *   6. Delete the `users` row last.
 *
 * Wrapped in a single transaction (matching the pattern already used in
 * `payouts.ts`'s reservePayoutAndInsert/releaseReservedPayout for
 * multi-statement sequential writes) so a failure partway through doesn't
 * leave the account half-deleted.
 */
export async function deleteAccountData(
  uid: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!uid) {
    return { ok: false, error: 'invalid_uid' };
  }

  return db.transaction(async (tx) => {
    const outstanding = await tx
      .select({ id: payoutRequests.id })
      .from(payoutRequests)
      .where(
        and(
          or(
            eq(payoutRequests.userId, uid),
            eq(payoutRequests.creatorId, uid),
          ),
          inArray(payoutRequests.status, [...NON_TERMINAL_PAYOUT_STATUSES]),
        ),
      )
      .limit(1);

    if (outstanding.length > 0) {
      return { ok: false as const, error: 'pending_payout' };
    }

    await tx
      .delete(payoutRequests)
      .where(
        or(
          eq(payoutRequests.userId, uid),
          eq(payoutRequests.creatorId, uid),
        ),
      );

    await tx.delete(creatorStats).where(eq(creatorStats.userId, uid));

    await tx
      .update(tips)
      .set({ senderUid: null })
      .where(eq(tips.senderUid, uid));

    // pesapalOrders: deliberately untouched - see doc comment above.

    await tx.delete(users).where(eq(users.uid, uid));

    return { ok: true as const };
  });
}
