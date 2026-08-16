import React, { useState, useEffect } from 'react';
import { CreatorDashboardStats, Currency } from '../types';
import { CURRENCY_RATES, REGIONAL_SERVER_NODES } from '../data/mockData';
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
  Layers
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
  initialStats: CreatorDashboardStats;
  currentCurrency: Currency;
}

export const CreatorStudioView: React.FC<CreatorStudioViewProps> = ({
  initialStats,
  currentCurrency,
}) => {
  const [stats, setStats] = useState<CreatorDashboardStats>(initialStats);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedIngest, setCopiedIngest] = useState(false);
  const [selectedIngestServer, setSelectedIngestServer] = useState(REGIONAL_SERVER_NODES[0].id);

  // Cashout Modal State
  const [cashoutModalOpen, setCashoutModalOpen] = useState(false);
  const [cashoutMethod, setCashoutMethod] = useState<'M-Pesa' | 'MTN MoMo' | 'Airtel Money' | 'PayPal'>('MTN MoMo');
  const [cashoutPhone, setCashoutPhone] = useState('0780123456');
  const [cashoutAmountUSD, setCashoutAmountUSD] = useState(stats.payoutBreakdown.netPayoutUSD);
  const [cashoutSuccessAlert, setCashoutSuccessAlert] = useState<string | null>(null);

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

  const handleProcessCashout = (e: React.FormEvent) => {
    e.preventDefault();
    setCashoutModalOpen(false);

    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 }
    });

    const newPayoutRecord = {
      id: 'po_' + Math.floor(Math.random() * 900 + 100),
      date: 'Aug 16, 2026 (Just now)',
      amountUSD: cashoutAmountUSD,
      method: cashoutMethod,
      account: `${cashoutPhone} (${CURRENCY_RATES[currentCurrency].symbol} ${(cashoutAmountUSD * CURRENCY_RATES[currentCurrency].rate).toLocaleString()})`,
      status: 'Processing' as const,
    };

    setStats(prev => ({
      ...prev,
      recentPayouts: [newPayoutRecord, ...prev.recentPayouts]
    }));

    setCashoutSuccessAlert(
      `Instant payout of $${cashoutAmountUSD} USD initiated to ${cashoutPhone} via ${cashoutMethod}!`
    );

    setTimeout(() => setCashoutSuccessAlert(null), 8000);
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

        {/* Live Broadcast Status Chip */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono-code font-bold">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span>BROADCASTING LIVE</span>
          </div>

          <button
            onClick={() => setCashoutModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-transform active:scale-95"
          >
            <DollarSign className="w-4 h-4 text-slate-950" />
            <span>Request Mobile Money Payout</span>
          </button>
        </div>
      </div>

      {/* 4 Core Real-Time Metric Bento Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Current Viewers */}
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
              {stats.totalSubscribers.toLocaleString()}
            </span>
            <span className="text-xs text-indigo-400 font-bold font-mono-code">
              {stats.payoutBreakdown.fanSubs} Fan / {stats.payoutBreakdown.proSubs} Pro
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
              {symbol} {(stats.payoutBreakdown.netPayoutUSD * rate).toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono-code">
            ${stats.payoutBreakdown.netPayoutUSD} USD gross: ${stats.payoutBreakdown.grossTotalUSD}
          </p>
        </div>
      </div>

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
                  <p className="text-xs text-slate-400">Instant direct settlement to your African wallet</p>
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
    </div>
  );
};
