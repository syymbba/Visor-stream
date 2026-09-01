import React, { useState } from 'react';
import { SubscriptionPlan, Currency } from '../types';
import { SUBSCRIPTION_PLANS, CURRENCY_RATES } from '../data/mockData';
import { useLanguage } from '../lib/i18n';
import confetti from 'canvas-confetti';
import {
  CreditCard,
  CheckCircle2,
  Sparkles,
  Smartphone,
  ShieldCheck,
  Zap,
  Globe,
  Star,
  Users,
  Flame
} from 'lucide-react';

interface PricingViewProps {
  currentCurrency: Currency;
  setCurrentCurrency: (curr: Currency) => void;
  onSubscribePlan: (plan: SubscriptionPlan) => void;
}

export const PricingView: React.FC<PricingViewProps> = ({
  currentCurrency,
  setCurrentCurrency,
  onSubscribePlan,
}) => {
  const { t } = useLanguage();
  const [selectedBilling, setSelectedBilling] = useState<'monthly' | 'yearly'>('monthly');

  const rate = CURRENCY_RATES[currentCurrency].rate;
  const symbol = CURRENCY_RATES[currentCurrency].symbol;

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Pricing Header Bento */}
      <div className="text-center space-y-3 max-w-3xl mx-auto pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/30 text-xs font-mono-code font-bold uppercase tracking-wider">
          <CreditCard className="w-3.5 h-3.5" />
          <span>ACCESSIBLE CREATOR-FIRST PRICING</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          {t('pricing.header.title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl mx-auto">
          Priced affordably for gamers across Africa and globally with direct Mobile Money (M-Pesa, MTN, Airtel) and card support. 70% of all subscription fees go directly to your favorite streamers.
        </p>

        {/* Currency Switcher Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {(Object.keys(CURRENCY_RATES) as Currency[]).map((curr) => (
            <button
              key={curr}
              onClick={() => setCurrentCurrency(curr)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono-code font-bold transition-all ${
                currentCurrency === curr
                  ? 'bg-[#0284c7]/20 text-sky-300 border border-[#0369a1]/50 font-bold shadow-[0_0_10px_rgba(2,132,199,0.15)]'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {CURRENCY_RATES[curr].label}
            </button>
          ))}
        </div>
      </div>

      {/* 3-Tier Bento Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const rawPrice = plan.priceUSD;
          const displayPrice = (rawPrice * rate).toLocaleString();
          const isPro = plan.id === 'pro';
          const isLegend = plan.id === 'legend';

          return (
            <div
              key={plan.id}
              className={`relative bg-slate-900 rounded-[28px] sm:rounded-[32px] border flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 shadow-2xl ${
                isPro
                  ? 'border-sky-400 ring-2 ring-sky-400/30 shadow-2xl shadow-sky-500/10'
                  : isLegend
                  ? 'border-amber-500/50 shadow-2xl shadow-amber-500/10'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {isPro && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-xl bg-sky-500 text-slate-950 text-[10px] font-mono-code font-black uppercase tracking-wider shadow-lg">
                  ★ {t('pricing.card.most_popular_badge')}
                </div>
              )}

              {isLegend && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-xl bg-amber-500 text-slate-950 text-[10px] font-mono-code font-black uppercase tracking-wider shadow-lg">
                  👑 {t('pricing.card.vip_champion_badge')}
                </div>
              )}

              <div className="p-7 space-y-6">
                <div className="space-y-2">
                  <span className={`text-[11px] font-mono-code font-bold uppercase tracking-wider px-2.5 py-1 rounded-xl ${
                    isPro ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : isLegend ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {plan.badge}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-slate-300 min-h-[36px] leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                {/* Price Display */}
                <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-mono-code text-slate-400 font-semibold">{symbol}</span>
                    <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                      {displayPrice}
                    </span>
                    <span className="text-xs text-slate-400 font-mono-code">/ month</span>
                  </div>
                  <div className="text-[11px] text-emerald-400 font-mono-code mt-1.5 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Payable via M-Pesa, MTN, Airtel & Card</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-mono-code font-bold uppercase text-slate-400">
                    {t('pricing.card.whats_included')}
                  </span>
                  <ul className="space-y-2.5 text-xs text-slate-300">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckCircle2 className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                          isPro ? 'text-sky-400' : isLegend ? 'text-amber-400' : 'text-slate-400'
                        }`} />
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Call to Action Button */}
              <div className="p-7 pt-0">
                <button
                  onClick={() => onSubscribePlan(plan)}
                  className={`w-full py-3.5 rounded-2xl font-black text-xs tracking-widest uppercase transition-all shadow-xl active:scale-95 ${
                    isPro
                      ? 'bg-sky-500 hover:bg-sky-400 text-slate-950'
                      : isLegend
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                      : 'bg-white text-slate-950 hover:bg-slate-200'
                  }`}
                >
                  Subscribe to {plan.name.split('/')[0]}
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
