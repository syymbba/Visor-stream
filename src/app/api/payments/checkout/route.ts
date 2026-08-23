import { getPesapalBaseUrl, getPesapalConsumerKey, getPesapalConsumerSecret, getNotificationId, submitPesapalOrder } from '../../../../lib/pesapal';
import { adminAuth } from '../../../../lib/firebase-admin';

// Explicit JSON Response Helper
function jsonResponse(data: any, status = 200) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
  };
  const configuredOrigin = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (configuredOrigin) headers['Access-Control-Allow-Origin'] = configuredOrigin;
  return new Response(JSON.stringify(data), {
    status,
    headers,
  });
}

export async function OPTIONS() {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
  };
  const configuredOrigin = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (configuredOrigin) headers['Access-Control-Allow-Origin'] = configuredOrigin;
  return new Response(null, {
    status: 204,
    headers,
  });
}

export async function POST(req: Request) {
  try {
    const authorization = req.headers.get('authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }
    const user = await adminAuth.verifyIdToken(authorization.slice('Bearer '.length));
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: 'Invalid JSON request body' }, 400);
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
      userId: user.uid,
      firstName = 'Visor',
      lastName = 'User',
    } = body || {};

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return jsonResponse({ error: 'Valid payment amount is required' }, 400);
    }

    if (!email) {
      return jsonResponse({ error: 'Customer email is required' }, 400);
    }

    const key = getPesapalConsumerKey();
    const secret = getPesapalConsumerSecret();
    const baseUrl = getPesapalBaseUrl();

    if (!key || !secret) {
      return jsonResponse(
        { error: 'Pesapal payment gateway credentials not configured on server.' },
        500
      );
    }

    // Determine host URL for callbacks
    const urlObj = new URL(req.url);
    const hostHeader = req.headers.get('host') || urlObj.host;
    const protoHeader = req.headers.get('x-forwarded-proto') || urlObj.protocol.replace(':', '') || 'https';
    const appUrl = (
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.APP_URL ||
      `${protoHeader}://${hostHeader}`
    ).replace(/\/$/, '');

    const callbackUrl = `${appUrl}/api/payments/callback`;
    const merchantReference = `VSR-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Get or register notification ID
    let notificationId = process.env.PESAPAL_NOTIFICATION_ID || '';
    if (!notificationId) {
      try {
        notificationId = await getNotificationId(appUrl);
      } catch (ipnErr) {
        console.warn('IPN resolution note:', ipnErr);
      }
    }

    // Submit Order to Pesapal v3
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

    return jsonResponse({
      success: true,
      redirectUrl: pesapalRes.redirect_url,
      orderTrackingId: pesapalRes.order_tracking_id,
      merchantReference,
    });
  } catch (err: any) {
    console.error('Universal Checkout Route Handler Error:', err);
    return jsonResponse(
      { error: err.message || 'Payment initiation failed on server' },
      500
    );
  }
}
