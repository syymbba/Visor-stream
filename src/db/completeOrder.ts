import { eq } from 'drizzle-orm';
import { getFirestore } from 'firebase-admin/firestore';
import { db } from './index.ts';
import { pesapalOrders, tips } from './schema.ts';
import { applyCompletedOrderToCreatorStats } from './creatorStats.ts';
import { CREATOR_SHARE_RATE, PLATFORM_FEE_RATE } from '../lib/pricing.ts';

export interface PesapalStatusLike {
  amount?: number | string;
  currency?: string;
  merchant_reference?: string;
  merchantReference?: string;
  payment_method?: string;
  confirmation_code?: string;
}

export type StoredOrder = typeof pesapalOrders.$inferSelect;

const AMOUNT_TOLERANCE = 0.009;

export function validatePesapalAgainstOrder(
  order: StoredOrder,
  statusData: PesapalStatusLike,
  trackingId?: string,
): { ok: true; amount: number; currency: string } | { ok: false; reason: string } {
  const returnedReference = statusData.merchant_reference || statusData.merchantReference;
  if (returnedReference && returnedReference !== order.merchantReference) {
    return { ok: false, reason: 'merchant_reference mismatch' };
  }

  if (trackingId && order.orderTrackingId && order.orderTrackingId !== trackingId) {
    return { ok: false, reason: 'orderTrackingId mismatch' };
  }

  const returnedAmount = Number(statusData.amount);
  const storedAmount = Number(order.amount);
  if (!Number.isFinite(returnedAmount) || returnedAmount <= 0) {
    return { ok: false, reason: 'missing or non-positive Pesapal amount' };
  }
  if (!Number.isFinite(storedAmount) || Math.abs(returnedAmount - storedAmount) > AMOUNT_TOLERANCE) {
    return { ok: false, reason: 'amount mismatch' };
  }

  const returnedCurrency = String(statusData.currency || '').toUpperCase();
  const storedCurrency = String(order.currency || '').toUpperCase();
  if (returnedCurrency && storedCurrency && returnedCurrency !== storedCurrency) {
    return { ok: false, reason: 'currency mismatch' };
  }

  return { ok: true, amount: returnedAmount, currency: storedCurrency || returnedCurrency };
}

/**
 * Marks a stored Pesapal order COMPLETED and credits the creator ledger /
 * tip feed / subscription entitlement exactly once. Callers must only invoke
 * this after Pesapal reports a completed payment. Amount and currency are
 * taken from the already-validated Pesapal status, never from a missing
 * webhook field falling back to the stored order total.
 */
export async function markOrderCompletedAndCredit(
  order: StoredOrder,
  statusData: PesapalStatusLike,
  trackingId?: string,
): Promise<{ credited: boolean; reason?: string }> {
  const validated = validatePesapalAgainstOrder(order, statusData, trackingId);
  if (validated.ok === false) {
    console.warn(
      `[PESAPAL COMPLETE REJECTED] ref=${order.merchantReference} reason=${validated.reason}`,
    );
    return { credited: false, reason: validated.reason };
  }

  const wasAlreadyCompleted = order.status === 'COMPLETED';
  const creatorShare = (validated.amount * CREATOR_SHARE_RATE).toFixed(2);
  const platformShare = (validated.amount * PLATFORM_FEE_RATE).toFixed(2);

  await db
    .update(pesapalOrders)
    .set({
      status: 'COMPLETED',
      orderTrackingId: trackingId || order.orderTrackingId,
      paymentMethod: statusData.payment_method || order.paymentMethod,
      creatorEarnings: creatorShare,
      platformEarnings: platformShare,
      pesapalConfirmationCode: statusData.confirmation_code || order.pesapalConfirmationCode,
      updatedAt: new Date(),
    })
    .where(eq(pesapalOrders.id, order.id));

  if (wasAlreadyCompleted) {
    return { credited: false, reason: 'already_completed' };
  }

  if (order.type === 'tip' && order.streamId) {
    try {
      await db.insert(tips).values({
        streamId: order.streamId,
        sender: order.email?.split('@')[0] || 'Super Supporter',
        senderUid: order.userId || null,
        amount: String(validated.amount),
        currency: validated.currency,
        message: order.description || 'Super Tip via Pesapal Mobile Money',
        provider: statusData.payment_method || order.paymentMethod,
      });
    } catch (tipInsertErr) {
      console.warn('Could not insert stream tip row during payment completion:', tipInsertErr);
    }
  }

  try {
    await applyCompletedOrderToCreatorStats({
      creatorId: order.creatorId,
      amount: validated.amount,
      currency: validated.currency,
      type: order.type,
    });
  } catch (ledgerErr) {
    console.error('Failed to update creator earnings ledger during payment completion:', ledgerErr);
  }

  if (order.type === 'subscription' && order.userId && order.planId) {
    try {
      const firestore = getFirestore();
      await firestore.collection('users').doc(order.userId).set(
        {
          proGamerTier: order.planId,
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );
    } catch (tierErr) {
      console.error('Failed to grant subscription tier after payment:', tierErr);
    }
  }

  return { credited: true };
}
