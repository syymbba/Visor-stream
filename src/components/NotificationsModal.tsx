import React from 'react';
import { Bell, CheckCircle2, Radio, Trophy, Sparkles, X, DollarSign } from 'lucide-react';
import { useLanguage } from '../lib/i18n';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  const notifications = [
    {
      id: 1,
      type: 'live',
      title: 'RexGamingUG is LIVE now!',
      message: 'Apex Legends Mobile • Predator Ranked Grind (Uganda #1)',
      time: '5m ago',
      icon: Radio,
      color: 'text-red-400 bg-red-500/20',
    },
    {
      id: 2,
      type: 'esports',
      title: 'Match Reminder: EA FC 24 Kampala Showdown',
      message: 'Kampala Knights vs Nairobi Cyber Kings starts in 15 mins.',
      time: '18m ago',
      icon: Trophy,
      color: 'text-purple-400 bg-purple-500/20',
    },
    {
      id: 3,
      type: 'tip',
      title: 'Mobile Money Tip Sent',
      message: 'You successfully tipped 10,000 UGX ($2.70 USD) to @AminaValkyrie.',
      time: '1h ago',
      icon: DollarSign,
      color: 'text-emerald-400 bg-emerald-500/20',
    },
    {
      id: 4,
      type: 'xp',
      title: 'Gamipress XP Milestone Unlocked',
      message: 'You unlocked the "Master Strategist" badge (+350 XP).',
      time: '3h ago',
      icon: Sparkles,
      color: 'text-amber-400 bg-amber-500/20',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-[28px] max-w-md w-full shadow-2xl overflow-hidden animate-scaleUp">
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-white tracking-tight">
                {t('notifications.header.title')}
              </h3>
              <p className="text-xs text-slate-400 font-mono-code">Real-time notifications</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-2.5 max-h-[400px] overflow-y-auto">
          {notifications.map((notif) => {
            const Icon = notif.icon;
            return (
              <div
                key={notif.id}
                className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex items-start gap-3"
              >
                <div className={`p-2.5 rounded-xl flex-shrink-0 ${notif.color} border border-white/5`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-white">{notif.title}</h4>
                    <span className="text-[10px] font-mono-code text-slate-400">{notif.time}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-snug">{notif.message}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-3.5 bg-slate-950 border-t border-slate-800 text-center">
          <button
            onClick={onClose}
            className="text-xs text-sky-400 font-mono-code font-bold hover:underline"
          >
            {t('notifications.markAllRead')}
          </button>
        </div>
      </div>
    </div>
  );
};
