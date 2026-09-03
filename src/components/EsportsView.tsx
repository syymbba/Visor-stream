import React, { useState } from 'react';
import { EsportsTournament, Currency } from '../types';
import { CURRENCY_RATES } from '../data/mockData';
import { EsportsTournamentBracket } from './EsportsTournamentBracket';
import { EsportsScrimLobby } from './EsportsScrimLobby';
import { useLanguage } from '../lib/i18n';
import {
  Trophy,
  Calendar,
  MapPin,
  Users,
  Ticket,
  CheckCircle2,
  Shield,
  Flame,
  Radio,
  Clock,
  Sparkles,
  Award,
  Gamepad2,
  GitBranch,
  X,
  Smartphone,
  CreditCard
} from 'lucide-react';

interface EsportsViewProps {
  tournaments: EsportsTournament[];
  currentCurrency: Currency;
  onOpenLiveTournamentStream: () => void;
}

export const EsportsView: React.FC<EsportsViewProps> = ({
  tournaments,
  currentCurrency,
  onOpenLiveTournamentStream,
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'tournaments' | 'brackets' | 'scrims'>('tournaments');
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<EsportsTournament>(tournaments[0]);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [ticketPaymentMethod, setTicketPaymentMethod] = useState<'mobile_money' | 'card'>('mobile_money');

  const rate = CURRENCY_RATES[currentCurrency].rate;
  const symbol = CURRENCY_RATES[currentCurrency].symbol;

  const handleRegister = (t: EsportsTournament) => {
    if (t.isPayPerView) {
      setSelectedTournament(t);
      setTicketModalOpen(true);
    } else {
      setRegisteredIds((prev) => [...prev, t.id]);
    }
  };

  const handleConfirmTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketModalOpen(false);
    setRegisteredIds((prev) => [...prev, selectedTournament.id]);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Hero Banner: Esports Circuit Bento Header */}
      <div className="relative rounded-[28px] sm:rounded-[32px] overflow-hidden bg-slate-900 p-6 sm:p-8 border border-slate-800 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/30 text-xs font-mono-code font-bold uppercase tracking-wider">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>VISOR PRO ESPORTS CIRCUIT 2026</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[9px] font-mono-code font-bold uppercase tracking-wider">
                {t('common.demo_content_badge')}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {t('esports.hero.title')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Compete for over{' '}
              <span className="text-amber-400 font-bold">
                $25,000 USD (90,000,000+ UGX / 3.2M+ KES)
              </span>{' '}
              in seasonal prize pools. Powered by low-latency server nodes across Kampala, Nairobi, and Dar es Salaam.
            </p>
          </div>

          <button
            onClick={onOpenLiveTournamentStream}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-red-600/30 transition-transform active:scale-95 whitespace-nowrap"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>{t('esports.hero.watch_live')}</span>
          </button>
        </div>
      </div>

      {/* Esports Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 w-fit">
        <button
          onClick={() => setActiveTab('tournaments')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'tournaments'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>{t('esports.tabs.tournaments')}</span>
        </button>

        <button
          onClick={() => setActiveTab('brackets')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'brackets'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          <span>{t('esports.tabs.brackets')}</span>
        </button>

        <button
          onClick={() => setActiveTab('scrims')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'scrims'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          <span>{t('esports.tabs.scrims')}</span>
        </button>
      </div>

      {/* Tab 1: Tournaments & Passes */}
      {activeTab === 'tournaments' && (
        <div className="space-y-6">
          {/* Featured Tournament Bento Card */}
          <div className="bg-slate-900 rounded-[28px] sm:rounded-[32px] p-6 border border-slate-800 shadow-2xl space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="lg:w-1/2 relative rounded-[24px] overflow-hidden aspect-video border border-slate-800">
                <img
                  src={selectedTournament.banner}
                  alt={selectedTournament.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent flex flex-col justify-between p-4">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-mono-code font-bold uppercase tracking-wider ${
                        selectedTournament.status === 'Live Now'
                          ? 'bg-red-600 text-white animate-pulse'
                          : 'bg-purple-600 text-white'
                      }`}
                    >
                      {selectedTournament.status}
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md text-amber-400 font-mono-code font-bold text-xs border border-amber-500/30 inline-flex items-center gap-1">
                      <Trophy className="w-3 h-3" /> {selectedTournament.prizePoolFormatted}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      {selectedTournament.title}
                    </h2>
                    <p className="text-xs text-slate-300 flex items-center gap-2 font-mono-code">
                      <span>{selectedTournament.game}</span>
                      <span>•</span>
                      <span>{selectedTournament.format}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:w-1/2 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {selectedTournament.description}
                  </p>

                  <div className="grid grid-cols-2 gap-3 text-xs font-mono-code">
                    <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                      <div className="text-slate-400 flex items-center gap-1.5 mb-1">
                        <Calendar className="w-3.5 h-3.5 text-purple-400" />
                        <span>{t('esports.stats.schedule')}</span>
                      </div>
                      <div className="font-bold text-white">{selectedTournament.startDate}</div>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                      <div className="text-slate-400 flex items-center gap-1.5 mb-1">
                        <MapPin className="w-3.5 h-3.5 text-sky-400" />
                        <span>{t('esports.stats.server_region')}</span>
                      </div>
                      <div className="font-bold text-white">{selectedTournament.region}</div>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                      <div className="text-slate-400 flex items-center gap-1.5 mb-1">
                        <Users className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{t('esports.stats.registered')}</span>
                      </div>
                      <div className="font-bold text-white">
                        {selectedTournament.registeredTeams} / {selectedTournament.maxTeams} Teams
                      </div>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                      <div className="text-slate-400 flex items-center gap-1.5 mb-1">
                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                        <span>{t('esports.stats.prize_pool')}</span>
                      </div>
                      <div className="font-bold text-amber-400">
                        ${selectedTournament.prizePoolUSD.toLocaleString()} USD
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-4">
                  {selectedTournament.isPayPerView ? (
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono-code block">
                        {t('esports.ticket.ppv_label')}
                      </span>
                      <span className="text-sm font-black text-amber-400 font-mono-code">
                        ${selectedTournament.ticketPriceUSD} USD ({symbol}{' '}
                        {(selectedTournament.ticketPriceUSD! * rate).toLocaleString()})
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono-code block">
                        Registration
                      </span>
                      <span className="text-sm font-black text-emerald-400 font-mono-code">
                        FREE ENTRY
                      </span>
                    </div>
                  )}

                  <button
                    onClick={() => handleRegister(selectedTournament)}
                    disabled={registeredIds.includes(selectedTournament.id)}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
                      registeredIds.includes(selectedTournament.id)
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                        : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 active:scale-95'
                    }`}
                  >
                    {registeredIds.includes(selectedTournament.id) ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Registered & Pass Active</span>
                      </>
                    ) : (
                      <>
                        <Ticket className="w-4 h-4" />
                        <span>
                          {selectedTournament.isPayPerView
                            ? t('esports.register.buy_ppv_pass')
                            : t('esports.register.register_team')}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tournament Grid */}
          <div className="space-y-4">
            <h3 className="text-base font-black text-white">{t('esports.grid.section_title')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tournaments.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTournament(t)}
                  className={`p-4 rounded-2xl bg-slate-900 border cursor-pointer transition-all space-y-3 ${
                    selectedTournament.id === t.id
                      ? 'border-purple-500 shadow-lg shadow-purple-500/10'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="aspect-video rounded-xl overflow-hidden relative">
                    <img src={t.banner} alt={t.title} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-slate-950/80 backdrop-blur-md text-[10px] font-mono-code text-amber-400 font-bold border border-amber-500/30 inline-flex items-center gap-1">
                      <Trophy className="w-2.5 h-2.5" /> {t.prizePoolFormatted}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-white mb-1">{t.title}</h4>
                    <p className="text-[11px] text-slate-400 font-mono-code">
                      {t.game} • {t.region}
                    </p>
                  </div>

                  <div className="text-[11px] text-slate-300 flex items-center justify-between pt-2.5 border-t border-slate-800 font-mono-code">
                    <span>{t.startDate}</span>
                    <span className="text-sky-400 font-bold">{t.registeredTeams} teams</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Interactive Tournament Elimination Brackets */}
      {activeTab === 'brackets' && <EsportsTournamentBracket />}

      {/* Tab 3: Custom Scrim Matchmaking Lobbies */}
      {activeTab === 'scrims' && <EsportsScrimLobby />}

      {/* Ticket Modal */}
      {ticketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Pay-Per-View Esports Pass</h3>
                  <p className="text-xs text-slate-400">{selectedTournament.title}</p>
                </div>
              </div>
              <button
                onClick={() => setTicketModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmTicket} className="space-y-4 text-xs">
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span>Match Pass Price:</span>
                  <span className="font-mono-code font-bold text-white">
                    ${selectedTournament.ticketPriceUSD} USD ({symbol}{' '}
                    {(selectedTournament.ticketPriceUSD! * rate).toLocaleString()})
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Stream Quality:</span>
                  <span className="text-emerald-400 font-semibold">4K Low-Latency Unlocked</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Payment Option</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTicketPaymentMethod('mobile_money')}
                    className={`p-2.5 rounded-xl border font-semibold flex items-center justify-center text-center gap-1.5 transition-all ${
                      ticketPaymentMethod === 'mobile_money'
                        ? 'border-purple-500 bg-purple-500/10 text-white'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" /> Mobile Money (MTN / M-Pesa)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTicketPaymentMethod('card')}
                    className={`p-2.5 rounded-xl border font-semibold flex items-center justify-center text-center gap-1.5 transition-all ${
                      ticketPaymentMethod === 'card'
                        ? 'border-purple-500 bg-purple-500/10 text-white'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" /> Card / PayPal
                  </button>
                </div>
              </div>

              {ticketPaymentMethod === 'mobile_money' ? (
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Mobile Money Number</label>
                  <input
                    type="tel"
                    defaultValue="0771234567"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono-code"
                    required
                  />
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Card Number</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="4242 4242 4242 4242"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono-code placeholder-slate-600"
                    required
                  />
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 transition-transform active:scale-95"
                >
                  Confirm & Unlock Match Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
