import React, { useState } from 'react';
import { useLanguage } from '../lib/i18n';
import confetti from 'canvas-confetti';
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
  ChevronRight
} from 'lucide-react';

export interface BracketMatch {
  id: string;
  round: 'Quarterfinals' | 'Semifinals' | 'Grand Finals';
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
      team1: { name: 'Kampala Vipers Esports', tag: 'KVE', score: 2, seed: 1, winner: true },
      team2: { name: 'Nairobi Apex Hunters', tag: 'NAH', score: 1, seed: 8 },
      status: 'COMPLETED',
      scheduledTime: '14:00 EAT',
      bestOf: 3,
    },
    {
      id: 'qf2',
      round: 'Quarterfinals',
      team1: { name: 'Dar es Salaam Titans', tag: 'DST', score: 2, seed: 4, winner: true },
      team2: { name: 'Kigali Cyber Warriors', tag: 'KCW', score: 0, seed: 5 },
      status: 'COMPLETED',
      scheduledTime: '15:30 EAT',
      bestOf: 3,
    },
    {
      id: 'qf3',
      round: 'Quarterfinals',
      team1: { name: 'Entebbe SkyHawks', tag: 'ESH', score: 1, seed: 3 },
      team2: { name: 'Mombasa Coastal Kings', tag: 'MCK', score: 2, seed: 6, winner: true },
      status: 'COMPLETED',
      scheduledTime: '17:00 EAT',
      bestOf: 3,
    },
    {
      id: 'qf4',
      round: 'Quarterfinals',
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
      team1: { name: 'Kampala Vipers Esports', tag: 'KVE', score: 3, seed: 1, winner: true },
      team2: { name: 'Dar es Salaam Titans', tag: 'DST', score: 2, seed: 4 },
      status: 'COMPLETED',
      scheduledTime: 'Yesterday',
      bestOf: 5,
    },
    {
      id: 'sf2',
      round: 'Semifinals',
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
      team1: { name: 'Kampala Vipers Esports', tag: 'KVE', score: 2, seed: 1 },
      team2: { name: 'Jinja Thunderbolts', tag: 'JTB', score: 2, seed: 2 },
      status: 'LIVE',
      scheduledTime: 'Live Now (Match 5 Decider)',
      bestOf: 5,
    },
  ];

  const qfMatches = matches.filter((m) => m.round === 'Quarterfinals');
  const sfMatches = matches.filter((m) => m.round === 'Semifinals');
  const gfMatches = matches.filter((m) => m.round === 'Grand Finals');

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
            Click any match box to inspect live team rosters, map vetoes, and real-time kill leaderboards.
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
    </div>
  );
};
