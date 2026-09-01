import React, { useState } from 'react';
import { UserLibraryItem, Currency } from '../types';
import { MOCK_LIBRARY_ITEMS, CURRENCY_RATES } from '../data/mockData';
import { getMuxPlaybackUrl, getMuxPosterUrl } from '../lib/mux';
import {
  FolderDown,
  Bookmark,
  Video,
  Play,
  Trash2,
  Download,
  WifiOff,
  Wifi,
  HardDrive,
  CheckCircle2,
  Clock,
  Eye,
  Film,
  Sparkles,
  Share2,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../lib/i18n';

interface LibraryViewProps {
  currentCurrency: Currency;
  isOfflineMode: boolean;
  setIsOfflineMode: (offline: boolean) => void;
  onNavigateToTutorials?: () => void;
  onNavigateToReels?: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  currentCurrency,
  isOfflineMode,
  setIsOfflineMode,
  onNavigateToTutorials,
  onNavigateToReels
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'downloaded' | 'saved' | 'created_vod'>('downloaded');
  const [items, setItems] = useState<UserLibraryItem[]>(MOCK_LIBRARY_ITEMS);
  const [playingItem, setPlayingItem] = useState<UserLibraryItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const downloadedItems = items.filter(i => i.type === 'downloaded');
  const savedItems = items.filter(i => i.type === 'saved');
  const createdVods = items.filter(i => i.type === 'created_vod');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setItems(prev => prev.filter(i => i.id !== id));
    showToast('Item removed from Library');
  };

  const handleDownloadToLocalCache = (item: UserLibraryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setItems(prev => [
      ...prev,
      {
        ...item,
        id: `lib_down_${Date.now()}`,
        type: 'downloaded',
        downloadedAt: 'Downloaded just now',
        fileSize: '240 MB',
        isOfflineAvailable: true,
      }
    ]);
    confetti({ particleCount: 35, spread: 60 });
    showToast(`"${item.title.substring(0, 30)}..." cached for offline play!`);
  };

  const handleClearCache = () => {
    setItems(prev => prev.filter(i => i.type !== 'downloaded'));
    showToast('Offline cache cleared');
  };

  const currentTabItems = activeTab === 'downloaded' 
    ? downloadedItems 
    : activeTab === 'saved' 
    ? savedItems 
    : createdVods;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#171a21] border border-[#38bdf8] text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-2xl animate-fadeIn flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#38bdf8]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner & Storage Telemetry */}
      <div className="steam-card rounded-2xl p-4 sm:p-6 border border-[#2a475e]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FolderDown className="w-6 h-6 text-[#38bdf8]" />
              <h1 className="text-xl sm:text-2xl font-black text-white font-rajdhani uppercase tracking-wide">
                {t('library.header_title')}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {t('library.header_desc')}
            </p>
          </div>

          {/* Offline Mode Toggle & Storage Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setIsOfflineMode(!isOfflineMode);
                showToast(isOfflineMode ? 'Online mode restored. Syncing feeds...' : 'Offline mode active. Using local cached vault.');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono-code font-bold transition-all ${
                isOfflineMode
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                  : 'bg-[#1b2838] text-slate-300 border border-[#2a475e] hover:border-[#38bdf8]'
              }`}
            >
              {isOfflineMode ? <WifiOff className="w-4 h-4 text-amber-400" /> : <Wifi className="w-4 h-4 text-emerald-400" />}
              <span>{isOfflineMode ? t('library.offline_mode_active') : t('library.online_sync_active')}</span>
            </button>

            <button
              onClick={handleClearCache}
              className="px-3 py-2 bg-[#1b2838] border border-[#2a475e] hover:border-rose-500/50 text-slate-400 hover:text-rose-400 rounded-xl text-xs font-mono-code transition-all"
              title="Free up device storage"
            >
              {t('library.clear_cache_button')}
            </button>
          </div>
        </div>

        {/* Storage Bar Indicator */}
        <div className="mt-4 pt-4 border-t border-[#2a475e]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono-code">
          <div className="flex items-center gap-2 text-slate-400">
            <HardDrive className="w-4 h-4 text-[#38bdf8]" />
            <span>Local Vault Storage: <strong className="text-white">557 MB</strong> / 5.0 GB (11% used)</span>
          </div>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> High-speed IndexedDB Storage Ready
          </span>
        </div>
      </div>

      {/* Offline Alert Notice when offline mode is toggled */}
      {isOfflineMode && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/40 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-300 animate-fadeIn">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
            <span>You are currently in <strong>Offline Mode</strong>. You can play any items in the "Downloaded Videos" tab without network connectivity.</span>
          </div>
          <button
            onClick={() => setIsOfflineMode(false)}
            className="underline font-bold text-white shrink-0"
          >
            {t('library.go_online_button')}
          </button>
        </div>
      )}

      {/* 3 Organized Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#2a475e] pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('downloaded')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'downloaded'
              ? 'bg-[#0284c7]/10 text-sky-300 border border-[#0369a1]/35 shadow-[0_0_10px_rgba(2,132,199,0.12)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#171a21]'
          }`}
        >
          <FolderDown className="w-4 h-4" />
          <span>{t('library.tab_downloaded')}</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono-code bg-[#0284c7]/15 text-sky-300 border border-[#0369a1]/30">
            {downloadedItems.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'saved'
              ? 'bg-[#0284c7]/10 text-sky-300 border border-[#0369a1]/35 shadow-[0_0_10px_rgba(2,132,199,0.12)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#171a21]'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>{t('library.tab_saved')}</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono-code bg-slate-700 text-slate-300">
            {savedItems.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('created_vod')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'created_vod'
              ? 'bg-[#0284c7]/10 text-sky-300 border border-[#0369a1]/35 shadow-[0_0_10px_rgba(2,132,199,0.12)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#171a21]'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>{t('library.tab_created_vod')}</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono-code bg-slate-700 text-slate-300">
            {createdVods.length}
          </span>
        </button>
      </div>

      {/* Media Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentTabItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setPlayingItem(item)}
            className="steam-card rounded-2xl overflow-hidden border border-[#2a475e] group cursor-pointer flex flex-col hover:border-[#38bdf8]/50 transition-all shadow-lg"
          >
            {/* Thumbnail Box */}
            <div className="relative aspect-video bg-[#0b0e14] overflow-hidden">
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-[#171a21]/90 border border-[#38bdf8] flex items-center justify-center text-[#38bdf8] opacity-90 group-hover:scale-110 group-hover:opacity-100 transition-all shadow-xl">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>
              </div>

              {/* Badges */}
              <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-[#0b0e14]/80 backdrop-blur-md rounded-md text-[10px] font-mono-code text-[#38bdf8] font-bold border border-[#2a475e]">
                {item.game}
              </div>

              <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-black/80 rounded-md text-[10px] font-mono-code text-white font-semibold">
                {item.duration}
              </div>

              {item.fileSize && (
                <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 bg-[#171a21]/80 rounded-md text-[10px] font-mono-code text-slate-300">
                  {item.fileSize}
                </div>
              )}
            </div>

            {/* Content Details */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-100 group-hover:text-[#38bdf8] transition-colors line-clamp-2">
                  {item.title}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <img
                    src={item.author.avatar}
                    alt={item.author.name}
                    className="w-5 h-5 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-xs text-slate-400 truncate">{item.author.name}</span>
                </div>
              </div>

              {/* Card Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-[#2a475e]/60 flex items-center justify-between text-xs">
                <span className="text-[11px] font-mono-code text-slate-500">
                  {item.downloadedAt || item.savedAt || 'Saved'}
                </span>

                <div className="flex items-center gap-2">
                  {item.type !== 'downloaded' && (
                    <button
                      onClick={(e) => handleDownloadToLocalCache(item, e)}
                      className="p-1.5 rounded-lg bg-[#1b2838] border border-[#2a475e] text-slate-300 hover:text-[#38bdf8] hover:border-[#38bdf8] transition-all"
                      title={t('library.download_title')}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={(e) => handleDeleteItem(item.id, e)}
                    className="p-1.5 rounded-lg bg-[#1b2838] border border-[#2a475e] text-slate-400 hover:text-rose-400 hover:border-rose-400 transition-all"
                    title={t('library.remove_title')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {currentTabItems.length === 0 && (
        <div className="steam-card rounded-2xl p-12 text-center border border-[#2a475e]">
          <FolderDown className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">{t('library.empty_title')}</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {t('library.empty_desc')}
          </p>
          <div className="mt-4 flex justify-center gap-3">
            {onNavigateToTutorials && (
              <button
                onClick={onNavigateToTutorials}
                className="px-4 py-2 bg-[#38bdf8] text-[#0b0e14] rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#66c0f4]"
              >
                {t('library.browse_tutorials_button')}
              </button>
            )}
            {onNavigateToReels && (
              <button
                onClick={onNavigateToReels}
                className="px-4 py-2 bg-[#1b2838] border border-[#2a475e] text-slate-200 rounded-xl text-xs font-bold hover:border-[#38bdf8]"
              >
                {t('library.watch_reels_button')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {playingItem && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 animate-fadeIn">
          <div className="w-full max-w-4xl bg-[#171a21] border border-[#2a475e] rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#2a475e]">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#38bdf8]/15 border border-[#38bdf8]/30 text-[#38bdf8] text-[10px] font-mono-code font-bold rounded">
                  {playingItem.isOfflineAvailable ? 'OFFLINE READY' : 'HD STREAM'}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-lg">{playingItem.title}</h3>
              </div>
              <button
                onClick={() => setPlayingItem(null)}
                className="p-1.5 rounded-xl hover:bg-[#1b2838] text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video bg-black flex items-center justify-center">
              <video
                src={getMuxPlaybackUrl(playingItem.muxPlaybackId) || playingItem.videoUrl}
                poster={getMuxPosterUrl(playingItem.muxPlaybackId) || playingItem.thumbnail}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>

            <div className="p-4 bg-[#0b0e14] flex items-center justify-between text-xs text-slate-400 font-mono-code">
              <span>Creator: <strong className="text-[#38bdf8]">{playingItem.author.name}</strong></span>
              <span>Game: <strong className="text-white">{playingItem.game}</strong></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
