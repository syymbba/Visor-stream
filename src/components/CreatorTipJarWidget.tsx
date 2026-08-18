import React, { useState } from 'react';
import {
  Gift,
  Sparkles,
  TrendingUp,
  Sliders,
  DollarSign,
  Copy,
  CheckCircle2,
  Volume2,
  VolumeX,
  Radio,
  Share2,
  Check,
  Edit3,
  Heart,
  Smartphone,
  ExternalLink,
  Flame,
  Award,
  Zap
} from 'lucide-react';
import { CreatorTipJarConfig, CreatorTipGoal, Currency } from '../types';
import { MOCK_CREATOR_TIP_JAR, CURRENCY_RATES } from '../data/mockData';
import { useLanguage } from '../lib/i18n';
import confetti from 'canvas-confetti';

interface CreatorTipJarWidgetProps {
  currentCurrency: Currency;
  onOpenTipModal?: () => void;
  isCreatorView?: boolean;
}

export const CreatorTipJarWidget: React.FC<CreatorTipJarWidgetProps> = ({
  currentCurrency,
  onOpenTipModal,
  isCreatorView = false
}) => {
  const { t } = useLanguage();
  const [tipJarConfig, setTipJarConfig] = useState<CreatorTipJarConfig>(MOCK_CREATOR_TIP_JAR);
  const [goal, setGoal] = useState<CreatorTipGoal>(MOCK_CREATOR_TIP_JAR.activeGoal);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoalTitle, setTempGoalTitle] = useState(goal.title);
  const [tempGoalTarget, setTempGoalTarget] = useState(goal.targetAmountUSD.toString());
  const [copiedLink, setCopiedLink] = useState(false);
  const [showAlertTest, setShowAlertTest] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const rate = CURRENCY_RATES[currentCurrency]?.rate || 1;
  const symbol = CURRENCY_RATES[currentCurrency]?.symbol || '$';

  const percentComplete = Math.min(100, Math.round((goal.currentAmountUSD / goal.targetAmountUSD) * 100));

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: CreatorTipGoal = {
      ...goal,
      title: tempGoalTitle,
      targetAmountUSD: parseFloat(tempGoalTarget) || 500
    };
    setGoal(updated);
    setTipJarConfig(prev => ({ ...prev, activeGoal: updated }));
    setIsEditingGoal(false);
    confetti({ particleCount: 30, spread: 50 });
    showToast('Tip Jar Goal updated and published!');
  };

  const handleTestAlert = () => {
    setShowAlertTest(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Play a friendly synthesized chime using Web Audio API
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.45);
    } catch (e) {
      // Audio context might be restricted before interaction
    }

    setTimeout(() => {
      setShowAlertTest(false);
    }, 4500);
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText('https://visorstream.com/@ProGamerLive/tipjar');
    }
    setCopiedLink(true);
    showToast('Public Creator Tip Jar link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-4">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#171a21] border border-[#38bdf8] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-2xl animate-fadeIn flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#38bdf8]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Interactive On-Screen Tip Alert Overlay Preview */}
      {showAlertTest && (
        <div className="fixed top-16 right-4 sm:right-8 z-50 animate-scaleUp">
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-0.5 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.5)]">
            <div className="bg-[#0b0e14]/95 backdrop-blur-md px-5 py-4 rounded-[14px] flex items-center gap-4 text-white max-w-sm border border-amber-400/50">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-300 flex items-center justify-center shrink-0 animate-bounce">
                <Gift className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono-code uppercase font-bold text-amber-300 px-1.5 py-0.2 rounded bg-amber-500/20">
                    SUPER TIP ALERT!
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono-code">Just now</span>
                </div>
                <div className="font-black text-sm text-white">
                  Kampala_Sniper_99 tipped 50,000 UGX ($15.00)
                </div>
                <p className="text-xs text-slate-300 italic">
                  "Clutch play in round 4! Let's get that studio mic!"
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Tip Jar Box */}
      <div className="steam-card p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#2a475e] shadow-xl space-y-5">
        {/* Header with Title and Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2a475e]/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-white font-rajdhani uppercase tracking-wide">
                  {t('tipjar.title')}
                </h3>
                <span className="text-[10px] font-mono-code uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live MoMo Rails
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {t('tipjar.subtitle')}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenTipModal && (
              <button
                onClick={onOpenTipModal}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('tipjar.send_tip')}</span>
              </button>
            )}

            <button
              onClick={handleCopyLink}
              className="px-3 py-2 rounded-xl bg-[#1b2838] border border-[#2a475e] hover:border-[#38bdf8] text-slate-300 hover:text-white text-xs font-mono-code flex items-center gap-1.5 transition-all"
              title="Copy Tip Jar Public Link"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copiedLink ? t('common.copied') : t('common.copy')}</span>
            </button>

            {isCreatorView && (
              <button
                onClick={handleTestAlert}
                className="px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-mono-code font-bold flex items-center gap-1.5 transition-all"
                title="Trigger a simulated on-screen super tip alert"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{t('tipjar.test_alert')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Tip Jar Active Goal Progress Card */}
        <div className="p-4 bg-[#0b0e14] rounded-2xl border border-[#2a475e] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono-code uppercase font-bold text-slate-400 tracking-wider">
                {t('tipjar.goal_progress')}
              </span>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{goal.title}</span>
                {isCreatorView && !isEditingGoal && (
                  <button
                    onClick={() => setIsEditingGoal(true)}
                    className="text-slate-400 hover:text-sky-300 p-1"
                    title="Edit Goal"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
              </h4>
            </div>

            <div className="text-left sm:text-right font-mono-code">
              <div className="text-sm font-black text-amber-400">
                ${goal.currentAmountUSD} / ${goal.targetAmountUSD} USD
              </div>
              <div className="text-[11px] text-slate-400">
                ≈ {symbol} {(goal.currentAmountUSD * rate).toLocaleString()} / {(goal.targetAmountUSD * rate).toLocaleString()} ({percentComplete}%)
              </div>
            </div>
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full bg-[#171a21] h-3.5 rounded-full overflow-hidden border border-[#2a475e] p-0.5">
            <div
              className="bg-gradient-to-r from-amber-500 via-orange-400 to-amber-300 h-full rounded-full transition-all duration-700 relative shadow-[0_0_12px_rgba(245,158,11,0.5)]"
              style={{ width: `${percentComplete}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            {goal.description}
          </p>

          {/* Edit Goal Inline Form for Creators */}
          {isEditingGoal && (
            <form onSubmit={handleSaveGoal} className="pt-3 border-t border-[#2a475e]/60 space-y-3 animate-fadeIn font-mono-code text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-slate-300 font-bold">{t('tipjar.goal_title')}</label>
                  <input
                    type="text"
                    value={tempGoalTitle}
                    onChange={(e) => setTempGoalTitle(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#171a21] border border-[#2a475e] rounded-xl text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">{t('tipjar.target_amount')} (USD)</label>
                  <input
                    type="number"
                    min={10}
                    value={tempGoalTarget}
                    onChange={(e) => setTempGoalTarget(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#171a21] border border-[#2a475e] rounded-xl text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingGoal(false)}
                  className="px-3 py-1.5 bg-[#1b2838] text-slate-300 rounded-xl hover:bg-slate-700"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-xl hover:bg-amber-400"
                >
                  {t('tipjar.save_goal')}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Recent Super Supporters & Tips Feed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white font-mono-code uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('tipjar.recent_tips')}</span>
            </span>
            <span className="text-slate-400 font-mono-code text-[11px]">
              {tipJarConfig.recentTips.length} tips recorded
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {tipJarConfig.recentTips.map((tip) => (
              <div
                key={tip.id}
                className="p-3 bg-[#0b0e14] border border-[#2a475e] rounded-xl flex items-start justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-2.5">
                  <img
                    src={tip.donorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80'}
                    alt={tip.donorName}
                    className="w-8 h-8 rounded-xl object-cover border border-[#2a475e] shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white">{tip.donorName}</span>
                      {tip.badge && (
                        <span className="text-[9px] font-mono-code font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {tip.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-2">
                      "{tip.message}"
                    </p>
                    <div className="text-[10px] text-slate-500 font-mono-code">
                      via {tip.network} • {tip.timestamp}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 font-mono-code">
                  <div className="font-black text-amber-400 text-xs sm:text-sm">
                    {tip.amountFormatted}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    (${tip.amountUSD} USD)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
