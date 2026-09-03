import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../lib/i18n';
import {
  Flame,
  Zap,
  Gift,
  Clock,
  Sparkles,
  Award,
  ChevronUp,
  ChevronDown,
  ShieldAlert
} from 'lucide-react';

interface HypeTrainWidgetProps {
  streamId: string;
  onOpenTip?: () => void;
  onOpenSubscribe?: () => void;
  /**
   * Increment this value from the parent once a tip (opened via onOpenTip)
   * has actually been confirmed/completed — e.g. from TipModal's onSuccess
   * callback. The widget only advances hype-train progress when this count
   * changes, never when the Boost button merely opens the tip modal.
   */
  tipConfirmationCount?: number;
}

export const HypeTrainWidget: React.FC<HypeTrainWidgetProps> = ({
  streamId,
  onOpenTip,
  onOpenSubscribe,
  tipConfirmationCount = 0,
}) => {
  const { t } = useLanguage();
  const [isActive, setIsActive] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [level, setLevel] = useState(2);
  const [progressPercent, setProgressPercent] = useState(68);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(185); // ~3 mins
  const [hypeContributors, setHypeContributors] = useState([
    { name: 'KlaSniper', amount: '10,000 UGX' },
    { name: 'EntebbePro', amount: 'Tier 1 Sub' },
    { name: 'NairobiChamp', amount: '5,000 UGX' }
  ]);

  // Countdown timer simulation
  useEffect(() => {
    if (!isActive || timeLeftSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          // Reset or restart hype train
          return 300;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, timeLeftSeconds]);

  // Format time mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const applyHypeBoost = () => {
    setProgressPercent((prev) => {
      const next = prev + 18;
      if (next >= 100) {
        setLevel((l) => Math.min(5, l + 1));
        return next - 100;
      }
      return next;
    });
  };

  const handleBoostHype = () => {
    // Opening the tip flow no longer grants progress by itself — the boost
    // is only applied once the tip is actually confirmed (see the
    // tipConfirmationCount effect below), so canceling out of the tip
    // modal leaves the hype train untouched.
    if (onOpenTip) {
      onOpenTip();
    }
  };

  // Only advance hype-train progress once a tip has genuinely been
  // completed by the parent (e.g. TipModal's onSuccess incrementing this
  // count) — never on the button click that just opens the modal.
  const prevTipConfirmationCount = useRef(tipConfirmationCount);
  useEffect(() => {
    if (tipConfirmationCount > prevTipConfirmationCount.current) {
      applyHypeBoost();
    }
    prevTipConfirmationCount.current = tipConfirmationCount;
  }, [tipConfirmationCount]);

  if (!isActive) return null;

  return (
    <div className="relative rounded-2xl bg-gradient-to-r from-amber-950/60 via-purple-950/70 to-slate-950 border border-amber-500/40 p-3 shadow-lg shadow-amber-500/5 animate-fadeIn">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Flame className="w-4 h-4 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-white uppercase tracking-wider">
                {t('hype.title')}
              </span>
              <span className="px-1.5 py-0.2 rounded-md bg-amber-500 text-slate-950 font-black text-[10px]">
                LEVEL {level}
              </span>
            </div>
            <p className="text-[10px] text-amber-300/80 font-mono-code">
              {progressPercent}% to Level {level + 1} • {formatTime(timeLeftSeconds)} left
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleBoostHype}
            className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-[11px] uppercase tracking-wider shadow-md shadow-amber-500/20 transition-transform active:scale-95 flex items-center gap-1"
          >
            <Zap className="w-3 h-3 fill-current" />
            <span>{t('hype.boost')}</span>
          </button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Progress & Rewards */}
      {!isCollapsed && (
        <div className="mt-2.5 space-y-2 pt-2 border-t border-slate-800/80">
          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-purple-500 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono-code">
            <span className="flex items-center gap-1 text-amber-300">
              <Sparkles className="w-3 h-3" />
              <span>Unlocked: 2x Channel XP + Golden Chat Badge</span>
            </span>
            <span>{hypeContributors.length} Hype Conductors</span>
          </div>
        </div>
      )}
    </div>
  );
};
