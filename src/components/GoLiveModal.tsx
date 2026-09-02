import React, { useState, useEffect, useRef } from 'react';
import { Radio, X, Copy, RefreshCw, Key, Server, Loader2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../lib/i18n';
import { useAuth } from '../hooks/useAuth';
import { useMyStream } from '../hooks/useMyStream';

interface GoLiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartBroadcast: (streamData: { title: string; game: string; resolution: string }) => void;
}

const GAME_OPTIONS = [
  'Apex Legends Mobile',
  'PUBG Mobile',
  'EA Sports FC 24',
  'Free Fire',
  'Valorant',
  'Tekken 8',
];

/**
 * Real RTMP-credentials screen, replacing the old fake `getUserMedia`
 * webcam-preview-then-fake-live flow. Mux Live Streams ingest over RTMP
 * from external broadcaster software (OBS, Streamlabs, mobile RTMP apps),
 * not from an in-browser camera - so there is no meaningful in-app camera
 * preview to show. Flow:
 *   1. On open, GET /api/streams/me (get-or-creates the creator's
 *      persistent Mux live stream) via the shared useMyStream() hook.
 *   2. Show the RTMP URL + stream key with copy buttons, and a title/game
 *      form that PATCHes /api/streams/me.
 *   3. Poll GET /api/streams/:uid/status until isLive, then call
 *      onStartBroadcast (unchanged callback shape) so navigation to the
 *      live view proceeds exactly as it did before.
 */
