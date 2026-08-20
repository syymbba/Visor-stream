import React, { useState } from 'react';
import { Currency } from '../types';
import { CURRENCY_RATES } from '../data/mockData';
import confetti from 'canvas-confetti';
import {
  Smartphone,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Building2,
  Clock,
  Download,
  Receipt,
  X,
  AlertCircle,
  Zap,
  Info
} from 'lucide-react';

interface CreatorPayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalanceUSD: number;
  currentCurrency: Currency;
  onPayoutSuccess?: (payout: any) => void;
}

export type PayoutProvider = 'MTN MoMo' | 'Airtel Money' | 'M-Pesa' | 'Bank Transfer';

export const CreatorPayoutModal: React.FC<CreatorPayoutModalProps> = ({
  isOpen,
  onClose,
  availableBalanceUSD,
  currentCurrency,
  onPayoutSuccess,
}) => {
  const [provider, setProvider] = useState<PayoutProvider>('MTN MoMo');
  const [phone, setPhone] = useState('0780123456');
  const [recipientName, setRecipientName] = useState('Visor Pro Creator');
  const [amountUSD, setAmountUSD] = useState<number>(Math.min(availableBalanceUSD, 50));
  const [bankDetails, setBankDetails] = useState({
    bankName: 'Stanbic Bank Uganda',
    accountNumber: '9030012345678',
    swiftCode: 'SBICUGKX',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedReceipt, setCompletedReceipt] = useState<any | null>(null);

  if (!isOpen) return null;

  const rate = CURRENCY_RATES[currentCurrency]?.rate || 3750;
  const symbol = CURRENCY_RATES[currentCurrency]?.symbol || 'UGX';

  const feeUSD = Math.round(amountUSD * 0.015 * 100) / 100; // 1.5% processing fee
  const netPayoutUSD = Math.max(0, amountUSD - feeUSD);
  const localAmount = Math.round(amountUSD * rate);
  const netLocalAmount = Math.round(netPayoutUSD * rate);

  const handleMax = () => {
    setAmountUSD(availableBalanceUSD);
  };

  const handleQuickPercent = (percent: number) => {
    setAmountUSD(Math.round(availableBalanceUSD * (percent / 100) * 100) / 100);
  };

  const handleSubmitPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (amountUSD <= 0) {
      setError('Please enter a valid payout amount.');
      return;
    }

    if (amountUSD > availableBalanceUSD) {
      setError(`Requested amount exceeds available balance ($${availableBalanceUSD.toFixed(2)}).`);
      return;
    }

    if (provider !== 'Bank Transfer' && (!phone || phone.trim().length < 9)) {
      setError('Please enter a valid Mobile Money phone number.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/payouts/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountUSD,
          localAmount,
          currency: currentCurrency,
          provider,
          phone: provider === 'Bank Transfer' ? bankDetails.accountNumber : phone,
          recipientName,
          feeUSD,
          netPayoutUSD,
          notes: provider === 'Bank Transfer' ? `${bankDetails.bankName} - ${bankDetails.swiftCode}` : 'Instant Mobile Money Disbursal'
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Payout request failed on server');
      }

      setCompletedReceipt(data.payout);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      if (onPayoutSuccess) {
        onPayoutSuccess(data.payout);
      }
    } catch (err: any) {
      setError(err.message || 'Unable to process withdrawal request');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = () => {
    if (!completedReceipt) return;
    const content = `
========================================
       VISOR STREAM CREATOR PAYOUT
========================================
Receipt No: ${completedReceipt.receiptNumber || 'VSR-PAY-' + Date.now()}
Reference: ${completedReceipt.reference}
Date: ${new Date().toLocaleString()}

Recipient: ${completedReceipt.recipientName}
Payment Rail: ${completedReceipt.provider}
Destination: ${completedReceipt.phone}
KYC Tier: ${completedReceipt.kycTier || 'Tier 2 (Verified)'}

Gross Amount: $${completedReceipt.amountUsd} (${completedReceipt.currency} ${parseFloat(completedReceipt.localAmount).toLocaleString()})
Processing Fee (1.5%): $${completedReceipt.feeUsd}
Net Disbursed: $${completedReceipt.netPayoutUsd} (${completedReceipt.currency} ${Math.round(parseFloat(completedReceipt.netPayoutUsd) * rate).toLocaleString()})

Status: COMPLETED (Dispatched via Instant Switch)
========================================
    Powered by Visor Stream Direct Ingest
========================================
    `.trim();

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Visor_Payout_${completedReceipt.reference}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {completedReceipt ? (
          /* Receipt Success State */
          <div className="space-y-6 text-center py-2 animate-scaleIn">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-mono-code font-bold uppercase tracking-wider">
                Payout Dispatched Instantly
              </span>
              <h2 className="text-2xl font-black text-white">Withdrawal Successful</h2>
              <p className="text-xs text-slate-400">
                Funds transferred via <strong className="text-slate-200">{completedReceipt.provider}</strong> to <strong className="text-slate-200">{completedReceipt.phone}</strong>.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 text-left space-y-3 font-mono-code text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Receipt Number:</span>
                <span className="text-white font-bold">{completedReceipt.receiptNumber || 'VSR-PAY-9821'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Reference ID:</span>
                <span className="text-purple-400">{completedReceipt.reference}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Net Disbursed:</span>
                <span className="text-emerald-400 font-bold text-sm">
                  ${completedReceipt.netPayoutUsd} ({completedReceipt.currency} {Math.round(parseFloat(completedReceipt.netPayoutUsd) * rate).toLocaleString()})
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Processing Fee (1.5%):</span>
                <span className="text-slate-300">${completedReceipt.feeUsd}</span>
              </div>
              <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800">
                <span>Status:</span>
                <span className="text-emerald-400 flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> COMPLETED
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDownloadReceipt}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Receipt</span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Form Entry State */
          <form onSubmit={handleSubmitPayout} className="space-y-5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-purple-500/10 text-purple-300 text-xs font-mono-code font-bold uppercase tracking-wider">
                <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                <span>Instant Mobile Money & Cashout Gateway</span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Withdraw Creator Earnings</h2>
              <p className="text-xs text-slate-400">
                Disburse your live stream super tips and subscriptions directly to Mobile Money or your bank.
              </p>
            </div>

            {/* Available Balance Banner */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="space-y-0.5">
                <span className="text-[11px] font-mono-code text-slate-400 uppercase">Available for Payout</span>
                <div className="text-xl font-black text-white">
                  ${availableBalanceUSD.toFixed(2)}{' '}
                  <span className="text-xs font-normal text-purple-400 font-mono-code">
                    ({symbol} {Math.round(availableBalanceUSD * rate).toLocaleString()})
                  </span>
                </div>
              </div>
              <div className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Tier 2 Verified</span>
              </div>
            </div>

            {/* Provider Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Select Payout Rail</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'MTN MoMo', label: 'MTN MoMo', color: 'border-yellow-500/40 text-yellow-400' },
                  { id: 'Airtel Money', label: 'Airtel Money', color: 'border-red-500/40 text-red-400' },
                  { id: 'M-Pesa', label: 'M-Pesa', color: 'border-emerald-500/40 text-emerald-400' },
                  { id: 'Bank Transfer', label: 'Bank Transfer', color: 'border-blue-500/40 text-blue-400' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setProvider(item.id as PayoutProvider)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                      provider === item.id
                        ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-500/10'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-slate-300 uppercase tracking-wider">Withdrawal Amount (USD)</label>
                <div className="flex items-center gap-1.5 font-mono-code">
                  <button
                    type="button"
                    onClick={() => handleQuickPercent(25)}
                    className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300"
                  >
                    25%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPercent(50)}
                    className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300"
                  >
                    50%
                  </button>
                  <button
                    type="button"
                    onClick={handleMax}
                    className="px-2 py-0.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-[10px] text-purple-300 font-bold"
                  >
                    MAX
                  </button>
                </div>
              </div>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  step="1"
                  min="5"
                  max={availableBalanceUSD}
                  value={amountUSD || ''}
                  onChange={(e) => setAmountUSD(parseFloat(e.target.value) || 0)}
                  placeholder="50"
                  className="w-full pl-8 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white font-mono-code font-bold text-lg focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <div className="text-right text-[11px] font-mono-code text-slate-400">
                ≈ {symbol} {localAmount.toLocaleString()}
              </div>
            </div>

            {/* Mobile Money Details */}
            {provider !== 'Bank Transfer' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Registered Name</label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    required
                    placeholder="e.g. John Doe"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">{provider} Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="0780123456"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono-code focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-xs space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 font-medium">Bank Name</label>
                    <input
                      type="text"
                      value={bankDetails.bankName}
                      onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-medium">Account Number</label>
                    <input
                      type="text"
                      value={bankDetails.accountNumber}
                      onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono-code"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Fee & Net Calculation Breakdown */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs font-mono-code">
              <div className="flex justify-between text-slate-400">
                <span>Processing Fee (1.5%):</span>
                <span>${feeUSD.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-200 font-bold pt-1 border-t border-slate-800">
                <span>Net Disbursed Amount:</span>
                <span className="text-emerald-400">
                  ${netPayoutUSD.toFixed(2)} ({symbol} {netLocalAmount.toLocaleString()})
                </span>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || amountUSD <= 0 || amountUSD > availableBalanceUSD}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 transition-transform active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Transmitting to {provider}...</span>
                </div>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Confirm Instant Payout (${netPayoutUSD.toFixed(2)})</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
