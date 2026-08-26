import { getPesapalTransactionStatus } from '../../src/lib/pesapal';
import { db } from '../../src/db';
import { pesapalOrders } from '../../src/db/schema';
import { eq } from 'drizzle-orm';
import { authenticateApiRequest, setPrivateCors } from '../_auth';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  setPrivateCors(req, res);

  const user = await authenticateApiRequest(req, res);
  if (!user) return;

  try {
    const trackingId = (req.query.id || req.query.trackingId || req.query.orderTrackingId || req.query.OrderTrackingId) as string;

    if (!trackingId) {
      return res.status(400).json({ error: 'Missing orderTrackingId parameter' });
    }

    let dbOrder = null;
    try {
      const orderRows = await db
        .select()
        .from(pesapalOrders)
        .where(eq(pesapalOrders.orderTrackingId, trackingId))
        .limit(1);
      dbOrder = orderRows[0] || null;
    } catch (dbErr) {
      console.warn('DB lookup error:', dbErr);
    }

    if (!dbOrder || (dbOrder.userId !== user.uid && dbOrder.creatorId !== user.uid)) {
      return res.status(404).json({ error: 'Payment order not found' });
    }

    let pesapalStatus: any = null;
    try {
      pesapalStatus = await getPesapalTransactionStatus(trackingId);
    } catch (statusErr) {
      console.warn('Remote status check error:', statusErr);
    }

    return res.status(200).json({
      success: true,
      order: dbOrder,
      status: pesapalStatus || (dbOrder ? { payment_status_description: dbOrder.status } : null),
    });
  } catch (err: any) {
    console.error('Status Handler Error:', err);
    return res.status(500).json({ error: err.message || 'Failed to check status' });
  }
}
