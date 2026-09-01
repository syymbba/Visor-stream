import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../lib/i18n';
import {
  Users,
  Swords,
  Plus,
  Lock,
  Globe,
  CheckCircle2,
  Trophy,
  Shield,
  Copy,
  Check,
  Zap,
  Radio,
  Gamepad2,
  X
} from 'lucide-react';

export interface ScrimLobbyItem {
  id: string;
  lobbyCode: string;
  title: string;
  game: string;
  format: string;
  hostName: string;
  maxTeams: number;
  currentTeams: number;
  entryFee: string;
  prizePoolUsd: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';
  serverRegion: string;
  slots: { teamName: string; tag: string; checkedIn: boolean }[];
}

export const EsportsScrimLobby: React.FC = () => {
  const { t } = useLanguage();
  const [selectedGame, setSelectedGame] = useState<string>('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [activeLobby, setActiveLobby] = useState<ScrimLobbyItem | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form State
  const [newTitle, setNewTitle] = useState('Friday Night Free Fire Pro Scrims');
  const [newGame, setNewGame] = useState('Free Fire');
  const [newFormat, setNewFormat] = useState('4v4 Squads');
  const [newMaxTeams, setNewMaxTeams] = useState(8);
  const [newPrizePool, setNewPrizePool] = useState('50');

  const [lobbies, setLobbies] = useState<ScrimLobbyItem[]>([
    {
      id: 'scrim-1',
      lobbyCode: 'VSR-FF-492',
      title: 'Kampala Elite Free Fire Squad Scrims (BO3)',
      game: 'Free Fire',
      format: '4v4 Squads',
      hostName: 'UgandaProGaming',
      maxTeams: 8,
      currentTeams: 6,
      entryFee: 'Free',
      prizePoolUsd: '60',
      status: 'OPEN',
      serverRegion: 'Kampala East-1',
      slots: [
        { teamName: 'Kampala Vipers', tag: 'KVE', checkedIn: true },
        { teamName: 'Nairobi Apex', tag: 'NAH', checkedIn: true },
        { teamName: 'Entebbe SkyHawks', tag: 'ESH', checkedIn: true },
        { teamName: 'Jinja Thunder', tag: 'JTB', checkedIn: true },
        { teamName: 'Kigali Warriors', tag: 'KCW', checkedIn: false },
        { teamName: 'Dar Titans', tag: 'DST', checkedIn: false },
      ],
    },
    {
      id: 'scrim-2',
      lobbyCode: 'VSR-EAFC-810',
      title: 'EA FC 24 Ultimate Knockout Championship',
      game: 'EA FC 24',
      format: '1v1 Knockout',
      hostName: 'EAFC_Kampala',
      maxTeams: 16,
      currentTeams: 14,
      entryFee: 'Free',
      prizePoolUsd: '100',
      status: 'OPEN',
      serverRegion: 'Nairobi Central-1',
      slots: [
        { teamName: 'Ssebo_Gaming', tag: 'SBG', checkedIn: true },
        { teamName: 'Omukiga_Striker', tag: 'OKS', checkedIn: true },
        { teamName: 'Kipchoge_FC', tag: 'KFC', checkedIn: true },
      ],
    },
    {
      id: 'scrim-3',
      lobbyCode: 'VSR-PUBG-115',
      title: 'PUBG Mobile Erangel Pro Battle Scrims',
      game: 'PUBG Mobile',
      format: 'Battle Royale',
      hostName: 'PUBG_ProSquad',
      maxTeams: 12,
      currentTeams: 12,
      entryFee: 'Free',
      prizePoolUsd: '80',
      status: 'IN_PROGRESS',
      serverRegion: 'Kampala East-1',
      slots: [],
    },
  ]);

  const handleCreateLobby = (e: React.FormEvent) => {
    e.preventDefault();
    const newLobby: ScrimLobbyItem = {
      id: `scrim-${Date.now()}`,
      lobbyCode: `VSR-${newGame.substring(0, 2).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      title: newTitle,
      game: newGame,
      format: newFormat,
      hostName: 'You (Creator)',
      maxTeams: newMaxTeams,
      currentTeams: 1,
      entryFee: 'Free',
      prizePoolUsd: newPrizePool,
      status: 'OPEN',
      serverRegion: 'Kampala East-1',
      slots: [{ teamName: 'Your Team', tag: 'YOU', checkedIn: true }],
    };

    setLobbies([newLobby, ...lobbies]);
    setCreateModalOpen(false);
    confetti({ particleCount: 70, spread: 60 });
  };

  const handleJoinLobby = (lobby: ScrimLobbyItem) => {
    if (lobby.currentTeams >= lobby.maxTeams) return;
    setLobbies((prev) =>
      prev.map((l) => {
        if (l.id === lobby.id) {
          return {
            ...l,
            currentTeams: l.currentTeams + 1,
            slots: [...l.slots, { teamName: 'Your Squad', tag: 'YOU', checkedIn: true }],
          };
        }
        return l;
      })
    );
    confetti({ particleCount: 60, spread: 70 });
  };

  const copyLobbyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const filteredLobbies = lobbies.filter(
    (l) => selectedGame === 'all' || l.game === selectedGame
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-purple-500/10 text-purple-300 text-xs font-mono-code font-bold uppercase">
            <Gamepad2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Community Scrims & Matchmaking Lobbies</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">{t('scrim.banner.title')}</h2>
          <p className="text-xs text-slate-400">
            Create or join competitive practice rooms, check in your squad, and battle for escrow cash prizes.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 transition-transform active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>{t('scrim.banner.hostButton')}</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['all', 'Free Fire', 'EA FC 24', 'PUBG Mobile', 'COD Mobile'].map((g) => (
          <button
            key={g}
            onClick={() => setSelectedGame(g)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              selectedGame === g
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {g === 'all' ? 'All Games' : g}
          </button>
        ))}
      </div>

      {/* Lobbies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLobbies.map((lobby) => (
          <div
            key={lobby.id}
            className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 shadow-xl space-y-4 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-lg bg-purple-500/10 text-purple-300 font-mono-code font-bold text-[11px] border border-purple-500/20">
                  {lobby.game} • {lobby.format}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-mono-code font-bold ${
                    lobby.status === 'OPEN'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {lobby.status}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-black text-white line-clamp-2">{lobby.title}</h3>
                <p className="text-[11px] text-slate-400 font-mono-code">
                  Hosted by <strong className="text-slate-200">{lobby.hostName}</strong> • {lobby.serverRegion}
                </p>
              </div>

              {/* Slots Bar */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex justify-between text-[11px] font-mono-code">
                  <span className="text-slate-400">Team Slots Filled:</span>
                  <span className="text-white font-bold">
                    {lobby.currentTeams} / {lobby.maxTeams} Teams
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${(lobby.currentTeams / lobby.maxTeams) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono-code">
                <span className="text-slate-400">Prize Pool:</span>
                <span className="text-amber-400 font-bold">${lobby.prizePoolUsd} USD</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => copyLobbyCode(lobby.lobbyCode)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono-code font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                {copiedCode === lobby.lobbyCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Code Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{lobby.lobbyCode}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleJoinLobby(lobby)}
                disabled={lobby.currentTeams >= lobby.maxTeams || lobby.status !== 'OPEN'}
                className="flex-1 py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs transition-transform active:scale-95"
              >
                {lobby.currentTeams >= lobby.maxTeams ? 'Full' : t('scrim.card.joinSquad')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Host Lobby Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white">Create Scrim Match Lobby</h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLobby} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Lobby Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Game Title</label>
                  <select
                    value={newGame}
                    onChange={(e) => setNewGame(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  >
                    <option value="Free Fire">Free Fire</option>
                    <option value="EA FC 24">EA FC 24</option>
                    <option value="PUBG Mobile">PUBG Mobile</option>
                    <option value="COD Mobile">COD Mobile</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Format</label>
                  <select
                    value={newFormat}
                    onChange={(e) => setNewFormat(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  >
                    <option value="4v4 Squads">4v4 Squads</option>
                    <option value="1v1 Knockout">1v1 Knockout</option>
                    <option value="Battle Royale">Battle Royale</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Max Team Slots</label>
                  <input
                    type="number"
                    min="2"
                    max="32"
                    value={newMaxTeams}
                    onChange={(e) => setNewMaxTeams(parseInt(e.target.value) || 8)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono-code"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Prize Pool (USD)</label>
                  <input
                    type="number"
                    min="0"
                    value={newPrizePool}
                    onChange={(e) => setNewPrizePool(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono-code"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 transition-transform active:scale-95"
              >
                Publish & Open Scrim Lobby
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
