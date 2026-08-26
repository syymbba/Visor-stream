import type { IncomingMessage, ServerResponse } from 'http';
import { getPesapalConsumerKey, getPesapalConsumerSecret, getPesapalBaseUrl, getNotificationId, submitPesapalOrder, getAppUrl } from '../../src/lib/pesapal';
import { authenticateApiRequest, setPrivateCors } from '../_auth';

export default async function handler(req: any, res: any) {
  // Set explicit JSON header and CORS
  res.setHeader('Content-Type', 'application/json');
  setPrivateCors(req, res);
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const user = await authenticateApiRequest(req, res);
  if (!user) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        return res.status(400).json({ error: 'Malformed JSON payload' });
      }
    }

    const {
      amount,
      currency = 'UGX',
      email = 'customer@visorstream.com',
      phone = '',
      provider,
      creatorId = 'me',
      streamId,
      type = 'subscription',
      planId,
      description,
      userId,
      firstName = 'Visor',
      lastName = 'User',
    } = body || {};

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'Valid payment amount is required' });
    }

    const normalizedCurrency = String(currency).toUpperCase();
    if (!['UGX', 'KES', 'TZS', 'USD'].includes(normalizedCurrency)) {
      return res.status(400).json({ error: 'Unsupported currency' });
    }
    if (!['subscription', 'tip', 'topup'].includes(type)) {
      return res.status(400).json({ error: 'Unsupported payment type' });
    }
    if (type === 'subscription') {
      const planPricesUSD: Record<string, number> = { fan: 2, pro: 5, legend: 10 };
      const currencyRates: Record<string, number> = { UGX: 3750, KES: 130, TZS: 2600, USD: 1 };
      const expectedAmount = planPricesUSD[String(planId)] === undefined
        ? undefined
        : Math.round(planPricesUSD[String(planId)] * currencyRates[normalizedCurrency]);
      if (expectedAmount === undefined || numAmount !== expectedAmount) {
        return res.status(400).json({ error: 'Invalid subscription plan or price' });
      }
    }

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const key = getPesapalConsumerKey();
    const secret = getPesapalConsumerSecret();

    if (!key || !secret) {
      return res.status(500).json({ error: 'Pesapal credentials missing on server.' });
    }

    const appUrl = getAppUrl();

    const callbackUrl = `${appUrl}/api/payments/callback`;
    const merchantReference = `VSR-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    let notificationId = process.env.PESAPAL_NOTIFICATION_ID || '';
    if (!notificationId) {
      try {
        notificationId = await getNotificationId(appUrl);
      } catch (err) {
        console.warn('IPN resolution error:', err);
      }
    }

    const pesapalRes = await submitPesapalOrder({
      merchantReference,
      amount: numAmount,
      currency: normalizedCurrency,
      description: description || `Visor Stream ${type === 'tip' ? 'Live Tip' : 'Subscription'}`,
      callbackUrl,
      notificationId,
      email,
      phone,
      firstName,
      lastName,
    });

    return res.status(200).json({
      success: true,
      redirectUrl: pesapalRes.redirect_url,
      orderTrackingId: pesapalRes.order_tracking_id,
      merchantReference,
    });
  } catch (error: any) {
    console.error('Vercel API Checkout Handler Error:', error);
    return res.status(500).json({ error: error.message || 'Payment initiation failed' });
  }
}
