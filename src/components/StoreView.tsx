import React, { useState } from 'react';
import { StoreMerchItem, Currency } from '../types';
import { CURRENCY_RATES } from '../data/mockData';
import { useLanguage } from '../lib/i18n';
import {
  ShoppingBag,
  Star,
  CheckCircle2,
  Tag,
  Sparkles,
  Smartphone,
  ShieldCheck,
  X
} from 'lucide-react';

interface StoreViewProps {
  items: StoreMerchItem[];
  currentCurrency: Currency;
}

export const StoreView: React.FC<StoreViewProps> = ({
  items,
  currentCurrency,
}) => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [checkoutItem, setCheckoutItem] = useState<StoreMerchItem | null>(null);
  const [orderComplete, setOrderComplete] = useState(false);

  const rate = CURRENCY_RATES[currentCurrency].rate;
  const symbol = CURRENCY_RATES[currentCurrency].symbol;

  const categories = ['all', 'Apparel', 'Peripherals', 'Gear'];

  const filteredItems = items.filter(
    (item) => selectedCategory === 'all' || item.category === selectedCategory
  );

  const handleBuy = (item: StoreMerchItem) => {
    setCheckoutItem(item);
    setOrderComplete(false);
  };

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderComplete(true);

    setTimeout(() => {
      setCheckoutItem(null);
      setOrderComplete(false);
    }, 2500);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Store Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-[28px] sm:rounded-[32px] border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {t('store.header.title')}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[9px] font-mono-code font-bold uppercase tracking-wider">
                  {t('common.demo_content_badge')}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {t('store.header.subtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono-code font-bold capitalize transition-all ${
                selectedCategory === c
                  ? 'bg-sky-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {c === 'all' ? t('store.filter.all_merch') : c}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filteredItems.map((item) => {
          const displayPrice = (item.priceUSD * rate).toLocaleString();
          const origPrice = item.originalPriceUSD ? (item.originalPriceUSD * rate).toLocaleString() : null;

          return (
            <div
              key={item.id}
              className="bg-slate-900 rounded-[28px] overflow-hidden border border-slate-800 hover:border-sky-400/80 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-sky-500/10 group"
            >
              <div className="relative aspect-square overflow-hidden bg-slate-950">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {item.badge && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-sky-500 text-slate-950 font-mono-code font-black text-[10px] uppercase shadow-md">
                    {item.badge}
                  </span>
                )}
                {item.creatorAffiliate && (
                  <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md text-amber-300 font-mono-code text-[10px] border border-amber-500/30">
                    Affiliate: @{item.creatorAffiliate}
                  </span>
                )}
              </div>

              <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono-code text-sky-400 font-bold uppercase tracking-wider">
                    {item.category}
                  </span>
                  <h3 className="font-bold text-sm text-white group-hover:text-sky-400 transition-colors line-clamp-2 leading-snug">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono-code">
                    <span className="flex items-center gap-1 text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      {item.rating}
                    </span>
                    <span>({item.reviewsCount} reviews)</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs font-mono-code text-slate-400">{symbol}</span>
                      <span className="text-lg font-black text-white">{displayPrice}</span>
                    </div>
                    {origPrice && (
                      <span className="text-[10px] line-through text-slate-500 font-mono-code">
                        {symbol} {origPrice}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleBuy(item)}
                    className="px-4 py-2 rounded-xl bg-white text-slate-950 hover:bg-sky-400 transition-colors font-black text-xs uppercase tracking-wider shadow-md active:scale-95"
                  >
                    {t('store.card.buy_now')}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Checkout Modal */}
      {checkoutItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#121824] border border-white/[0.15] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#00B4D8]" />
                <h3 className="font-rajdhani font-bold text-lg text-white">{t('store.checkout.title')}</h3>
              </div>
              <button
                onClick={() => setCheckoutItem(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {orderComplete ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-lg font-bold text-white font-rajdhani">{t('store.checkout.order_confirmed')}</h4>
                <p className="text-xs text-slate-300">
                  {t('store.checkout.confirmation_message')}
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmOrder} className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-[#171e2b] rounded-xl border border-white/[0.06]">
                  <img
                    src={checkoutItem.image}
                    alt={checkoutItem.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-white line-clamp-1">{checkoutItem.name}</h4>
                    <p className="text-xs text-emerald-400 font-mono-code font-bold">
                      {symbol} {(checkoutItem.priceUSD * rate).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">{t('store.checkout.address_label')}</label>
                  <input
                    type="text"
                    defaultValue="Kampala / Nairobi Central"
                    className="w-full px-3 py-2 bg-[#171e2b] border border-white/[0.1] rounded-lg text-xs text-white"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">{t('store.checkout.phone_label')}</label>
                  <input
                    type="tel"
                    defaultValue="0780123456"
                    className="w-full px-3 py-2 bg-[#171e2b] border border-white/[0.1] rounded-lg text-xs text-white"
                    required
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#0074e4] to-[#00B4D8] text-white font-rajdhani font-bold text-sm uppercase tracking-wider shadow-lg shadow-[#0074e4]/30"
                  >
                    Pay {symbol} {(checkoutItem.priceUSD * rate).toLocaleString()} via M-Pesa / MTN
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
