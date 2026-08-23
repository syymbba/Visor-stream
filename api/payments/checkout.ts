import type { IncomingMessage, ServerResponse } from 'http';
import { getPesapalConsumerKey, getPesapalConsumerSecret, getPesapalBaseUrl, getNotificationId, submitPesapalOrder } from '../../src/lib/pesapal';
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
      firstName = 'Visor',
      lastName = 'User',
    } = body || {};

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'Valid payment amount is required' });
    }

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const key = getPesapalConsumerKey();
    const secret = getPesapalConsumerSecret();

    if (!key || !secret) {
      return res.status(500).json({ error: 'Pesapal credentials missing on server.' });
    }

    const host = req.headers['host'] || 'visor-stream.vercel.app';
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const appUrl = (
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.APP_URL ||
      `${protocol}://${host}`
    ).replace(/\/$/, '');

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
      currency,
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
