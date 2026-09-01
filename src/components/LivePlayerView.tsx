import React, { useState, useEffect, useRef } from 'react';
import { LiveStream, ChatMessage, Currency } from '../types';
import { CURRENCY_RATES } from '../data/mockData';
import { StreamPlayer } from './StreamPlayer';
import { TipModal } from './TipModal';
import { HypeTrainWidget } from './HypeTrainWidget';
import { LiveMatchPredictionsWidget } from './LiveMatchPredictionsWidget';
import { auth, getAuthHeaders, onAuthStateChanged, User as FirebaseUser } from '../firebase';
import { 
  subscribeToStreamChat, 
  sendStreamChatMessage, 
  getLocalChatMessages,
  getRandomSimulatedChatter 
} from '../services/chatService';
import confetti from 'canvas-confetti';
import { useLanguage } from '../lib/i18n';
import {
  Radio,
  Send,
  Heart,
  Sparkles,
  Smartphone,
  CheckCircle2,
  Users,
  Eye,
  Activity,
  MessageSquare,
  Gift,
  Coins,
  Cpu,
  ShoppingBag,
  Info,
  Tv,
  Smile,
  Volume2,
  VolumeX,
  Pin,
  Flame,
  Mic,
  Zap,
  ArrowDown,
  Filter,
  Check,
  WifiOff,
  Download,
  Lock
} from 'lucide-react';

interface LivePlayerViewProps {
  currentStream: LiveStream;
  allStreams?: LiveStream[];
  streams?: LiveStream[];
  onSelectStream: (stream: LiveStream) => void;
  onOpenSubscribe: (streamerName?: string) => void;
  currentCurrency: Currency;
  onSelectCategory?: (categoryId: string) => void;
  isOfflineMode?: boolean;
  onNavigateToLibrary?: () => void;
  userTier?: 'free' | 'fan' | 'pro' | 'legend';
}

// Quick reaction hype chips (standard free emotes + subscriber badges)
const STANDARD_EMOTES = ['🔥', '🎮', 'GG', 'W', 'LFG', '⚡', '🚀'];
const SUBSCRIBER_EXCLUSIVE_EMOTES = [
  { emote: '👑', label: 'VIP Crown', minTier: 'fan' as const },
  { emote: '💎', label: 'Diamond Clutcher', minTier: 'fan' as const },
  { emote: '🦁', label: 'Kampala Pride', minTier: 'pro' as const },
  { emote: '🏆', label: 'Champion', minTier: 'pro' as const },
];

