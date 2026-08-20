import React, { useState, useEffect } from 'react';
import { VisorLogo } from './VisorLogo';
import { LiveStream, Currency } from '../types';
import { MOCK_LIVE_STREAMS } from '../data/mockData';
import {
  Play,
  Tv,
  Radio,
  Gamepad2,
  Zap,
  Users,
  ShieldCheck,
  Smartphone,
  Gift,
  Coins,
  Cpu,
  ShoppingBag,
  Film,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  Activity,
  Flame,
  Globe,
  Layers,
  MessageSquare,
  Lock,
  FileText,
  Mail,
  Heart,
  Eye,
  LogIn,
  UserPlus,
  LayoutDashboard
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LandingPageViewProps {
  isAuthenticated: boolean;
  userDisplayName?: string | null;
  userAvatar?: string | null;
  onOpenLogin: () => void;
  onOpenSignUp: () => void;
  onEnterApp: () => void;
  onSelectStream: (stream: LiveStream) => void;
  onNavigateLegal: (section: 'terms' | 'privacy' | 'about') => void;
  onNavigateTab?: (tab: string) => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  isAuthenticated,
  userDisplayName,
  userAvatar,
  onOpenLogin,
  onOpenSignUp,
  onEnterApp,
  onSelectStream,
  onNavigateLegal,
  onNavigateTab
}) => {
  const [activeHeroTab, setActiveHeroTab] = useState<'stream' | 'chat'>('stream');
  const [isPlayingHero, setIsPlayingHero] = useState(true);
  const [heroLikes, setHeroLikes] = useState(3842);
  const [hasLikedHero, setHasLikedHero] = useState(false);

  // Smooth scroll handler
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLikeHero = () => {
    if (!hasLikedHero) {
      setHeroLikes(prev => prev + 1);
      setHasLikedHero(true);
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.7 }
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-sky-500 selection:text-black">
      {/* GLOBAL TOP NAV BAR */}
      <header className="sticky top-0 z-50 bg-[#07090e]/85 backdrop-blur-xl border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-3 group focus:outline-none"
            >
              <VisorLogo size="md" glow={true} />
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 text-xs font-mono-code font-bold uppercase tracking-wider text-slate-300">
              <button
                onClick={() => scrollToSection('features')}
                className="hover:text-sky-400 transition-colors py-2"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('live-streams')}
                className="hover:text-sky-400 transition-colors py-2 flex items-center gap-1.5"
              >
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                <span>Live Streams</span>
              </button>
              <button
                onClick={() => scrollToSection('integrations')}
                className="hover:text-sky-400 transition-colors py-2"
              >
                Integrations
              </button>
              <button
                onClick={() => scrollToSection('creators')}
                className="hover:text-sky-400 transition-colors py-2"
              >
                Monetization
              </button>
              <button
                onClick={() => onNavigateLegal('about')}
                className="hover:text-sky-400 transition-colors py-2"
              >
                About
              </button>
            </nav>
          </div>

          {/* Right Action / Auth Controls */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={onEnterApp}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-500 hover:from-sky-300 hover:to-indigo-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-sky-500/20 transition-all hover:scale-105"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to App Dashboard</span>
                </button>

                {userAvatar && (
                  <img
                    src={userAvatar}
                    alt={userDisplayName || 'User'}
                    className="w-9 h-9 rounded-xl object-cover border-2 border-sky-400/80 shadow-md"
                  />
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={onOpenLogin}
                  className="px-4 py-2 rounded-xl text-xs font-mono-code font-bold uppercase tracking-wider text-slate-200 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 transition-all flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5 text-sky-400" />
                  <span>Log In</span>
                </button>

                <button
                  onClick={onOpenSignUp}
                  className="px-4 sm:px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-sky-500/20 transition-all hover:scale-105"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Get Started Free</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* SECTION A: HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-800/60">
        {/* Background glow ambient rings */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-sky-500/15 via-indigo-600/10 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Hero Text Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-mono-code font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>PREMIER GAMING & ESPORTS STREAMING PLATFORM</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight font-rajdhani uppercase leading-[1.08]">
                Stream. Play. Connect. Built for creators and competitive gamers.
              </h1>

              {/* Subheadline */}
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
                Next-gen low-latency live streaming, creator tools, community hubs, and game store integrations all in one unified platform.
              </p>

              {/* Primary Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={isAuthenticated ? onEnterApp : onOpenSignUp}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-400 via-sky-500 to-indigo-500 hover:from-sky-300 hover:to-indigo-400 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-sky-500/25 transition-all hover:scale-105 active:scale-95"
                >
                  <Radio className="w-4 h-4" />
                  <span>Start Streaming Free</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => scrollToSection('live-streams')}
                  className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:border-sky-500/50"
                >
                  <Eye className="w-4 h-4 text-sky-400" />
                  <span>Explore Stream Hubs</span>
                </button>
              </div>

              {/* Trust Metrics Pill Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-800/80">
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 text-left">
                  <div className="text-sky-400 font-mono-code font-black text-base">&lt; 45ms</div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono-code">Ultra-Low Latency</div>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 text-left">
                  <div className="text-amber-400 font-mono-code font-black text-base">70 / 30</div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono-code">Creator Split</div>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 text-left">
                  <div className="text-emerald-400 font-mono-code font-black text-base">Instant</div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono-code">MTN / M-Pesa Tips</div>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 text-left">
                  <div className="text-purple-400 font-mono-code font-black text-base">120 FPS</div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono-code">Ultra-HD Ingest</div>
                </div>
              </div>
            </div>

            {/* Hero Media: Interactive Glassmorphism Stream Mockup */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-lg lg:max-w-none bg-slate-900/80 backdrop-blur-2xl border-2 border-slate-700/80 rounded-[32px] overflow-hidden shadow-2xl shadow-sky-500/10">
                
                {/* Mock Window Topbar */}
                <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                    <span className="ml-2 font-mono-code text-[11px] text-slate-400 font-bold">
                      VISOR // LIVE EDGE BROADCAST
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-red-600 text-white font-mono-code font-black text-[9px] uppercase tracking-wider animate-pulse">
                    LIVE NOW
                  </span>
                </div>

                {/* Video Stage Mock */}
                <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80"
                    alt="Esports Tournament Live"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                  {/* Telemetry Overlays */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <div className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono-code text-white flex items-center gap-1.5">
                      <Users className="w-3 h-3 text-sky-400" />
                      <span>14,820 Viewers</span>
                    </div>
                    <div className="px-2.5 py-1 rounded-lg bg-emerald-500/20 backdrop-blur-md border border-emerald-500/40 text-[10px] font-mono-code text-emerald-300 font-bold">
                      Node: NAIROBI-01 (24ms)
                    </div>
                  </div>

                  {/* Super Tip Alert Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-gradient-to-r from-amber-500/90 to-orange-500/90 text-slate-950 shadow-xl backdrop-blur-md flex items-center justify-between gap-3 animate-bounce">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-black">
                        <Gift className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-[11px] font-black uppercase font-mono-code">
                          ★ SUPER TIP: 25,000 UGX (MTN MoMo)
                        </div>
                        <div className="text-[10px] font-bold text-slate-900">
                          Kampala_Gamer: "Insane clutch on Site B! 🔥🔥"
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono-code px-2 py-0.5 rounded bg-black/20 font-bold">VIP PIN</span>
                  </div>
                </div>

                {/* Live Chat Mock Stream Overlay */}
                <div className="p-4 bg-slate-950/90 space-y-2 text-xs border-t border-slate-800">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono-code">
                    <span className="flex items-center gap-1.5 text-sky-400 font-bold">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>STREAM CHAT (REAL-TIME)</span>
                    </span>
                    <button 
                      onClick={handleLikeHero}
                      className="flex items-center gap-1 text-pink-400 hover:scale-105 transition-transform"
                    >
                      <Heart className="w-3.5 h-3.5 fill-pink-400" />
                      <span>{heroLikes}</span>
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono-code font-bold text-[9px]">PRO</span>
                        <span className="font-bold text-white">Zack_KLA:</span>
                        <span className="text-slate-300">That 120 FPS frame pacing is butter smooth 🚀</span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono-code">now</span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono-code font-bold text-[9px]">VIP</span>
                        <span className="font-bold text-white">Nairobi_Sniper:</span>
                        <span className="text-slate-300">Sent MoMo support! Let's hit that grand finals!</span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono-code">1s</span>
                    </div>
                  </div>

                  {/* Direct Jump CTA */}
                  <button
                    onClick={() => {
                      if (MOCK_LIVE_STREAMS[0]) {
                        onSelectStream(MOCK_LIVE_STREAMS[0]);
                      } else {
                        onEnterApp();
                      }
                    }}
                    className="w-full mt-2 py-2.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 text-sky-300 text-xs font-mono-code font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>Click to Enter Broadcast</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION B: PLATFORM HIGHLIGHTS GRID (CORE FEATURES) */}
      <section id="features" className="py-20 bg-[#07090e] border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono-code font-bold uppercase text-sky-400 tracking-widest px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30">
              ENGINEERED FOR HIGH PERFORMANCE
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white font-rajdhani uppercase tracking-tight">
              All-In-One Continental Gaming Infrastructure
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Every tool creators and competitive gamers need — from low-latency broadcasting to multi-currency mobile money payouts.
            </p>
          </div>

          {/* 4-Card Highlight Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Low-Latency Ingest & Studio */}
            <div className="p-7 rounded-[28px] bg-slate-900/70 border border-slate-800 hover:border-sky-500/50 transition-all hover:-translate-y-1.5 shadow-xl group space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                  <Radio className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white font-rajdhani uppercase">
                  1. Low-Latency Ingest & Studio
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  High-bitrate streaming with built-in OBS stream keys, RTMP ingest, instant clip generation, and real-time network telemetry.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800/80 text-[11px] font-mono-code text-sky-400 font-bold flex items-center gap-1">
                <span>1080p60 & 120 FPS Ready</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Card 2: Integrated Game Store & Library */}
            <div className="p-7 rounded-[28px] bg-slate-900/70 border border-slate-800 hover:border-purple-500/50 transition-all hover:-translate-y-1.5 shadow-xl group space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white font-rajdhani uppercase">
                  2. Game Store & Library
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Seamless game launching, cross-platform account linkings (Steam, Epic, Xbox, PlayStation, YouTube, Twitch, Discord), and offline media downloads.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800/80 text-[11px] font-mono-code text-purple-400 font-bold flex items-center gap-1">
                <span>Instant Game Vault Sync</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Card 3: Community Hubs & Short-Form Reels */}
            <div className="p-7 rounded-[28px] bg-slate-900/70 border border-slate-800 hover:border-pink-500/50 transition-all hover:-translate-y-1.5 shadow-xl group space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
                  <Film className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white font-rajdhani uppercase">
                  3. Community Hubs & Reels
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Dedicated creator channels, vertical short-form video feed ("Reels"), active friend search, tournament ladders, and custom gamer badges.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800/80 text-[11px] font-mono-code text-pink-400 font-bold flex items-center gap-1">
                <span>Vertical Viral Gaming Feed</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Card 4: Creator Payouts & Monetization */}
            <div className="p-7 rounded-[28px] bg-slate-900/70 border border-slate-800 hover:border-amber-500/50 transition-all hover:-translate-y-1.5 shadow-xl group space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <Coins className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white font-rajdhani uppercase">
                  4. Creator Monetization
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Multi-currency support (including local Mobile Money MTN, Airtel, M-Pesa and Visa/Mastercard options) with real-time balance tracking.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800/80 text-[11px] font-mono-code text-amber-400 font-bold flex items-center gap-1">
                <span>70% Direct Creator Split</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION C: LIVE PREVIEW STREAM GRID */}
      <section id="live-streams" className="py-20 bg-[#0a0d14] border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono-code font-bold uppercase text-red-500">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span>ACTIVE BROADCASTS</span>
              </div>
              <h2 className="text-3xl font-black text-white font-rajdhani uppercase tracking-tight mt-1">
                Live Channels Across the Continent
              </h2>
            </div>

            <button
              onClick={onEnterApp}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 font-mono-code font-bold text-xs uppercase tracking-wider border border-slate-700 flex items-center gap-2 shrink-0"
            >
              <span>View All 48 Live Streams</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Stream Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_LIVE_STREAMS.slice(0, 6).map((stream) => (
              <div
                key={stream.id}
                onClick={() => onSelectStream(stream)}
                className="group bg-slate-900 border border-slate-800 hover:border-sky-500/60 rounded-[24px] overflow-hidden shadow-xl hover:shadow-2xl transition-all cursor-pointer hover:-translate-y-1"
              >
                {/* Thumbnail Stage */}
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={stream.thumbnail}
                    alt={stream.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                  {/* Overlays */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-red-600 text-white font-mono-code font-black text-[9px] uppercase tracking-wider">
                      LIVE
                    </span>
                    <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-white font-mono-code text-[9px]">
                      {stream.viewersCount.toLocaleString()} viewers
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono-code text-slate-300">
                    <span className="px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-sm border border-slate-800 text-sky-400 font-bold">
                      {stream.game}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-950/80 text-slate-400">
                      {stream.resolution}
                    </span>
                  </div>
                </div>

                {/* Info Block */}
                <div className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={stream.streamer.avatar}
                      alt={stream.streamer.name}
                      className="w-9 h-9 rounded-xl object-cover border border-sky-400/60 mt-0.5 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-xs text-white group-hover:text-sky-300 transition-colors truncate">
                        {stream.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                        <span className="text-slate-300 font-semibold">{stream.streamer.name}</span>
                        <span>{stream.streamer.countryFlag}</span>
                        {stream.streamer.verified && (
                          <CheckCircle2 className="w-3 h-3 text-sky-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono-code text-slate-500">
                    <span>Edge: Nairobi Relay</span>
                    <span className="text-emerald-400 font-bold">● Low Latency</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION D: CROSS-PLATFORM INTEGRATION BANNER */}
      <section id="integrations" className="py-16 bg-[#07090e] border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center space-y-2">
            <span className="text-xs font-mono-code font-bold uppercase text-indigo-400 tracking-widest">
              UNIFIED ECOSYSTEM
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-rajdhani uppercase tracking-tight">
              Seamless Cross-Platform Account Linking
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              Sync your friend lists, game libraries, and achievements across all your favorite gaming services.
            </p>
          </div>

          {/* Integration Badges Carousel */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { name: 'Steam', label: 'Valve Steam Sync', color: 'from-blue-600 to-indigo-900', status: 'API Active' },
              { name: 'Discord', label: 'Rich Presence & Bot', color: 'from-indigo-600 to-purple-900', status: 'Linked' },
              { name: 'Twitch', label: 'Restream Ingest', color: 'from-purple-600 to-pink-900', status: 'Dual Stream' },
              { name: 'YouTube', label: 'VOD & Clips Sync', color: 'from-red-600 to-rose-900', status: 'Automated' },
              { name: 'Epic Games', label: 'Launcher Link', color: 'from-slate-700 to-slate-900', status: 'Connected' },
              { name: 'Xbox', label: 'Live Network', color: 'from-emerald-600 to-green-900', status: 'Cloud Play' },
              { name: 'PlayStation', label: 'PSN Network', color: 'from-blue-700 to-sky-900', status: 'Console Feed' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-sky-500/40 text-center space-y-2 transition-all hover:scale-105 shadow-md"
              >
                <div className="text-sm font-black text-white font-rajdhani uppercase">
                  {item.name}
                </div>
                <div className="text-[10px] text-slate-400 leading-tight">
                  {item.label}
                </div>
                <div className="inline-block px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono-code text-[9px] font-bold border border-emerald-500/20">
                  {item.status}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION E: TESTIMONIALS & CREATOR BENCHMARKS */}
      <section id="creators" className="py-20 bg-[#0a0d14] border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono-code font-bold uppercase text-amber-400 tracking-widest px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30">
              CREATOR SUCCESS STORIES
            </span>
            <h2 className="text-3xl font-black text-white font-rajdhani uppercase tracking-tight">
              Trusted by Top Pro Gaming Creators
            </h2>
          </div>

          {/* Testimonial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-7 rounded-[28px] bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Amina"
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-400"
                />
                <div>
                  <h4 className="font-bold text-white text-sm">Amina "Viper" K.</h4>
                  <p className="text-[11px] text-slate-400 font-mono-code">eFootball Pro • Dar es Salaam 🇹🇿</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "Visor Stream completely solved monetization for me. My viewers tip in M-Pesa and Tigo Pesa, and the funds land in my mobile wallet immediately. The 70/30 model is revolutionary."
              </p>
              <div className="pt-3 border-t border-slate-800 text-[10px] font-mono-code text-amber-400 font-bold">
                ★ 45,000+ Subscribers
              </div>
            </div>

            <div className="p-7 rounded-[28px] bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                  alt="Kigozi"
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-sky-400"
                />
                <div>
                  <h4 className="font-bold text-white text-sm">Kigozi "Apex" Brian</h4>
                  <p className="text-[11px] text-slate-400 font-mono-code">Warzone Streamer • Kampala 🇺🇬</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "The Nairobi edge relay reduced my broadcast latency from 180ms on Western platforms to 24ms. Chat reacts to my snipes with zero delay."
              </p>
              <div className="pt-3 border-t border-slate-800 text-[10px] font-mono-code text-sky-400 font-bold">
                ★ 120 FPS Sub-second Ingest
              </div>
            </div>

            <div className="p-7 rounded-[28px] bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
                  alt="Tunde"
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-purple-400"
                />
                <div>
                  <h4 className="font-bold text-white text-sm">Tunde "Ghost" Adeleke</h4>
                  <p className="text-[11px] text-slate-400 font-mono-code">GTA RP Creator • Lagos 🇳🇬</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "Having the game store, tutorials, and short-form Reels inside one app allows me to grow my audience twice as fast as anywhere else."
              </p>
              <div className="pt-3 border-t border-slate-800 text-[10px] font-mono-code text-purple-400 font-bold">
                ★ 85,000+ Community Members
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION F: FOOTER & LEGAL NAVIGATION */}
      <footer id="legal" className="bg-[#05070a] border-t border-slate-800 text-xs text-slate-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            
            {/* Brand Col */}
            <div className="lg:col-span-2 space-y-4">
              <VisorLogo size="md" glow={false} />
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                Visor Stream is the premier continental gaming platform combining low-latency video streaming, creator studio tools, localized mobile money payouts, and esports hubs.
              </p>
              <div className="flex items-center gap-3 pt-2 text-slate-300">
                <a href="https://discord.gg" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:text-sky-400 transition-colors">
                  Discord
                </a>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:text-sky-400 transition-colors">
                  Twitter / X
                </a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:text-sky-400 transition-colors">
                  YouTube
                </a>
                <a href="https://twitch.tv" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:text-sky-400 transition-colors">
                  Twitch
                </a>
              </div>
            </div>

            {/* Product Links */}
            <div className="space-y-3">
              <h4 className="font-bold text-white font-mono-code uppercase tracking-wider text-xs">
                Platform
              </h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <button onClick={onEnterApp} className="hover:text-white transition-colors">
                    Live Stream Feed
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigateTab ? onNavigateTab('creator') : onEnterApp()} className="hover:text-white transition-colors">
                    Creator Studio
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigateTab ? onNavigateTab('store') : onEnterApp()} className="hover:text-white transition-colors">
                    Game Store & Vault
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigateTab ? onNavigateTab('reels') : onEnterApp()} className="hover:text-white transition-colors">
                    Short-Form Reels
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigateTab ? onNavigateTab('esports') : onEnterApp()} className="hover:text-white transition-colors">
                    Esports Tournaments
                  </button>
                </li>
              </ul>
            </div>

            {/* Legal & Compliance (Public Links) */}
            <div className="space-y-3">
              <h4 className="font-bold text-white font-mono-code uppercase tracking-wider text-xs">
                Legal & Compliance
              </h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <button
                    onClick={() => onNavigateLegal('privacy')}
                    className="hover:text-sky-400 transition-colors font-semibold text-slate-300 flex items-center gap-1 text-left"
                  >
                    <Lock className="w-3.5 h-3.5 text-sky-400" />
                    <span>Privacy Policy</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigateLegal('terms')}
                    className="hover:text-sky-400 transition-colors font-semibold text-slate-300 flex items-center gap-1 text-left"
                  >
                    <FileText className="w-3.5 h-3.5 text-sky-400" />
                    <span>Terms of Service</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigateLegal('about')}
                    className="hover:text-white transition-colors"
                  >
                    About Visor Stream
                  </button>
                </li>
                <li>
                  <a
                    href="https://developers.google.com/terms/api-services-user-data-policy"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-sky-400 transition-colors flex items-center gap-1"
                  >
                    <span>Google API Limited Use</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Support & Developer Contact */}
            <div className="space-y-3">
              <h4 className="font-bold text-white font-mono-code uppercase tracking-wider text-xs">
                Support & Contact
              </h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <div className="text-slate-300 font-bold">Developer Contact:</div>
                  <a
                    href="mailto:syymbba@gmail.com"
                    className="text-sky-400 font-mono-code underline hover:text-sky-300 break-all"
                  >
                    syymbba@gmail.com
                  </a>
                </li>
                <li className="pt-1">
                  <span className="text-slate-300 font-bold">Edge CDN Status:</span>
                  <div className="flex items-center gap-1.5 text-emerald-400 font-mono-code text-[11px] mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>All Relay Nodes 100% Operational</span>
                  </div>
                </li>
                <li className="text-[11px] text-slate-500 font-mono-code pt-1">
                  Kampala • Nairobi • Lagos • Johannesburg
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-mono-code">
            <div>
              © 2026 VISOR STREAM Technologies. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => onNavigateLegal('privacy')} className="hover:text-slate-300">
                Privacy Policy
              </button>
              <span>•</span>
              <button onClick={() => onNavigateLegal('terms')} className="hover:text-slate-300">
                Terms of Service
              </button>
              <span>•</span>
              <a href="mailto:syymbba@gmail.com" className="hover:text-slate-300">
                syymbba@gmail.com
              </a>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
};
