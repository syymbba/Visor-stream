import React, { useState } from 'react';
import { Currency } from '../types';
import { CURRENCY_RATES } from '../data/mockData';
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  Percent,
  Wallet,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Info,
  DollarSign,
  Smartphone,
  Award,
  Crown
} from 'lucide-react';

interface RevenueSplitChartProps {
  currentCurrency: Currency;
  totalGrossUSD?: number;
  creatorEarningsUSD?: number;
  platformFeesUSD?: number;
}

export const RevenueSplitChart: React.FC<RevenueSplitChartProps> = ({
  currentCurrency,
  totalGrossUSD = 3450,
  creatorEarningsUSD = 2415,
  platformFeesUSD = 1035,
}) => {
  const [viewMode, setViewMode] = useState<'monthly' | 'channels' | 'projection'>('monthly');

  const rate = CURRENCY_RATES[currentCurrency]?.rate || 1;
  const symbol = CURRENCY_RATES[currentCurrency]?.symbol || '$';

  const formatMoney = (usd: number) => {
    const val = usd * rate;
    return `${symbol} ${val.toLocaleString(undefined, {
      minimumFractionDigits: currentCurrency === 'UGX' || currentCurrency === 'TZS' ? 0 : 2,
      maximumFractionDigits: currentCurrency === 'UGX' || currentCurrency === 'TZS' ? 0 : 2,
    })}`;
  };

  // 1. Split Pie Breakdown Data
  const splitData = [
    {
      name: 'Creator Payout (70%)',
      value: Math.round(creatorEarningsUSD * 100) / 100,
      color: '#10b981', // Emerald
      percentage: '70%',
      description: 'Direct instant withdrawal to MTN MoMo, M-Pesa & Airtel Money',
    },
    {
      name: 'Platform & Telco Edge (30%)',
      value: Math.round(platformFeesUSD * 100) / 100,
      color: '#38bdf8', // Sky
      percentage: '30%',
      description: 'Regional CDN routing (Kampala/Nairobi/Lagos), low-latency nodes, Pesapal gateway',
    },
  ];

  // 2. Historical 6-Month Split Breakdown Data
  const monthlyData = [
    {
      month: 'Mar 2026',
      creatorUSD: 1420,
      platformUSD: 608,
      totalUSD: 2028,
      tipsUSD: 450,
      subsUSD: 1100,
      ppvUSD: 478,
    },
    {
      month: 'Apr 2026',
      creatorUSD: 1890,
      platformUSD: 810,
      totalUSD: 2700,
      tipsUSD: 620,
      subsUSD: 1450,
      ppvUSD: 630,
    },
    {
      month: 'May 2026',
      creatorUSD: 2240,
      platformUSD: 960,
      totalUSD: 3200,
      tipsUSD: 780,
      subsUSD: 1720,
      ppvUSD: 700,
    },
    {
      month: 'Jun 2026',
      creatorUSD: 2650,
      platformUSD: 1135,
      totalUSD: 3785,
      tipsUSD: 910,
      subsUSD: 2050,
      ppvUSD: 825,
    },
    {
      month: 'Jul 2026',
      creatorUSD: 3100,
      platformUSD: 1328,
      totalUSD: 4428,
      tipsUSD: 1150,
      subsUSD: 2380,
      ppvUSD: 898,
    },
    {
      month: 'Aug 2026 (MTD)',
      creatorUSD: creatorEarningsUSD > 0 ? creatorEarningsUSD : 3450,
      platformUSD: platformFeesUSD > 0 ? platformFeesUSD : 1478,
      totalUSD: (creatorEarningsUSD || 3450) + (platformFeesUSD || 1478),
      tipsUSD: 1320,
      subsUSD: 2650,
      ppvUSD: 958,
    },
  ];

  // 3. Monetization Channel Split Data
  const channelData = [
    {
      channel: 'Mobile Money Super Tips',
      creatorShare: 95,
      platformShare: 5,
      grossUSD: 1320,
      icon: Smartphone,
      note: '95% to Broadcaster (direct community support)',
    },
    {
      channel: 'Monthly Channel Subscriptions',
      creatorShare: 70,
      platformShare: 30,
      grossUSD: 2650,
      icon: Crown,
      note: '70/30 Split with custom emotes & badge privileges',
    },
    {
      channel: 'Pay-Per-View Esports Passes',
      creatorShare: 70,
      platformShare: 30,
      grossUSD: 958,
      icon: Award,
      note: '70% to Tournament Organizer & Broadcaster',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Cards Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Gross Revenue Card */}
        <div className="p-5 rounded-2xl bg-[#171a21] border border-[#2a475e] shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 rounded-full blur-2xl group-hover:bg-sky-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between text-xs font-mono-code text-slate-400 mb-2">
            <span className="flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-sky-400" />
              Gross Volume
            </span>
            <span className="text-emerald-400 flex items-center font-bold">
              <ArrowUpRight className="w-3 h-3" /> +28.4%
            </span>
          </div>
          <div className="text-2xl font-black text-white font-mono-code">
            {formatMoney(totalGrossUSD)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono-code">
            ${totalGrossUSD.toLocaleString()} USD total collected
          </p>
        </div>

        {/* Creator Share (70%) Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#171a21] to-[#0f2e24] border border-emerald-500/40 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/15 rounded-full blur-2xl group-hover:bg-emerald-500/25 transition-all pointer-events-none" />
          <div className="flex items-center justify-between text-xs font-mono-code text-emerald-400 mb-2">
            <span className="flex items-center gap-1.5 font-bold">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              Creator Net Share (70%)
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-[10px] font-black uppercase tracking-wider">
              70% Payout
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono-code">
            {formatMoney(creatorEarningsUSD)}
          </div>
          <p className="text-[11px] text-slate-300 mt-1 font-mono-code">
            Instant withdrawable to MTN / M-Pesa / Airtel
          </p>
        </div>

        {/* Platform & Infrastructure Fee (30%) Card */}
        <div className="p-5 rounded-2xl bg-[#171a21] border border-[#2a475e] shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-xs font-mono-code text-slate-400 mb-2">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              Platform & Edge Fee (30%)
            </span>
            <span className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 text-[10px] font-mono-code font-bold">
              30% Telco/Infra
            </span>
          </div>
          <div className="text-2xl font-black text-sky-300 font-mono-code">
            {formatMoney(platformFeesUSD)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono-code">
            Low-latency nodes, Pesapal & server uptime
          </p>
        </div>
      </div>

      {/* Main Chart Container with Tabs */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#171a21] border border-[#2a475e] shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2a475e]/70 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                <Percent className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                70/30 Revenue Split & Channel Performance
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Transparent breakdown of earnings across Mobile Money and digital payment networks
            </p>
          </div>

          {/* Sub-view Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0b0e14] border border-[#2a475e] self-start sm:self-auto">
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono-code transition-all ${
                viewMode === 'monthly'
                  ? 'bg-[#38bdf8] text-[#0b0e14] shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Split Trend
            </button>
            <button
              onClick={() => setViewMode('channels')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono-code transition-all ${
                viewMode === 'channels'
                  ? 'bg-[#38bdf8] text-[#0b0e14] shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Split by Monetization
            </button>
            <button
              onClick={() => setViewMode('projection')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono-code transition-all ${
                viewMode === 'projection'
                  ? 'bg-[#38bdf8] text-[#0b0e14] shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              70/30 Ratio Pie
            </button>
          </div>
        </div>

        {/* View 1: Monthly Trend Split (Area Chart) */}
        {viewMode === 'monthly' && (
          <div className="space-y-4">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={monthlyData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="creatorGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="platformGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a475e" opacity={0.5} />
                  <XAxis
                    dataKey="month"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    fontFamily="monospace"
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `$${val}`}
                    fontFamily="monospace"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#171a21',
                      border: '1px solid #2a475e',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#fff',
                      fontFamily: 'monospace',
                    }}
                    formatter={(val: any, name: any) => [
                      `$${Number(val).toLocaleString()} USD (${symbol}${Math.round(Number(val) * rate).toLocaleString()})`,
                      name === 'creatorUSD' ? 'Creator Share (70%)' : 'Platform & Gateway (30%)',
                    ]}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }}
                    formatter={(value) =>
                      value === 'creatorUSD'
                        ? 'Creator Net Earnings (70%)'
                        : 'Platform & Infrastructure Fee (30%)'
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="creatorUSD"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#creatorGrad)"
                    name="creatorUSD"
                  />
                  <Area
                    type="monotone"
                    dataKey="platformUSD"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#platformGrad)"
                    name="platformUSD"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono-code pt-2">
              <div className="p-3 bg-[#0b0e14] rounded-xl border border-[#2a475e]/70 flex items-center justify-between">
                <span className="text-slate-400">Total 6-Month Creator Payouts:</span>
                <span className="text-emerald-400 font-bold">$14,750 USD ({symbol} {(14750 * rate).toLocaleString()})</span>
              </div>
              <div className="p-3 bg-[#0b0e14] rounded-xl border border-[#2a475e]/70 flex items-center justify-between">
                <span className="text-slate-400">Average Creator Payout Ratio:</span>
                <span className="text-[#38bdf8] font-bold">70.2% Effective Net</span>
              </div>
            </div>
          </div>
        )}

        {/* View 2: Split by Monetization Channels (Bar Chart) */}
        {viewMode === 'channels' && (
          <div className="space-y-6">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={channelData}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 30, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a475e" opacity={0.5} horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={11} unit="%" />
                  <YAxis type="category" dataKey="channel" stroke="#94a3b8" fontSize={11} width={180} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#171a21',
                      border: '1px solid #2a475e',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#fff',
                    }}
                    formatter={(val: any, name: any) => [`${val}%`, name === 'creatorShare' ? 'Creator Share' : 'Platform Share']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                  <Bar dataKey="creatorShare" fill="#10b981" name="Creator Share %" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="platformShare" fill="#38bdf8" name="Platform Share %" stackId="a" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {channelData.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="p-4 rounded-xl bg-[#0b0e14] border border-[#2a475e] space-y-2">
                    <div className="flex items-center gap-2 text-white font-bold text-xs">
                      <Icon className="w-4 h-4 text-emerald-400" />
                      <span>{item.channel}</span>
                    </div>
                    <div className="flex justify-between items-baseline text-xs font-mono-code">
                      <span className="text-emerald-400 font-bold">{item.creatorShare}% Creator</span>
                      <span className="text-slate-400">{item.platformShare}% Platform</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{item.note}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* View 3: 70/30 Ratio Pie Visualization */}
        {viewMode === 'projection' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={splitData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {splitData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#0b0e14" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#171a21',
                      border: '1px solid #2a475e',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#fff',
                      fontFamily: 'monospace',
                    }}
                    formatter={(val: any) => [
                      `$${Number(val).toLocaleString()} USD (${symbol}${Math.round(Number(val) * rate).toLocaleString()})`,
                      'Volume',
                    ]}
                  />
                </RechartsPie>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              {splitData.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#0b0e14] border border-[#2a475e] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-bold text-xs text-white">{item.name}</span>
                    </div>
                    <span className="font-mono-code font-bold text-xs text-white">
                      {formatMoney(item.value)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 pl-5 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Policy Guarantee Banner */}
        <div className="p-3.5 rounded-xl bg-[#0b0e14] border border-[#2a475e]/80 flex items-start gap-3 text-xs text-slate-300 font-mono-code">
          <Info className="w-4 h-4 text-[#38bdf8] flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-white">Guaranteed Direct Mobile Settlement</span>
            <p className="text-[11px] text-slate-400">
              Creators receive 70% of subscription revenue and 95% of direct Super Tips. Withdrawals are processed instantly via Pesapal to MTN Mobile Money (Uganda/Rwanda), M-Pesa (Kenya/Tanzania), and Airtel Money with zero foreign exchange markup fees.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
