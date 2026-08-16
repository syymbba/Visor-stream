import React, { useState, useEffect } from 'react';
import { Smartphone, CheckCircle2, ShieldCheck, Zap, X, Gift, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { recordStreamTip } from '../services/chatService';

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
  const [provider, setProvider] = useState<'mtn' | 'airtel' | 'mpesa' | 'card'>('mtn');
  const [amount, setAmount] = useState('5000');
  const [phone, setPhone] = useState('0780123456');
  const [senderName, setSenderName] = useState('Kampala_Gamer');
  const [shoutout, setShoutout] = useState('GG on that clutch play! Keep dominating 🔥');
  
  // Payment processing simulation states
  const [step, setStep] = useState<'form' | 'stk_prompt' | 'processing' | 'success'>('form');
  const [countdown, setCountdown] = useState(15);
  const [pinEntered, setPinEntered] = useState('');

  useEffect(() => {
    let timer: any;
    if (step === 'stk_prompt' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((c) => c - 1);
      }, 1000);
    } else if (step === 'stk_prompt' && countdown === 0) {
      handleFinalizePayment();
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('stk_prompt');
    setCountdown(15);
  };

  const handleFinalizePayment = async () => {
    setStep('processing');
    
    // Simulate gateway response & write to Firestore
    try {
      const numAmount = parseFloat(amount) || 5000;
      await recordStreamTip(streamId, {
        streamerName,
        senderName: senderName.trim() || 'Anonymous Gamer',
        senderPhone: phone,
        amount: numAmount,
        currency: currencyMap[provider],
        network: provider === 'mtn' ? 'MTN MoMo' : provider === 'airtel' ? 'Airtel Money' : provider === 'mpesa' ? 'M-Pesa' : 'Card / Flutterwave',
        message: shoutout
      });
    } catch (e) {
      console.warn('Tip logging error:', e);
    }

    setTimeout(() => {
      setStep('success');
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 }
      });

      if (onSuccess) {
        onSuccess({
          amount: `${amount} ${currencyMap[provider]}`,
          currency: currencyMap[provider],
          message: shoutout,
          sender: senderName
        });
      }
    }, 1200);
  };

  const handleReset = () => {
    setStep('form');
    setCountdown(15);
    setPinEntered('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-[28px] sm:rounded-[32px] p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 relative">
        {/* Close Button */}
        <button
          onClick={handleReset}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-lg text-white tracking-tight">
              Tip {streamerName}
            </h3>
            <p className="text-xs text-slate-400">
              Direct Mobile Money Super Chat & Instant Payout
            </p>
          </div>
        </div>

        {/* STEP 1: Tip Details Form */}
        {step === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-4 font-sans">
            {/* Provider Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono-code">
                Select Mobile Rail / Method
              </label>
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => { setProvider('mtn'); setAmount('5000'); setPhone('0780123456'); }}
                  className={`p-2.5 rounded-2xl border text-center transition-all ${
                    provider === 'mtn'
                      ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500 shadow-md'
                      : 'bg-slate-800/60 text-slate-400 border-slate-700'
                  }`}
                >
                  <span className="block text-sm">🇺🇬</span>
                  <span className="text-[10px] font-bold block mt-0.5">MTN MoMo</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setProvider('airtel'); setAmount('5000'); setPhone('0750123456'); }}
                  className={`p-2.5 rounded-2xl border text-center transition-all ${
                    provider === 'airtel'
                      ? 'bg-red-500/20 text-red-400 border-red-500 shadow-md'
                      : 'bg-slate-800/60 text-slate-400 border-slate-700'
                  }`}
                >
                  <span className="block text-sm">🔴</span>
                  <span className="text-[10px] font-bold block mt-0.5">Airtel</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setProvider('mpesa'); setAmount('500'); setPhone('0712345678'); }}
                  className={`p-2.5 rounded-2xl border text-center transition-all ${
                    provider === 'mpesa'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500 shadow-md'
                      : 'bg-slate-800/60 text-slate-400 border-slate-700'
                  }`}
                >
                  <span className="block text-sm">🇰🇪</span>
                  <span className="text-[10px] font-bold block mt-0.5">M-Pesa</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setProvider('card'); setAmount('5'); }}
                  className={`p-2.5 rounded-2xl border text-center transition-all ${
                    provider === 'card'
                      ? 'bg-sky-500/20 text-sky-400 border-sky-500 shadow-md'
                      : 'bg-slate-800/60 text-slate-400 border-slate-700'
                  }`}
                >
                  <span className="block text-sm">💳</span>
                  <span className="text-[10px] font-bold block mt-0.5">Card</span>
                </button>
              </div>
            </div>

            {/* Quick Amounts */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono-code">
                Amount ({currencyMap[provider]})
              </label>
              <div className="grid grid-cols-4 gap-2">
                {presetAmounts[provider].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt)}
                    className={`py-2 rounded-xl text-xs font-mono-code font-bold border transition-all ${
                      amount === amt
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {amt}
                  </button>
                ))}
              </div>
              <div className="relative mt-2">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono-code text-white font-bold focus:outline-none focus:border-amber-400"
                  required
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono-code font-bold">
                  {currencyMap[provider]}
                </span>
              </div>
            </div>

            {/* Phone Number Input for Mobile Money */}
            {provider !== 'card' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono-code">
                  Subscriber Mobile Number
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0780123456"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono-code"
                    required
                  />
                </div>
              </div>
            )}

            {/* Gamer Name & Shoutout */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono-code">
                Your Gamer Tag & On-Screen Shoutout
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
                placeholder="Write a message to appear on the stream HUD..."
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-none"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
              >
                <span>Authorize {amount} {currencyMap[provider]} Tip</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: STK Push Mobile Simulation */}
        {step === 'stk_prompt' && (
          <div className="space-y-5 animate-fadeIn text-center">
            <div className="p-5 bg-amber-500/10 border border-amber-500/30 rounded-3xl space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/40 animate-pulse">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-black text-white">
                  STK Push Sent to Phone
                </h4>
                <p className="text-xs text-amber-300 font-mono-code mt-0.5">
                  Target: {phone} • {provider.toUpperCase()}
                </p>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Check your mobile handset now. An instant network USSD prompt has appeared to authorize{' '}
                <span className="font-bold text-white">{amount} {currencyMap[provider]}</span>.
              </p>

              {/* Simulated Interactive Mobile PIN Pad / Quick Approver */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 mt-2">
                <p className="text-[10px] uppercase font-mono-code font-bold text-slate-400">
                  Simulate PIN Authorization (Or auto-approves in {countdown}s)
                </p>
                <div className="flex justify-center gap-2">
                  <input
                    type="password"
                    maxLength={4}
                    value={pinEntered}
                    onChange={(e) => setPinEntered(e.target.value)}
                    placeholder="••••"
                    className="w-28 text-center py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono-code font-bold tracking-widest text-base focus:border-amber-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleFinalizePayment}
                    className="px-4 py-2 bg-amber-500 text-slate-950 font-black text-xs rounded-xl uppercase hover:bg-amber-400 transition-colors"
                  >
                    Confirm PIN
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 font-mono-code">
              <span>Automatic Timeout:</span>
              <span className="text-amber-400 font-bold">{countdown} seconds</span>
            </div>
          </div>
        )}

        {/* STEP 3: Processing */}
        {step === 'processing' && (
          <div className="py-12 space-y-4 text-center animate-fadeIn">
            <Loader2 className="w-10 h-10 text-amber-400 animate-spin mx-auto" />
            <h4 className="text-base font-black text-white">
              Validating Mobile Money Settlement...
            </h4>
            <p className="text-xs text-slate-400 font-mono-code">
              Connecting with Nairobi Edge Gateway & Cloud Firestore
            </p>
          </div>
        )}

        {/* STEP 4: Success Confetti View */}
        {step === 'success' && (
          <div className="py-6 space-y-4 text-center animate-fadeIn">
            <div className="w-14 h-14 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-black text-white">
                Super Tip Dispatched!
              </h4>
              <p className="text-xs text-emerald-400 font-mono-code mt-1">
                {amount} {currencyMap[provider]} successfully paid to {streamerName}
              </p>
            </div>
            <p className="text-xs text-slate-300 italic px-4 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
              "{shoutout}"
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="w-full py-3 bg-white text-slate-950 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-sky-400 transition-colors shadow-lg"
            >
              Back to Live Stream
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
