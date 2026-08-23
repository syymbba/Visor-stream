import React from 'react';
import { VisorLogo } from './VisorLogo';
import {
  Radio,
  ShoppingBag,
  Film,
  Coins,
  Cpu,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Zap,
  Shield,
  Layers,
  Activity,
  Globe,
  Sliders,
  ExternalLink,
  Users,
  Video,
  LayoutDashboard
} from 'lucide-react';

export type FeatureId =
  | 'high-fps-streaming'
  | 'game-vault-sync'
  | 'vertical-feed'
  | 'creator-monetization'
  | 'creative-tools'
  | 'ai-clips';

interface FeatureInfoViewProps {
  featureId: FeatureId;
  onBackToLanding: () => void;
  onSelectFeature?: (id: FeatureId) => void;
  onEnterApp?: () => void;
}

interface FeatureContent {
  id: FeatureId;
  title: string;
  badge: string;
  tagline: string;
  description: string;
  highlights: { title: string; desc: string; icon: React.ComponentType<{ className?: string }> }[];
  technicalSpecs: { label: string; value: string }[];
  architectureOverview: string;
  faqs: { q: string; a: string }[];
}

const FEATURE_DATA: Record<FeatureId, FeatureContent> = {
  'high-fps-streaming': {
    id: 'high-fps-streaming',
    title: '1080p60 & 120 FPS High-Framerate Streaming',
    badge: 'ULTRA LOW-LATENCY INGEST',
    tagline: 'Broadcast competitive esports and high-octane gameplay with sub-45ms glass-to-glass latency.',
    description:
      'Visor Stream leverages regional edge relays across Africa and globally, allowing streamers to ingest at up to 120 frames per second with uncompressed clarity and adaptive HLS bitrate fallback for all network conditions.',
    highlights: [
      {
        title: 'Hardware-Accelerated HEVC / AV1',
        desc: 'Encode with cutting-edge AV1 and H.265 compression for 40% bandwidth reduction without losing texture sharpness.',
        icon: Cpu,
      },
      {
        title: 'Edge Ingest PoPs in Major Hubs',
        desc: 'Direct peering at IXPs in Nairobi, Kampala, Lagos, and Johannesburg delivers instantaneous chat feedback and zero buffering.',
        icon: Globe,
      },
      {
        title: 'Dynamic Adaptive Bitrate (ABR)',
        desc: 'Viewers automatically transition between 1080p60, 720p60, and data-saver 480p depending on mobile connection strength.',
        icon: Activity,
      },
      {
        title: 'OBS & Streamlabs One-Click Setup',
        desc: 'Standard RTMP/SRT stream keys work out of the box with OBS Studio, vMix, Streamlabs, and Prism Live.',
        icon: Sliders,
      },
    ],
    technicalSpecs: [
      { label: 'Ingest Protocols', value: 'RTMP, RTMPS, SRT' },
      { label: 'Max Ingest Bitrate', value: '14,000 kbps (14 Mbps)' },
      { label: 'Framerate Support', value: '30, 60, and 120 FPS' },
      { label: 'Delivery Latency', value: '35ms – 65ms (CMAF / LL-HLS)' },
      { label: 'Audio Bitrate', value: 'Up to 320 kbps AAC Stereo' },
    ],
    architectureOverview:
      'Video packets are received at the nearest Edge Point of Presence (PoP), transcoded in real time into multi-resolution HLS chunks, and distributed via our continental CDN cache layer.',
    faqs: [
      {
        q: 'Do I need special hardware to stream at 120 FPS?',
        a: 'Any modern GPU (Nvidia RTX, AMD RX, or Apple Silicon M-series) supports 120 FPS NVENC/AMF encoding directly inside OBS Studio.',
      },
      {
        q: 'How does Visor maintain low latency on mobile networks?',
        a: 'We use Chunked Transfer Encoding (LL-HLS) and localized servers to ensure data never travels to European or US data centers before reaching local viewers.',
      },
    ],
  },
  'game-vault-sync': {
    id: 'game-vault-sync',
    title: 'Instant Game Vault & Multi-Platform Library Sync',
    badge: 'UNIFIED GAME ECOSYSTEM',
    tagline: 'Connect Steam, Epic, Xbox, PlayStation, and Discord to showcase your complete gaming footprint.',
    description:
      'Manage your game installations, launch titles with custom overlays, track trophies and achievements, and sync offline-cached tutorial guides in one unified launcher hub.',
    highlights: [
      {
        title: 'Steam & PSN Account Link',
        desc: 'Import your game library, play history, and in-game achievements with secure OAuth2 authentication.',
        icon: ShoppingBag,
      },
      {
        title: 'Offline VOD Vault',
        desc: 'Save critical stream moments, tournament VODs, and mission tutorials directly to your device storage.',
        icon: Layers,
      },
      {
        title: 'In-Game Visor Overlay',
        desc: 'Access stream chat, alerts, and instant replay widgets with a single keyboard shortcut while playing.',
        icon: Zap,
      },
      {
        title: 'Discord Rich Presence',
        desc: 'Broadcast your live match status, party count, and stream link directly to your Discord community.',
        icon: Users,
      },
    ],
    technicalSpecs: [
      { label: 'Supported Platforms', value: 'Steam, Epic Games, Xbox Live, PSN, Discord' },
      { label: 'Offline Storage', value: 'IndexedDB Encrypted Cache' },
      { label: 'Sync Frequency', value: 'Real-Time Webhooks + Periodic Poll' },
      { label: 'Launcher Overhead', value: '< 15MB RAM Footprint' },
    ],
    architectureOverview:
      'Our lightweight OAuth connector links user gaming profiles with token encryption, delivering seamless synchronization without storing sensitive user login passwords.',
    faqs: [
      {
        q: 'Does linking my Steam account give access to my inventory or payments?',
        a: 'No. We use standard read-only OpenID authentication that only verifies your ownership of games and public badges.',
      },
    ],
  },
  'vertical-feed': {
    id: 'vertical-feed',
    title: 'Vertical Viral Gaming Reels & Community Hubs',
    badge: 'DISCOVERY & SHORT-FORM FEED',
    tagline: 'Grow your audience faster with mobile-first vertical clips, smart discovery, and interactive squad hubs.',
    description:
      'Visor Reels enables creators to turn epic stream highlights into viral 60-second clips. Gamers can swipe through high-impact plays, join creator guilds, and participate in community tournaments.',
    highlights: [
      {
        title: 'AI Auto-Clip Highlight Detection',
        desc: 'Our engine identifies victory screams, clutch headshots, and high-energy chat bursts to suggest instant clips.',
        icon: Sparkles,
      },
      {
        title: 'Interactive Tip Overlays',
        desc: 'Viewers can send micro-tips and unlock subscriber badges directly from the vertical feed.',
        icon: Coins,
      },
      {
        title: 'Creator Channel Guilds',
        desc: 'Dedicated community message boards, scrim matchmaking, and custom emote unlocks for loyal fans.',
        icon: Users,
      },
      {
        title: 'Seamless Live Transitions',
        desc: 'If a creator is currently live, tap their avatar in the Reels feed to jump straight into their active stream.',
        icon: Video,
      },
    ],
    technicalSpecs: [
      { label: 'Clip Duration', value: 'Up to 90 seconds' },
      { label: 'Aspect Ratio', value: '9:16 Vertical HD (1080x1920)' },
      { label: 'Render Pipeline', value: 'Client-Side WebAssembly + Cloud CDN' },
      { label: 'Audio Master', value: 'Stereo 48kHz with Smart Normalization' },
    ],
    architectureOverview:
      'Short-form media items are pre-cached using dynamic service workers to deliver instant zero-lag swipe transitions even on 3G and 4G mobile networks.',
    faqs: [
      {
        q: 'Can viewers tip while watching Reels?',
        a: 'Yes, tipping is integrated into every clip with one-tap Mobile Money and saved wallet options.',
      },
    ],
  },
  'creator-monetization': {
    id: 'creator-monetization',
    title: '70% Direct Creator Split & Local Mobile Money Payouts',
    badge: 'CREATOR-FIRST ECONOMY',
    tagline: 'Earn sustainable revenue with instant Mobile Money payouts (MTN, Airtel, M-Pesa) and 70/30 creator revenue splits.',
    description:
      'Unlike legacy Western platforms that take 50% cuts and lock African creators out with wire fees, Visor Stream delivers 70% of subscriptions and 100% of direct tips straight to local mobile wallets.',
    highlights: [
      {
        title: '70% Subscription Revenue Share',
        desc: 'You receive 70% of every monthly subscriber tier ($2 Gamer Pass, $5 Pro Streamer, $10 VIP).',
        icon: Coins,
      },
      {
        title: 'Instant Mobile Money Rail Payouts',
        desc: 'Cash out directly to MTN Mobile Money, Airtel Money, or Safaricom M-Pesa with transparent zero-delay settlement.',
        icon: Zap,
      },
      {
        title: 'No International Wire Headaches',
        desc: 'Receive local currency (UGX, KES, TZS, NGN) directly to your phone without foreign bank conversion losses.',
        icon: Shield,
      },
      {
        title: 'Transparent Real-Time Ledger',
        desc: 'Audit every tip, sub, and platform allocation with complete order tracking IDs and cryptographic receipt timestamps.',
        icon: Activity,
      },
    ],
    technicalSpecs: [
      { label: 'Creator Split', value: '70% Subscriptions / 100% Tips' },
      { label: 'Payout Rails', value: 'MTN MoMo, Airtel Money, M-Pesa, Bank EFT' },
      { label: 'Settlement Speed', value: 'Real-time to < 24 Hours' },
      { label: 'Minimum Payout', value: 'UGX 10,000 / KES 300 / $3 USD' },
    ],
    architectureOverview:
      'Payment webhooks calculate the 70/30 split upon instant confirmation, crediting the creator’s real-time wallet ledger for on-demand withdrawal.',
    faqs: [
      {
        q: 'How often can I withdraw my creator balance?',
        a: 'You can request on-demand withdrawals as soon as your balance reaches the minimum threshold of UGX 10,000 or KES 300.',
      },
      {
        q: 'Are there hidden fees when receiving Mobile Money tips?',
        a: 'No hidden platform cuts on tips. The creator receives the full amount, minus standard telecom switch fees.',
      },
    ],
  },
  'creative-tools': {
    id: 'creative-tools',
    title: 'Creative Studio Tools & Interactive Stream Overlays',
    badge: 'BROADCASTER TOOLKIT',
    tagline: 'Transform your broadcast with AI clip generation, interactive overlay widgets, and custom stream alert builders.',
    description:
      'Empower your stream with browser-source widgets, real-time donation hype trains, interactive match prediction polls, and automated highlight reels.',
    highlights: [
      {
        title: 'Browser Source Widgets',
        desc: 'Drop dynamic transparent HUD widgets into OBS to display live follower goals, sub alerts, and custom tip jars.',
        icon: Sliders,
      },
      {
        title: 'Hype Train Level Engine',
        desc: 'Gamify your community support with multi-tier hype meters that unlock special channel badges and celebratory animations.',
        icon: Zap,
      },
      {
        title: 'Live Match Predictions',
        desc: 'Let viewers wager platform channel points on round outcomes, clutch plays, and tournament matches.',
        icon: Activity,
      },
      {
        title: 'AI Clip Auto-Generator',
        desc: 'Automatically clip high-energy moments and export formatted 9:16 vertical shorts for TikTok and YouTube.',
        icon: Sparkles,
      },
    ],
    technicalSpecs: [
      { label: 'Widget Format', value: 'HTML5 Transparent Browser Source' },
      { label: 'Refresh Rate', value: '60 FPS Hardware Rendered' },
      { label: 'Customization', value: 'CSS, Sound FX, Webhooks' },
      { label: 'Compatibility', value: 'OBS Studio, Streamlabs, Prism, vMix' },
    ],
    architectureOverview:
      'Browser overlays communicate via secure WebSockets to receive instant tipping and subscriber triggers with zero delay.',
    faqs: [
      {
        q: 'How do I add Visor overlay widgets into OBS?',
        a: 'Copy your unique Widget URL from the Creator Studio and paste it as a standard Browser Source in OBS Studio.',
      },
    ],
  },
  'ai-clips': {
    id: 'ai-clips',
    title: 'AI Automated Clip & Highlight Generation',
    badge: 'SMART CONTENT AUTOMATION',
    tagline: 'Convert multi-hour streams into viral short-form clips in minutes with automated audio and event analysis.',
    description:
      'Never spend hours combing through VOD footage again. Our smart highlight detector analyzes gameplay audio peaks, kill events, and viewer chat activity spikes to produce ready-to-share social clips.',
    highlights: [
      {
        title: 'Audio Peak & Voice Detection',
        desc: 'Detects caster hype, player callouts, and celebration spikes.',
        icon: Sparkles,
      },
      {
        title: 'Chat Sentiment Spikes',
        desc: 'Identifies high-density chat message clusters and emote spam.',
        icon: Users,
      },
      {
        title: 'Auto Vertical Reframing',
        desc: 'Intelligently centers gameplay action and webcams into 9:16 vertical video.',
        icon: Film,
      },
      {
        title: 'One-Click Export',
        desc: 'Directly publish generated clips to Visor Reels, YouTube Shorts, and TikTok.',
        icon: Zap,
      },
    ],
    technicalSpecs: [
      { label: 'Processing Time', value: '< 90 seconds per stream hour' },
      { label: 'Resolution', value: '1080x1920 Full HD' },
      { label: 'Detection Accuracy', value: '94% high-action match rate' },
    ],
    architectureOverview:
      'Lightweight edge machine-learning models scan audio decibels and frame variance to locate the top moments of every broadcast.',
    faqs: [
      {
        q: 'Can I edit the generated clips before publishing?',
        a: 'Yes, you can trim start/end times and adjust caption overlays in the built-in quick editor.',
      },
    ],
  },
};