export const GoLiveModal: React.FC<GoLiveModalProps> = ({
  isOpen,
  onClose,
  onStartBroadcast,
}) => {
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const { stream, isLoading, error, updateMeta, regenerateKey } = useMyStream({ enabled: isOpen });

  const [streamTitle, setStreamTitle] = useState('');
  const [selectedGame, setSelectedGame] = useState(GAME_OPTIONS[0]);
  const [copiedField, setCopiedField] = useState<'url' | 'key' | null>(null);
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [savedDetails, setSavedDetails] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isWaitingForStream, setIsWaitingForStream] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const hasStartedRef = useRef(false);

  // Seed the title/game inputs from the fetched stream once, so the
  // creator's own edits aren't clobbered by a background revalidation.
  const seededRef = useRef(false);
  useEffect(() => {
    if (stream && !seededRef.current) {
      seededRef.current = true;
      setStreamTitle(stream.title || '');
      setSelectedGame(stream.game || GAME_OPTIONS[0]);
    }
  }, [stream]);

  useEffect(() => {
    if (!isOpen) {
      seededRef.current = false;
      hasStartedRef.current = false;
      setIsWaitingForStream(false);
      setActionError(null);
    }
  }, [isOpen]);

  // Poll public stream status until the creator's RTMP push goes live,
  // then hand off to the existing onStartBroadcast/navigation flow.
  useEffect(() => {
    if (!isWaitingForStream || !currentUser?.uid) return;
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch(`/api/streams/${encodeURIComponent(currentUser.uid)}/status`);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data?.isLive && !hasStartedRef.current) {
          hasStartedRef.current = true;
          onStartBroadcast({
            title: streamTitle || stream?.title || '',
            game: selectedGame || stream?.game || '',
            // Resolution is now set in the broadcaster's own OBS/streaming
            // software, not chosen in-app (Mux ingest doesn't take a
            // resolution parameter) - this is just an informational default
            // for the callback's existing shape.
            resolution: '1080p60',
          });
          onClose();
        }
      } catch {
        // Transient network hiccup while polling - try again next tick.
      }
    };

    poll();
    const interval = setInterval(poll, 7000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isWaitingForStream, currentUser?.uid, onStartBroadcast, onClose, streamTitle, selectedGame, stream]);

  if (!isOpen) return null;

  const handleCopy = async (field: 'url' | 'key', value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Clipboard write can fail (permissions, insecure context) - no crash.
    }
  };

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setIsSavingDetails(true);
    try {
      await updateMeta({ title: streamTitle, game: selectedGame });
      setSavedDetails(true);
      setTimeout(() => setSavedDetails(false), 2000);
      setIsWaitingForStream(true);
    } catch (err: any) {
      setActionError(err?.message || 'Failed to save stream details');
    } finally {
      setIsSavingDetails(false);
    }
  };

  const handleRegenerateKey = async () => {
    setActionError(null);
    setIsRegenerating(true);
    try {
      await regenerateKey();
    } catch (err: any) {
      setActionError(err?.message || 'Failed to regenerate stream key');
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-[28px] max-w-lg w-full shadow-2xl overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-black text-lg text-white tracking-tight">
                {t('golive.title')}
              </h3>
              <p className="text-xs text-slate-400 font-mono-code">{t('golive.subtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {isLoading && !stream && (
            <div className="py-10 flex flex-col items-center gap-3 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin" />
              <p className="text-xs font-mono-code">{t('golive.loading')}</p>
            </div>
          )}

          {!isLoading && error && (
            <div className="py-6 flex flex-col items-center gap-2 text-center">
              <AlertCircle className="w-6 h-6 text-rose-400" />
              <p className="text-xs text-rose-300 font-mono-code">{t('golive.error_loading')}</p>
              <p className="text-[11px] text-slate-500">{error}</p>
            </div>
          )}

          {stream && !isWaitingForStream && (
            <form onSubmit={handleSaveDetails} className="space-y-4">
              {/* RTMP URL */}
              <div className="space-y-1.5 font-mono-code">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-sky-400" />
                  {t('golive.label_rtmp_url')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={stream.rtmpUrl}
                    className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy('url', stream.rtmpUrl)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-white border border-slate-700 flex items-center gap-1.5 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedField === 'url' ? t('golive.copied') : t('golive.copy')}</span>
                  </button>
                </div>
              </div>

              {/* Stream Key */}
              <div className="space-y-1.5 font-mono-code">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  {t('golive.label_stream_key')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    readOnly
                    value={stream.muxStreamKey}
                    className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy('key', stream.muxStreamKey)}
                    className="px-4 py-2.5 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 rounded-xl text-xs font-bold text-sky-400 flex items-center gap-1.5 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedField === 'key' ? t('golive.copied') : t('golive.copy')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRegenerateKey}
                    disabled={isRegenerating}
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 hover:text-white border border-slate-700 transition-colors disabled:opacity-50"
                    title={t('golive.regenerate_key')}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              <div className="space-y-1 font-mono-code">
                <label className="text-xs font-bold text-slate-300">{t('golive.label_title')}</label>
                <input
                  type="text"
                  value={streamTitle}
                  onChange={(e) => setStreamTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-400"
                  required
                />
              </div>

              <div className="space-y-1 font-mono-code">
                <label className="text-xs font-bold text-slate-300">{t('golive.label_category')}</label>
                <select
                  value={selectedGame}
                  onChange={(e) => setSelectedGame(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-400"
                >
                  {GAME_OPTIONS.map((game) => (
                    <option key={game} value={game}>{game}</option>
                  ))}
                </select>
              </div>

              {actionError && (
                <p className="text-[11px] text-rose-400 font-mono-code">{actionError}</p>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingDetails}
                  className="w-full py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs tracking-wider uppercase shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-60"
                >
                  {isSavingDetails ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                      <span>{t('golive.connecting')}</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Radio className="w-4 h-4" />
                      <span>{savedDetails ? t('golive.saved') : t('golive.save_details')}</span>
                    </span>
                  )}
                </button>
              </div>
            </form>
          )}

          {stream && isWaitingForStream && (
            <div className="space-y-4">
              <div className="py-6 flex flex-col items-center gap-3 text-center bg-slate-950/60 border border-slate-800 rounded-2xl">
                <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse"></span>
                <p className="text-sm font-bold text-white">{t('golive.waiting_title')}</p>
                <p className="text-xs text-slate-400 font-mono-code max-w-sm px-4">{t('golive.waiting_subtitle')}</p>
              </div>

              <div className="space-y-1.5 font-mono-code">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-sky-400" />
                  {t('golive.label_rtmp_url')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={stream.rtmpUrl}
                    className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy('url', stream.rtmpUrl)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-white border border-slate-700 flex items-center gap-1.5 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedField === 'url' ? t('golive.copied') : t('golive.copy')}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 font-mono-code">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  {t('golive.label_stream_key')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    readOnly
                    value={stream.muxStreamKey}
                    className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy('key', stream.muxStreamKey)}
                    className="px-4 py-2.5 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 rounded-xl text-xs font-bold text-sky-400 flex items-center gap-1.5 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedField === 'key' ? t('golive.copied') : t('golive.copy')}</span>
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
