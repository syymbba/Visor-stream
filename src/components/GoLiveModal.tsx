import React, { useState, useRef, useEffect } from 'react';
import { Video, Mic, MicOff, Camera, CameraOff, Radio, Sparkles, X, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../lib/i18n';

interface GoLiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartBroadcast: (streamData: { title: string; game: string; resolution: string }) => void;
}

export const GoLiveModal: React.FC<GoLiveModalProps> = ({
  isOpen,
  onClose,
  onStartBroadcast,
}) => {
  const { t } = useLanguage();
  const [streamTitle, setStreamTitle] = useState('🔥 Friday Ranked Grind with Squad! Tips via M-Pesa / MTN MoMo');
  const [selectedGame, setSelectedGame] = useState('Apex Legends Mobile');
  const [resolution, setResolution] = useState('1080p60');
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [isMicActive, setIsMicActive] = useState(true);
  const [isLiveActive, setIsLiveActive] = useState(false);

  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    if (isOpen && isCameraActive) {
      navigator.mediaDevices?.getUserMedia({ video: true, audio: isMicActive })
        .then((s) => {
          stream = s;
          if (videoPreviewRef.current) {
            videoPreviewRef.current.srcObject = s;
          }
        })
        .catch(() => {
          // Camera not permitted in iframe or absent, graceful fallback handled
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen, isCameraActive, isMicActive]);

  if (!isOpen) return null;

  const handleGoLive = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLiveActive(true);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    setTimeout(() => {
      onStartBroadcast({
        title: streamTitle,
        game: selectedGame,
        resolution
      });
      setIsLiveActive(false);
      onClose();
    }, 1500);
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

        {/* Modal Form */}
        <form onSubmit={handleGoLive} className="p-6 space-y-4">
          {/* Simulated Broadcaster Camera & Mic Stage */}
          <div className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
            {isCameraActive ? (
              <video
                ref={videoPreviewRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            ) : (
              <div className="text-center space-y-2">
                <CameraOff className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400 font-mono-code">{t('golive.camera_muted')}</p>
              </div>
            )}

            {/* Stage controls overlay */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCameraActive(!isCameraActive)}
                  className={`p-2.5 rounded-xl backdrop-blur-md transition-colors ${
                    isCameraActive ? 'bg-slate-900/80 text-white border border-slate-700' : 'bg-rose-500 text-white'
                  }`}
                >
                  {isCameraActive ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => setIsMicActive(!isMicActive)}
                  className={`p-2.5 rounded-xl backdrop-blur-md transition-colors ${
                    isMicActive ? 'bg-slate-900/80 text-white border border-slate-700' : 'bg-rose-500 text-white'
                  }`}
                >
                  {isMicActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>
              </div>

              <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 backdrop-blur-sm text-[10px] font-mono-code text-emerald-400 font-bold">
                {t('golive.ready_ingest')}
              </span>
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

          <div className="grid grid-cols-2 gap-3 font-mono-code">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">{t('golive.label_category')}</label>
              <select
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-400"
              >
                <option value="Apex Legends Mobile">Apex Legends Mobile</option>
                <option value="PUBG Mobile">PUBG Mobile</option>
                <option value="EA Sports FC 24">EA Sports FC 24</option>
                <option value="Free Fire">Free Fire</option>
                <option value="Valorant">Valorant</option>
                <option value="Tekken 8">Tekken 8</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">{t('golive.label_resolution')}</label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-400"
              >
                <option value="1080p60">1080p 60FPS (Full HD)</option>
                <option value="4K UHD">4K UHD 60FPS (Master)</option>
                <option value="720p">720p (Data Saver)</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLiveActive}
              className="w-full py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs tracking-wider uppercase shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              {isLiveActive ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                  <span>{t('golive.connecting')}</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Radio className="w-4 h-4" />
                  <span>{t('golive.start_broadcast')}</span>
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