export const LivePlayerView: React.FC<LivePlayerViewProps> = ({
  currentStream,
  allStreams,
  streams: propStreams,
  onSelectStream,
  onOpenSubscribe,
  currentCurrency,
  onSelectCategory,
  isOfflineMode = false,
  onNavigateToLibrary,
  userTier = 'free',
}) => {
  const { t } = useLanguage();
  const displayStreams = allStreams || propStreams || [];
  const [isFollowing, setIsFollowing] = useState(false);
  const [likesCount, setLikesCount] = useState(1420);
  const [hasLiked, setHasLiked] = useState(false);

  // Mobile Tabbed Interface: 'stream' | 'chat' | 'store' | 'info'
  const [mobileActiveTab, setMobileActiveTab] = useState<'stream' | 'chat' | 'store' | 'info'>('stream');

  // Real-time Chat State (Firestore + Local fallback)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => getLocalChatMessages(currentStream.id));
  const [inputMessage, setInputMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [customGamerTag, setCustomGamerTag] = useState('You (Gamer)');
  const [customAvatar, setCustomAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80');

  // Chat settings & filters
  const [chatFilter, setChatFilter] = useState<'all' | 'tips'>('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isLiveHypeActive, setIsLiveHypeActive] = useState(true);
  const [pinnedNoticeOpen, setPinnedNoticeOpen] = useState(true);
  const [showEmotePicker, setShowEmotePicker] = useState(false);
  
  // Tipping Modal State
  const [tipModalOpen, setTipModalOpen] = useState(false);
  const [activeTipAlert, setActiveTipAlert] = useState<{ sender: string; amount: string; msg: string } | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Track Firebase Auth user & profile
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        setCustomGamerTag(user.displayName || user.email?.split('@')[0] || 'GamerPro');
        if (user.photoURL) {
          setCustomAvatar(user.photoURL);
        }
      } else {
        try {
          const savedTag = localStorage.getItem('visor_user_gamertag');
          if (savedTag) setCustomGamerTag(savedTag);
        } catch (e) {}
      }
    });

    return () => unsubAuth();
  }, []);

  // Web Audio chime for sound notifications
  const playChatChime = (isSuperTip = false) => {
    if (!soundEnabled) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      const audioCtx = new AudioCtxClass();
      if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      const duration = isSuperTip ? 0.4 : 0.15;
      if (isSuperTip) {
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      } else {
        osc.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      }
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
      setTimeout(() => {
        audioCtx.close().catch(() => {});
      }, (duration + 0.1) * 1000);
    } catch (e) {
      // Audio context may be restricted before user gesture
    }
  };

  // Subscribe to real-time Cloud Firestore chat updates
  useEffect(() => {
    const unsubscribe = subscribeToStreamChat(currentStream.id, (messages) => {
      setChatMessages(messages);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentStream.id]);

  // Live Community Chatter Simulation for realistic broadcast hype
  useEffect(() => {
    if (!isLiveHypeActive) return;

    const interval = setInterval(() => {
      const randomChatter = getRandomSimulatedChatter();
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      const newMsg: ChatMessage = {
        id: 'sim_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        sender: randomChatter.sender,
        avatar: randomChatter.avatar,
        badge: randomChatter.badge,
        text: randomChatter.text,
        timestamp: timeStr
      };

      setChatMessages(prev => {
        const next = [...prev.slice(-60), newMsg];
        return next;
      });
    }, 12000);

    return () => clearInterval(interval);
  }, [isLiveHypeActive, currentStream.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatFilter]);

  const handleSendMessage = async (e?: React.FormEvent, directText?: string) => {
    if (e) e.preventDefault();
    const textToSend = directText || inputMessage;
    if (!textToSend.trim()) return;

    setInputMessage('');
    setShowEmotePicker(false);

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    playChatChime(false);

    await sendStreamChatMessage(currentStream.id, {
      sender: customGamerTag,
      avatar: customAvatar,
      badge: currentUser ? 'VIP' : 'PRO',
      text: textToSend,
      timestamp: timeStr
    });
  };

  const handleInsertEmote = (emote: string) => {
    setInputMessage(prev => (prev ? `${prev} ${emote}` : emote));
    inputRef.current?.focus();
  };

  const handleMentionUser = (senderName: string) => {
    setInputMessage(prev => `@${senderName} ${prev}`);
    inputRef.current?.focus();
  };

  const handleTipSuccess = (tipDetails: { amount: string; currency: string; message: string; sender: string }) => {
    playChatChime(true);
    setActiveTipAlert({
      sender: tipDetails.sender || 'You',
      amount: tipDetails.amount,
      msg: tipDetails.message
    });

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });

    setTimeout(() => {
      setActiveTipAlert(null);
    }, 7000);
  };

  const handleLike = () => {
    if (hasLiked) {
      setLikesCount(prev => prev - 1);
      setHasLiked(false);
    } else {
      setLikesCount(prev => prev + 1);
      setHasLiked(true);
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.8 }
      });
    }
  };

  // ✅ Redirects user to Pesapal payment portal
  const handleDirectSubscribe = async (planAmountUSD = 5) => {
    try {
      const rate = CURRENCY_RATES[currentCurrency]?.rate || 3750;
      const calculatedAmount = Math.round(planAmountUSD * rate);
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
        body: JSON.stringify({
          amount: calculatedAmount,
          currency: currentCurrency,
          email: currentUser?.email || 'gamer@visorstream.com',
          phone: '0780123456',
          creatorId: currentStream.streamer.id,
          streamId: currentStream.id,
          type: 'subscription',
          description: `Visor Stream Pro Gamer Subscription (${currentStream.streamer.name})`
        })
      });

      const data = await res.json();
      if (data.redirectUrl) {
        // Redirects browser to Pesapal checkout for MTN/Airtel MoMo/Card payment
        window.location.href = data.redirectUrl;
      } else {
        onOpenSubscribe(currentStream.streamer.name);
      }
    } catch (err) {
      console.error('Subscription checkout error:', err);
      onOpenSubscribe(currentStream.streamer.name);
    }
  };


  const filteredChatMessages = chatFilter === 'tips'
    ? chatMessages.filter(m => m.isDonation)
    : chatMessages;

  return (
    <div className="space-y-5 animate-fadeIn pb-12">
      {/* Live Super Tip Overlay Toast */}
      {activeTipAlert && (
        <div className="fixed top-24 right-6 z-50 max-w-sm bg-slate-900/95 backdrop-blur-xl text-white p-4 rounded-3xl shadow-2xl border border-amber-500/50 animate-bounce">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-2xl flex items-center justify-center border border-amber-500/30">
              <Gift className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-mono-code font-bold tracking-wider text-amber-400">
                🎉 LIVE SUPER TIP DISPATCHED!
              </p>
              <p className="font-bold text-xs text-white">
                {activeTipAlert.sender} tipped <span className="text-amber-300 font-mono-code">{activeTipAlert.amount}</span>!
              </p>
              <p className="text-xs italic text-slate-300">"{activeTipAlert.msg}"</p>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Tabbed Switcher (Visible on mobile/small screens) */}
      <div className="lg:hidden flex items-center gap-1.5 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl">
        <button
          onClick={() => setMobileActiveTab('stream')}
          className={`flex-1 py-2 rounded-xl text-xs font-mono-code font-bold flex items-center justify-center gap-1.5 transition-all ${
            mobileActiveTab === 'stream'
              ? 'bg-[#0284c7]/20 text-sky-300 border border-[#0369a1]/40 shadow-[0_0_10px_rgba(2,132,199,0.15)]'
              : 'text-slate-400 hover:text-white border border-transparent'
          }`}
        >
          <Tv className="w-3.5 h-3.5" />
          <span>{t('player.tab_stream')}</span>
        </button>
        <button
          onClick={() => setMobileActiveTab('chat')}
          className={`flex-1 py-2 rounded-xl text-xs font-mono-code font-bold flex items-center justify-center gap-1.5 transition-all ${
            mobileActiveTab === 'chat'
              ? 'bg-[#0284c7]/20 text-sky-300 border border-[#0369a1]/40 shadow-[0_0_10px_rgba(2,132,199,0.15)]'
              : 'text-slate-400 hover:text-white border border-transparent'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{t('player.tab_chat')}</span>
        </button>
        <button
          onClick={() => setMobileActiveTab('store')}
          className={`flex-1 py-2 rounded-xl text-xs font-mono-code font-bold flex items-center justify-center gap-1.5 transition-all ${
            mobileActiveTab === 'store'
              ? 'bg-[#0284c7]/20 text-sky-300 border border-[#0369a1]/40 shadow-[0_0_10px_rgba(2,132,199,0.15)]'
              : 'text-slate-400 hover:text-white border border-transparent'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>{t('player.tab_store')}</span>
        </button>
        <button
          onClick={() => setMobileActiveTab('info')}
          className={`flex-1 py-2 rounded-xl text-xs font-mono-code font-bold flex items-center justify-center gap-1.5 transition-all ${
            mobileActiveTab === 'info'
              ? 'bg-[#0284c7]/20 text-sky-300 border border-[#0369a1]/40 shadow-[0_0_10px_rgba(2,132,199,0.15)]'
              : 'text-slate-400 hover:text-white border border-transparent'
          }`}
        >
          <Info className="w-3.5 h-3.5" />
          <span>{t('player.tab_info')}</span>
        </button>
      </div>

      {/* Main Bento Grid: Video Player + Real-time Event/Chat Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Bento Hero Section: Live Video + Streamer Telemetry (8 cols) */}
        <section className={`lg:col-span-8 flex flex-col gap-4 ${mobileActiveTab === 'chat' ? 'hidden lg:flex' : 'flex'}`}>
          {isOfflineMode && (
            <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs font-mono-code flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>{t('player.offline_banner_title')}</strong> Live stream playback paused to conserve cellular data. You can watch cached matches in your offline library.
                </span>
              </div>
              {onNavigateToLibrary && (
                <button
                  onClick={onNavigateToLibrary}
                  className="px-3 py-1.5 bg-amber-500 text-slate-950 rounded-xl font-bold uppercase text-[11px] shrink-0 hover:bg-amber-400 transition-colors flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>{t('player.open_offline_library')}</span>
                </button>
              )}
            </div>
          )}

          {/* HLS Adaptive Stream Player */}
          <StreamPlayer
            stream={currentStream}
            userTier={userTier}
            onOpenSubscribe={() => onOpenSubscribe(currentStream.streamer.name)}
            onOpenTip={() => setTipModalOpen(true)}
          />

          {/* Bento Stream Details & Streamer Profile Module */}
          <div className="bg-slate-900 rounded-[28px] border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono-code font-bold uppercase px-2.5 py-0.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/30">
                    {currentStream.game}
                  </span>
                  <span className="text-xs text-slate-500 font-mono-code">{t('player.uptime_label')} {currentStream.uptime}</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-1.5">
                  {currentStream.title.includes('[GRAND FINALS]') && (
                    <Flame className="w-5 h-5 text-orange-500 shrink-0" />
                  )}
                  <span>{currentStream.title}</span>
                </h1>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    hasLiked
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${hasLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span>{likesCount.toLocaleString()}</span>
                </button>

                <button
                  onClick={() => setTipModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-transform active:scale-95"
                >
                  <Smartphone className="w-4 h-4 text-slate-950" />
                  <span>{t('player.tip_momo_button')}</span>
                </button>

                <button
                  onClick={() => onOpenSubscribe(currentStream.streamer.name)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-950 hover:bg-sky-400 transition-colors font-black text-xs uppercase tracking-widest shadow-lg shadow-sky-500/10"
                >
                  <Sparkles className="w-4 h-4 text-sky-600" />
                  <span>{t('player.subscribe_button')}</span>
                </button>
              </div>
            </div>

            {/* Streamer Profile Row */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={currentStream.streamer.avatar}
                    alt={currentStream.streamer.name}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-sky-400/80 shadow-md shadow-sky-400/20"
                  />
                  <span className="absolute -bottom-1 -right-1 text-sm">
                    {currentStream.streamer.countryFlag}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-white">
                      {currentStream.streamer.name}
                    </span>
                    {currentStream.streamer.verified && (
                      <CheckCircle2 className="w-4 h-4 text-sky-400" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="font-mono-code">{currentStream.streamer.handle}</span>
                    <span>•</span>
                    <span>{currentStream.streamer.subscribers.toLocaleString()} {t('player.subscribers_suffix')}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isFollowing
                    ? 'bg-slate-800 text-slate-300 border border-slate-700'
                    : 'bg-sky-500/15 text-sky-400 border border-sky-500/40 hover:bg-sky-500/25'
                }`}
              >
                {isFollowing ? t('player.following_button') : t('player.follow_button')}
              </button>
            </div>

            {/* Creator Active Tip Jar Goal Widget */}
            <div className="p-3.5 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 rounded-2xl border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-300">
                    <Gift className="w-3.5 h-3.5 text-amber-400" />
                    <span className="flex items-center gap-1">
                      {t('player.tipjar_goal_label')}
                      <Mic className="w-3.5 h-3.5 text-amber-400 inline-block" />
                      Studio Mic & Capture Card Upgrade
                    </span>
                  </div>
                  <span className="font-mono-code font-bold text-white text-[11px]">
                    $335 / $450 USD (74%)
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-400 h-full w-[74%] rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                </div>
              </div>

              <button
                onClick={() => setTipModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('player.tipjar_button')}</span>
              </button>
            </div>

            {/* Live Community Match Prediction Widget */}
            <LiveMatchPredictionsWidget
              streamTitle={currentStream.title}
              gameCategory={currentStream.game}
            />
          </div>
        </section>

        {/* Bento Event Stream & Persistent Firestore Chat Panel (4 cols) */}
        <section className={`lg:col-span-4 bg-slate-900 border border-slate-800 rounded-[28px] sm:rounded-[32px] flex flex-col overflow-hidden shadow-2xl shadow-black/40 h-[640px] ${mobileActiveTab === 'stream' ? 'hidden lg:flex' : 'flex'}`}>
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-sky-400" />
              </div>
              <div>
                <h2 className="font-black text-xs uppercase tracking-wider text-white">
                  {t('player.chat_panel_title')}
                </h2>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono-code">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Real-Time Sync Active</span>
                </div>
              </div>
            </div>

            {/* Chat Controls: Sound Mute & Live Hype Toggle */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-1.5 rounded-lg border transition-all ${
                  soundEnabled
                    ? 'bg-slate-800 text-sky-400 border-slate-700 hover:bg-slate-700'
                    : 'bg-slate-800/40 text-slate-500 border-slate-800'
                }`}
                title={soundEnabled ? 'Mute Chat Sound Effects' : 'Enable Chat Sound Effects'}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setIsLiveHypeActive(!isLiveHypeActive)}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono-code font-bold border transition-all flex items-center gap-1 ${
                  isLiveHypeActive
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
                title="Toggle simulated community live chat hype"
              >
                <Zap className="w-3 h-3 text-amber-400" />
                <span>{isLiveHypeActive ? 'HYPE ON' : 'HYPE PAUSED'}</span>
              </button>
            </div>
          </div>

          {/* MoMo Community Hype Train Widget */}
          <div className="p-2.5 bg-slate-950/40 border-b border-slate-800/80">
            <HypeTrainWidget
              streamId={currentStream.id}
              onOpenTip={() => setTipModalOpen(true)}
              onOpenSubscribe={() => onOpenSubscribe(currentStream.streamer.name)}
            />
          </div>

          {/* Chat Filter Tabs: All vs Super Tips */}
          <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between text-xs font-mono-code">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setChatFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                  chatFilter === 'all'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white border border-transparent'
                }`}
              >
                {t('player.chat_filter_all')} ({chatMessages.length})
              </button>
              <button
                onClick={() => setChatFilter('tips')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 ${
                  chatFilter === 'tips'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-amber-300 border border-transparent'
                }`}
              >
                <Gift className="w-3 h-3 text-amber-400" />
                <span>{t('player.chat_filter_tips')} ({chatMessages.filter(m => m.isDonation).length})</span>
              </button>
            </div>

            <span className="text-[10px] text-slate-500">
              {currentUser ? `@${customGamerTag}` : t('player.guest_mode')}
            </span>
          </div>

          {/* Streamer Pinned Banner */}
          {pinnedNoticeOpen && (
            <div className="mx-3 mt-2.5 p-2.5 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-sky-950/40 rounded-xl border border-indigo-500/30 flex items-start justify-between gap-2 text-xs">
              <div className="flex items-start gap-2">
                <Pin className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1 text-[10px] font-mono-code font-bold text-indigo-300">
                    <span>📌 PINNED BY {currentStream.streamer.name.toUpperCase()}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    Welcome to the broadcast! Sub goal 500. Tips via MTN MoMo, M-Pesa & Card will show on live overlay!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPinnedNoticeOpen(false)}
                className="text-slate-500 hover:text-white text-xs p-1"
                title="Dismiss Notice"
              >
                ✕
              </button>
            </div>
          )}

          {/* Messages Container */}
          <div 
            ref={chatContainerRef}
            className="flex-grow p-4 space-y-3 overflow-y-auto font-sans text-xs scroll-smooth"
          >
            {filteredChatMessages.length === 0 ? (
              <div className="py-12 text-center space-y-2 text-slate-500">
                <MessageSquare className="w-8 h-8 mx-auto opacity-40 text-slate-600" />
                <p className="text-xs">{t('player.no_messages_filter')}</p>
                <button
                  onClick={() => setChatFilter('all')}
                  className="text-xs text-sky-400 font-bold underline"
                >
                  View all chat messages
                </button>
              </div>
            ) : (
              filteredChatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-2xl transition-all ${
                    msg.isDonation
                      ? 'bg-gradient-to-r from-amber-500/15 via-slate-900 to-orange-500/10 border border-amber-500/40 shadow-lg shadow-amber-500/5'
                      : 'bg-slate-800/40 hover:bg-slate-800/70 border border-slate-800/80'
                  }`}
                >
                  {msg.isDonation && (
                    <div className="flex items-center justify-between text-amber-300 font-bold text-[10px] font-mono-code mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <Gift className="w-3.5 h-3.5 text-amber-400" />
                        SUPER TIP: {msg.donationAmount}
                      </span>
                      <span className="text-[9px] px-2 py-0.5 bg-amber-500/20 text-amber-200 rounded font-bold uppercase">
                        ★ SUPER CHAT
                      </span>
                    </div>
                  )}

                  <div className="flex items-start gap-2.5">
                    <img
                      src={msg.avatar}
                      alt={msg.sender}
                      className="w-7 h-7 rounded-xl object-cover mt-0.5 shrink-0 border border-slate-700"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <button
                            onClick={() => handleMentionUser(msg.sender)}
                            className="font-bold text-xs text-slate-200 hover:text-sky-300 truncate text-left transition-colors"
                            title={`Mention @${msg.sender}`}
                          >
                            {msg.sender}
                          </button>
                          {msg.badge && (
                            <span
                              className={`text-[8px] px-1.5 py-0.2 rounded font-mono-code font-bold uppercase shrink-0 ${
                                msg.badge === 'CREATOR'
                                  ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/40'
                                  : msg.badge === 'VIP'
                                  ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                                  : msg.badge === 'MOD'
                                  ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                              }`}
                            >
                              {msg.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono-code text-slate-500 shrink-0">{msg.timestamp}</span>
                      </div>
                      <p className={`mt-1 text-xs leading-normal break-words ${msg.isDonation ? 'text-amber-100 font-semibold' : 'text-slate-300'}`}>
                        {msg.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Hype Emotes Bar with Subscriber Perks */}
          <div className="px-3.5 py-2 bg-slate-950/70 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-mono-code text-slate-400 uppercase font-bold shrink-0 flex items-center gap-1 mr-1">
              <Flame className="w-3 h-3 text-orange-400" />
              <span>Hype:</span>
            </span>
            {STANDARD_EMOTES.map((emote, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(undefined, emote)}
                className="px-2 py-1 bg-slate-800 hover:bg-sky-500/20 hover:border-sky-500/40 border border-slate-700 text-xs rounded-lg transition-all shrink-0 hover:scale-105 active:scale-95"
                title={`Send ${emote}`}
              >
                {emote}
              </button>
            ))}
            <span className="h-4 w-px bg-slate-800 shrink-0 mx-0.5" />
            {SUBSCRIBER_EXCLUSIVE_EMOTES.map((sub, idx) => {
              const isLocked = userTier === 'free' || (sub.minTier === 'pro' && userTier === 'fan');
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (isLocked) {
                      onOpenSubscribe(currentStream.streamer.name);
                    } else {
                      handleSendMessage(undefined, `${sub.emote} [Sub Perk]`);
                    }
                  }}
                  className={`px-2 py-1 border text-xs rounded-lg transition-all shrink-0 flex items-center gap-1 ${
                    isLocked 
                      ? 'bg-slate-900/60 text-slate-500 border-slate-800 hover:border-amber-500/40' 
                      : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}
                  title={isLocked ? `${sub.label} (Subscriber Perk - Click to unlock)` : `Send ${sub.label}`}
                >
                  <span>{sub.emote}</span>
                  {isLocked && <Lock className="w-2.5 h-2.5 text-amber-400" />}
                </button>
              );
            })}
          </div>

          {/* Chat Form & Actions */}
          <div className="p-3.5 sm:p-4 bg-slate-950 border-t border-slate-800 space-y-2.5">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                placeholder={currentUser ? `Chat as ${customGamerTag}...` : t('player.chat_input_placeholder')}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-800 focus:border-sky-400 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setTipModalOpen(true)}
                className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 transition-colors"
                title={t('player.send_super_tip_title')}
              >
                <Coins className="w-4 h-4" />
              </button>
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className={`p-2.5 rounded-xl font-bold transition-all ${
                  inputMessage.trim()
                    ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md shadow-sky-500/20'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTipModalOpen(true)}
                className="py-2 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
              >
                <Gift className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('player.super_tip_button')}</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenSubscribe(currentStream.streamer.name)}
                className="py-2 px-3 bg-white text-slate-950 hover:bg-sky-400 border border-transparent rounded-xl text-[11px] font-black uppercase tracking-wider transition-colors shadow-md"
              >
                <span>{t('player.subscribe_button')}</span>
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Bento Telemetry Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Bento Cell 1: Intelligence Precision */}
        <section className="md:col-span-4 bg-slate-900 border border-slate-800 rounded-[28px] sm:rounded-[32px] p-6 flex flex-col justify-between overflow-hidden relative shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono-code">
              Adaptive Bitrate Sync
            </h3>
            <span className="text-[9px] font-mono-code text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              OPTIMAL
            </span>
          </div>

          <div className="my-4">
            <div className="flex items-end gap-3">
              <span className="text-5xl sm:text-6xl font-bold text-white tracking-tighter font-rajdhani">
                98.4<span className="text-2xl text-slate-600">%</span>
              </span>
              <div className="mb-2 flex items-center gap-1 text-emerald-400 font-mono-code">
                <Activity className="w-4 h-4" />
                <span className="text-xs font-black">+0.3</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Stream encoder sync with HLS.js adaptive player & Cloudflare Nairobi node.
            </p>
          </div>

          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-sky-400 h-full w-[98.4%] shadow-[0_0_12px_rgba(56,189,248,0.6)]"></div>
          </div>
        </section>

        {/* Bento Cell 2: Semantic Graphing */}
        <section className="md:col-span-4 bg-slate-900 border border-slate-800 rounded-[28px] sm:rounded-[32px] p-6 flex flex-col justify-between shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono-code">
                Regional CDN Routing
              </h3>
              <span className="text-xs text-slate-400">Ultra-low edge latency</span>
            </div>
            <div className="flex gap-1.5">
              <div className="w-1.5 h-4 bg-indigo-500 rounded-full animate-pulse"></div>
              <div className="w-1.5 h-4 bg-indigo-500/60 rounded-full"></div>
              <div className="w-1.5 h-4 bg-indigo-500/20 rounded-full"></div>
            </div>
          </div>

          <div className="flex items-end justify-between gap-2.5 my-4 h-16">
            <div className="flex-1 bg-slate-800/50 h-8 rounded-xl relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-full h-full bg-indigo-500/20 border-b-2 border-indigo-400 rounded-b-xl"></div>
            </div>
            <div className="flex-1 bg-slate-800/50 h-14 rounded-xl relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-full h-full bg-sky-500/20 border-b-2 border-sky-400 rounded-b-xl"></div>
            </div>
            <div className="flex-1 bg-slate-800/50 h-16 rounded-xl relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-full h-full bg-indigo-500/30 border-b-2 border-indigo-400 rounded-b-xl"></div>
            </div>
            <div className="flex-1 bg-slate-800/50 h-10 rounded-xl relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-full h-full bg-sky-500/20 border-b-2 border-sky-400 rounded-b-xl"></div>
            </div>
          </div>

          <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono-code font-bold uppercase">
            <span>Nairobi (14ms)</span>
            <span>Kampala (18ms)</span>
            <span>Dar es Salaam (22ms)</span>
          </div>
        </section>

        {/* Bento Cell 3: Mobile Money Instant Payouts */}
        <section className="md:col-span-4 bg-slate-900 border border-slate-800 rounded-[28px] sm:rounded-[32px] p-6 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono-code">
              Direct Monetization
            </h3>
            <span className="text-[9px] font-mono-code text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              70/30 REVENUE
            </span>
          </div>

          <div className="my-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Supported Rails:</span>
              <span className="text-white font-bold">MTN MoMo, M-Pesa, Airtel</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Streamer Payout Rate:</span>
              <span className="text-sky-400 font-bold">70% Instant Direct</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Settlement Currency:</span>
              <span className="text-emerald-400 font-bold">{currentCurrency} Local</span>
            </div>
          </div>

          <button
            onClick={() => setTipModalOpen(true)}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-sky-400 font-bold text-xs rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            <Smartphone className="w-4 h-4 text-sky-400" />
            <span>Send Direct Mobile Tip</span>
          </button>
        </section>
      </div>

      {/* Featured Live Streams Grid */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Radio className="w-4 h-4 text-red-500 animate-pulse" />
            <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider font-rajdhani">
              {t('player.featured_streams_title')}
            </h2>
          </div>
          <span className="text-xs text-sky-400 font-mono-code font-semibold">
            {displayStreams.length} ACTIVE BROADCASTS
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayStreams.map((stream) => (
            <div
              key={stream.id}
              onClick={() => onSelectStream(stream)}
              className={`group bg-slate-900 rounded-2xl overflow-hidden border cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                currentStream.id === stream.id
                  ? 'border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.25)]'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={stream.thumbnail}
                  alt={stream.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-red-600 text-white font-mono-code font-bold text-[9px] tracking-wider uppercase">
                    {t('player.live_badge')}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-white text-[9px] font-mono-code">
                    {stream.viewersCount.toLocaleString()} {t('player.viewers_suffix')}
                  </span>
                </div>
                <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-slate-950/80 text-[9px] font-mono-code text-slate-300">
                  {stream.resolution}
                </div>
              </div>

              <div className="p-3.5 space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <img
                    src={stream.streamer.avatar}
                    alt={stream.streamer.name}
                    className="w-8 h-8 rounded-xl object-cover border border-sky-500/40"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-bold text-white line-clamp-1 group-hover:text-sky-400 transition-colors">
                      {stream.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <span>{stream.streamer.name}</span>
                      <span>{stream.streamer.countryFlag}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                  <span className="text-sky-400 font-mono-code font-semibold">{stream.game}</span>
                  <span className="font-mono-code">{stream.uptime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tip Modal */}
      <TipModal
        isOpen={tipModalOpen}
        onClose={() => setTipModalOpen(false)}
        streamId={currentStream.id}
        streamerName={currentStream.streamer.name}
        onSuccess={handleTipSuccess}
      />
    </div>
  );
};
