import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Radio, 
  Eye, 
  Cpu, 
  Wifi, 
  Activity,
  Zap,
  Flame,
  Shield,
  Gauge
} from 'lucide-react';
import { LiveStream } from '../types';

interface StreamPlayerProps {
  stream: LiveStream;
  onOpenSubscribe?: () => void;
  onOpenTip?: () => void;
  isDataSaverGlobal?: boolean;
}

export const StreamPlayer: React.FC<StreamPlayerProps> = ({
  stream,
  onOpenSubscribe,
  onOpenTip,
  isDataSaverGlobal = false
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showStatsHUD, setShowStatsHUD] = useState(false);
  const [dataSaverMode, setDataSaverMode] = useState(isDataSaverGlobal);
  const [isAudioOnlyMode, setIsAudioOnlyMode] = useState(false);
  const [dataSavedMB, setDataSavedMB] = useState(0);
  const [selectedQuality, setSelectedQuality] = useState<'4K' | '1080p' | '720p' | '480p' | 'Audio-Only' | 'Auto'>('1080p');
  const [latencyMs, setLatencyMs] = useState(14);
  const [currentBitrate, setCurrentBitrate] = useState('4.8 Mbps');
  const [droppedFrames, setDroppedFrames] = useState(0);

  // Real-time data savings accumulator when in Audio-Only Mode (~550 KB saved every second vs 1080p)
  useEffect(() => {
    if (!isAudioOnlyMode) return;
    const interval = setInterval(() => {
      setDataSavedMB((prev) => Math.round((prev + 0.55) * 10) / 10);
    }, 1000);
    return () => clearInterval(interval);
  }, [isAudioOnlyMode]);

  // Handle data-saver quality switches
  const handleToggleAudioOnly = () => {
    const nextState = !isAudioOnlyMode;
    setIsAudioOnlyMode(nextState);
    if (nextState) {
      setSelectedQuality('Audio-Only');
      setCurrentBitrate('0.06 Mbps (Audio Shoutcast)');
    } else {
      setSelectedQuality('1080p');
      setCurrentBitrate('4.8 Mbps');
    }
  };

  // Initialize HLS adaptive streaming or fallback video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Check if HLS source or MP4
    const src = stream.videoPreviewUrl;
    const isHlsStream = src.endsWith('.m3u8');

    if (isHlsStream && Hls.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      const hls = new Hls({
        capLevelToPlayerSize: true,
        maxBufferLength: dataSaverMode ? 5 : 30,
        maxMaxBufferLength: dataSaverMode ? 10 : 60,
      });

      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => setIsPlaying(false));
      });

      hlsRef.current = hls;

      return () => {
        hls.destroy();
      };
    } else {
      video.src = src;
      video.play().catch(() => setIsPlaying(false));
    }
  }, [stream.videoPreviewUrl, dataSaverMode]);

  // Handle data-saver quality switches
  const handleToggleDataSaver = () => {
    const nextState = !dataSaverMode;
    setDataSaverMode(nextState);
    if (nextState) {
      setSelectedQuality('Data-Saver');
      setCurrentBitrate('0.6 Mbps');
    } else {
      setSelectedQuality('1080p');
      setCurrentBitrate('4.8 Mbps');
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => console.warn(err));
    } else {
      document.exitFullscreen().catch(err => console.warn(err));
    }
  };

  return (
    <div 
      ref={containerRef}
      className="bg-slate-900 rounded-[28px] sm:rounded-[32px] border border-slate-800 relative overflow-hidden group shadow-2xl shadow-black/60 aspect-video flex flex-col justify-between select-none"
    >
      {/* Live Video Media Layer or Audio-Only Shoutcast Canvas */}
      {isAudioOnlyMode ? (
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-6 text-center z-10 animate-fadeIn">
          {/* Animated Audio Equalizer Bars */}
          <div className="flex items-end justify-center gap-1.5 h-20 mb-4">
            {[40, 75, 95, 60, 85, 100, 70, 90, 50, 80, 65, 95, 45, 85, 60].map((height, i) => (
              <div
                key={i}
                className="w-1.5 sm:w-2 bg-gradient-to-t from-emerald-500 via-teal-400 to-sky-400 rounded-full animate-pulse"
                style={{
                  height: `${height}%`,
                  animationDuration: `${0.4 + (i % 5) * 0.15}s`,
                  animationDelay: `${(i * 0.08)}s`,
                }}
              ></div>
            ))}
          </div>

          <div className="space-y-1 max-w-md">
            <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-mono-code font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Ultra Data-Saver Shoutcast (Audio Only)</span>
            </span>
            <h3 className="text-base sm:text-lg font-black text-white">
              {stream.title}
            </h3>
            <p className="text-xs text-slate-400">
              Low-Bandwidth Shoutcast active • Consuming &lt;64 Kbps
            </p>
          </div>

          {/* Live Data Savings Tracker Meter */}
          <div className="mt-4 px-4 py-2 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs font-mono-code flex items-center gap-3">
            <span className="text-amber-400 font-bold">
              💾 Saved {dataSavedMB} MB
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-emerald-400">92% Bandwidth Reduced</span>
            <button
              onClick={handleToggleAudioOnly}
              className="ml-2 px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] transition-colors"
            >
              Resume HD Video
            </button>
          </div>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            dataSaverMode ? 'brightness-95 contrast-105' : ''
          }`}
        />
      )}

      {/* Video Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40 pointer-events-none"></div>

      {/* Low-Bandwidth Data-Saver Indicator Badge */}
      {dataSaverMode && (
        <div className="absolute top-16 left-6 z-20 px-3 py-1.5 rounded-xl bg-amber-500/90 text-slate-950 font-mono-code font-black text-[10px] uppercase tracking-wider shadow-lg flex items-center gap-1.5 animate-pulse">
          <Zap className="w-3.5 h-3.5 fill-slate-950" />
          <span>DATA SAVER ACTIVE (&lt;1MB/MIN AUDIO-OPTIMIZED)</span>
        </div>
      )}

      {/* Tactical HUD Annotations (Stream Tracking Overlay) */}
      <div className="absolute top-20 right-28 w-32 sm:w-40 h-28 sm:h-36 border border-sky-400/60 rounded-lg pointer-events-none hidden sm:block">
        <span className="absolute -top-4 left-0 bg-sky-500 text-[9px] text-slate-950 px-1.5 py-0.2 font-black rounded uppercase">
          AI TRACKER [0.98]
        </span>
      </div>

      {/* Top Video Status Telemetry */}
      <div className="relative z-20 flex items-center justify-between p-4 sm:p-6">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-600/90 text-white font-mono-code font-bold text-xs uppercase tracking-wider shadow-lg animate-pulse">
            <Radio className="w-3.5 h-3.5" />
            <span>LIVE</span>
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md text-slate-200 text-xs font-mono-code border border-slate-800">
            <Eye className="w-3.5 h-3.5 text-sky-400" />
            <span>{stream.viewersCount.toLocaleString()}</span>
          </span>
          <span className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md text-emerald-400 text-xs font-mono-code border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{latencyMs}ms • NAIROBI EDGE</span>
          </span>
        </div>

        {/* Quality & Data Saver Action Controls */}
        <div className="flex items-center gap-2">
          {/* Audio-Only Shoutcast Mode (Optional User Toggle) */}
          <button
            type="button"
            onClick={handleToggleAudioOnly}
            className={`px-3 py-1 rounded-xl text-xs font-mono-code font-bold border transition-all flex items-center gap-1.5 ${
              isAudioOnlyMode
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/30'
                : 'bg-slate-950/80 backdrop-blur-md text-emerald-300 border-slate-800 hover:border-emerald-500/60'
            }`}
            title="Toggle Optional Audio-Only Shoutcasting Mode"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="hidden sm:inline">Audio Shoutcast</span>
          </button>

          {/* Data Saver Mode Pill Button */}
          <button
            type="button"
            onClick={handleToggleDataSaver}
            className={`px-3 py-1 rounded-xl text-xs font-mono-code font-bold border transition-all flex items-center gap-1.5 ${
              dataSaverMode
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/30'
                : 'bg-slate-950/80 backdrop-blur-md text-slate-300 border-slate-800 hover:border-amber-400/60'
            }`}
            title="Toggle Low-Bandwidth Data Saver"
          >
            <Zap className={`w-3.5 h-3.5 ${dataSaverMode ? 'fill-slate-950' : 'text-amber-400'}`} />
            <span className="hidden sm:inline">Data Saver</span>
          </button>

          <span className="px-2.5 py-1 rounded-xl bg-[#0284c7]/15 backdrop-blur-md text-sky-300 border border-[#0369a1]/30 text-xs font-mono-code font-bold">
            {selectedQuality}
          </span>
        </div>
      </div>

      {/* Diagnostics HUD (Top Left Floating Diagnostics Panel) */}
      {showStatsHUD && (
        <div className="absolute top-16 left-6 z-30 bg-slate-950/95 backdrop-blur-xl p-4 rounded-2xl border border-[#0369a1]/40 text-[11px] font-mono-code text-slate-200 space-y-2 max-w-xs shadow-2xl">
          <div className="flex items-center justify-between text-sky-400 font-bold border-b border-slate-800 pb-1.5">
            <span>REAL-TIME STREAM DIAGNOSTICS</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Adaptive Ingest:</span>
            <span className="text-white">HLS.js / Mux Adaptive</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Stream Bitrate:</span>
            <span className="text-emerald-400 font-bold">{currentBitrate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Frame Rate:</span>
            <span className="text-white">{stream.fps} FPS</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Dropped Frames:</span>
            <span className="text-emerald-400">{droppedFrames} (0.00%)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">CDN Relay Edge:</span>
            <span className="text-cyan-300">Cloudflare Nairobi-EAT</span>
          </div>
        </div>
      )}

      {/* Centered Bottom Narrative Description & Control Bar */}
      <div className="relative z-20 p-4 sm:p-6">
        <div className="bg-slate-950/85 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-white/10 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 bg-[#0284c7]/15 rounded-xl border border-[#0369a1]/30 flex items-center justify-center text-sky-400">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-grow min-w-0">
            <p className="text-[10px] text-sky-400 font-black uppercase tracking-widest font-mono-code mb-0.5">
              Live Broadcast Narrative
            </p>
            <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed italic line-clamp-2">
              "{stream.streamer.name} is streaming {stream.game} — adaptive bitrate synchronized via Nairobi edge relay."
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              onClick={() => {
                if (videoRef.current) {
                  if (isPlaying) videoRef.current.pause();
                  else videoRef.current.play();
                  setIsPlaying(!isPlaying);
                }
              }}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.muted = !isMuted;
                  setIsMuted(!isMuted);
                }
              }}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setShowStatsHUD(!showStatsHUD)}
              className={`p-2 rounded-xl border transition-colors ${
                showStatsHUD
                  ? 'bg-[#0284c7]/20 text-sky-300 border-[#0369a1]/50 font-bold shadow-[0_0_10px_rgba(2,132,199,0.15)]'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title="Stream Diagnostics HUD"
            >
              <Cpu className="w-4 h-4" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
              title="Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
