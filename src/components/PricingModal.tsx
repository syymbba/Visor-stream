import React, { useState, useEffect } from 'react';
import { SubscriptionPlan, Currency } from '../types';
import { CURRENCY_RATES } from '../data/mockData';
import { auth, getAuthHeaders } from '../firebase';
import {
  CreditCard,
  CheckCircle2,
  Smartphone,
  ShieldCheck,
  Zap,
  Sparkles,
  Lock,
  X,
  ExternalLink,
  Loader2
} from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: SubscriptionPlan;
  currentCurrency: Currency;
  onSuccess: (plan: SubscriptionPlan) => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  selectedPlan,
  currentCurrency,
  onSuccess,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'mtn' | 'airtel' | 'card' | 'paypal'>('mtn');
  const [phone, setPhone] = useState('0780123456');
  const [email, setEmail] = useState('gamer@visorstream.com');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (auth.currentUser?.email) {
      setEmail(auth.currentUser.email);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const rate = CURRENCY_RATES[currentCurrency]?.rate || 1;
  const symbol = CURRENCY_RATES[currentCurrency]?.symbol || '$';
  const priceCalculated = Math.round(selectedPlan.priceUSD * rate);
  const priceFormatted = priceCalculated.toLocaleString();

  // ✅ Redirects user directly to Pesapal payment portal
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Call Pesapal v3 Checkout Endpoint
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(await getAuthHeaders()),
        },
        body: JSON.stringify({
          amount: priceCalculated,
          currency: currentCurrency,
          email: email.trim() || auth.currentUser?.email || 'gamer@visorstream.com',
          phone: phone.trim(),
          provider: paymentMethod,
          creatorId: null,
          planId: selectedPlan.id,
          type: 'subscription',
          description: `Visor Stream ${selectedPlan.name} Subscription`,
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      let data: any = {};

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const rawText = await response.text();
        console.error(`Non-JSON response from /api/payments/checkout (${response.status}):`, rawText);
        throw new Error(`Server returned status ${response.status}. Payment gateway route unreachable.`);
      }

      if (data.redirectUrl) {
        // Redirects browser to Pesapal checkout for MTN/Airtel MoMo/Card payment
        try {
          if (window.top && window.top !== window) {
            window.top.location.href = data.redirectUrl;
          } else {
            window.location.href = data.redirectUrl;
          }
        } catch {
          window.location.href = data.redirectUrl;
        }
        return;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      throw new Error('Pesapal gateway redirect URL not returned. Please try again.');
    } catch (err: any) {
      console.error('Pesapal checkout error:', err);
      setErrorMessage(err.message || 'Payment initiation failed. Please check network or try again.');
      setIsProcessing(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-[28px] max-w-lg w-full shadow-2xl overflow-hidden animate-scaleUp">
        {/* Modal Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg text-white tracking-tight flex items-center gap-2">
                <span>Unlock {selectedPlan.name}</span>
              </h3>
              <p className="text-xs text-slate-400">70% revenue directly powers creator stream • 30% platform</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-center justify-between">
              <span>{errorMessage}</span>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-red-300 hover:text-white text-xs font-bold"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <form onSubmit={handleCheckout} className="space-y-4 font-mono-code">
            {/* Plan Summary */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-sky-400">
                  Selected Plan
                </span>
                <p className="font-black text-white text-sm">{selectedPlan.name}</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-emerald-400">
                  {symbol} {priceFormatted}
                </span>
                <span className="text-[10px] text-slate-400 block">/ month</span>
              </div>
            </div>

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Select Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('mtn')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                      paymentMethod === 'mtn'
                        ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    🇺🇬 MTN MoMo
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('mpesa')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                      paymentMethod === 'mpesa'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    🇰🇪 M-Pesa
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('airtel')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                      paymentMethod === 'airtel'
                        ? 'bg-red-500/20 text-red-400 border-red-500/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    🇹🇿 Airtel Money
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                      paymentMethod === 'card'
                        ? 'bg-[#0284c7]/20 text-sky-300 border-[#0369a1]/50 shadow-[0_0_8px_rgba(2,132,199,0.15)]'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5 inline mr-1" /> Visa / Mastercard
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paypal')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                      paymentMethod === 'paypal'
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 inline mr-1" /> Mobile Money & Wallets
                  </button>
                </div>
              </div>

              {/* Phone or Card Details Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">
                    Billing Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. gamer@gmail.com"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">
                    Mobile Number (MoMo / SMS)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 0780123456"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                    required
                  />
                </div>
              </div>

              {/* Secure guarantee badge */}
              <div className="flex items-center gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>256-Bit Bank-Grade Security • 70% Creator Revenue Share</span>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 rounded-2xl bg-sky-500 text-slate-950 hover:bg-sky-400 transition-all font-black text-xs tracking-wider uppercase shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Connecting to Secure Gateway...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span>PAY {symbol} {priceFormatted}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                )}
              </button>
            </form>
        </div>
      </div>
    </div>
  );
};

