import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Copy,
  Check,
  Radio,
  LayoutDashboard,
  AlertTriangle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Wallet,
  ShieldAlert,
  Signal,
  CreditCard,
  PhoneCall,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { getAuthHeaders } from '../firebase';
import { parsePesapalError, PesapalErrorBreakdown, ErrorCategory } from '../lib/pesapalErrors';
import { useLanguage } from '../lib/i18n';

export interface MobileMoneyProviderDetails {
  id: 'MTN_MOMO' | 'AIRTEL_MONEY' | 'MPESA' | 'CARD' | 'UNKNOWN';
  name: string;
  shortName: string;
  tagline: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  ussdCode: string;
  ussdPrompt: string;
  accountCheckAction: string;
  isMobileMoney: boolean;
  networkLogoType: 'mtn' | 'airtel' | 'mpesa' | 'card' | 'generic';
}

/**
 * Helper function to detect and parse the specific mobile money provider (MTN MoMo vs Airtel Money)
 * from the paymentMethod string returned by the Pesapal callback or order response.
 */
export function detectMobileMoneyProvider(
  paymentMethod?: string | null,
  currency?: string | null
): MobileMoneyProviderDetails {
  const methodStr = (paymentMethod || '').trim().toUpperCase();
  const curr = (currency || 'UGX').trim().toUpperCase();

  // 1. Detect MTN Mobile Money (e.g., "MTN", "MTN UG", "MTN_MOMO", "UG_MTN_MOMO", "MOMO", "MTN_UGX")
  if (
    methodStr.includes('MTN') ||
    methodStr.includes('MOMO') ||
    methodStr.includes('UG_MTN') ||
    methodStr.includes('MTN_UGX')
  ) {
    return {
      id: 'MTN_MOMO',
      name: 'MTN Mobile Money (MoMo)',
      shortName: 'MTN MoMo',
      tagline: 'Uganda MTN MoMo Switch',
      badgeBg: 'bg-amber-500/15',
      badgeText: 'text-amber-300',
      badgeBorder: 'border-amber-500/40',
      ussdCode: '*165#',
      ussdPrompt: 'Dial *165# to check your MTN MoMo balance',
      accountCheckAction: 'MTN MoMo (*165#)',
      isMobileMoney: true,
      networkLogoType: 'mtn',
    };
  }

  // 2. Detect Airtel Money (e.g., "AIRTEL", "AIRTEL UG", "AIRTEL_MONEY", "UG_AIRTEL_MONEY", "AIRTEL_UGX")
  if (
    methodStr.includes('AIRTEL') ||
    methodStr.includes('AIRTEL_UG') ||
    methodStr.includes('UG_AIRTEL') ||
    methodStr.includes('AIRTEL_UGX')
  ) {
    return {
      id: 'AIRTEL_MONEY',
      name: 'Airtel Money',
      shortName: 'Airtel Money',
      tagline: 'Airtel East Africa Switch',
      badgeBg: 'bg-red-500/15',
      badgeText: 'text-red-300',
      badgeBorder: 'border-red-500/40',
      ussdCode: '*185#',
      ussdPrompt: 'Dial *185# to check your Airtel Money balance',
      accountCheckAction: 'Airtel Money (*185#)',
      isMobileMoney: true,
      networkLogoType: 'airtel',
    };
  }

  // 3. Detect Safaricom M-Pesa (e.g., "MPESA", "M-PESA", "SAFARICOM")
  if (
    methodStr.includes('MPESA') ||
    methodStr.includes('M-PESA') ||
    methodStr.includes('SAFARICOM') ||
    curr === 'KES'
  ) {
    return {
      id: 'MPESA',
      name: 'Safaricom M-Pesa',
      shortName: 'M-Pesa',
      tagline: 'Safaricom Daraja Switch',
      badgeBg: 'bg-emerald-500/15',
      badgeText: 'text-emerald-300',
      badgeBorder: 'border-emerald-500/40',
      ussdCode: '*334#',
      ussdPrompt: 'Dial *334# or check the M-Pesa App',
      accountCheckAction: 'M-Pesa (*334#)',
      isMobileMoney: true,
      networkLogoType: 'mpesa',
    };
  }

  // 4. Detect Bank Card (Visa / Mastercard)
  if (
    methodStr.includes('CARD') ||
    methodStr.includes('VISA') ||
    methodStr.includes('MASTERCARD') ||
    methodStr.includes('CYBERSOURCE')
  ) {
    return {
      id: 'CARD',
      name: 'Visa / Mastercard',
      shortName: 'Bank Card',
      tagline: '3D Secure 256-Bit Gateway',
      badgeBg: 'bg-sky-500/15',
      badgeText: 'text-sky-300',
      badgeBorder: 'border-sky-500/40',
      ussdCode: '',
      ussdPrompt: 'Check your mobile banking app or card statement',
      accountCheckAction: 'Bank Card / App',
      isMobileMoney: false,
      networkLogoType: 'card',
    };
  }

  // Fallback for Uganda Mobile Money if method string is generic
  if (curr === 'UGX') {
    return {
      id: 'UNKNOWN',
      name: 'MTN / Airtel Mobile Money',
      shortName: 'MoMo / Airtel',
      tagline: 'Uganda Mobile Money Switch',
      badgeBg: 'bg-amber-500/15',
      badgeText: 'text-amber-300',
      badgeBorder: 'border-amber-500/30',
      ussdCode: '*165# / *185#',
      ussdPrompt: 'Dial *165# (MTN) or *185# (Airtel) to check balance',
      accountCheckAction: 'Dial *165# or *185#',
      isMobileMoney: true,
      networkLogoType: 'generic',
    };
  }

  return {
    id: 'UNKNOWN',
    name: methodStr || 'Mobile Money Gateway',
    shortName: methodStr || 'Mobile Money',
    tagline: 'Pesapal v3 Payment Switch',
    badgeBg: 'bg-slate-800',
    badgeText: 'text-slate-300',
    badgeBorder: 'border-slate-700',
    ussdCode: '',
    ussdPrompt: 'Check your mobile carrier statement',
    accountCheckAction: 'Carrier Statement',
    isMobileMoney: true,
    networkLogoType: 'generic',
  };
}

