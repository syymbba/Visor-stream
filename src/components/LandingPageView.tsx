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
  LayoutDashboard,
  Star,
  Sliders,
  Award,
  Video,
  Share2,
  TrendingUp,
  Info
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
  onSelectFeature?: (featureId: string) => void;
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
  onNavigateTab,
  onSelectFeature,
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

  const handleFeatureClick = (id: string) => {
    if (onSelectFeature) {
      onSelectFeature(id);
    } else if (onNavigateTab) {
      onNavigateTab(`features-${id}`);
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
                onClick={() => scrollToSection('creative-tools')}
                className="hover:text-sky-400 transition-colors py-2"
              >
                Studio Tools
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
                onClick={() => scrollToSection('about')}
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
                <div 
                  onClick={() => handleFeatureClick('high-fps-streaming')}
                  className="p-3 bg-slate-900/60 hover:bg-slate-900 rounded-xl border border-slate-800/80 hover:border-sky-500/40 text-left cursor-pointer transition-all"
                >
                  <div className="text-sky-400 font-mono-code font-black text-base">&lt; 45ms</div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono-code flex items-center justify-between">
                    <span>Ultra-Low Latency</span>
                    <ChevronRight className="w-3 h-3 text-sky-400/60" />
                  </div>
                </div>
                <div 
                  onClick={() => handleFeatureClick('creator-monetization')}
                  className="p-3 bg-slate-900/60 hover:bg-slate-900 rounded-xl border border-slate-800/80 hover:border-amber-500/40 text-left cursor-pointer transition-all"
                >
                  <div className="text-amber-400 font-mono-code font-black text-base">70 / 30</div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono-code flex items-center justify-between">
                    <span>Creator Split</span>
                    <ChevronRight className="w-3 h-3 text-amber-400/60" />
                  </div>
                </div>
                <div 
                  onClick={() => handleFeatureClick('creator-monetization')}
                  className="p-3 bg-slate-900/60 hover:bg-slate-900 rounded-xl border border-slate-800/80 hover:border-emerald-500/40 text-left cursor-pointer transition-all"
                >
                  <div className="text-emerald-400 font-mono-code font-black text-base">Instant</div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono-code flex items-center justify-between">
                    <span>MTN / M-Pesa Tips</span>
                    <ChevronRight className="w-3 h-3 text-emerald-400/60" />
                  </div>
                </div>
                <div 
                  onClick={() => handleFeatureClick('high-fps-streaming')}
                  className="p-3 bg-slate-900/60 hover:bg-slate-900 rounded-xl border border-slate-800/80 hover:border-purple-500/40 text-left cursor-pointer transition-all"
                >
                  <div className="text-purple-400 font-mono-code font-black text-base">120 FPS</div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono-code flex items-center justify-between">
                    <span>Ultra-HD Ingest</span>
                    <ChevronRight className="w-3 h-3 text-purple-400/60" />
                  </div>
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

      {/* SECTION B: PLATFORM HIGHLIGHTS GRID (CORE FEATURES - INTERACTIVE DEDICATED PAGES) */}
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
              Click any feature below to inspect detailed architecture specs, encoding benchmarks, and live integration capabilities.
            </p>
          </div>

          {/* 4-Card Highlight Grid with Dedicated Info Page Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Low-Latency Ingest & Studio */}
            <div 
              onClick={() => handleFeatureClick('high-fps-streaming')}
              className="p-7 rounded-[28px] bg-slate-900/70 border border-slate-800 hover:border-sky-500/60 hover:bg-slate-900 transition-all hover:-translate-y-1.5 shadow-xl group space-y-4 flex flex-col justify-between cursor-pointer"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                  <Radio className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white font-rajdhani uppercase group-hover:text-sky-300 transition-colors">
                  1. Low-Latency Ingest & Studio
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  High-bitrate streaming with built-in OBS stream keys, RTMP/SRT ingest, and sub-45ms continental edge relays.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800/80 text-[11px] font-mono-code text-sky-400 font-bold flex items-center justify-between">
                <span>1080p60 & 120 FPS Ready</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 2: Integrated Game Store & Library */}
            <div 
              onClick={() => handleFeatureClick('game-vault-sync')}
              className="p-7 rounded-[28px] bg-slate-900/70 border border-slate-800 hover:border-purple-500/60 hover:bg-slate-900 transition-all hover:-translate-y-1.5 shadow-xl group space-y-4 flex flex-col justify-between cursor-pointer"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white font-rajdhani uppercase group-hover:text-purple-300 transition-colors">
                  2. Game Store & Library
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Seamless game launching, cross-platform account linking (Steam, Epic, Xbox, PlayStation, Discord), and offline media downloads.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800/80 text-[11px] font-mono-code text-purple-400 font-bold flex items-center justify-between">
                <span>Instant Game Vault Sync</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 3: Community Hubs & Short-Form Reels */}
            <div 
              onClick={() => handleFeatureClick('vertical-feed')}
              className="p-7 rounded-[28px] bg-slate-900/70 border border-slate-800 hover:border-pink-500/60 hover:bg-slate-900 transition-all hover:-translate-y-1.5 shadow-xl group space-y-4 flex flex-col justify-between cursor-pointer"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
                  <Film className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white font-rajdhani uppercase group-hover:text-pink-300 transition-colors">
                  3. Community Hubs & Reels
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Dedicated creator channels, vertical short-form video feed ("Reels"), tournament brackets, and live squad voice chats.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800/80 text-[11px] font-mono-code text-pink-400 font-bold flex items-center justify-between">
                <span>Vertical Viral Gaming Feed</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 4: Creator Payouts & Monetization */}
            <div 
              onClick={() => handleFeatureClick('creator-monetization')}
              className="p-7 rounded-[28px] bg-slate-900/70 border border-slate-800 hover:border-amber-500/60 hover:bg-slate-900 transition-all hover:-translate-y-1.5 shadow-xl group space-y-4 flex flex-col justify-between cursor-pointer"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <Coins className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white font-rajdhani uppercase group-hover:text-amber-300 transition-colors">
                  4. Creator Monetization
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Multi-currency support with direct Mobile Money (MTN MoMo, Airtel Money, M-Pesa) and Visa/Mastercard instant creator payouts.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800/80 text-[11px] font-mono-code text-amber-400 font-bold flex items-center justify-between">
                <span>70% Direct Creator Split</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION B2: CREATIVE STUDIO TOOLS & AI SUITE */}
      <section id="creative-tools" className="py-20 bg-[#090c13] border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <span className="text-xs font-mono-code font-bold uppercase text-sky-400 tracking-widest px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30">
                CREATOR STUDIO TOOLS
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white font-rajdhani uppercase tracking-tight">
                Built-in Broadcast Automation & Smart Overlays
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Streamline your production workflow with AI highlight generation, interactive transparent browser widgets, and live prediction engines.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => handleFeatureClick('creative-tools')}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 font-mono-code font-bold text-xs uppercase border border-slate-700 flex items-center gap-2"
              >
                <span>Explore Studio Specs</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Tool 1: AI Clip & Highlight Generation */}
            <div 
              onClick={() => handleFeatureClick('ai-clips')}
              className="p-7 rounded-[28px] bg-slate-900/80 border border-slate-800 hover:border-sky-500/50 transition-all space-y-4 group cursor-pointer shadow-xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white font-rajdhani uppercase">
                AI Auto-Clip Highlight Engine
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automatically isolates victory moments, high-decibel audio spikes, and chat burst events to render 9:16 vertical shorts in under 90 seconds.
              </p>
              <div className="pt-3 border-t border-slate-800 text-[11px] font-mono-code text-sky-400 font-bold flex items-center justify-between">
                <span>View AI Pipeline</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Tool 2: Interactive Transparent Overlay Widgets */}
            <div 
              onClick={() => handleFeatureClick('creative-tools')}
              className="p-7 rounded-[28px] bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition-all space-y-4 group cursor-pointer shadow-xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white font-rajdhani uppercase">
                HTML5 Transparent HUD Widgets
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Drop high-performance 60 FPS browser sources directly into OBS Studio for live subscriber alert popups, donation goal bars, and animated tip jars.
              </p>
              <div className="pt-3 border-t border-slate-800 text-[11px] font-mono-code text-indigo-400 font-bold flex items-center justify-between">
                <span>Widget Documentation</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Tool 3: Stream Alert & Hype Train Builder */}
            <div 
              onClick={() => handleFeatureClick('creative-tools')}
              className="p-7 rounded-[28px] bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 transition-all space-y-4 group cursor-pointer shadow-xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white font-rajdhani uppercase">
                Hype Train & Gamified Alerts
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Trigger community hype milestones, sound effects, custom channel emote unlocks, and prediction wagers to boost audience engagement.
              </p>
              <div className="pt-3 border-t border-slate-800 text-[11px] font-mono-code text-purple-400 font-bold flex items-center justify-between">
                <span>Alert Customizer</span>
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

      {/* SECTION D: CROSS-PLATFORM & BROADCAST SOFTWARE INTEGRATIONS */}
      <section id="integrations" className="py-20 bg-[#07090e] border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-mono-code font-bold uppercase text-indigo-400 tracking-widest px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30">
              UNIFIED BROADCAST & GAMING ECOSYSTEM
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-rajdhani uppercase tracking-tight">
              Supported Streaming Software & Platforms
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Seamlessly link your favorite broadcasting apps, gaming libraries, and social networks with zero configuration hassle.
            </p>
          </div>

          {/* Integration Badges Grid with Software and Gaming Networks */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
            {[
              { name: 'OBS Studio', label: 'Direct RTMP & SRT Keys', tag: 'Verified Ingest', badgeColor: 'text-emerald-400 bg-emerald-500/10' },
              { name: 'Streamlabs', label: 'Alert & Overlay Widgets', tag: 'Full Support', badgeColor: 'text-emerald-400 bg-emerald-500/10' },
              { name: 'Twitch Cross-Sync', label: 'Dual Stream Restream', tag: 'Multi-Cast', badgeColor: 'text-purple-400 bg-purple-500/10' },
              { name: 'YouTube Gaming', label: 'VOD & Archive Export', tag: 'Automated', badgeColor: 'text-red-400 bg-red-500/10' },
              { name: 'TikTok Live', label: '9:16 Short Clip Push', tag: 'Reels Sync', badgeColor: 'text-pink-400 bg-pink-500/10' },
              { name: 'Discord', label: 'Rich Presence & Bot', tag: 'Active Link', badgeColor: 'text-indigo-400 bg-indigo-500/10' },
              { name: 'Steam', label: 'Game Vault & Badges', tag: 'OpenID Sync', badgeColor: 'text-blue-400 bg-blue-500/10' },
              { name: 'Epic Games', label: 'Store & Launcher Link', tag: 'Connected', badgeColor: 'text-slate-300 bg-slate-800' },
              { name: 'Xbox Live', label: 'Console Stream Mirror', tag: 'Cloud Ready', badgeColor: 'text-green-400 bg-green-500/10' },
              { name: 'PlayStation Network', label: 'PSN Trophies & Feed', tag: 'Broadcast Feed', badgeColor: 'text-sky-400 bg-sky-500/10' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-sky-500/40 text-center space-y-2 transition-all hover:scale-105 shadow-md group"
              >
                <div className="text-sm font-black text-white font-rajdhani uppercase group-hover:text-sky-300 transition-colors">
                  {item.name}
                </div>
                <div className="text-[10px] text-slate-400 leading-tight">
                  {item.label}
                </div>
                <div className={`inline-block px-2 py-0.5 rounded-full font-mono-code text-[9px] font-bold border border-current/20 ${item.badgeColor}`}>
                  {item.tag}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION E: USER REVIEWS & CREATOR TESTIMONIALS */}
      <section id="creators" className="py-20 bg-[#0a0d14] border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono-code font-bold uppercase text-amber-400 tracking-widest px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30">
              COMMUNITY TESTIMONIALS & TRUST
            </span>
            <h2 className="text-3xl font-black text-white font-rajdhani uppercase tracking-tight">
              Loved by Creators & Esports Enthusiasts
            </h2>
            <div className="flex items-center justify-center gap-1 text-amber-400 pt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-4 h-4 fill-amber-400" />
              ))}
              <span className="text-xs font-mono-code text-slate-300 font-bold ml-2">4.9 / 5.0 (2,400+ Gamer Reviews)</span>
            </div>
          </div>

          {/* Testimonial & Review Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-7 rounded-[28px] bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono-code text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                    VERIFIED CREATOR
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "Visor Stream completely revolutionized my stream monetization. Viewers tip directly via M-Pesa and Tigo Pesa, and the money arrives in my mobile wallet in seconds. The 70/30 split is the most creator-friendly in the industry."
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Amina"
                  className="w-11 h-11 rounded-xl object-cover border border-amber-400"
                />
                <div>
                  <h4 className="font-bold text-white text-xs">Amina "Viper" K.</h4>
                  <p className="text-[10px] text-slate-400 font-mono-code">eFootball Champion • Dar es Salaam 🇹🇿</p>
                  <p className="text-[10px] text-amber-400 font-bold">45,000+ Subs</p>
                </div>
              </div>
            </div>

            <div className="p-7 rounded-[28px] bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono-code text-sky-400 font-bold px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/30">
                    PRO BROADCASTER
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "The Nairobi edge relay brought my ingest latency down from 180ms on Twitch to just 24ms. Chat reacts to my clutch sniper shots instantly, and the 120 FPS frame pacing makes high-speed action look razor sharp."
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                  alt="Kigozi"
                  className="w-11 h-11 rounded-xl object-cover border border-sky-400"
                />
                <div>
                  <h4 className="font-bold text-white text-xs">Kigozi "Apex" Brian</h4>
                  <p className="text-[10px] text-slate-400 font-mono-code">Warzone Streamer • Kampala 🇺🇬</p>
                  <p className="text-[10px] text-sky-400 font-bold">120 FPS Pro Ingest</p>
                </div>
              </div>
            </div>

            <div className="p-7 rounded-[28px] bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono-code text-purple-400 font-bold px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30">
                    COMMUNITY LEADER
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "Having our tournament brackets, game store, tutorials, and short-form Reels inside one app allows our esports squad to grow 3x faster. The offline video cache is a lifesaver on metered connections."
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
                  alt="Tunde"
                  className="w-11 h-11 rounded-xl object-cover border border-purple-400"
                />
                <div>
                  <h4 className="font-bold text-white text-xs">Tunde "Ghost" Adeleke</h4>
                  <p className="text-[10px] text-slate-400 font-mono-code">Esports Org Captain • Lagos 🇳🇬</p>
                  <p className="text-[10px] text-purple-400 font-bold">85,000+ Community</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION F: ABOUT VISOR STREAM (INLINE CONTINUATION & ABOUT SECTION) */}
      <section id="about" className="py-20 bg-[#07090e] border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono-code font-bold uppercase text-sky-400 tracking-widest px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30">
              ABOUT VISOR STREAM
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white font-rajdhani uppercase tracking-tight">
              Democratizing Gaming, Esports & Creator Empowerment
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Visor is a high-performance video streaming and social platform designed specifically for competitive gamers, streamers, and viewers who want more than entertainment. We provide a home to stream gameplay, master mission guides, connect with squads, and earn direct mobile money revenue.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-[32px] bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center gap-3 text-sky-400">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white font-rajdhani uppercase">
                  Our Mission & Payout Commitment
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                To break the barriers of monetization for creators across the continent. By offering affordable subscriptions ($2–$10/month), direct Mobile Money (M-Pesa, MTN MoMo, Airtel) integration, and a 70% revenue share, we empower creators to build sustainable full-time careers.
              </p>
              <div className="pt-2 text-[11px] font-mono-code text-slate-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Instant Mobile Money Payouts • 0% Hidden Surcharges</span>
              </div>
            </div>

            <div className="p-8 rounded-[32px] bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center gap-3 text-indigo-400">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white font-rajdhani uppercase">
                  Continental Edge Relay Footprint
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                We operate distributed edge PoPs peering with local internet exchanges across Kampala, Nairobi, Lagos, and Johannesburg. This delivers under 45ms latency and eliminates buffering on metered networks.
              </p>
              <div className="pt-2 text-[11px] font-mono-code text-slate-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>100% Edge Node Uptime • AV1 & LL-HLS Chunked Streaming</span>
              </div>
            </div>
          </div>

          {/* Developer contact. Privacy Policy / Terms of Service links live
              exclusively in the footer below - see the "Legal & Compliance"
              column - to avoid duplicating the same links in multiple spots
              on this page. */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-center justify-center gap-4 text-xs font-mono-code text-slate-400">
            <div>Developer & Platform Contact: <a href="mailto:syymbba@gmail.com" className="text-sky-400 underline">syymbba@gmail.com</a></div>
          </div>

        </div>
      </section>

      {/* SECTION G: FOOTER & LEGAL NAVIGATION */}
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

            {/* Product Links - these scroll to the matching showcase section
                further up this same landing page. They intentionally do NOT
                open the authenticated app dashboard (onEnterApp/onNavigateTab)
                from the public marketing footer; a visitor should only see
                landing-page content until they actually sign in. */}
            <div className="space-y-3">
              <h4 className="font-bold text-white font-mono-code uppercase tracking-wider text-xs">
                Platform
              </h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <a href="#live-streams" onClick={(e) => { e.preventDefault(); scrollToSection('live-streams'); }} className="hover:text-white transition-colors">
                    Live Streams
                  </a>
                </li>
                <li>
                  <a href="#creative-tools" onClick={(e) => { e.preventDefault(); scrollToSection('creative-tools'); }} className="hover:text-white transition-colors">
                    Creator Studio Tools
                  </a>
                </li>
                <li>
                  <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }} className="hover:text-white transition-colors">
                    Game Store & Vault
                  </a>
                </li>
                <li>
                  <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }} className="hover:text-white transition-colors">
                    Short-Form Reels
                  </a>
                </li>
                <li>
                  <a href="#creators" onClick={(e) => { e.preventDefault(); scrollToSection('creators'); }} className="hover:text-white transition-colors">
                    Esports & Community
                  </a>
                </li>
              </ul>
            </div>

            {/* Dedicated Feature Pages */}
            <div className="space-y-3">
              <h4 className="font-bold text-white font-mono-code uppercase tracking-wider text-xs">
                Feature Deep Dives
              </h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <button onClick={() => handleFeatureClick('high-fps-streaming')} className="hover:text-sky-400 transition-colors text-left">
                    120 FPS High-Framerate
                  </button>
                </li>
                <li>
                  <button onClick={() => handleFeatureClick('game-vault-sync')} className="hover:text-sky-400 transition-colors text-left">
                    Game Vault & Multi-Account
                  </button>
                </li>
                <li>
                  <button onClick={() => handleFeatureClick('vertical-feed')} className="hover:text-sky-400 transition-colors text-left">
                    Vertical Reels Feed
                  </button>
                </li>
                <li>
                  <button onClick={() => handleFeatureClick('creator-monetization')} className="hover:text-sky-400 transition-colors text-left">
                    70/30 Monetization
                  </button>
                </li>
                <li>
                  <button onClick={() => handleFeatureClick('creative-tools')} className="hover:text-sky-400 transition-colors text-left">
                    OBS Studio Overlay Widgets
                  </button>
                </li>
                <li>
                  <button onClick={() => handleFeatureClick('ai-clips')} className="hover:text-sky-400 transition-colors text-left">
                    AI Auto-Clip Generator
                  </button>
                </li>
              </ul>
            </div>

            {/* Legal & Compliance - the ONLY place on this landing page with
                links to /privacy and /terms. Real <a href> elements (not
                click handlers with no href) so the links are explicit,
                visible HTML links that work even without JavaScript;
                onClick still intercepts the click for a smooth in-app
                transition when JS is available. Each link goes straight to
                its own dedicated, standalone page and nothing else. */}
            <div className="space-y-3">
              <h4 className="font-bold text-white font-mono-code uppercase tracking-wider text-xs">
                Legal & Compliance
              </h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <a
                    href="/privacy"
                    onClick={(e) => { e.preventDefault(); onNavigateLegal('privacy'); }}
                    className="hover:text-sky-400 transition-colors font-semibold text-slate-300 flex items-center gap-1 text-left"
                  >
                    <Lock className="w-3.5 h-3.5 text-sky-400" />
                    <span>Privacy Policy</span>
                  </a>
                </li>
                <li>
                  <a
                    href="/terms"
                    onClick={(e) => { e.preventDefault(); onNavigateLegal('terms'); }}
                    className="hover:text-sky-400 transition-colors font-semibold text-slate-300 flex items-center gap-1 text-left"
                  >
                    <FileText className="w-3.5 h-3.5 text-sky-400" />
                    <span>Terms of Service</span>
                  </a>
                </li>
                <li>
                  <a
                    href="/about"
                    onClick={(e) => { e.preventDefault(); onNavigateLegal('about'); }}
                    className="hover:text-white transition-colors"
                  >
                    About Visor Stream
                  </a>
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

          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-mono-code">
            <div>
              © 2026 VISOR STREAM Technologies. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
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
