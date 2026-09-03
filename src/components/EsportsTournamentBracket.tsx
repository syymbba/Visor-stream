import React, { useState } from 'react';
import { useLanguage } from '../lib/i18n';
import {
  Trophy,
  Users,
  Swords,
  CheckCircle2,
  Radio,
  Flame,
  Shield,
  Medal,
  Calendar,
  Sparkles,
  ExternalLink,
  ChevronRight,
  X,
  Gamepad2
} from 'lucide-react';

export interface BracketMatch {
  id: string;
  round: 'Quarterfinals' | 'Semifinals' | 'Grand Finals';
  game: 'Free Fire' | 'EA FC 24' | 'PUBG Mobile';
  team1: { name: string; tag: string; score?: number; logo?: string; winner?: boolean; seed: number };
  team2: { name: string; tag: string; score?: number; logo?: string; winner?: boolean; seed: number };
  status: 'LIVE' | 'COMPLETED' | 'UPCOMING';
  scheduledTime: string;
  streamUrl?: string;
  bestOf: number;
}

export const EsportsTournamentBracket: React.FC = () => {
  const { t } = useLanguage();
  const [selectedGame, setSelectedGame] = useState<'Free Fire' | 'EA FC 24' | 'PUBG Mobile'>('Free Fire');
  const [activeMatchModal, setActiveMatchModal] = useState<BracketMatch | null>(null);

  // Tournament Bracket Matches
  const matches: BracketMatch[] = [
    // Quarterfinals
    {
      id: 'qf1',
      round: 'Quarterfinals',
      game: 'Free Fire',
      team1: { name: 'Kampala Vipers Esports', tag: 'KVE', score: 2, seed: 1, winner: true },
      team2: { name: 'Nairobi Apex Hunters', tag: 'NAH', score: 1, seed: 8 },
      status: 'COMPLETED',
      scheduledTime: '14:00 EAT',
      bestOf: 3,
    },
    {
      id: 'qf2',
      round: 'Quarterfinals',
      game: 'Free Fire',
      team1: { name: 'Dar es Salaam Titans', tag: 'DST', score: 2, seed: 4, winner: true },
      team2: { name: 'Kigali Cyber Warriors', tag: 'KCW', score: 0, seed: 5 },
      status: 'COMPLETED',
      scheduledTime: '15:30 EAT',
      bestOf: 3,
    },
    {
      id: 'qf3',
      round: 'Quarterfinals',
      game: 'Free Fire',
      team1: { name: 'Entebbe SkyHawks', tag: 'ESH', score: 1, seed: 3 },
      team2: { name: 'Mombasa Coastal Kings', tag: 'MCK', score: 2, seed: 6, winner: true },
      status: 'COMPLETED',
      scheduledTime: '17:00 EAT',
      bestOf: 3,
    },
    {
      id: 'qf4',
      round: 'Quarterfinals',
      game: 'Free Fire',
      team1: { name: 'Jinja Thunderbolts', tag: 'JTB', score: 2, seed: 2, winner: true },
      team2: { name: 'Addis Black Lions', tag: 'ABL', score: 1, seed: 7 },
      status: 'COMPLETED',
      scheduledTime: '18:30 EAT',
      bestOf: 3,
    },
    // Semifinals
    {
      id: 'sf1',
      round: 'Semifinals',
      game: 'Free Fire',
      team1: { name: 'Kampala Vipers Esports', tag: 'KVE', score: 3, seed: 1, winner: true },
      team2: { name: 'Dar es Salaam Titans', tag: 'DST', score: 2, seed: 4 },
      status: 'COMPLETED',
      scheduledTime: 'Yesterday',
      bestOf: 5,
    },
    {
      id: 'sf2',
      round: 'Semifinals',
      game: 'Free Fire',
      team1: { name: 'Mombasa Coastal Kings', tag: 'MCK', score: 1, seed: 6 },
      team2: { name: 'Jinja Thunderbolts', tag: 'JTB', score: 3, seed: 2, winner: true },
      status: 'COMPLETED',
      scheduledTime: 'Yesterday',
      bestOf: 5,
    },
    // Grand Finals
    {
      id: 'gf1',
      round: 'Grand Finals',
      game: 'Free Fire',
      team1: { name: 'Kampala Vipers Esports', tag: 'KVE', score: 2, seed: 1 },
      team2: { name: 'Jinja Thunderbolts', tag: 'JTB', score: 2, seed: 2 },
      status: 'LIVE',
      scheduledTime: 'Live Now (Match 5 Decider)',
      bestOf: 5,
    },
  ];

  const filteredMatches = matches.filter((m) => m.game === selectedGame);
  const qfMatches = filteredMatches.filter((m) => m.round === 'Quarterfinals');
  const sfMatches = filteredMatches.filter((m) => m.round === 'Semifinals');
  const gfMatches = filteredMatches.filter((m) => m.round === 'Grand Finals');
  const hasMatches = filteredMatches.length > 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Circuit Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-purple-500/10 text-purple-300 text-xs font-mono-code font-bold uppercase">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Interactive Championship Elimination Tree</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">{t('bracket.header.title')}</h2>
          <p className="text-xs text-slate-400">
            Click any match box to view the full matchup — teams, score, round and schedule.
          </p>
        </div>

        {/* Game Filter */}
        <div className="flex items-center gap-2">
          {['Free Fire', 'EA FC 24', 'PUBG Mobile'].map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGame(g as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                selectedGame === g
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Bracket Tree Canvas */}
      {!hasMatches ? (
        <div className="p-12 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl text-center">
          <Gamepad2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Bracket Yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            This game doesn't have a live elimination bracket yet. Check back soon.
          </p>
        </div>
      ) : (
      <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 overflow-x-auto shadow-2xl">
        <div className="min-w-[850px] grid grid-cols-3 gap-8 items-center">

          {/* Column 1: Quarterfinals */}
          <div className="space-y-6">
            <div className="text-center font-mono-code text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-800">
              Quarterfinals (BO3)
            </div>
            <div className="space-y-4">
              {qfMatches.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setActiveMatchModal(m)}
                  className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/60 cursor-pointer transition-all shadow-lg space-y-2 group"
                >
                  <div className="flex justify-between text-[10px] font-mono-code text-slate-400">
                    <span>Match #{m.id.toUpperCase()}</span>
                    <span className="text-emerald-400 font-bold">{m.status === 'COMPLETED' ? t('bracket.status.completed') : m.status === 'LIVE' ? t('bracket.status.live') : m.status}</span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className={`flex items-center justify-between p-1.5 rounded-lg ${m.team1.winner ? 'bg-purple-600/20 text-white font-bold' : 'text-slate-400'}`}>
                      <span className="truncate">{m.team1.name}</span>
                      <span className="font-mono-code font-bold ml-2">{m.team1.score}</span>
                    </div>
                    <div className={`flex items-center justify-between p-1.5 rounded-lg ${m.team2.winner ? 'bg-purple-600/20 text-white font-bold' : 'text-slate-400'}`}>
                      <span className="truncate">{m.team2.name}</span>
                      <span className="font-mono-code font-bold ml-2">{m.team2.score}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Semifinals */}
          <div className="space-y-12">
            <div className="text-center font-mono-code text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-800">
              Semifinals (BO5)
            </div>
            <div className="space-y-16">
              {sfMatches.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setActiveMatchModal(m)}
                  className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/60 cursor-pointer transition-all shadow-lg space-y-2"
                >
                  <div className="flex justify-between text-[10px] font-mono-code text-slate-400">
                    <span>Match #{m.id.toUpperCase()}</span>
                    <span className="text-emerald-400 font-bold">{m.status === 'COMPLETED' ? t('bracket.status.completed') : m.status === 'LIVE' ? t('bracket.status.live') : m.status}</span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className={`flex items-center justify-between p-2 rounded-xl ${m.team1.winner ? 'bg-purple-600/20 text-white font-bold border border-purple-500/30' : 'text-slate-400'}`}>
                      <span className="truncate">{m.team1.name}</span>
                      <span className="font-mono-code font-bold ml-2">{m.team1.score}</span>
                    </div>
                    <div className={`flex items-center justify-between p-2 rounded-xl ${m.team2.winner ? 'bg-purple-600/20 text-white font-bold border border-purple-500/30' : 'text-slate-400'}`}>
                      <span className="truncate">{m.team2.name}</span>
                      <span className="font-mono-code font-bold ml-2">{m.team2.score}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Grand Finals & Champion Trophy */}
          <div className="space-y-6">
            <div className="text-center font-mono-code text-xs font-bold text-amber-400 uppercase tracking-wider pb-2 border-b border-amber-500/30 flex items-center justify-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Grand Finals (BO5)</span>
            </div>

            {gfMatches.map((m) => (
              <div
                key={m.id}
                onClick={() => setActiveMatchModal(m)}
                className="p-5 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/60 shadow-[0_0_30px_rgba(245,158,11,0.15)] cursor-pointer transition-all space-y-3"
              >
                <div className="flex items-center justify-between text-xs font-mono-code">
                  <span className="px-2 py-0.5 rounded-lg bg-red-600 text-white font-bold animate-pulse flex items-center gap-1">
                    <Radio className="w-3 h-3" /> LIVE NOW
                  </span>
                  <span className="text-amber-400 font-bold">$10,000 USD First Place</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 text-white font-bold">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-purple-600/30 text-purple-300 flex items-center justify-center text-[10px]">
                        1
                      </div>
                      <span>{m.team1.name}</span>
                    </div>
                    <span className="text-base text-amber-400 font-mono-code">{m.team1.score}</span>
                  </div>

                  <div className="text-center text-[11px] font-mono-code text-slate-500 font-bold">{t('bracket.finals.vs')}</div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 text-white font-bold">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-cyan-600/30 text-cyan-300 flex items-center justify-center text-[10px]">
                        2
                      </div>
                      <span>{m.team2.name}</span>
                    </div>
                    <span className="text-base text-amber-400 font-mono-code">{m.team2.score}</span>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <span className="text-xs text-purple-400 font-bold hover:underline flex items-center justify-center gap-1">
                    <span>{t('bracket.finals.watch_stream')}</span>
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
      )}

      {/* Match Detail Modal */}
      {activeMatchModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setActiveMatchModal(null)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                  <Swords className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Match Details</h3>
                  <p className="text-xs text-slate-400">
                    {activeMatchModal.round} • Match #{activeMatchModal.id.toUpperCase()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveMatchModal(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between text-xs font-mono-code">
              <span
                className={`px-2.5 py-1 rounded-lg font-bold ${
                  activeMatchModal.status === 'LIVE'
                    ? 'bg-red-600 text-white animate-pulse'
                    : activeMatchModal.status === 'COMPLETED'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}
              >
                {activeMatchModal.status === 'COMPLETED'
                  ? t('bracket.status.completed')
                  : activeMatchModal.status === 'LIVE'
                  ? t('bracket.status.live')
                  : activeMatchModal.status}
              </span>
              <span className="text-slate-400">Best of {activeMatchModal.bestOf}</span>
            </div>

            <div className="space-y-2 text-sm">
              <div
                className={`flex items-center justify-between p-3 rounded-2xl border ${
                  activeMatchModal.team1.winner
                    ? 'bg-purple-600/20 border-purple-500/40 text-white font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono-code text-slate-500">SEED {activeMatchModal.team1.seed}</span>
                  <span>{activeMatchModal.team1.name}</span>
                  {activeMatchModal.team1.winner && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <span className="font-mono-code font-bold text-base">{activeMatchModal.team1.score ?? '—'}</span>
              </div>

              <div className="text-center text-[11px] font-mono-code text-slate-500 font-bold">
                {t('bracket.finals.vs')}
              </div>

              <div
                className={`flex items-center justify-between p-3 rounded-2xl border ${
                  activeMatchModal.team2.winner
                    ? 'bg-purple-600/20 border-purple-500/40 text-white font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono-code text-slate-500">SEED {activeMatchModal.team2.seed}</span>
                  <span>{activeMatchModal.team2.name}</span>
                  {activeMatchModal.team2.winner && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <span className="font-mono-code font-bold text-base">{activeMatchModal.team2.score ?? '—'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800 text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{activeMatchModal.scheduledTime}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>{activeMatchModal.game}</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
