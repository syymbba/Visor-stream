import React from 'react';
import { WifiOff, Download, ArrowRight, X, RefreshCw } from 'lucide-react';

interface OfflineBannerProps {
  isOffline: boolean;
  onDisableOffline: () => void;
  onNavigateToLibrary: () => void;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  isOffline,
  onDisableOffline,
  onNavigateToLibrary,
}) => {
  if (!isOffline) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border-y border-amber-500/30 px-3 sm:px-6 py-2.5 backdrop-blur-md animate-fadeIn">
      <div className="max-w-[1720px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs sm:text-sm text-amber-200 font-mono-code">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/30 text-amber-300 animate-pulse">
            <WifiOff className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white uppercase tracking-wider">
              Offline Mode Active:
            </span>{' '}
            <span className="text-amber-300">
              Streaming disabled. Serving cached matches, VODs & tutorials from local storage.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToLibrary}
            className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/30 hover:bg-amber-500/40 text-amber-100 rounded-lg text-xs font-bold transition-colors border border-amber-500/40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Offline Library (4 VODs)</span>
            <ArrowRight className="w-3 h-3 ml-0.5" />
          </button>
          <button
            onClick={onDisableOffline}
            className="flex items-center gap-1 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-colors"
            title="Switch Back Online"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Go Online</span>
          </button>
        </div>
      </div>
    </div>
  );
};
