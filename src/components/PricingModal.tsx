import React, { useState } from 'react';
import { SubscriptionPlan, Currency } from '../types';
import { CURRENCY_RATES } from '../data/mockData';
import confetti from 'canvas-confetti';
import {
  CreditCard,
  CheckCircle2,
  Smartphone,
  ShieldCheck,
  Zap,
  Sparkles,
  Lock,
  X
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  if (!isOpen) return null;

  const rate = CURRENCY_RATES[currentCurrency].rate;
  const symbol = CURRENCY_RATES[currentCurrency].symbol;
  const priceFormatted = (selectedPlan.priceUSD * rate).toLocaleString();

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 }
      });

      setTimeout(() => {
        onSuccess(selectedPlan);
        onClose();
        setIsComplete(false);
      }, 2000);
    }, 1800);
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
              <h3 className="font-black text-lg text-white tracking-tight">
                Unlock {selectedPlan.name}
              </h3>
              <p className="text-xs text-slate-400">70% revenue directly powers creator stream</p>
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
          {isComplete ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center animate-bounce border border-emerald-500/30">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-black text-white">
                Subscription Activated!
              </h4>
              <p className="text-xs text-slate-300">
                You are now an active {selectedPlan.badge}. All perks & masterclass tutorials are unlocked.
              </p>
            </div>
          ) : (
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
                <label className="text-xs font-bold text-slate-300">Select Local / Global Payment Channel</label>
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
                        ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    💳 Stripe / Cards
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
                    🅿️ PayPal
                  </button>
                </div>
              </div>

              {/* Phone or Card Details Input */}
              {paymentMethod !== 'card' && paymentMethod !== 'paypal' ? (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">
                    Mobile Money Number for STK Push
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 0780123456 or 0712345678"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    A PIN authorization prompt will appear on your phone screen.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">
                    Cardholder Email / Name
                  </label>
                  <input
                    type="email"
                    defaultValue="gamer@gmail.com"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-400"
                    required
                  />
                </div>
              )}

              {/* Secure guarantee badge */}
              <div className="flex items-center gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>256-bit encrypted checkout via Flutterwave & Paystack. Cancel anytime.</span>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 rounded-2xl bg-white text-slate-950 hover:bg-sky-400 transition-colors font-black text-xs tracking-wider uppercase shadow-lg flex items-center justify-center gap-2 active:scale-95"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin"></span>
                    <span>Waiting for Mobile STK PIN Confirm...</span>
                  </span>
                ) : (
                  <span>
                    Pay {symbol} {priceFormatted} & Unlock
                  </span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
