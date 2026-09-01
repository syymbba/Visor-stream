import React, { useState } from 'react';
import { GameCategory } from '../types';
import { useLanguage } from '../lib/i18n';
import { Gamepad2, Eye, Radio, Flame, Sparkles, Filter, Search } from 'lucide-react';

interface GamesViewProps {
  games: GameCategory[];
  onSelectCategory: (categoryId: string) => void;
}

export const GamesView: React.FC<GamesViewProps> = ({
  games,
  onSelectCategory,
}) => {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  const filteredGames = games.filter((g) => {
    if (search && !g.name.toLowerCase().includes(search.toLowerCase()) && !g.genre.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (selectedPlatform !== 'all' && !g.platforms.includes(selectedPlatform)) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner Bento Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-[28px] sm:rounded-[32px] border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {t('games.header.title')}
              </h1>
              <p className="text-xs text-slate-400">
                {t('games.header.subtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder={t('games.filter.placeholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3.5 py-2 bg-slate-950 border border-slate-800 focus:border-sky-400 rounded-xl text-xs font-mono-code text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {['all', 'Mobile', 'PC', 'Console'].map((plat) => (
              <button
                key={plat}
                onClick={() => setSelectedPlatform(plat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono-code font-bold transition-all ${
                  selectedPlatform === plat
                    ? 'bg-sky-500 text-slate-950 font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {plat === 'all' ? t('games.filter.all_platforms') : plat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {filteredGames.map((game) => (
          <div
            key={game.id}
            onClick={() => onSelectCategory(game.id)}
            className="group bg-slate-900 rounded-[24px] overflow-hidden border border-slate-800 hover:border-sky-400/80 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-sky-500/10 flex flex-col"
          >
            <div className="relative aspect-[3/4] overflow-hidden">
              <img
                src={game.cover}
                alt={game.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent flex flex-col justify-between p-3.5">
                <div className="flex justify-between items-center">
                  <span className="px-2.5 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md text-sky-400 font-bold text-[10px] font-mono-code border border-sky-500/30">
                    RANK #{game.trendingRank}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap gap-1">
                    {game.platforms.map((p, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-white text-[9px] font-mono-code">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-2 flex-1 flex flex-col justify-between bg-slate-900">
              <div>
                <h3 className="font-bold text-sm text-white group-hover:text-sky-400 transition-colors line-clamp-1">
                  {game.name}
                </h3>
                <p className="text-[11px] text-slate-400 line-clamp-1 font-mono-code">
                  {game.genre}
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-2.5 border-t border-slate-800 text-slate-400 font-mono-code">
                <span className="flex items-center gap-1 text-slate-300">
                  <Eye className="w-3.5 h-3.5 text-sky-400" />
                  {game.viewers.toLocaleString()}
                </span>
                <span className="flex items-center gap-1 text-rose-400 font-semibold">
                  <Radio className="w-3 h-3 animate-pulse" />
                  {game.liveStreamsCount} live
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