export const FeatureInfoView: React.FC<FeatureInfoViewProps> = ({
  featureId,
  onBackToLanding,
  onSelectFeature,
  onEnterApp,
}) => {
  const current = FEATURE_DATA[featureId] || FEATURE_DATA['high-fps-streaming'];

  const allFeatures: { id: FeatureId; title: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'high-fps-streaming', title: '120 FPS Ingest', icon: Radio },
    { id: 'game-vault-sync', title: 'Game Vault Sync', icon: ShoppingBag },
    { id: 'vertical-feed', title: 'Vertical Reels', icon: Film },
    { id: 'creator-monetization', title: '70/30 Monetization', icon: Coins },
    { id: 'creative-tools', title: 'Creative Studio Tools', icon: Sliders },
    { id: 'ai-clips', title: 'AI Clip Generator', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-sky-500 selection:text-black">
      {/* Top Bar Navigation */}
      <header className="sticky top-0 z-50 bg-[#07090e]/90 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToLanding}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 font-mono-code font-bold text-xs flex items-center gap-2 transition-all hover:-translate-x-0.5"
            >
              <ArrowLeft className="w-4 h-4 text-sky-400" />
              <span>Back to Landing</span>
            </button>
            <VisorLogo size="sm" glow={false} />
          </div>

          {onEnterApp && (
            <button
              onClick={onEnterApp}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-500 hover:from-sky-300 hover:to-indigo-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-sky-500/20 transition-all hover:scale-105"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Explore Platform</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Feature Content Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 animate-fadeIn">
        {/* Feature Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar p-2 bg-slate-900/90 rounded-2xl border border-slate-800">
          {allFeatures.map((feat) => {
            const Icon = feat.icon;
            const isSelected = feat.id === featureId;
            return (
              <button
                key={feat.id}
                onClick={() => onSelectFeature && onSelectFeature(feat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono-code font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{feat.title}</span>
              </button>
            );
          })}
        </div>

        {/* Hero Section of Feature */}
        <div className="space-y-4 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-mono-code font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{current.badge}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white font-rajdhani uppercase tracking-tight leading-tight">
            {current.title}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-3xl">
            {current.tagline}
          </p>

          <p className="text-sm text-slate-400 leading-relaxed max-w-3xl">
            {current.description}
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {current.highlights.map((hl, idx) => {
            const Icon = hl.icon;
            return (
              <div
                key={idx}
                className="p-6 bg-slate-900/80 rounded-[24px] border border-slate-800 hover:border-sky-500/40 transition-all space-y-3 shadow-xl"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white font-rajdhani uppercase">
                  {hl.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {hl.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Technical Specifications Matrix */}
        <div className="p-7 bg-slate-900/90 rounded-[28px] border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-xs font-mono-code font-bold uppercase text-sky-400">
            <Activity className="w-4 h-4" />
            <span>TECHNICAL SPECIFICATIONS & ARCHITECTURE</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {current.technicalSpecs.map((spec, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80">
                <div className="text-[11px] text-slate-400 font-mono-code">{spec.label}</div>
                <div className="text-sm font-bold text-white font-mono-code mt-1">{spec.value}</div>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs text-slate-400 leading-relaxed font-sans">
            <span className="font-bold text-slate-200">Architecture Pipeline: </span>
            {current.architectureOverview}
          </div>
        </div>

        {/* Frequently Asked Questions */}
        <div className="space-y-4">
          <h3 className="text-xl font-black text-white font-rajdhani uppercase tracking-tight">
            Frequently Asked Questions
          </h3>
          <div className="space-y-3">
            {current.faqs.map((faq, idx) => (
              <div key={idx} className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-2">
                <div className="font-bold text-sm text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{faq.q}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA Card */}
        <div className="p-8 rounded-[32px] bg-gradient-to-r from-sky-900/40 via-indigo-900/40 to-slate-900 border border-sky-500/30 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-white font-rajdhani uppercase">
              Ready to Experience Visor Stream?
            </h3>
            <p className="text-xs text-slate-300 max-w-lg">
              Join thousands of creators and gamers streaming with continental edge speed, high-fps quality, and direct mobile money support.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToLanding}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase font-mono-code transition-colors"
            >
              Explore Landing
            </button>
            {onEnterApp && (
              <button
                onClick={onEnterApp}
                className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-sky-500/25 transition-all hover:scale-105"
              >
                <span>Launch App</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Feature Page Footer */}
      <footer className="mt-20 py-8 border-t border-slate-800/80 bg-[#05070a] text-xs text-slate-500 font-mono-code">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© 2026 VISOR STREAM Technologies. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <button onClick={onBackToLanding} className="hover:text-slate-300">
              Landing Page
            </button>
            <span>•</span>
            <button onClick={() => onSelectFeature && onSelectFeature('creator-monetization')} className="hover:text-slate-300">
              70/30 Monetization
            </button>
            <span>•</span>
            <button onClick={() => onSelectFeature && onSelectFeature('high-fps-streaming')} className="hover:text-slate-300">
              120 FPS Streaming
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
