import React, { useState, useEffect } from 'react';
import { CreatorDashboardStats, Currency } from '../types';
import { CURRENCY_RATES, REGIONAL_SERVER_NODES, MOCK_CREATOR_DASHBOARD } from '../data/mockData';
import { CreatorTipJarWidget } from './CreatorTipJarWidget';
import { TipModal } from './TipModal';
import { PaymentHistory } from './PaymentHistory';
import { StreamOverlayWidget } from './StreamOverlayWidget';
import { RevenueSplitChart } from './RevenueSplitChart';
import { useWalletBalance } from '../hooks/useWalletBalance';
import { getAuthHeaders } from '../firebase';
import confetti from 'canvas-confetti';
import {
  LayoutDashboard,
  Activity,
  DollarSign,
  TrendingUp,
  Users,
  Eye,
  Key,
  Copy,
  RefreshCw,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Wifi,
  Settings,
  Flame,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Sliders,
  Layers,
  Radio,
  Gift,
  Receipt,
  Tv,
  Percent,
  Download,
  FileCheck
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

interface CreatorStudioViewProps {
  stats?: CreatorDashboardStats;
  initialStats?: CreatorDashboardStats;
  currentCurrency: Currency;
  onStartBroadcast?: () => void;
}

export const CreatorStudioView: React.FC<CreatorStudioViewProps> = ({
  stats: propsStats,
  initialStats,
  currentCurrency,
  onStartBroadcast,
}) => {
  const effectiveStats = propsStats || initialStats || MOCK_CREATOR_DASHBOARD;
  const [stats, setStats] = useState<CreatorDashboardStats>(effectiveStats);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedIngest, setCopiedIngest] = useState(false);
  const [selectedIngestServer, setSelectedIngestServer] = useState(REGIONAL_SERVER_NODES[0].id);
  const [activeTab, setActiveTab] = useState<'overview' | 'split' | 'payouts' | 'payments' | 'overlay'>('overview');

  // Live Wallet Balance Hook
  const wallet = useWalletBalance({ enabled: true });

  // Payout Requests State
  const [payoutList, setPayoutList] = useState<any[]>([]);
  const [loadingPayouts, setLoadingPayouts] = useState(false);
  const [isProcessingPayout, setIsProcessingPayout] = useState(false);
  const [receiptModalPayout, setReceiptModalPayout] = useState<any | null>(null);

  // Cashout Modal State
  const [cashoutModalOpen, setCashoutModalOpen] = useState(false);
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const [cashoutMethod, setCashoutMethod] = useState<'M-Pesa' | 'MTN MoMo' | 'Airtel Money' | 'PayPal'>('MTN MoMo');
  const [cashoutPhone, setCashoutPhone] = useState('0780123456');
  const [cashoutAmountUSD, setCashoutAmountUSD] = useState(wallet.balanceUSD || 0);
  const [cashoutSuccessAlert, setCashoutSuccessAlert] = useState<string | null>(null);
  const [cashoutTwoFactorRequired, setCashoutTwoFactorRequired] = useState(false);
  const [cashoutTwoFactorToken, setCashoutTwoFactorToken] = useState('');

  const fetchPayoutHistory = async () => {
    setLoadingPayouts(true);
    try {
      const res = await fetch('/api/payouts/history', { headers: await getAuthHeaders() });
      const data = await res.json();
      if (data.success && Array.isArray(data.payouts)) {
        setPayoutList(data.payouts);
      }
    } catch (err) {
      console.warn('Could not fetch payout history:', err);
    } finally {
      setLoadingPayouts(false);
    }
  };

  useEffect(() => {
    fetchPayoutHistory();
  }, []);

  useEffect(() => {
    if (wallet.balanceUSD > 0 && cashoutAmountUSD === 0) {
      setCashoutAmountUSD(wallet.balanceUSD);
    }
  }, [wallet.balanceUSD]);

  useEffect(() => {
    if (!cashoutModalOpen) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/auth/2fa/status', { headers: await getAuthHeaders() });
        const data = await res.json();
        if (!cancelled) setCashoutTwoFactorRequired(Boolean(data.enabled));
      } catch {
        if (!cancelled) setCashoutTwoFactorRequired(false);
      }
    })();
    return () => { cancelled = true; };
  }, [cashoutModalOpen]);

  useEffect(() => {
    if (propsStats || initialStats) {
      setStats(propsStats || initialStats || MOCK_CREATOR_DASHBOARD);
    }
  }, [propsStats, initialStats]);

  // Real-time fluctuating stream bitrate & viewers simulation
  const [viewerHistory, setViewerHistory] = useState([
    { time: '18:00', viewers: 1800, bitrate: 6200 },
    { time: '18:30', viewers: 2200, bitrate: 6400 },
    { time: '19:00', viewers: 2650, bitrate: 6500 },
    { time: '19:30', viewers: 3100, bitrate: 6600 },
    { time: '20:00', viewers: 3420, bitrate: 6540 },
    { time: '20:30', viewers: 3750, bitrate: 6580 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time stream pulse
      const jitterBitrate = Math.floor(6450 + (Math.random() * 200 - 100));
      const jitterViewers = Math.floor(stats.currentViewers + (Math.random() * 20 - 10));

      setStats(prev => ({
        ...prev,
        liveBitrateKbps: jitterBitrate,
        currentViewers: Math.max(3000, jitterViewers),
        fps: Math.random() > 0.1 ? 60 : 59,
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, [stats.currentViewers]);

  const handleCopyStreamKey = () => {
    navigator.clipboard.writeText(stats.streamKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCopyIngest = () => {
    navigator.clipboard.writeText(stats.serverIngestUrl);
    setCopiedIngest(true);
    setTimeout(() => setCopiedIngest(false), 2000);
  };

  const handleRegenerateKey = () => {
    const newKey = 'live_vsr_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 10);
    setStats(prev => ({ ...prev, streamKey: newKey }));
    confetti({ particleCount: 30, spread: 50 });
  };

  const handleProcessCashout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingPayout(true);

    try {
      const res = await fetch('/api/payouts/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
        body: JSON.stringify({
          amountUSD: cashoutAmountUSD,
          method: cashoutMethod,
          phone: cashoutPhone,
          currency: currentCurrency,
          recipientName: 'Visor Broadcaster',
          twoFactorToken: cashoutTwoFactorToken || undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setCashoutModalOpen(false);
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });

        setCashoutSuccessAlert(
          `Instant payout of $${cashoutAmountUSD} USD dispatched to ${cashoutPhone} via ${cashoutMethod}! Receipt: ${data.receiptNumber || data.reference}`
        );

        // Reload payout ledger & balance. (This used to call the
        // non-existent `wallet.refetch()`, which threw and was caught by the
        // outer catch below - reopening this modal with a confusing error
        // alert immediately after a successful payout, and skipping the
        // fetchPayoutHistory() call entirely.)
        wallet.refreshBalance();
        fetchPayoutHistory();

        setTimeout(() => setCashoutSuccessAlert(null), 9000);
      } else {
        alert(data.error || 'Failed to submit payout request');
      }
    } catch (err: any) {
      console.error('Payout submit error:', err);
      setCashoutModalOpen(true);
      alert(err.message || 'Payout request failed. Please try again.');
    } finally {
      setIsProcessingPayout(false);
    }
  };

  const rate = CURRENCY_RATES[currentCurrency].rate;
  const symbol = CURRENCY_RATES[currentCurrency].symbol;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner Alert on Payout */}
      {cashoutSuccessAlert && (
        <div className="p-4 bg-gradient-to-r from-emerald-600/90 to-teal-600/90 text-white rounded-xl border border-emerald-400 shadow-2xl flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-6 h-6 text-emerald-200 flex-shrink-0" />
          <div className="text-xs sm:text-sm font-semibold">
            {cashoutSuccessAlert}
          </div>
        </div>
      )}

      {/* Creator Header with Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-[28px] sm:rounded-[32px] border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Real-Time Creator Dashboard & Ingest Studio
              </h1>
              <p className="text-xs text-slate-400">
                Live broadcast monitoring, stream telemetry & automated 70/30 mobile money revenue settlements
              </p>
            </div>
          </div>
        </div>

        {/* Live Broadcast Status Chip & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {onStartBroadcast && (
            <button
              onClick={onStartBroadcast}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-500/20 transition-transform active:scale-95 cursor-pointer"
            >
              <Radio className="w-4 h-4 text-white animate-pulse" />
              <span>Launch Live Stream</span>
            </button>
          )}

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono-code font-bold">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span>BROADCASTING LIVE</span>
          </div>

          <button
            onClick={() => setCashoutModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-transform active:scale-95 cursor-pointer"
          >
            <DollarSign className="w-4 h-4 text-slate-950" />
            <span>Request Mobile Money Payout</span>
          </button>
        </div>
      </div>

      {/* Studio Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-mono-code transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-sky-500 text-slate-950 font-black shadow-lg shadow-sky-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Studio Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('split')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-mono-code transition-all cursor-pointer ${
            activeTab === 'split'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Percent className="w-3.5 h-3.5 text-emerald-400" />
          <span>70/30 Revenue Split</span>
        </button>

        <button
          onClick={() => setActiveTab('payouts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-mono-code transition-all cursor-pointer ${
            activeTab === 'payouts'
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-400" />
          <span>Payout Requests</span>
          {payoutList.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-slate-950 text-amber-400 text-[10px]">
              {payoutList.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-mono-code transition-all cursor-pointer ${
            activeTab === 'payments'
              ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Customer Orders</span>
          {wallet.completedOrdersCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-slate-950 text-emerald-400 text-[10px]">
              {wallet.completedOrdersCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('overlay')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-mono-code transition-all cursor-pointer ${
            activeTab === 'overlay'
              ? 'bg-purple-600 text-white font-black shadow-lg shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Tv className="w-3.5 h-3.5" />
          <span>Stream Overlay & Alerts (TTS)</span>
        </button>
      </div>

      {/* Tab: Revenue Split Chart */}
      {activeTab === 'split' && (
        <RevenueSplitChart
          currentCurrency={currentCurrency}
          userBalanceUSD={wallet.balanceUSD}
          totalRevenueUSD={wallet.totalRevenueUSD}
        />
      )}

      {/* Tab: Payout Requests & Mobile Money Ledger */}
      {activeTab === 'payouts' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-mono-code uppercase font-bold">Available to Cash Out</span>
              <div className="my-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-emerald-400 font-rajdhani">
                  {symbol} {(wallet.getBalanceInCurrency(currentCurrency)).toLocaleString()}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono-code">${wallet.balanceUSD.toFixed(2)} USD Net Share</span>
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-mono-code uppercase font-bold">Total Payouts Settled</span>
              <div className="my-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-sky-400 font-rajdhani">
                  {payoutList.length}
                </span>
                <span className="text-xs text-emerald-400 font-mono-code">100% On-Time</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono-code">Direct Telco Gateway</span>
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl border border-amber-500/30 flex flex-col justify-between bg-gradient-to-br from-slate-900 to-amber-950/20">
              <span className="text-xs text-amber-300 font-mono-code uppercase font-bold">Instant MoMo Push</span>
              <div className="my-2">
                <button
                  onClick={() => setCashoutModalOpen(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Request Cashout Now</span>
                </button>
              </div>
              <span className="text-[10px] text-slate-400 font-mono-code">Min: $20.00 USD (75,000 UGX / 2,600 KES)</span>
            </div>
          </div>

          {/* Payouts Ledger Table */}
          <div className="bg-slate-900 p-6 rounded-[28px] border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-black text-sm uppercase text-slate-300 tracking-wider font-mono-code flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  Mobile Money Payout Ledger & Settlements
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Direct disbursements to MTN MoMo, M-Pesa Kenya, Airtel Money & PayPal.
                </p>
              </div>
              <button
                onClick={fetchPayoutHistory}
                disabled={loadingPayouts}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono-code transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingPayouts ? 'animate-spin' : ''}`} />
                <span>Refresh Ledger</span>
              </button>
            </div>

            {loadingPayouts ? (
              <div className="py-12 text-center text-slate-400 text-xs font-mono-code">
                Loading payout records...
              </div>
            ) : payoutList.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <Smartphone className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">No payout requests yet</p>
                <p className="text-xs text-slate-500 font-mono-code">
                  Earn revenue from subs & tips, then request instant mobile money cashouts.
                </p>
                <button
                  onClick={() => setCashoutModalOpen(true)}
                  className="mt-2 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider"
                >
                  Create First Payout Request
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono-code">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                      <th className="py-3 px-3">Reference / Receipt</th>
                      <th className="py-3 px-3">Channel / Carrier</th>
                      <th className="py-3 px-3">Phone / Account</th>
                      <th className="py-3 px-3">Amount (USD)</th>
                      <th className="py-3 px-3">Local Disbursed</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {payoutList.map((po) => (
                      <tr key={po.id || po.reference} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-3">
                          <span className="font-bold text-white block">{po.reference || po.id}</span>
                          <span className="text-[10px] text-slate-500">{po.receiptNumber || 'REC-VERIFIED'}</span>
                        </td>
                        <td className="py-3.5 px-3 font-semibold text-slate-200">
                          {po.provider || po.method || 'MTN MoMo'}
                        </td>
                        <td className="py-3.5 px-3 text-slate-300">
                          {po.phone || po.account}
                        </td>
                        <td className="py-3.5 px-3 font-bold text-emerald-400">
                          ${po.amountUSD ? po.amountUSD.toFixed(2) : (po.amountUsd || '0.00')} USD
                        </td>
                        <td className="py-3.5 px-3 text-slate-300">
                          {po.currency || 'UGX'} {Number(po.localAmount || 0).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                            {po.status || 'COMPLETED'}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <button
                            onClick={() => setReceiptModalPayout(po)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg text-[11px] font-bold transition-colors inline-flex items-center gap-1"
                          >
                            <FileCheck className="w-3 h-3" />
                            <span>Receipt</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 1: Studio Dashboard (Overview) */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1: Concurrent Viewers */}
          <div className="bg-slate-900 p-5 rounded-[24px] border border-slate-800 shadow-lg relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono-code text-[11px] uppercase font-bold tracking-wider">Concurrent Viewers</span>
              <Eye className="w-4 h-4 text-sky-400" />
            </div>
            <div className="my-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-bold text-white font-rajdhani">
                {stats.currentViewers.toLocaleString()}
              </span>
              <span className="text-xs text-emerald-400 font-mono-code font-bold flex items-center">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +14.2%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono-code">Peak session: {stats.peakViewers.toLocaleString()}</p>
          </div>

          {/* Metric 2: Live Ingest Bitrate */}
          <div className="bg-slate-900 p-5 rounded-[24px] border border-slate-800 shadow-lg relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono-code text-[11px] uppercase font-bold tracking-wider">Live Ingest Bitrate</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="my-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-bold text-emerald-400 font-rajdhani font-mono-code">
                {stats.liveBitrateKbps} <span className="text-sm text-slate-400">Kbps</span>
              </span>
              <span className="text-xs text-slate-300 font-mono-code">{stats.fps} FPS</span>
            </div>
            <p className="text-[11px] text-emerald-400 font-mono-code flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Health: {stats.streamHealth} (0.08% drops)
            </p>
          </div>

          {/* Metric 3: Active Subscribers */}
          <div className="bg-slate-900 p-5 rounded-[24px] border border-slate-800 shadow-lg relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono-code text-[11px] uppercase font-bold tracking-wider">Paying Subscribers</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="my-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-bold text-white font-rajdhani">
                {wallet.totalSubscribers.toLocaleString()}
              </span>
              <span className="text-xs text-indigo-400 font-bold font-mono-code">
                {wallet.totalTipsCount} Super Tips
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono-code">+{stats.followersGainedToday} new followers today</p>
          </div>

          {/* Metric 4: Estimated Net Earnings */}
          <div className="bg-slate-900 p-5 rounded-[24px] border border-emerald-500/30 bg-gradient-to-br from-slate-900 to-emerald-950/40 shadow-lg relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono-code text-[11px] uppercase font-bold tracking-wider">Net Payout (70% Share)</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="my-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-bold text-emerald-400 font-rajdhani">
                {symbol} {(wallet.getBalanceInCurrency(currentCurrency)).toLocaleString()}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono-code">
              ${wallet.balanceUSD.toFixed(2)} USD (Gross: ${wallet.totalRevenueUSD.toFixed(2)})
            </p>
          </div>
        </div>
      )}

      {activeTab === 'payments' ? (
        <PaymentHistory currentCurrency={currentCurrency} />
      ) : (
        <>

      {/* Creator Tip Jar & Community Goal Widget */}
      <CreatorTipJarWidget
        currentCurrency={currentCurrency}
        isCreatorView={true}
        onOpenTipModal={() => setIsTipModalOpen(true)}
      />

      {/* Main Bento Studio Grid: Real-Time Telemetry & Financial Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 7 Cols: Real-Time Stream Performance Graph & Stream Keys */}
        <div className="lg:col-span-7 space-y-5">
          {/* Chart Card */}
          <div className="bg-slate-900 p-6 rounded-[28px] sm:rounded-[32px] border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-400" />
                <h3 className="font-black text-xs uppercase text-slate-400 tracking-widest font-mono-code">
                  Live Viewership & Ingest Bitrate Telemetry
                </h3>
              </div>
              <span className="text-xs font-mono-code text-sky-400 font-bold">
                Session Time: 02h 44m
              </span>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={viewerHistory}>
                  <defs>
                    <linearGradient id="colorViewers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="viewers"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorViewers)"
                    name="Concurrent Viewers"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* RTMP Stream Key & Ingest Server Setup */}
          <div className="bg-slate-900 p-6 rounded-[28px] sm:rounded-[32px] border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                <h3 className="font-black text-xs uppercase text-slate-400 tracking-widest font-mono-code">
                  Broadcaster RTMP Credentials (OBS / Streamlabs / Mobile)
                </h3>
              </div>
              <span className="text-[10px] text-amber-400 font-bold font-mono-code bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                🔒 SECRET KEY
              </span>
            </div>

            <div className="space-y-4">
              {/* Ingest Server selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 font-mono-code uppercase flex items-center justify-between">
                  <span>Target Ingest Relay Node</span>
                  <span className="text-[11px] text-sky-400 font-mono-code">Auto-selected lowest latency</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {REGIONAL_SERVER_NODES.slice(0, 3).map((node) => (
                    <button
                      key={node.id}
                      onClick={() => setSelectedIngestServer(node.id)}
                      className={`p-3 rounded-2xl border text-left text-xs transition-all ${
                        selectedIngestServer === node.id
                          ? 'bg-sky-500/20 border-sky-400 text-white shadow-sm'
                          : 'bg-slate-800/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{node.flag} {node.city}</span>
                        <span className="font-mono-code text-[10px] text-emerald-400 font-bold">{node.pingMs}ms</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5 font-mono-code">{node.status}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stream URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase font-mono-code">Server Ingest URL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={stats.serverIngestUrl}
                    className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono-code text-slate-300 focus:outline-none"
                  />
                  <button
                    onClick={handleCopyIngest}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-white border border-slate-700 flex items-center gap-1.5 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedIngest ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Stream Key */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase font-mono-code">Primary Stream Key</label>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    readOnly
                    value={stats.streamKey}
                    className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono-code text-slate-300 focus:outline-none tracking-widest"
                  />
                  <button
                    onClick={handleCopyStreamKey}
                    className="px-4 py-2.5 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 rounded-xl text-xs font-bold text-sky-400 flex items-center gap-1.5 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedKey ? 'Copied!' : 'Copy Key'}</span>
                  </button>
                  <button
                    onClick={handleRegenerateKey}
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 hover:text-white border border-slate-700 transition-colors"
                    title="Regenerate Stream Key"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: 70/30 Revenue Breakdown & Mobile Money Payout Ledger */}
        <div className="lg:col-span-5 space-y-5">
          {/* Revenue Breakdown Card */}
          <div className="bg-slate-900 p-6 rounded-[28px] sm:rounded-[32px] border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <h3 className="font-black text-xs uppercase text-slate-400 tracking-widest font-mono-code">
                  Monthly Revenue Share (70/30)
                </h3>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between p-3 rounded-2xl bg-slate-800/50 border border-slate-800">
                <span className="text-slate-300">Subscriptions (Fan, Pro, Legend)</span>
                <span className="font-bold text-white font-mono-code">
                  $2,240 USD
                </span>
              </div>

              <div className="flex justify-between p-3 rounded-2xl bg-slate-800/50 border border-slate-800">
                <span className="text-slate-300">In-Stream Video Ads (~$6 CPM)</span>
                <span className="font-bold text-white font-mono-code">${stats.payoutBreakdown.adImpressionsRevenue} USD</span>
              </div>

              <div className="flex justify-between p-3 rounded-2xl bg-slate-800/50 border border-slate-800">
                <span className="text-slate-300">Pay-Per-View Esports Tickets</span>
                <span className="font-bold text-white font-mono-code">${stats.payoutBreakdown.ppvTicketRevenue} USD</span>
              </div>

              <div className="flex justify-between p-3 rounded-2xl bg-slate-800/50 border border-slate-800">
                <span className="text-slate-300">Gaming Brand Sponsorships</span>
                <span className="font-bold text-white font-mono-code">${stats.payoutBreakdown.sponsorshipRevenue} USD</span>
              </div>

              {/* Total Settlement Calculation */}
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-emerald-500/30 space-y-2 mt-2">
                <div className="flex justify-between text-slate-400 text-xs">
                  <span>Gross Platform Revenue:</span>
                  <span className="font-mono-code text-white">${stats.payoutBreakdown.grossTotalUSD} USD</span>
                </div>
                <div className="flex justify-between text-slate-400 text-xs">
                  <span>Visor Platform & Hosting Fee (30%):</span>
                  <span className="font-mono-code text-rose-400">-${(stats.payoutBreakdown.grossTotalUSD * 0.3).toFixed(0)} USD</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-bold text-sm pt-2 border-t border-slate-800">
                  <span>Your Net Available Payout:</span>
                  <span className="font-mono-code text-base">
                    ${stats.payoutBreakdown.netPayoutUSD} USD
                  </span>
                </div>
              </div>

              <button
                onClick={() => setCashoutModalOpen(true)}
                className="w-full py-3.5 rounded-2xl bg-white text-slate-950 hover:bg-sky-400 font-black text-xs uppercase tracking-widest shadow-xl transition-colors"
              >
                Withdraw {symbol} {(stats.payoutBreakdown.netPayoutUSD * rate).toLocaleString()} to Mobile Money
              </button>
            </div>
          </div>

          {/* Recent Payout History Ledger */}
          <div className="bg-slate-900 p-6 rounded-[28px] sm:rounded-[32px] border border-slate-800 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <h3 className="font-black text-xs uppercase text-slate-400 tracking-widest font-mono-code">
                Recent Settlement History
              </h3>
              <span className="text-[10px] text-sky-400 font-mono-code font-bold bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                100% SUCCESS RATE
              </span>
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto">
              {stats.recentPayouts.map((po) => (
                <div key={po.id} className="p-3.5 bg-slate-800/40 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-white">
                      <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{po.method}</span>
                      <span className="text-[10px] font-mono-code text-slate-400">• {po.date}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate font-mono-code">{po.account}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-400 font-mono-code block">
                      +${po.amountUSD} USD
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-semibold uppercase font-mono-code">
                      {po.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </>
      )}

      {/* Tab 3: Stream Overlay & Live Alerts (TTS) */}
      {activeTab === 'overlay' && (
        <StreamOverlayWidget />
      )}

      {/* Cashout / Mobile Money Withdrawal Modal */}
      {cashoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#121824] border border-white/[0.15] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-rajdhani font-bold text-lg text-white">
                    Request Mobile Money Withdrawal
                  </h3>
                  <p className="text-xs text-slate-400">Instant direct settlement to your mobile wallet or bank</p>
                </div>
              </div>
              <button
                onClick={() => setCashoutModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProcessCashout} className="space-y-4">
              {/* Method choice */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Select Payout Channel</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCashoutMethod('MTN MoMo')}
                    className={`p-2.5 rounded-lg border text-left text-xs font-bold transition-all ${
                      cashoutMethod === 'MTN MoMo' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500' : 'bg-[#171e2b] text-slate-300 border-white/[0.08]'
                    }`}
                  >
                    🇺🇬 MTN MoMo (Uganda)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCashoutMethod('M-Pesa')}
                    className={`p-2.5 rounded-lg border text-left text-xs font-bold transition-all ${
                      cashoutMethod === 'M-Pesa' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500' : 'bg-[#171e2b] text-slate-300 border-white/[0.08]'
                    }`}
                  >
                    🇰🇪 M-Pesa (Kenya)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCashoutMethod('Airtel Money')}
                    className={`p-2.5 rounded-lg border text-left text-xs font-bold transition-all ${
                      cashoutMethod === 'Airtel Money' ? 'bg-red-500/20 text-red-400 border-red-500' : 'bg-[#171e2b] text-slate-300 border-white/[0.08]'
                    }`}
                  >
                    🇹🇿 Airtel Money (TZ / UG)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCashoutMethod('PayPal')}
                    className={`p-2.5 rounded-lg border text-left text-xs font-bold transition-all ${
                      cashoutMethod === 'PayPal' ? 'bg-blue-500/20 text-blue-400 border-blue-500' : 'bg-[#171e2b] text-slate-300 border-white/[0.08]'
                    }`}
                  >
                    🌍 Global PayPal / Stripe
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Withdrawal Amount (USD)</label>
                <input
                  type="number"
                  max={stats.payoutBreakdown.netPayoutUSD}
                  min={20}
                  value={cashoutAmountUSD}
                  onChange={(e) => setCashoutAmountUSD(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#171e2b] border border-white/[0.1] rounded-lg text-sm text-white font-mono-code font-bold focus:outline-none focus:border-emerald-500"
                  required
                />
                <p className="text-[11px] text-emerald-400 font-mono-code">
                  Equivalent to approx. {symbol} {(cashoutAmountUSD * rate).toLocaleString()} (Zero forex fee)
                </p>
              </div>

              {cashoutTwoFactorRequired && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Authenticator code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={cashoutTwoFactorToken}
                    onChange={(e) => setCashoutTwoFactorToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="6-digit code"
                    className="w-full px-3 py-2 bg-[#171e2b] border border-white/[0.1] rounded-lg text-sm text-white font-mono-code tracking-widest focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              )}

              {/* Mobile phone number */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  {cashoutMethod === 'PayPal' ? 'PayPal Email Address' : 'Mobile Money Phone Number'}
                </label>
                <input
                  type="text"
                  value={cashoutPhone}
                  onChange={(e) => setCashoutPhone(e.target.value)}
                  placeholder={cashoutMethod === 'PayPal' ? 'creator@gmail.com' : 'e.g. 0780123456'}
                  className="w-full px-3 py-2 bg-[#171e2b] border border-white/[0.1] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="p-3 bg-[#0d141f] rounded-lg border border-white/[0.04] text-[11px] text-slate-400 space-y-1">
                <span className="text-emerald-400 font-bold">⚡ Instant Settlement:</span>
                <p>Funds are pushed directly through Flutterwave / Paystack mobile money gateway within 60 seconds.</p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-rajdhani font-bold text-sm tracking-wider uppercase shadow-lg shadow-emerald-500/25 transition-transform active:scale-98"
                >
                  Confirm Instant Cash-Out
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Creator Tip Modal */}
      <TipModal
        isOpen={isTipModalOpen}
        onClose={() => setIsTipModalOpen(false)}
        streamId="creator_studio_broadcast"
        streamerName="ProGamerLive"
      />

      {/* Payout Settlement Receipt Modal */}
      {receiptModalPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#121824] border border-white/[0.15] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-rajdhani font-bold text-xl text-white">Disbursement Voucher</h3>
              <p className="text-xs text-slate-400 font-mono-code">
                Pesapal / Telco Switch Clearing Certificate
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0b0e14] border border-slate-800 space-y-2.5 text-xs font-mono-code">
              <div className="flex justify-between text-slate-400">
                <span>Receipt Number:</span>
                <span className="font-bold text-white">{receiptModalPayout.receiptNumber || 'REC-VSR-849102'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Reference:</span>
                <span className="font-bold text-sky-400">{receiptModalPayout.reference || receiptModalPayout.id}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Payment Channel:</span>
                <span className="font-bold text-white">{receiptModalPayout.provider || receiptModalPayout.method}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Beneficiary:</span>
                <span className="font-bold text-white">{receiptModalPayout.phone || receiptModalPayout.account}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>KYC Verification:</span>
                <span className="text-emerald-400 font-bold">Tier 2 Verified (Instant)</span>
              </div>
              <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-sm">
                <span className="text-white">Amount Settled:</span>
                <span className="text-emerald-400">
                  ${receiptModalPayout.amountUSD ? receiptModalPayout.amountUSD.toFixed(2) : receiptModalPayout.amountUsd} USD
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  alert(`Receipt ${receiptModalPayout.receiptNumber || 'REC-VSR-849102'} downloaded to device.`);
                }}
                className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold font-mono-code flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save PDF</span>
              </button>
              <button
                onClick={() => setReceiptModalPayout(null)}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl text-xs font-bold uppercase tracking-wider font-mono-code transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