interface PaymentStatusViewProps {
  orderTrackingId?: string | null;
  merchantReference?: string | null;
  statusParam?: 'success' | 'pending' | 'error' | 'failed' | 'cancelled' | null;
  initialAmount?: string | null;
  initialCurrency?: string | null;
  statusCode?: number | string | null;
  statusDesc?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  paymentMethod?: string | null;
  onNavigateHome: () => void;
  onNavigateStudio?: () => void;
  onNavigateLive?: () => void;
  onTryAgain?: () => void;
}

export const PaymentStatusView: React.FC<PaymentStatusViewProps> = ({
  orderTrackingId: propTrackingId,
  merchantReference: propRef,
  statusParam: propStatusParam,
  initialAmount: propAmount,
  initialCurrency: propCurrency,
  statusCode: propStatusCode,
  statusDesc: propStatusDesc,
  errorCode: propErrorCode,
  errorMessage: propErrorMessage,
  paymentMethod: propPaymentMethod,
  onNavigateHome,
  onNavigateStudio,
  onNavigateLive,
  onTryAgain,
}) => {
  const { t } = useLanguage();
  // Extract query params from window.location if not explicitly passed as props
  const searchParams = useMemo(() => new URLSearchParams(window.location.search), []);

  const trackingId =
    propTrackingId ||
    searchParams.get('OrderTrackingId') ||
    searchParams.get('orderTrackingId') ||
    searchParams.get('trackingId') ||
    null;

  const merchantRef =
    propRef ||
    searchParams.get('OrderMerchantReference') ||
    searchParams.get('orderMerchantReference') ||
    searchParams.get('orderId') ||
    null;

  const urlStatusParam =
    propStatusParam ||
    (searchParams.get('payment') as any) ||
    (searchParams.get('status') as any) ||
    null;

  const rawStatusCode = propStatusCode || searchParams.get('statusCode') || null;
  const rawStatusDesc = propStatusDesc || searchParams.get('statusDesc') || null;
  const rawErrorCode = propErrorCode || searchParams.get('errorCode') || null;
  const rawErrorMessage = propErrorMessage || searchParams.get('errorMessage') || searchParams.get('message') || null;
  const rawMethod = propPaymentMethod || searchParams.get('paymentMethod') || null;
  const rawAmount = propAmount || searchParams.get('amount') || null;
  const rawCurrency = propCurrency || searchParams.get('currency') || 'UGX';

  const [loading, setLoading] = useState<boolean>(Boolean(trackingId));
  const [copiedRef, setCopiedRef] = useState<boolean>(false);
  const [copiedDiagnostics, setCopiedDiagnostics] = useState<boolean>(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);
  const [pollCount, setPollCount] = useState<number>(0);

  const [txDetails, setTxDetails] = useState<{
    status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'REVERSED' | 'INVALID' | 'UNKNOWN';
    amount?: number;
    currency?: string;
    paymentMethod?: string;
    confirmationCode?: string;
    description?: string;
    createdDate?: string;
    statusCode?: number;
    statusDesc?: string;
    errorCode?: string;
    errorMessage?: string;
  }>({
    status:
      urlStatusParam === 'success'
        ? 'COMPLETED'
        : urlStatusParam === 'error' || urlStatusParam === 'failed' || urlStatusParam === 'cancelled'
        ? 'FAILED'
        : 'PENDING',
    amount: rawAmount ? parseFloat(rawAmount) : undefined,
    currency: rawCurrency,
    paymentMethod: rawMethod || undefined,
    statusCode: rawStatusCode ? parseInt(String(rawStatusCode)) : undefined,
    statusDesc: rawStatusDesc || undefined,
    errorCode: rawErrorCode || undefined,
    errorMessage: rawErrorMessage || undefined,
  });

  // Verify status directly with Pesapal v3 gateway
  const verifyStatus = useCallback(async () => {
    if (!trackingId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/payments/status/${encodeURIComponent(trackingId)}`, {
        headers: await getAuthHeaders(),
      });
      const data = await res.json();

      if (data.success && data.status) {
        const desc = (data.status.payment_status_description || '').toUpperCase();
        const code = typeof data.status.status_code === 'number' ? data.status.status_code : -1;

        const isCompleted = desc === 'COMPLETED' || code === 1;
        const isReversed = desc === 'REVERSED' || code === 3;
        const isInvalid = desc === 'INVALID' || code === 0;
        const isFailed = desc === 'FAILED' || code === 2 || isReversed || isInvalid;

        const finalStatus = isCompleted
          ? 'COMPLETED'
          : isReversed
          ? 'REVERSED'
          : isInvalid
          ? 'INVALID'
          : isFailed
          ? 'FAILED'
          : 'PENDING';

        const extractedErrorCode =
          data.status.error?.error_type ||
          data.status.error?.code ||
          data.status.error_type ||
          rawErrorCode ||
          (isFailed ? `PESAPAL_${desc || 'FAILURE'}` : undefined);

        const extractedErrorMessage =
          data.status.error?.message ||
          data.status.message ||
          data.status.description ||
          rawErrorMessage ||
          undefined;

        setTxDetails({
          status: finalStatus,
          amount: data.status.amount || (data.order ? parseFloat(data.order.amount) : rawAmount ? parseFloat(rawAmount) : undefined),
          currency: data.status.currency || (data.order ? data.order.currency : rawCurrency),
          paymentMethod: data.status.payment_method || (data.order ? data.order.paymentMethod : rawMethod || 'MTN / Airtel / M-Pesa'),
          confirmationCode: data.status.confirmation_code || (data.order ? data.order.pesapalConfirmationCode : undefined),
          description: data.status.description || (data.order ? data.order.description : 'Visor Stream Live'),
          createdDate: data.status.created_date || (data.order ? data.order.createdAt : undefined),
          statusCode: code >= 0 ? code : undefined,
          statusDesc: data.status.payment_status_description || desc,
          errorCode: extractedErrorCode,
          errorMessage: extractedErrorMessage,
        });

        if (finalStatus === 'COMPLETED') {
        }
      }
    } catch (err) {
      console.warn('Payment status verification error:', err);
    } finally {
      setLoading(false);
    }
  }, [trackingId, rawAmount, rawCurrency, rawMethod, rawErrorCode, rawErrorMessage]);

  useEffect(() => {
    verifyStatus();
  }, [verifyStatus]);

  // Auto-poll if status is currently PENDING (e.g. user is waiting for USSD prompt on their phone)
  useEffect(() => {
    if (txDetails.status === 'PENDING' && trackingId && pollCount < 5) {
      const timer = setTimeout(() => {
        setPollCount((prev) => prev + 1);
        verifyStatus();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [txDetails.status, trackingId, pollCount, verifyStatus]);

  // Parse error breakdown using our comprehensive Pesapal diagnostic parser
  const errorBreakdown: PesapalErrorBreakdown = useMemo(() => {
    return parsePesapalError({
      statusCode: txDetails.statusCode,
      statusDescription: txDetails.statusDesc || txDetails.status,
      errorCode: txDetails.errorCode,
      errorMessage: txDetails.errorMessage,
      paymentMethod: txDetails.paymentMethod,
      currency: txDetails.currency,
    });
  }, [txDetails]);

  // Detect specific mobile money provider (MTN MoMo vs Airtel Money vs M-Pesa vs Card)
  const detectedProvider = useMemo(() => {
    return detectMobileMoneyProvider(txDetails.paymentMethod, txDetails.currency);
  }, [txDetails.paymentMethod, txDetails.currency]);

  const handleCopyRef = () => {
    if (merchantRef || trackingId) {
      navigator.clipboard.writeText(merchantRef || trackingId || '');
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  const handleCopyDiagnostics = () => {
    const diagnosticReport = [
      `--- VISOR STREAM PESAPAL PAYMENT DIAGNOSTIC ---`,
      `Timestamp: ${new Date().toISOString()}`,
      `Order Tracking ID: ${trackingId || 'N/A'}`,
      `Merchant Reference: ${merchantRef || 'N/A'}`,
      `Status: ${txDetails.status} (Code: ${txDetails.statusCode ?? 'N/A'})`,
      `Payment Method: ${txDetails.paymentMethod || 'Mobile Money'} (${detectedProvider.name})`,
      `Detected Provider: ${detectedProvider.name}`,
      `Carrier USSD Code: ${detectedProvider.ussdCode || 'N/A'}`,
      `Amount: ${txDetails.currency || 'UGX'} ${txDetails.amount?.toLocaleString() || 'N/A'}`,
      `Diagnostic Code: ${errorBreakdown.code}`,
      `Category: ${errorBreakdown.categoryLabel}`,
      `Reason: ${errorBreakdown.title}`,
      `Error Details: ${errorBreakdown.description}`,
      `Raw Message: ${txDetails.errorMessage || 'N/A'}`,
      `Carrier / Network: ${errorBreakdown.carrierName || detectedProvider.name}`,
      `----------------------------------------------`,
    ].join('\n');

    navigator.clipboard.writeText(diagnosticReport);
    setCopiedDiagnostics(true);
    setTimeout(() => setCopiedDiagnostics(false), 2500);
  };

  const isFailedState =
    txDetails.status === 'FAILED' ||
    txDetails.status === 'REVERSED' ||
    txDetails.status === 'INVALID';

  // Category Icon & Badge Styling
  const getCategoryBadge = (category: ErrorCategory) => {
    switch (category) {
      case 'WALLET_LIMIT':
        return {
          icon: <Wallet className="w-4 h-4 text-amber-400" />,
          bgColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        };
      case 'USER_ACTION':
        return {
          icon: <Smartphone className="w-4 h-4 text-rose-400" />,
          bgColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        };
      case 'SECURITY_AUTH':
        return {
          icon: <ShieldAlert className="w-4 h-4 text-violet-400" />,
          bgColor: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
        };
      case 'TELCO_NETWORK':
        return {
          icon: <Signal className="w-4 h-4 text-sky-400" />,
          bgColor: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
        };
      case 'SYSTEM_SESSION':
      default:
        return {
          icon: <Clock className="w-4 h-4 text-slate-400" />,
          bgColor: 'bg-slate-800/80 text-slate-300 border-slate-700',
        };
    }
  };

  const categoryBadge = getCategoryBadge(errorBreakdown.category);

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 py-12 animate-fadeIn font-sans">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl relative">
        {/* Top High-Contrast Status Bar */}
        <div
          className={`h-2.5 w-full ${
            txDetails.status === 'COMPLETED'
              ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400'
              : txDetails.status === 'PENDING'
              ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500'
              : 'bg-gradient-to-r from-rose-600 via-red-500 to-rose-500'
          }`}
        />

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header State Indicator */}
          {loading ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center mx-auto border border-sky-500/30 animate-spin">
                <RefreshCw className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white">Verifying Pesapal Transaction...</h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
                  Connecting to the Pesapal v3 switch to fetch live settlement status from your mobile money operator.
                </p>
              </div>
            </div>
          ) : txDetails.status === 'COMPLETED' ? (
            <div className="text-center space-y-3">
              <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40 shadow-lg shadow-emerald-500/20 animate-bounce">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {t('paymentstatus.completed.title')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                Your payment has been fully confirmed by Pesapal and settled with the telecom carrier. Subscriptions, stream badges, and live tip alerts are now active.
              </p>
            </div>
          ) : txDetails.status === 'PENDING' ? (
            <div className="text-center space-y-3">
              <div className="w-20 h-20 rounded-3xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/40 shadow-lg shadow-amber-500/20">
                <Clock className="w-12 h-12 animate-pulse" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {t('paymentstatus.pending.title')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                Pesapal has transmitted the USSD prompt to your mobile phone. Please unlock your device and enter your Mobile Money PIN to complete the transaction.
              </p>
              {pollCount > 0 && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                  <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
                  <span>Auto-checking live status (Attempt {pollCount}/5)...</span>
                </div>
              )}
            </div>
          ) : (
            /* DETAILED FAILURE BANNER */
            <div className="text-center space-y-3">
              <div className="w-20 h-20 rounded-3xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/40 shadow-lg shadow-rose-500/20">
                <XCircle className="w-12 h-12" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2 mb-1.5">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${categoryBadge.bgColor}`}>
                    {categoryBadge.icon}
                    <span>{errorBreakdown.categoryLabel}</span>
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {t('paymentstatus.failed.title')}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                  The transaction was declined by the telecom operator or could not be completed on your mobile device.
                </p>
              </div>
            </div>
          )}

          {/* DETAILED ERROR BREAKDOWN CARD (Visible when transaction failed or cancelled) */}
          {isFailedState && (
            <div className="bg-slate-950 rounded-2xl border border-rose-500/30 overflow-hidden shadow-xl">
              {/* Error Header */}
              <div className="p-4 sm:p-5 bg-rose-950/20 border-b border-rose-500/20 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center flex-shrink-0 text-rose-400 mt-0.5">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="space-y-1 text-left flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white tracking-wide">
                      {errorBreakdown.title}
                    </h3>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {errorBreakdown.code}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-rose-200/90 leading-relaxed">
                    {errorBreakdown.description}
                  </p>
                </div>
              </div>

              {/* Actionable Troubleshooting Checklist */}
              <div className="p-5 space-y-4 text-left">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>How to Fix & Complete This Payment</span>
                </h4>

                <div className="space-y-2.5">
                  {errorBreakdown.troubleshootingSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200"
                    >
                      <div className="w-5 h-5 rounded-full bg-sky-500/20 border border-sky-500/40 text-sky-400 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                        {idx + 1}
                      </div>
                      <span className="leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>

                {/* Operator Quick Reference USSD Tip */}
                {errorBreakdown.providerTip && (
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                    <PhoneCall className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-300">Carrier Tip: </span>
                      <span>{errorBreakdown.providerTip}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Transaction Summary Card */}
          <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <span className="text-slate-400 font-sans">Payment Status</span>
              <span
                className={`font-black px-2.5 py-0.5 rounded-full text-[11px] uppercase tracking-wider ${
                  txDetails.status === 'COMPLETED'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : txDetails.status === 'PENDING'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                {txDetails.statusDesc || txDetails.status}
              </span>
            </div>

            {txDetails.amount !== undefined && (
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <span className="text-slate-400 font-sans">Amount Payable</span>
                <span className="font-bold text-white text-sm">
                  {txDetails.currency || 'UGX'} {txDetails.amount.toLocaleString()}
                </span>
              </div>
            )}

            {merchantRef && (
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <span className="text-slate-400 font-sans">Merchant Reference</span>
                <div className="flex items-center gap-2 font-bold text-slate-200">
                  <span className="truncate max-w-[200px] sm:max-w-xs">{merchantRef}</span>
                  <button
                    onClick={handleCopyRef}
                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-sky-400 transition-colors"
                    title="Copy reference"
                  >
                    {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            {trackingId && (
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <span className="text-slate-400 font-sans">Pesapal Tracking ID</span>
                <span className="text-slate-300 font-bold truncate max-w-[220px]" title={trackingId}>
                  {trackingId}
                </span>
              </div>
            )}

            {txDetails.confirmationCode && (
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <span className="text-slate-400 font-sans">Confirmation Code</span>
                <span className="font-bold text-sky-400">{txDetails.confirmationCode}</span>
              </div>
            )}

            {txDetails.paymentMethod && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-sans">Payment Channel</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${detectedProvider.badgeBg} ${detectedProvider.badgeText} ${detectedProvider.badgeBorder}`}
                  >
                    {detectedProvider.id === 'MTN_MOMO' ? (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-sm shadow-amber-400/50" />
                    ) : detectedProvider.id === 'AIRTEL_MONEY' ? (
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-sm shadow-red-500/50" />
                    ) : detectedProvider.id === 'MPESA' ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    ) : (
                      <Smartphone className="w-3.5 h-3.5" />
                    )}
                    <span>{detectedProvider.name}</span>
                  </span>
                  {detectedProvider.ussdCode && (
                    <span
                      className="hidden sm:inline text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800"
                      title={detectedProvider.ussdPrompt}
                    >
                      {detectedProvider.ussdCode}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Collapsible Technical Diagnostics Drawer (Especially valuable for debugging & support) */}
          <div className="border border-slate-800/80 rounded-2xl overflow-hidden bg-slate-950/60">
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="w-full p-3.5 flex items-center justify-between text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-sky-400" />
                <span>Technical Gateway Details & Audit Logs</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <span>{showTechnicalDetails ? 'Hide' : 'Show Details'}</span>
                {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {showTechnicalDetails && (
              <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-950 font-mono text-[11px]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-400">
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase">Gateway Status Code</div>
                    <div className="font-bold text-slate-200 mt-0.5">
                      {txDetails.statusCode !== undefined ? `${txDetails.statusCode}` : 'Unassigned'}
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase">Status Description</div>
                    <div className="font-bold text-slate-200 mt-0.5">
                      {txDetails.statusDesc || txDetails.status}
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase">Error Identifier</div>
                    <div className="font-bold text-rose-400 mt-0.5">
                      {errorBreakdown.code}
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase">Telecom Switch & Network</div>
                    <div className={`font-bold mt-0.5 text-xs ${detectedProvider.badgeText}`}>
                      {detectedProvider.name} {detectedProvider.ussdCode ? `(${detectedProvider.ussdCode})` : ''}
                    </div>
                  </div>
                </div>

                {txDetails.errorMessage && (
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-slate-300">
                    <div className="text-[10px] text-slate-500 uppercase">Raw Operator Message</div>
                    <div className="mt-0.5 text-xs text-rose-300 break-words">{txDetails.errorMessage}</div>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">Need live assistance?</span>
                  <button
                    onClick={handleCopyDiagnostics}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition-all cursor-pointer"
                  >
                    {copiedDiagnostics ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Diagnostic Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-sky-400" />
                        <span>Copy Diagnostic Report for Support</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Security & Rev Share Guarantee Pill */}
          <div className="flex items-center gap-2 p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>
              70% creator share is routed directly to creator wallet. PCI-DSS Level 1 Encrypted via Pesapal.
            </span>
          </div>

          {/* Action Buttons with High-Contrast Clear Hierarchy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {txDetails.status === 'COMPLETED' ? (
              <>
                {onNavigateLive && (
                  <button
                    onClick={onNavigateLive}
                    className="w-full py-3.5 px-4 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-sky-500/20 cursor-pointer"
                  >
                    <Radio className="w-4 h-4 text-slate-950" />
                    <span>{t('paymentstatus.actions.returnToLive')}</span>
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
                  <span>{t('paymentstatus.actions.checkStatusAgain')}</span>
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
                  className="w-full py-3.5 px-4 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-sky-500/20 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 text-slate-950" />
                  <span>
                    {errorBreakdown.suggestedAction === 'TOP_UP'
                      ? 'Top Up & Try Again'
                      : errorBreakdown.suggestedAction === 'CHANGE_METHOD'
                      ? 'Try Different Method'
                      : 'Try Payment Again'}
                  </span>
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={verifyStatus}
                    disabled={loading}
                    className="flex-1 py-3.5 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    title="Re-query gateway in case authorization just settled"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${loading ? 'animate-spin' : ''}`} />
                    <span>Re-Check Status</span>
                  </button>
                  <button
                    onClick={onNavigateHome}
                    className="py-3.5 px-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    <span>Back</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
