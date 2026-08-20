import { db } from '../../src/db';
import { pesapalOrders } from '../../src/db/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    let completedOrders: any[] = [];
    try {
      completedOrders = await db
        .select()
        .from(pesapalOrders)
        .where(eq(pesapalOrders.status, 'COMPLETED'));
    } catch (dbErr) {
      console.warn('DB fetch error for balance:', dbErr);
    }

    const toUSD = (amt: number, curr: string): number => {
      const c = (curr || 'UGX').toUpperCase();
      if (c === 'USD') return amt;
      if (c === 'UGX') return amt / 3750;
      if (c === 'KES') return amt / 130;
      if (c === 'TZS') return amt / 2600;
      return amt / 3750;
    };

    let totalGrossUSD = 0;
    let totalCreatorEarningsUSD = 0;
    let totalPlatformFeesUSD = 0;
    let completedTipsCount = 0;
    let completedSubsCount = 0;

    completedOrders.forEach((order) => {
      const rawAmt = parseFloat(order.amount) || 0;
      const amtUSD = toUSD(rawAmt, order.currency);
      totalGrossUSD += amtUSD;

      if (order.type === 'subscription') {
        completedSubsCount += 1;
        totalCreatorEarningsUSD += amtUSD * 0.7;
        totalPlatformFeesUSD += amtUSD * 0.3;
      } else if (order.type === 'tip') {
        completedTipsCount += 1;
        totalCreatorEarningsUSD += amtUSD;
      } else {
        totalCreatorEarningsUSD += amtUSD * 0.7;
        totalPlatformFeesUSD += amtUSD * 0.3;
      }
    });

    const netBalanceUSD = Math.max(0, Math.round(totalCreatorEarningsUSD * 100) / 100);

    return res.status(200).json({
      success: true,
      balanceUSD: netBalanceUSD,
      balanceUGX: Math.round(netBalanceUSD * 3750),
      balanceKES: Math.round(netBalanceUSD * 130),
      balanceTZS: Math.round(netBalanceUSD * 2600),
      totalRevenueUSD: Math.round(totalGrossUSD * 100) / 100,
      creatorEarningsUSD: netBalanceUSD,
      platformFeesUSD: Math.round(totalPlatformFeesUSD * 100) / 100,
      totalSubscribers: completedSubsCount,
      totalTipsCount: completedTipsCount,
      completedOrdersCount: completedOrders.length,
      currencyRates: {
        UGX: 3750,
        KES: 130,
        TZS: 2600,
        USD: 1,
      },
    });
  } catch (error: any) {
    console.error('Wallet Balance API Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to calculate balance' });
  }
}
