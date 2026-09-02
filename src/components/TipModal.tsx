import React, { useState, useEffect } from 'react';
import { Smartphone, CheckCircle2, ShieldCheck, Zap, X, Gift, Sparkles, Loader2, ArrowRight, ExternalLink, CreditCard } from 'lucide-react';
import { usePesapalCheckout } from '../hooks/usePesapalCheckout';
import { auth } from '../firebase';
import { useLanguage } from '../lib/i18n';

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
  streamId: string;
  streamerName: string;
  onSuccess?: (tipDetails: { amount: string; currency: string; message: string; sender: string }) => void;
}

export const TipModal: React.FC<TipModalProps> = ({
  isOpen,
  onClose,
  streamId,
  streamerName,
  onSuccess
}) => {
  const { t } = useLanguage();
  const [provider, setProvider] = useState<'mtn' | 'airtel' | 'mpesa' | 'card'>('mtn');
  const [amount, setAmount] = useState('5000');
  const [phone, setPhone] = useState('0780123456');
  const [email, setEmail] = useState('gamer@visorstream.com');
  const [senderName, setSenderName] = useState('Kampala_Gamer');
  const [shoutout, setShoutout] = useState('GG on that clutch play! Keep dominating 🔥');

  const { loading, error, triggerCheckout } = usePesapalCheckout();

  useEffect(() => {
    if (auth.currentUser) {
      if (auth.currentUser.email) setEmail(auth.currentUser.email);
      if (auth.currentUser.displayName) setSenderName(auth.currentUser.displayName);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currencyMap = {
    mtn: 'UGX',
    airtel: 'UGX',
    mpesa: 'KES',
    card: 'USD'
  };

  const presetAmounts = {
    mtn: ['2000', '5000', '10000', '25000'],
    airtel: ['2000', '5000', '10000', '25000'],
    mpesa: ['100', '250', '500', '1000'],
    card: ['2', '5', '10', '25']
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    const currency = currencyMap[provider];

    // Trigger real Pesapal Checkout with autoRedirect
    await triggerCheckout({
      amount: numAmount,
      currency,
      email: email.trim() || `${senderName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'gamer'}@visorstream.com`,
      phone: phone.trim(),
      creatorId: streamerName,
      streamId,
      type: 'tip',
      description: `Live Stream Tip to ${streamerName}: "${shoutout}"`,
      autoRedirect: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-[32px] max-w-md w-full shadow-2xl overflow-hidden animate-scaleUp">
        {/* Modal Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-white tracking-tight flex items-center gap-2">
                <span>{t('tip.title')}</span>
              </h3>
              <p className="text-xs text-slate-400">
                <span className="text-white font-bold">{streamerName}</span> • {t('tip.to_creator')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono-code">
                {t('tip.select_network')}
              </label>
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setProvider('mtn');
                    setAmount('5000');
                  }}
                  className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                    provider === 'mtn'
                      ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40 shadow-lg shadow-yellow-500/10'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  🇺🇬 MTN
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProvider('airtel');
                    setAmount('5000');
                  }}
                  className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                    provider === 'airtel'
                      ? 'bg-red-500/20 text-red-400 border-red-500/40 shadow-lg shadow-red-500/10'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  🇺🇬 Airtel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProvider('mpesa');
                    setAmount('250');
                  }}
                  className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                    provider === 'mpesa'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  🇰🇪 M-Pesa
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProvider('card');
                    setAmount('5');
                  }}
                  className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                    provider === 'card'
                      ? 'bg-sky-500/20 text-sky-400 border-sky-500/40 shadow-lg shadow-sky-500/10'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 inline mr-1" /> Card
                </button>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono-code">
                {t('tip.amount_label')} ({currencyMap[provider]})
              </label>
              <div className="grid grid-cols-4 gap-2">
                {presetAmounts[provider].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset)}
                    className={`py-2 rounded-xl text-xs font-mono-code font-bold transition-all ${
                      amount === preset
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {/* Custom Input */}
              <div className="relative mt-2">
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Custom Amount"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono-code font-bold"
                  required
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono-code font-bold">
                  {currencyMap[provider]}
                </span>
              </div>
            </div>

            {/* Phone Number Input for Mobile Money */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono-code">
                {t('tip.mobile_number')}
              </label>
              <div className="relative">
                <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0780123456"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono-code"
                  required
                />
              </div>
            </div>

            {/* Gamer Name & Shoutout */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono-code">
                {t('tip.gamer_tag_shoutout')}
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Gamer Tag"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 mb-1.5"
                required
              />
              <textarea
                rows={2}
                value={shoutout}
                onChange={(e) => setShoutout(e.target.value)}
                placeholder={t('tip.shoutout_placeholder')}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-none text-xs"
                required
              />
            </div>

            <div className="flex items-center gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{t('tip.security_note')}</span>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>{t('tip.connecting_gateway')}</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span>{t('tip.pay')} {amount} {currencyMap[provider]}</span>
                    <ExternalLink className="w-4 h-4" />
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
