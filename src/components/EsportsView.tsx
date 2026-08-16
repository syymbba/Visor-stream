import React, { useState } from 'react';
import { EsportsTournament, Currency } from '../types';
import { CURRENCY_RATES } from '../data/mockData';
import confetti from 'canvas-confetti';
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
  Award
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
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<EsportsTournament>(tournaments[0]);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);

  const rate = CURRENCY_RATES[currentCurrency].rate;
  const symbol = CURRENCY_RATES[currentCurrency].symbol;

  const handleRegister = (t: EsportsTournament) => {
    if (t.isPayPerView) {
      setSelectedTournament(t);
      setTicketModalOpen(true);
    } else {
      setRegisteredIds(prev => [...prev, t.id]);
      confetti({ particleCount: 50, spread: 60 });
    }
  };

  const handleConfirmTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketModalOpen(false);
    setRegisteredIds(prev => [...prev, selectedTournament.id]);
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Hero Banner: Esports Circuit Bento Header */}
      <div className="relative rounded-[28px] sm:rounded-[32px] overflow-hidden bg-slate-900 p-6 sm:p-8 border border-slate-800 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/30 text-xs font-mono-code font-bold uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>VISOR EAST AFRICA ESPORTS CIRCUIT 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Championship Tournaments & Live Showdowns
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Compete for over <span className="text-amber-400 font-bold">$25,000 USD (90,000,000+ UGX / 3.2M+ KES)</span> in seasonal prize pools. Powered by low-latency server nodes across Kampala, Nairobi, and Dar es Salaam.
            </p>
          </div>

          <button
            onClick={onOpenLiveTournamentStream}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-red-600/30 transition-transform active:scale-95"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Watch Grand Finals Live</span>
          </button>
        </div>
      </div>

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
                <span className={`px-3 py-1 rounded-xl text-xs font-mono-code font-bold uppercase tracking-wider ${
                  selectedTournament.status === 'Live Now'
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-purple-600 text-white'
                }`}>
                  {selectedTournament.status}
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md text-amber-400 font-mono-code font-bold text-xs border border-amber-500/30">
                  🏆 {selectedTournament.prizePoolFormatted}
                </span>
              </div>

              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {selectedTournament.title}
                </h2>
                <p className="text-xs text-slate-300 flex items-center gap-2 font-mono-code">
                  <span>🎮 {selectedTournament.game}</span>
                  <span>•</span>
                  <span>📍 {selectedTournament.region}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 flex flex-col justify-between space-y-4">
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono-code text-sky-400 font-bold">
                  ORGANIZED BY: {selectedTournament.organizer}
                </span>
                <span className="text-xs text-slate-400 font-mono-code">
                  SPONSORS: {selectedTournament.sponsor}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono-code">
                <div className="bg-slate-800/40 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-sky-400" /> Dates:
                  </span>
                  <span className="font-bold text-white">{selectedTournament.startDate}</span>
                </div>
                <div className="bg-slate-800/40 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-sky-400" /> Teams:
                  </span>
                  <span className="font-bold text-white">
                    {selectedTournament.registeredTeams} / {selectedTournament.maxTeams} Teams
                  </span>
                </div>
              </div>

              {/* Tournament Match Brackets */}
              <div className="space-y-2">
                <span className="text-xs font-mono-code font-bold uppercase text-slate-400">
                  Live Match Stage & Scoreboard
                </span>
                <div className="space-y-2">
                  {selectedTournament.matches.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 bg-slate-800/40 rounded-2xl border border-slate-800 flex items-center justify-between text-xs font-mono-code"
                    >
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                          {m.stage}
                        </span>
                        <span className="font-bold text-white">{m.teamA}</span>
                        <span className="text-slate-500">vs</span>
                        <span className="font-bold text-white">{m.teamB}</span>
                      </div>
                      <div className="font-bold text-sky-400">
                        {m.scoreA !== undefined ? `${m.scoreA} - ${m.scoreB}` : m.time}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              {registeredIds.includes(selectedTournament.id) ? (
                <button
                  disabled
                  className="flex-1 py-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Pass / Ticket Registered</span>
                </button>
              ) : (
                <button
                  onClick={() => handleRegister(selectedTournament)}
                  className="flex-1 py-3.5 rounded-2xl bg-white text-slate-950 hover:bg-sky-400 transition-colors font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2"
                >
                  <Ticket className="w-4 h-4 text-slate-950" />
                  <span>
                    {selectedTournament.isPayPerView
                      ? `Book PPV Ticket ($${selectedTournament.ticketPriceUSD} USD)`
                      : 'Free Team Registration'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tournaments Grid */}
      <div className="space-y-4">
        <h3 className="font-black text-lg text-white uppercase tracking-wider font-rajdhani">
          All Seasonal Tournaments & Cups
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tournaments.map((t) => (
            <div
              key={t.id}
              onClick={() => setSelectedTournament(t)}
              className={`p-5 rounded-[24px] border bg-slate-900 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                selectedTournament.id === t.id
                  ? 'border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span className={`px-2.5 py-0.5 rounded-lg font-mono-code text-[10px] font-bold uppercase ${
                  t.status === 'Live Now' ? 'bg-red-500/20 text-red-400' : 'bg-purple-500/20 text-purple-300'
                }`}>
                  {t.status}
                </span>
                <span className="font-mono-code text-amber-400 font-bold">
                  {t.prizePoolFormatted.split(' ')[0]}
                </span>
              </div>

              <h4 className="font-bold text-sm text-white mb-1">
                {t.title}
              </h4>
              <p className="text-[11px] text-slate-400 mb-3 font-mono-code">{t.game} • {t.region}</p>

              <div className="text-[11px] text-slate-300 flex items-center justify-between pt-2.5 border-t border-slate-800 font-mono-code">
                <span>{t.startDate}</span>
                <span className="text-sky-400 font-bold">{t.registeredTeams} teams</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ticket Modal */}
      {ticketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#121824] border border-white/[0.15] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-rajdhani font-bold text-lg text-white">
                    Pay-Per-View Esports Pass
                  </h3>
                  <p className="text-xs text-slate-400">{selectedTournament.title}</p>
                </div>
              </div>
              <button
                onClick={() => setTicketModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmTicket} className="space-y-4">
              <div className="p-3.5 bg-[#171e2b] rounded-xl border border-white/[0.06] space-y-2">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Match Pass Price:</span>
                  <span className="font-mono-code font-bold text-white">
                    ${selectedTournament.ticketPriceUSD} USD ({symbol} {(selectedTournament.ticketPriceUSD * rate).toLocaleString()})
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Stream Quality:</span>
                  <span className="text-emerald-400 font-semibold">4K Low-Latency Unlocked</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Payment Option</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg border border-[#00B4D8] bg-[#00B4D8]/10 text-white font-semibold">
                    📱 Mobile Money (M-Pesa / MTN)
                  </div>
                  <div className="p-2.5 rounded-lg border border-white/[0.08] bg-[#171e2b] text-slate-400">
                    💳 Card / PayPal
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Mobile Money Number</label>
                <input
                  type="tel"
                  defaultValue="0712345678"
                  className="w-full px-3 py-2 bg-[#171e2b] border border-white/[0.1] rounded-lg text-xs text-white"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-[#00B4D8] text-white font-rajdhani font-bold text-sm tracking-wider uppercase shadow-lg shadow-purple-600/30"
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
