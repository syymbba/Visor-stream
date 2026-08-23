/**
 * Pesapal v3 Payment Gateway Integration Helper
 * Supports Mobile Money (MTN MoMo, Airtel Money, M-Pesa) and Visa/Mastercard.
 */

export const getPesapalBaseUrl = (): string => {
  const env = (process.env.PESAPAL_ENV || 'production').toLowerCase().trim();
  return env === 'sandbox'
    ? 'https://cybqa.pesapal.com/pesapalv3/api'
    : 'https://pay.pesapal.com/v3/api';
};

export const getPesapalConsumerKey = (): string => {
  return process.env.PESAPAL_CONSUMER_KEY || '';
};

export const getPesapalConsumerSecret = (): string => {
  return process.env.PESAPAL_CONSUMER_SECRET || '';
};

// In-memory token & IPN ID caching
let cachedToken: { token: string; expiresAt: number } | null = null;
let cachedIpnId: string | null = null;

/**
 * 1. Request Bearer Token from Pesapal v3
 */
export async function getPesapalToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60000) {
    return cachedToken.token;
  }

  const baseUrl = getPesapalBaseUrl();
  const consumerKey = getPesapalConsumerKey();
  const consumerSecret = getPesapalConsumerSecret();

  try {
    const response = await fetch(`${baseUrl}/Auth/RequestToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        consumer_key: consumerKey,
        consumer_secret: consumerSecret,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Pesapal Auth Request Failed (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    if (!data.token) {
      throw new Error(`Pesapal Auth Error: ${data.message || 'No token returned'}`);
    }

    // Cache token (Pesapal tokens typically last 5 minutes)
    cachedToken = {
      token: data.token,
      expiresAt: now + (4 * 60 * 1000), // 4 minutes safe ttl
    };

    return data.token;
  } catch (error: any) {
    console.error('Pesapal Authentication Error:', error.message || error);
    throw error;
  }
}

/**
 * 2. Register Webhook IPN with Pesapal
 */
export async function getNotificationId(customAppUrl?: string): Promise<string> {
  if (cachedIpnId) {
    return cachedIpnId;
  }

  const token = await getPesapalToken();
  const baseUrl = getPesapalBaseUrl();
  
  const appUrl = (
    customAppUrl ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    'https://visor-stream.vercel.app'
  ).replace(/\/$/, '');

  const ipnUrl = `${appUrl}/api/payments/ipn`;

  try {
    const response = await fetch(`${baseUrl}/URLSetup/RegisterIPN`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        url: ipnUrl,
        ipn_notification_type: 'POST',
      }),
    });

    const data = await response.json();
    if (data.ipn_id) {
      cachedIpnId = data.ipn_id;
      return data.ipn_id;
    }

    if (data.status === '200' && data.ipn_id) {
      cachedIpnId = data.ipn_id;
      return data.ipn_id;
    }

    // In case IPN is already registered, try fetching list
    const listRes = await fetch(`${baseUrl}/URLSetup/GetIPNList`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (listRes.ok) {
      const listData = await listRes.json();
      if (Array.isArray(listData) && listData.length > 0) {
        const found = listData.find((item: any) => item.url === ipnUrl) || listData[0];
        if (found?.ipn_id) {
          cachedIpnId = found.ipn_id;
          return found.ipn_id;
        }
      }
    }

    // Fallback ID if register returned response without ipn_id
    return data.ipn_id || 'ipn_visor_stream_auto';
  } catch (error: any) {
    console.error('Pesapal Register IPN Error:', error.message || error);
    return 'ipn_visor_stream_fallback';
  }
}

export interface PesapalOrderRequest {
  merchantReference: string;
  amount: number;
  currency: string;
  description: string;
  callbackUrl: string;
  notificationId: string;
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
}

export interface PesapalOrderResponse {
  order_tracking_id: string;
  merchant_reference: string;
  redirect_url: string;
  status: string;
  error?: any;
}

/**
 * 3. Submit Order Request to Pesapal
 */
export async function submitPesapalOrder(params: PesapalOrderRequest): Promise<PesapalOrderResponse> {
  const token = await getPesapalToken();
  const baseUrl = getPesapalBaseUrl();

  const payload = {
    id: params.merchantReference,
    currency: params.currency || 'UGX',
    amount: params.amount,
    description: params.description || 'Visor Stream Live Gaming & Subscription',
    callback_url: params.callbackUrl,
    notification_id: params.notificationId,
    billing_address: {
      email_address: params.email || 'guest@visorstream.com',
      phone_number: params.phone || '',
      country_code: params.currency === 'KES' ? 'KE' : params.currency === 'TZS' ? 'TZ' : 'UG',
      first_name: params.firstName || 'Visor',
      last_name: params.lastName || 'Gamer',
      line_1: 'Visor Stream East Africa',
      city: 'Kampala',
    },
  };

  const response = await fetch(`${baseUrl}/Transactions/SubmitOrderRequest`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok || !data.redirect_url) {
    throw new Error(
      `Failed to submit Pesapal order: ${data.message || data.error?.message || response.statusText}`
    );
  }

  return {
    order_tracking_id: data.order_tracking_id,
    merchant_reference: data.merchant_reference || params.merchantReference,
    redirect_url: data.redirect_url,
    status: data.status || '200',
  };
}

export interface PesapalTransactionStatus {
  payment_method?: string;
  amount?: number;
  created_date?: string;
  confirmation_code?: string;
  payment_status_description: 'Completed' | 'Pending' | 'Failed' | 'Invalid' | 'Reversed' | string;
  description?: string;
  message?: string;
  payment_account?: string;
  call_back_url_status?: string;
  status_code?: number; // 1 = Completed, 0 = Invalid, 2 = Failed, 3 = Reversed
  merchant_reference?: string;
  currency?: string;
  error?: any;
}

/**
 * 4. Get Transaction Status from Pesapal
 */
export async function getPesapalTransactionStatus(orderTrackingId: string): Promise<PesapalTransactionStatus> {
  const token = await getPesapalToken();
  const baseUrl = getPesapalBaseUrl();

  const url = `${baseUrl}/Transactions/GetTransactionStatus?orderTrackingId=${encodeURIComponent(orderTrackingId)}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Pesapal GetTransactionStatus failed (${response.status}): ${errText}`);
  }

  const data: PesapalTransactionStatus = await response.json();
  return data;
}

/**
 * Helper to normalize and map Pesapal v3 status codes into standard application statuses
 */
export function normalizePesapalStatus(statusData: Partial<PesapalTransactionStatus>): {
  isCompleted: boolean;
  isFailed: boolean;
  isPending: boolean;
  standardStatus: 'COMPLETED' | 'FAILED' | 'REVERSED' | 'PENDING';
  statusCode: number;
} {
  const desc = (statusData.payment_status_description || '').toLowerCase();
  const code = typeof statusData.status_code === 'number' ? statusData.status_code : -1;

  if (desc === 'completed' || code === 1) {
    return { isCompleted: true, isFailed: false, isPending: false, standardStatus: 'COMPLETED', statusCode: 1 };
  }
  if (desc === 'reversed' || code === 3) {
    return { isCompleted: false, isFailed: true, isPending: false, standardStatus: 'REVERSED', statusCode: 3 };
  }
  if (desc === 'failed' || desc === 'invalid' || code === 2 || code === 0) {
    return { isCompleted: false, isFailed: true, isPending: false, standardStatus: 'FAILED', statusCode: 2 };
  }

  return { isCompleted: false, isFailed: false, isPending: true, standardStatus: 'PENDING', statusCode: 0 };
}
