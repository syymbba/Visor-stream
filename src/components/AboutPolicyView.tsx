import React, { useState, useEffect } from 'react';
import { VisorLogo } from './VisorLogo';
import {
  Info,
  Shield,
  FileText,
  HelpCircle,
  Briefcase,
  Users,
  Sparkles,
  CheckCircle2,
  Globe,
  DollarSign,
  Gamepad2,
  Lock,
  ChevronRight,
  Mail,
  ExternalLink,
  ArrowLeft,
  LayoutDashboard
} from 'lucide-react';
import { PLATFORM_FAQS } from '../data/mockData';

interface AboutPolicyViewProps {
  initialSection?: 'about' | 'terms' | 'privacy' | 'guidelines' | 'payouts' | 'careers' | 'contact';
  onBackToLanding?: () => void;
  onEnterApp?: () => void;
  isStandalone?: boolean;
}

export const AboutPolicyView: React.FC<AboutPolicyViewProps> = ({
  initialSection = 'about',
  onBackToLanding,
  onEnterApp,
  isStandalone = false
}) => {
  const [activeSection, setActiveSection] = useState<'about' | 'terms' | 'privacy' | 'guidelines' | 'payouts' | 'careers' | 'contact'>(initialSection);

  useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection]);

  return (
    <div className={`space-y-8 animate-fadeIn pb-16 ${isStandalone ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6' : ''}`}>
      {/* Standalone Top Bar if viewing in standalone legal route */}
      {isStandalone && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-900/90 backdrop-blur-md rounded-[24px] border border-slate-800 shadow-xl">
          <div className="flex items-center gap-3">
            {onBackToLanding && (
              <button
                onClick={onBackToLanding}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-mono-code font-bold text-xs flex items-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Landing Page</span>
              </button>
            )}
            <VisorLogo size="sm" glow={false} />
          </div>

          {onEnterApp && (
            <button
              onClick={onEnterApp}
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-sky-500/20"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Launch Live Feed</span>
            </button>
          )}
        </div>
      )}

      {/* Navigation Header for Legal / Info Pages */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar p-2 bg-slate-900 rounded-[24px] border border-slate-800 text-xs font-mono-code">
        {[
          { id: 'about', label: 'About Visor', icon: Info },
          { id: 'payouts', label: '70/30 Streamer Payout Model', icon: DollarSign },
          { id: 'terms', label: 'Terms of Service', icon: FileText },
          { id: 'privacy', label: 'Privacy Policy', icon: Lock },
          { id: 'guidelines', label: 'Community Guidelines', icon: Shield },
          { id: 'careers', label: 'Careers & Internships', icon: Briefcase },
        ].map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-sky-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: ABOUT VISOR */}
      {activeSection === 'about' && (
        <div className="space-y-8 max-w-4xl mx-auto animate-fadeIn">
          <div className="text-center space-y-3">
            <VisorLogo size="xl" glow={true} className="justify-center" />
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight mt-4">
              The Dedicated Next-Gen Gaming & Learning Hub
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Visor is a high-performance video streaming and social platform designed specifically for gamers who want more than just entertainment. We give players and creators a place to share gameplay, connect with fans, build communities, master challenging missions, and monetize their creativity without barriers.
            </p>
          </div>

          {/* Mission & Vision Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 p-7 rounded-[28px] sm:rounded-[32px] border border-slate-800 space-y-3 shadow-xl">
              <span className="text-[10px] font-mono-code font-bold uppercase text-sky-400 px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/30">
                OUR MISSION
              </span>
              <h3 className="text-xl font-black text-white">
                Democratize Gaming Content & Learning
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                To make gaming content creation and consumption accessible through affordable subscription tiers ($2–$10/month), direct Mobile Money (M-Pesa, MTN, Airtel) payments, and structured video tutorials that help gamers overcome challenging levels.
              </p>
            </div>

            <div className="bg-slate-900 p-7 rounded-[28px] sm:rounded-[32px] border border-slate-800 space-y-3 shadow-xl">
              <span className="text-[10px] font-mono-code font-bold uppercase text-purple-400 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30">
                OUR VISION
              </span>
              <h3 className="text-xl font-black text-white">
                The Global Stage for Esports & Creators
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                To become the premier creator-first gaming ecosystem, hosting seasonal esports tournaments with six-figure prize pools and scaling ultra low-latency server relays across the globe.
              </p>
            </div>
          </div>

          {/* Core Values */}
          <div className="bg-slate-900 p-7 rounded-[28px] sm:rounded-[32px] border border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-lg font-black text-white uppercase tracking-tight">
              Core Platform Values
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800 space-y-1">
                <span className="font-bold text-sky-400 block text-sm">1. Accessibility</span>
                <p className="text-slate-300">Affordable membership pricing & mobile money integration.</p>
              </div>
              <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800 space-y-1">
                <span className="font-bold text-purple-400 block text-sm">2. Community</span>
                <p className="text-slate-300">GamiPress XP rewards, Discord integration, and esports LAN events.</p>
              </div>
              <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-400 block text-sm">3. Skill Growth</span>
                <p className="text-slate-300">Comprehensive guides and tutorials for competitive player growth.</p>
              </div>
              <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800 space-y-1">
                <span className="font-bold text-amber-400 block text-sm">4. Scalability</span>
                <p className="text-slate-300">Cloudflare edge CDN & Bunny.net/Mux adaptive video delivery.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: STREAMER PAYOUT MODEL */}
      {activeSection === 'payouts' && (
        <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
          <div className="bg-slate-900 p-7 sm:p-9 rounded-[28px] sm:rounded-[32px] border border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 text-emerald-400">
              <DollarSign className="w-6 h-6" />
              <h2 className="text-2xl font-black uppercase text-white tracking-tight">
                Streamer Monetization & Payout Policy
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Visor empowers content creators with transparent, industry-leading revenue splits and automated monthly settlements directly to local Mobile Money accounts.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-5 bg-slate-800/40 rounded-2xl border border-emerald-500/30 text-center space-y-1.5">
                <span className="text-3xl font-black text-emerald-400 font-mono-code">70%</span>
                <p className="text-xs font-bold text-white uppercase">Channel Subscriptions</p>
                <p className="text-[10px] text-slate-400 font-mono-code">Fan ($2), Pro ($5), and Legend ($10) plans</p>
              </div>

              <div className="p-5 bg-slate-800/40 rounded-2xl border border-sky-500/30 text-center space-y-1.5">
                <span className="text-3xl font-black text-sky-400 font-mono-code">60%</span>
                <p className="text-xs font-bold text-white uppercase">In-Stream Video Ads</p>
                <p className="text-[10px] text-slate-400 font-mono-code">CPM based earnings per 1,000 video impressions</p>
              </div>

              <div className="p-5 bg-slate-800/40 rounded-2xl border border-purple-500/30 text-center space-y-1.5">
                <span className="text-3xl font-black text-purple-400 font-mono-code">80%</span>
                <p className="text-xs font-bold text-white uppercase">Pay-Per-View Events</p>
                <p className="text-[10px] text-slate-400 font-mono-code">Ticketed tournament passes & custom matches</p>
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-1.5 font-mono-code">
              <span className="font-bold text-white">Settlement Frequency & Minimums:</span>
              <p>Payouts are calculated on the 1st of each month and distributed within 24 hours. The minimum withdrawal threshold is just $20 USD with zero forex conversion penalty.</p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: TERMS OF SERVICE */}
      {activeSection === 'terms' && (
        <div className="bg-slate-900 p-7 sm:p-9 rounded-[28px] sm:rounded-[32px] border border-slate-800 shadow-2xl max-w-4xl mx-auto space-y-6 text-xs text-slate-300 leading-relaxed animate-fadeIn font-sans">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-2xl font-black text-white tracking-tight font-rajdhani uppercase">
              TERMS OF SERVICE
            </h2>
            <p className="text-[11px] text-slate-400 font-mono-code mt-1">Last Updated: August 18, 2026</p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800 space-y-1.5">
              <h4 className="font-bold text-white text-sm">1. Acceptance of Terms:</h4>
              <p>By creating an account or accessing Visor Stream, you agree to comply with these Terms of Service, our Community Guidelines, and applicable local digital regulations.</p>
            </div>

            <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800 space-y-1.5">
              <h4 className="font-bold text-white text-sm">2. Account Eligibility & Registration:</h4>
              <p>Users must be at least 13 years of age to register an account. Creators who monetize content must be authorized in their jurisdiction to receive mobile money, card, or banking transfers.</p>
            </div>

            <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800 space-y-1.5">
              <h4 className="font-bold text-white text-sm">3. Content Ownership & Licensing:</h4>
              <p>Creators retain full copyright ownership of all live streams, VODs, and clips created on Visor Stream. By broadcasting or uploading content, creators grant Visor Stream a non-exclusive, worldwide license to host, stream, and distribute the media across the platform.</p>
            </div>

            <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800 space-y-1.5">
              <h4 className="font-bold text-white text-sm">4. Subscriptions, Payments & Refunds:</h4>
              <p>Paid channel subscriptions, passes, and digital items renew automatically on a recurring billing cycle unless canceled prior to the renewal date. Refunds are processed in accordance with our financial policy for verified billing or technical errors.</p>
            </div>

            <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800 space-y-1.5">
              <h4 className="font-bold text-white text-sm">5. Service Modifications & Termination:</h4>
              <p>We reserve the right to suspend or terminate accounts that violate our Community Guidelines or engage in unauthorized platform activity.</p>
            </div>

            <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800 space-y-1.5">
              <h4 className="font-bold text-white text-sm">6. Developer & Legal Contact:</h4>
              <p>
                For legal inquiries, support, or data deletion requests, contact us at{' '}
                <a href="mailto:syymbba@gmail.com" className="text-sky-400 underline font-mono-code font-bold">
                  syymbba@gmail.com
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: PRIVACY POLICY */}
      {activeSection === 'privacy' && (
        <div className="bg-[#0b0e14] p-7 sm:p-9 rounded-[28px] sm:rounded-[32px] border border-[#2a475e] shadow-2xl max-w-4xl mx-auto space-y-6 text-xs text-slate-300 leading-relaxed animate-fadeIn font-sans">
          <div className="border-b border-[#2a475e]/80 pb-4">
            <div className="flex items-center gap-2 text-[#38bdf8] mb-1">
              <Lock className="w-5 h-5" />
              <span className="text-[10px] font-mono-code uppercase font-bold tracking-wider">Legal Compliance & Data Governance</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight font-rajdhani uppercase">
              PRIVACY POLICY
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] text-slate-400 font-mono-code">Last Updated: August 18, 2026</span>
            </div>
          </div>

          {/* Section 1: Information We Collect */}
          <div className="p-5 bg-[#171a21] rounded-2xl border border-[#2a475e] space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <span className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 font-mono-code text-xs flex items-center justify-center border border-sky-500/30">1</span>
              <h4>Information We Collect</h4>
            </div>
            <p className="text-slate-300 leading-relaxed pl-8">
              We collect account profile information (username, email address, profile picture) when you authenticate via Google or standard sign-up. We also collect usage telemetry data (latency pings, stream view counts) to improve streaming performance.
            </p>
          </div>

          {/* Section 2: Use of Google User Data */}
          <div className="p-5 bg-[#171a21] rounded-2xl border border-[#2a475e] space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <span className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 font-mono-code text-xs flex items-center justify-center border border-sky-500/30">2</span>
              <h4>Use of Google User Data</h4>
            </div>
            <p className="text-slate-300 leading-relaxed pl-8">
              Visor Stream accesses your Google account information solely to authenticate your user identity and set up your account profile. We do not use Google user data for serving advertisements, nor do we transfer or share this data with external AI models or third-party data brokers.
            </p>
          </div>

          {/* Section 3: Google API Limited Use Disclosure */}
          <div className="p-5 bg-gradient-to-br from-[#171a21] to-[#0d1f30] rounded-2xl border border-[#0284c7]/40 shadow-lg space-y-2">
            <div className="flex items-center gap-2 text-sky-300 font-bold text-sm">
              <span className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-300 font-mono-code text-xs flex items-center justify-center border border-sky-400/40">3</span>
              <h4>Google API Limited Use Disclosure</h4>
            </div>
            <p className="text-slate-200 leading-relaxed pl-8 font-medium">
              Visor Stream’s use and transfer to any other app of information received from Google APIs will adhere to the{' '}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noreferrer"
                className="text-[#38bdf8] underline hover:text-sky-300 font-bold inline-flex items-center gap-1"
              >
                Google API Services User Data Policy
                <ExternalLink className="w-3 h-3" />
              </a>
              , including the Limited Use requirements.
            </p>
          </div>

          {/* Section 4: Data Protection & Payment Security */}
          <div className="p-5 bg-[#171a21] rounded-2xl border border-[#2a475e] space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <span className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 font-mono-code text-xs flex items-center justify-center border border-sky-500/30">4</span>
              <h4>Data Protection & Payment Security</h4>
            </div>
            <p className="text-slate-300 leading-relaxed pl-8">
              All financial transactions (Mobile Money and Credit/Debit Cards) are processed via PCI-DSS compliant third-party payment gateways (such as Flutterwave, Paystack, and Stripe). Visor Stream never stores raw payment PINs, passwords, or full credit card numbers.
            </p>
          </div>

          {/* Section 5: Data Retention & Deletion */}
          <div className="p-5 bg-[#171a21] rounded-2xl border border-[#2a475e] space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <span className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 font-mono-code text-xs flex items-center justify-center border border-sky-500/30">5</span>
              <h4>Data Retention & Deletion</h4>
            </div>
            <p className="text-slate-300 leading-relaxed pl-8">
              Users retain full control over their data. You can request complete account and personal data deletion at any time by navigating to Settings &gt; Account &gt; Delete Account, or by contacting{' '}
              <a href="mailto:syymbba@gmail.com" className="text-sky-400 underline font-mono-code font-bold">
                syymbba@gmail.com
              </a>
              .
            </p>
          </div>

          {/* Contact / Inquiries Note */}
          <div className="p-4 bg-[#0b0e14] rounded-2xl border border-[#2a475e] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono-code">
            <div className="flex items-center gap-2 text-slate-300">
              <Mail className="w-4 h-4 text-sky-400" />
              <span>Data Protection Officer: <strong className="text-white">syymbba@gmail.com</strong></span>
            </div>
            <span className="text-slate-400 text-[11px]">Kampala, Uganda • Global CDN Relay</span>
          </div>
        </div>
      )}

      {/* SECTION 5: COMMUNITY GUIDELINES */}
      {activeSection === 'guidelines' && (
        <div className="bg-slate-900 p-7 sm:p-9 rounded-[28px] sm:rounded-[32px] border border-slate-800 shadow-2xl max-w-4xl mx-auto space-y-4 text-xs text-slate-300 leading-relaxed animate-fadeIn">
          <h2 className="text-xl font-black text-white tracking-tight">
            Community Guidelines & Fair Play
          </h2>
          <p><strong className="text-white">1. Anti-Harassment:</strong> Treat fellow gamers, streamers, and viewers with dignity. Hate speech, toxicity, and cyberbullying result in immediate account suspension.</p>
          <p><strong className="text-white">2. Anti-Cheating:</strong> Using aimbots, wallhacks, or modified APKs in competitive tournaments is strictly banned.</p>
          <p><strong className="text-white">3. Tutorial Quality:</strong> Gameplay guides must be accurate and authentic. Misleading titles or scam guides will be flagged and removed.</p>
        </div>
      )}

      {/* SECTION 6: CAREERS */}
      {activeSection === 'careers' && (
        <div className="bg-slate-900 p-7 sm:p-9 rounded-[28px] sm:rounded-[32px] border border-slate-800 shadow-2xl max-w-4xl mx-auto space-y-4 text-xs text-slate-300 leading-relaxed animate-fadeIn">
          <h2 className="text-xl font-black text-white tracking-tight">
            Join the Visor Team
          </h2>
          <p>We are building the leading modern digital gaming and esports company. Open roles include:</p>
          <div className="space-y-2.5 pt-2">
            <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-xs">Esports Tournament Operations Lead</h4>
                <p className="text-[10px] text-slate-400 font-mono-code">Full-time • Hybrid / Remote</p>
              </div>
              <span className="text-sky-400 font-bold text-xs font-mono-code">Apply →</span>
            </div>
            <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-xs">Video Streaming & CDN Infrastructure Engineer</h4>
                <p className="text-[10px] text-slate-400 font-mono-code">Remote • Global Hubs</p>
              </div>
              <span className="text-sky-400 font-bold text-xs font-mono-code">Apply →</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
