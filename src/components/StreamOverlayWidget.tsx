import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../lib/i18n';
import {
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  Gift,
  Heart,
  Smartphone,
  Copy,
  Check,
  Play,
  Sliders,
  Settings,
  Tv,
  Crown,
  Flame,
  MessageSquare
} from 'lucide-react';

interface StreamOverlayWidgetProps {
  creatorId?: string;
  isStandaloneOverlay?: boolean;
}

export interface StreamAlertEvent {
  id: string;
  type: 'tip' | 'subscription' | 'raid' | 'hype_train';
  sender: string;
  amount?: string;
  currency?: string;
  message?: string;
  tier?: string;
  provider?: string;
  timestamp: number;
}

export const StreamOverlayWidget: React.FC<StreamOverlayWidgetProps> = ({
  creatorId = 'me',
  isStandaloneOverlay = false,
}) => {
  const { t } = useLanguage();
  const [activeAlert, setActiveAlert] = useState<StreamAlertEvent | null>(null);
  const [alertQueue, setAlertQueue] = useState<StreamAlertEvent[]>([]);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [soundVolume, setSoundVolume] = useState(0.8);
  const [ttsVoice, setTtsVoice] = useState<string>('default');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [minTipForTts, setMinTipForTts] = useState(1.0); // $1 minimum for TTS
  const [overlayTheme, setOverlayTheme] = useState<'cyberpunk' | 'neon_gold' | 'esports_red'>('cyberpunk');
  const [copiedUrl, setCopiedUrl] = useState(false);

  const isProcessingRef = useRef(false);

  // Initialize browser speech synthesis voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Web Audio synthesizer for alert sound effects
  const playAlertChime = (type: string) => {
    if (soundVolume <= 0) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      const audioCtx = new AudioCtxClass();
      if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }
      const now = audioCtx.currentTime;

      if (type === 'tip') {
        // Super Tip chime: Arpeggiated happy chords (C5 -> E5 -> G5 -> C6)
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, index) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + index * 0.08);
          gain.gain.setValueAtTime(0.2 * soundVolume, now + index * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.35);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now + index * 0.08);
          osc.stop(now + index * 0.08 + 0.35);
        });
      } else {
        // Subscription fanfare: Powerful brassy pulse (F5 -> A5 -> C6)
        [698.46, 880.00, 1046.50].forEach((freq, index) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + index * 0.1);
          gain.gain.setValueAtTime(0.18 * soundVolume, now + index * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.1 + 0.4);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now + index * 0.1);
          osc.stop(now + index * 0.1 + 0.4);
        });
      }

      setTimeout(() => {
        audioCtx.close().catch(() => {});
      }, 1000);
    } catch (e) {
      // Audio context restricted before user interaction
    }
  };

  // Browser Text-To-Speech (TTS) engine
  const speakMessage = (text: string) => {
    if (!ttsEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = soundVolume;
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      if (ttsVoice !== 'default' && availableVoices.length > 0) {
        const found = availableVoices.find((v) => v.name === ttsVoice);
        if (found) utterance.voice = found;
      }

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('TTS playback note:', err);
    }
  };

  // Process alert queue sequentially
  useEffect(() => {
    if (alertQueue.length > 0 && !activeAlert && !isProcessingRef.current) {
      isProcessingRef.current = true;
      const next = alertQueue[0];
      setAlertQueue((prev) => prev.slice(1));
      setActiveAlert(next);

      // Play Sound Chime
      playAlertChime(next.type);

      // Trigger Confetti
      confetti({
        particleCount: next.type === 'tip' ? 60 : 100,
        spread: 80,
        origin: { y: 0.3 },
      });

      // TTS Message Readout (after short delay for chime)
      if (next.message && ttsEnabled) {
        setTimeout(() => {
          const ttsSpeech = `${next.sender} tipped ${next.amount || ''} ${next.currency || ''}. ${next.message}`;
          speakMessage(ttsSpeech);
        }, 600);
      }

      // Display alert for 5.5 seconds then clear
      setTimeout(() => {
        setActiveAlert(null);
        isProcessingRef.current = false;
      }, 5500);
    }
  }, [alertQueue, activeAlert, ttsEnabled, soundVolume]);

  const handleTestAlert = (type: 'tip' | 'subscription', customData?: Partial<StreamAlertEvent>) => {
    const testEvent: StreamAlertEvent = {
      id: `alert-${Date.now()}`,
      type,
      sender: customData?.sender || (type === 'tip' ? 'KampalaGamer256' : 'NairobiQueen'),
      amount: customData?.amount || (type === 'tip' ? '15,000' : undefined),
      currency: customData?.currency || 'UGX',
      provider: customData?.provider || 'MTN MoMo',
      message: customData?.message || (type === 'tip' ? 'GG bro! Clutch that final Free Fire circle! 🔥👑' : 'Let’s go! 3 months subbed!'),
      tier: type === 'subscription' ? 'Tier 1 Pro Sub' : undefined,
      timestamp: Date.now(),
    };

    setAlertQueue((prev) => [...prev, testEvent]);
  };

  const copyObsUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const obsUrl = `${origin}/overlay?creatorId=${creatorId}&theme=${overlayTheme}`;
    navigator.clipboard.writeText(obsUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  // If this is rendered as the standalone OBS Browser Source view
  if (isStandaloneOverlay) {
    return (
      <div className="fixed inset-0 pointer-events-none flex flex-col items-center justify-start pt-12 p-6 z-50 bg-transparent overflow-hidden">
        {activeAlert && (
          <div className="animate-bounceIn w-full max-w-md">
            <div className="relative overflow-hidden rounded-3xl p-6 bg-slate-950/95 border-2 border-purple-500/80 shadow-[0_0_50px_rgba(168,85,247,0.4)] backdrop-blur-xl text-center space-y-3">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 animate-pulse"></div>

              <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center justify-center shadow-lg">
                {activeAlert.type === 'tip' ? <Zap className="w-8 h-8 text-amber-400 animate-pulse" /> : <Crown className="w-8 h-8 text-pink-400" />}
              </div>

              <div className="space-y-1">
                <div className="text-xl font-black text-white tracking-wide uppercase">
                  {activeAlert.sender}
                </div>
                <div className="text-sm font-black text-amber-400 font-mono-code">
                  {activeAlert.type === 'tip' ? (
                    <span>TIPPED {activeAlert.amount} {activeAlert.currency} ({activeAlert.provider})</span>
                  ) : (
                    <span className="text-pink-400">NEW {activeAlert.tier || 'SUBSCRIPTION'}!</span>
                  )}
                </div>
              </div>

              {activeAlert.message && (
                <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-100 text-sm font-medium italic shadow-inner">
                  "{activeAlert.message}"
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Dashboard configuration & preview view
  return (
    <div className="space-y-6">
      {/* OBS Browser Source URL Banner */}
      <div className="p-5 rounded-2xl bg-slate-950 border border-purple-500/30 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-purple-400 font-mono-code text-xs font-bold uppercase">
              <Tv className="w-4 h-4" />
              <span>OBS Studio / vMix / TikTok Live Browser Source</span>
            </div>
            <h3 className="text-lg font-black text-white">{t('overlay.title')}</h3>
            <p className="text-xs text-slate-400">
              Paste this URL into OBS as a Browser Source (1920x1080) for transparent on-screen MoMo tip alerts with AI voice readout.
            </p>
          </div>

          <button
            onClick={copyObsUrl}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-lg shadow-purple-600/20 transition-transform active:scale-95 whitespace-nowrap"
          >
            {copiedUrl ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>URL Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>{t('overlay.copyUrl')}</span>
              </>
            )}
          </button>
        </div>

        {/* Live Overlay Canvas Preview Box */}
        <div className="relative rounded-2xl bg-slate-900 border border-slate-800 h-64 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
          
          <div className="absolute top-3 left-3 px-2 py-0.5 rounded-lg bg-slate-950/80 text-[10px] font-mono-code text-slate-400 border border-slate-800">
            OBS Canvas Preview (1080p)
          </div>

          {activeAlert ? (
            <div className="relative z-10 animate-bounceIn w-full max-w-sm">
              <div className="overflow-hidden rounded-3xl p-5 bg-slate-950/95 border-2 border-purple-500/80 shadow-[0_0_40px_rgba(168,85,247,0.5)] backdrop-blur-xl text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center justify-center">
                  {activeAlert.type === 'tip' ? <Zap className="w-6 h-6 text-amber-400" /> : <Crown className="w-6 h-6 text-pink-400" />}
                </div>

                <div>
                  <div className="text-base font-black text-white">{activeAlert.sender}</div>
                  <div className="text-xs font-black text-amber-400 font-mono-code">
                    {activeAlert.type === 'tip' ? `TIPPED ${activeAlert.amount} ${activeAlert.currency}` : 'NEW PRO SUBSCRIPTION!'}
                  </div>
                </div>

                {activeAlert.message && (
                  <div className="p-2.5 rounded-xl bg-slate-900 text-slate-200 text-xs italic">
                    "{activeAlert.message}"
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-500 space-y-1">
              <Sparkles className="w-6 h-6 mx-auto text-slate-600" />
              <div className="text-xs font-bold">Overlay Idle • Waiting for Live Donors</div>
              <div className="text-[10px]">Click any test button below to trigger live on-screen alert</div>
            </div>
          )}
        </div>

        {/* Test Alert Triggers */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Test Alerts:</span>
          
          <button
            onClick={() => handleTestAlert('tip', { sender: 'UgandaSniper', amount: '10,000', currency: 'UGX', provider: 'MTN MoMo', message: 'W stream! Take that sniper squad down!' })}
            className="px-3 py-1.5 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Test 10k UGX MoMo Tip</span>
          </button>

          <button
            onClick={() => handleTestAlert('tip', { sender: 'NairobiGamer', amount: '500', currency: 'KES', provider: 'M-Pesa', message: 'Big love from Kenya! Road to 10k followers!' })}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Test 500 KES M-Pesa Tip</span>
          </button>

          <button
            onClick={() => handleTestAlert('subscription', { sender: 'KigaliPro', tier: 'Tier 1 Pro Sub', message: 'Hyped for the finals!' })}
            className="px-3 py-1.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 text-pink-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Test Pro Subscription</span>
          </button>
        </div>
      </div>

      {/* TTS & Audio Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* TTS Controls */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-purple-400" />
                <span>Text-to-Speech (TTS) Voice</span>
              </h4>
              <p className="text-[11px] text-slate-400">Reads viewer super tip messages live on your stream.</p>
            </div>
            <input
              type="checkbox"
              checked={ttsEnabled}
              onChange={(e) => setTtsEnabled(e.target.checked)}
              className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-slate-300 font-medium">Select Voice Engine</label>
            <select
              value={ttsVoice}
              onChange={(e) => setTtsVoice(e.target.value)}
              disabled={!ttsEnabled}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500 disabled:opacity-50"
            >
              <option value="default">Default System Voice</option>
              {availableVoices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Minimum Tip for TTS:</span>
            <span className="font-mono-code font-bold text-amber-400">$1.00 USD (3,750 UGX)</span>
          </div>
        </div>

        {/* Audio Volume & Theme */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-pink-400" />
              <span>Alert Sound & Theme</span>
            </h4>
            <p className="text-[11px] text-slate-400">Tune alert volume and visual styling.</p>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Chime Volume</span>
              <span className="font-mono-code">{Math.round(soundVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={soundVolume}
              onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
              className="w-full accent-purple-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-medium">Visual Style</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'cyberpunk', label: 'Cyberpunk Purple' },
                { id: 'neon_gold', label: 'Neon Amber' },
                { id: 'esports_red', label: 'Esports Red' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setOverlayTheme(t.id as any)}
                  className={`py-2 px-2 rounded-xl text-[11px] font-bold border text-center transition-colors ${
                    overlayTheme === t.id
                      ? 'bg-purple-600/30 border-purple-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
