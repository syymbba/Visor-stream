import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Smartphone,
  ExternalLink,
  Copy,
  Check,
  Radio,
  LayoutDashboard,
  Receipt
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Currency } from '../types';

interface PaymentStatusViewProps {
  orderTrackingId?: string | null;
  merchantReference?: string | null;
  statusParam?: 'success' | 'pending' | 'error' | 'cancelled' | null;
  initialAmount?: string | null;
  initialCurrency?: string | null;
  onNavigateHome: () => void;
  onNavigateStudio?: () => void;
  onNavigateLive?: () => void;
  onTryAgain?: () => void;
}

export const PaymentStatusView: React.FC<PaymentStatusViewProps> = ({
  orderTrackingId: propTrackingId,
  merchantReference: propRef,
  statusParam: propStatusParam,
  initialAmount,
  initialCurrency,
  onNavigateHome,
  onNavigateStudio,
  onNavigateLive,
  onTryAgain,
}) => {
  // Extract query params from window.location if not passed
  const searchParams = new URLSearchParams(window.location.search);
  const trackingId =
    propTrackingId ||
    searchParams.get('OrderTrackingId') ||
    searchParams.get('orderTrackingId') ||
    searchParams.get('trackingId');
  const merchantRef =
    propRef ||
    searchParams.get('OrderMerchantReference') ||
    searchParams.get('orderMerchantReference') ||
    searchParams.get('orderId');
  const statusFromUrl =
    propStatusParam ||
    (searchParams.get('payment') as any) ||
    (searchParams.get('status') as any);

  const [loading, setLoading] = useState<boolean>(Boolean(trackingId));
  const [copiedRef, setCopiedRef] = useState<boolean>(false);
  const [txDetails, setTxDetails] = useState<{
    status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'UNKNOWN';
    amount?: number;
    currency?: string;
    paymentMethod?: string;
    confirmationCode?: string;
    description?: string;
    createdDate?: string;
    message?: string;
  }>({
    status:
      statusFromUrl === 'success'
        ? 'COMPLETED'
        : statusFromUrl === 'error' || statusFromUrl === 'cancelled'
        ? 'FAILED'
        : 'PENDING',
    amount: initialAmount ? parseFloat(initialAmount) : undefined,
    currency: initialCurrency || 'UGX',
  });

  const verifyStatus = useCallback(async () => {
    if (!trackingId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/payments/status/${encodeURIComponent(trackingId)}`);
      const data = await res.json();

      if (data.success && data.status) {
        const desc = (data.status.payment_status_description || '').toUpperCase();
        const isCompleted = desc === 'COMPLETED' || data.status.status_code === 1;
        const isFailed = desc === 'FAILED' || desc === 'INVALID';

        const finalStatus = isCompleted ? 'COMPLETED' : isFailed ? 'FAILED' : 'PENDING';

        setTxDetails({
          status: finalStatus,
          amount: data.status.amount || (data.order ? parseFloat(data.order.amount) : undefined),
          currency: data.status.currency || (data.order ? data.order.currency : 'UGX'),
          paymentMethod: data.status.payment_method || (data.order ? data.order.paymentMethod : 'Mobile Money / Card'),
          confirmationCode: data.status.confirmation_code || (data.order ? data.order.pesapalConfirmationCode : undefined),
          description: data.status.description || (data.order ? data.order.description : 'Visor Stream Payment'),
          createdDate: data.status.created_date || (data.order ? data.order.createdAt : undefined),
        });

        if (finalStatus === 'COMPLETED') {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.4 },
          });
        }
      }
    } catch (err) {
      console.warn('Verification call error:', err);
    } finally {
      setLoading(false);
    }
  }, [trackingId]);

  useEffect(() => {
    verifyStatus();
  }, [verifyStatus]);

  const handleCopyRef = () => {
    if (merchantRef || trackingId) {
      navigator.clipboard.writeText(merchantRef || trackingId || '');
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 py-12 animate-fadeIn font-sans">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl relative">
        {/* Top Glow Bar */}
        <div
          className={`h-2 w-full ${
            txDetails.status === 'COMPLETED'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
              : txDetails.status === 'PENDING'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
              : 'bg-gradient-to-r from-rose-500 to-red-400'
          }`}
        />

        <div className="p-8 space-y-6">
          {/* Status Icon & Header */}
          {loading ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center mx-auto border border-sky-500/30 animate-spin">
                <RefreshCw className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Verifying Pesapal Payment...</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Connecting to Pesapal v3 gateway to confirm your Mobile Money transaction
                </p>
              </div>
            </div>
          ) : txDetails.status === 'COMPLETED' ? (
            <div className="text-center space-y-3">
              <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40 shadow-lg shadow-emerald-500/20 animate-bounce">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Payment Successful!
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                Your payment has been confirmed by Pesapal. Perks, live tip alerts, and subscriptions are now active.
              </p>
            </div>
          ) : txDetails.status === 'PENDING' ? (
            <div className="text-center space-y-3">
              <div className="w-20 h-20 rounded-3xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/40 shadow-lg shadow-amber-500/20">
                <Clock className="w-12 h-12 animate-pulse" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Payment Processing
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                If you entered your Mobile Money PIN, authorization may take 15–30 seconds. You can refresh below.
              </p>
            </div>
          ) : (
            <div className="text-center space-y-3">
              <div className="w-20 h-20 rounded-3xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/40 shadow-lg shadow-rose-500/20">
                <XCircle className="w-12 h-12" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Payment Not Completed
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                The transaction was cancelled or declined. No funds were debited from your account.
              </p>
            </div>
          )}

          {/* Transaction Summary Card */}
          <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 font-mono-code space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <span className="text-slate-400">Status</span>
              <span
                className={`font-black px-2.5 py-0.5 rounded-full text-[11px] ${
                  txDetails.status === 'COMPLETED'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : txDetails.status === 'PENDING'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                {txDetails.status}
              </span>
            </div>

            {txDetails.amount !== undefined && (
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <span className="text-slate-400">Total Amount</span>
                <span className="font-black text-white text-sm">
                  {txDetails.currency || 'UGX'} {txDetails.amount.toLocaleString()}
                </span>
              </div>
            )}

            {merchantRef && (
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <span className="text-slate-400">Order Reference</span>
                <div className="flex items-center gap-1.5 font-bold text-slate-200">
                  <span>{merchantRef}</span>
                  <button
                    onClick={handleCopyRef}
                    className="text-slate-500 hover:text-sky-400"
                    title="Copy"
                  >
                    {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            {trackingId && (
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <span className="text-slate-400">Pesapal Tracking ID</span>
                <span className="text-slate-300 truncate max-w-[200px]" title={trackingId}>
                  {trackingId}
                </span>
              </div>
            )}

            {txDetails.confirmationCode && (
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <span className="text-slate-400">Gateway Confirmation</span>
                <span className="font-bold text-sky-400">{txDetails.confirmationCode}</span>
              </div>
            )}

            {txDetails.paymentMethod && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Payment Channel</span>
                <span className="text-slate-300">{txDetails.paymentMethod}</span>
              </div>
            )}
          </div>

          {/* Guarantee Pill */}
          <div className="flex items-center gap-2 p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>
              70% creator share is routed directly to creator wallet. PCI-DSS Level 1 Encrypted.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {txDetails.status === 'COMPLETED' ? (
              <>
                {onNavigateLive && (
                  <button
                    onClick={onNavigateLive}
                    className="w-full py-3.5 px-4 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-sky-500/20 cursor-pointer"
                  >
                    <Radio className="w-4 h-4 text-slate-950" />
                    <span>Return to Live Stream</span>
                  </button>
                )}
                {onNavigateStudio ? (
                  <button
                    onClick={onNavigateStudio}
                    className="w-full py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <LayoutDashboard className="w-4 h-4 text-sky-400" />
                    <span>Creator Studio</span>
                  </button>
                ) : (
                  <button
                    onClick={onNavigateHome}
                    className="w-full py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>Home Screen</span>
                  </button>
                )}
              </>
            ) : txDetails.status === 'PENDING' ? (
              <>
                <button
                  onClick={verifyStatus}
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Check Status Again</span>
                </button>
                <button
                  onClick={onNavigateHome}
                  className="w-full py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Return to Home</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onTryAgain || onNavigateHome}
                  className="w-full py-3.5 px-4 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Try Payment Again</span>
                </button>
                <button
                  onClick={onNavigateHome}
                  className="w-full py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Back to Browsing</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
