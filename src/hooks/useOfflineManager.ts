import { useState, useEffect } from 'react';

export interface OfflineStatus {
  isOfflineMode: boolean;
  isConnectionLost: boolean;
  cachedCount: number;
  cacheSizeMB: number;
  toggleOfflineMode: (override?: boolean) => void;
  clearOfflineCache: () => void;
}

export function useOfflineManager(): OfflineStatus {
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('visor_offline_mode');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const [isConnectionLost, setIsConnectionLost] = useState<boolean>(() => {
    if (typeof navigator !== 'undefined') {
      return !navigator.onLine;
    }
    return false;
  });

  const [cachedCount, setCachedCount] = useState<number>(4);
  const [cacheSizeMB, setCacheSizeMB] = useState<number>(840);

  useEffect(() => {
    const handleOnline = () => {
      setIsConnectionLost(false);
    };

    const handleOffline = () => {
      setIsConnectionLost(true);
      setIsOfflineMode(true);
      try {
        localStorage.setItem('visor_offline_mode', 'true');
      } catch {}
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleOfflineMode = (override?: boolean) => {
    setIsOfflineMode((prev) => {
      const next = override !== undefined ? override : !prev;
      try {
        localStorage.setItem('visor_offline_mode', String(next));
      } catch {}
      return next;
    });
  };

  const clearOfflineCache = () => {
    setCachedCount(0);
    setCacheSizeMB(0);
  };

  return {
    isOfflineMode: isOfflineMode || isConnectionLost,
    isConnectionLost,
    cachedCount,
    cacheSizeMB,
    toggleOfflineMode,
    clearOfflineCache,
  };
}
