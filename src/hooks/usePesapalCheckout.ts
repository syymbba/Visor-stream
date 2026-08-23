import { useState, useCallback } from 'react';
import { getAuthHeaders } from '../firebase';

export interface PesapalCheckoutPayload {
  amount: number;
  currency?: string;
  email?: string;
  phone?: string;
  creatorId?: string;
  streamId?: string;
  planId?: string;
  type?: 'subscription' | 'tip' | 'topup';
  description?: string;
  userId?: string;
  firstName?: string;
  lastName?: string;
  autoRedirect?: boolean;
}

export interface PesapalCheckoutResponse {
  success: boolean;
  redirectUrl?: string;
  orderTrackingId?: string;
  merchantReference?: string;
  error?: string;
}

export interface UsePesapalCheckoutReturn {
  loading: boolean;
  error: string | null;
  redirectUrl: string | null;
  orderTrackingId: string | null;
  merchantReference: string | null;
  triggerCheckout: (payload: PesapalCheckoutPayload) => Promise<PesapalCheckoutResponse>;
  reset: () => void;
}

export function usePesapalCheckout(): UsePesapalCheckoutReturn {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [orderTrackingId, setOrderTrackingId] = useState<string | null>(null);
  const [merchantReference, setMerchantReference] = useState<string | null>(null);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setRedirectUrl(null);
    setOrderTrackingId(null);
    setMerchantReference(null);
  }, []);

  const triggerCheckout = useCallback(
    async (payload: PesapalCheckoutPayload): Promise<PesapalCheckoutResponse> => {
      setLoading(true);
      setError(null);

      try {
        if (!payload.amount || payload.amount <= 0) {
          throw new Error('Payment amount must be greater than zero.');
        }

        const res = await fetch('/api/payments/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(await getAuthHeaders()),
          },
          body: JSON.stringify({
            amount: payload.amount,
            currency: payload.currency || 'UGX',
            email: payload.email?.trim() || 'gamer@visorstream.com',
            phone: payload.phone?.trim() || '',
            creatorId: payload.creatorId || 'me',
            streamId: payload.streamId,
            planId: payload.planId,
            type: payload.type || 'tip',
            description: payload.description || 'Visor Stream Payment',
            userId: payload.userId,
            firstName: payload.firstName || 'Visor',
            lastName: payload.lastName || 'Gamer',
          }),
        });

        // Safely parse JSON or handle HTML/Text error page
        const contentType = res.headers.get('content-type') || '';
        let data: any = {};

        if (contentType.includes('application/json')) {
          data = await res.json();
        } else {
          const rawText = await res.text();
          console.error(`Non-JSON response received from /api/payments/checkout (${res.status}):`, rawText);
          const errMsg = `Server returned status ${res.status}. Payment gateway endpoint unreachable or returned HTML.`;
          setError(errMsg);
          setLoading(false);
          return { success: false, error: errMsg };
        }

        if (!res.ok || data.error) {
          const errMsg = data.error || `Payment initiation failed (${res.status})`;
          setError(errMsg);
          setLoading(false);
          return { success: false, error: errMsg };
        }

        if (!data.redirectUrl) {
          const errMsg = 'No redirect URL received from Pesapal payment gateway.';
          setError(errMsg);
          setLoading(false);
          return { success: false, error: errMsg };
        }

        setRedirectUrl(data.redirectUrl);
        setOrderTrackingId(data.orderTrackingId || null);
        setMerchantReference(data.merchantReference || null);
        setLoading(false);

        // Auto-redirect user to Pesapal payment portal
        if (payload.autoRedirect !== false) {
          try {
            if (window.top && window.top !== window) {
              window.top.location.href = data.redirectUrl;
            } else {
              window.location.href = data.redirectUrl;
            }
          } catch {
            window.location.href = data.redirectUrl;
          }
        }

        return {
          success: true,
          redirectUrl: data.redirectUrl,
          orderTrackingId: data.orderTrackingId,
          merchantReference: data.merchantReference,
        };
      } catch (err: any) {
        console.error('Pesapal checkout hook error:', err);
        const errMsg = err.message || 'An unexpected error occurred during checkout.';
        setError(errMsg);
        setLoading(false);
        return { success: false, error: errMsg };
      }
    },
    []
  );

  return {
    loading,
    error,
    redirectUrl,
    orderTrackingId,
    merchantReference,
    triggerCheckout,
    reset,
  };
}
