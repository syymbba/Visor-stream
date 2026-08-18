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
  ExternalLink
} from 'lucide-react';
import { PLATFORM_FAQS } from '../data/mockData';

interface AboutPolicyViewProps {
  initialSection?: 'about' | 'terms' | 'privacy' | 'guidelines' | 'payouts' | 'careers' | 'contact';
}

export const AboutPolicyView: React.FC<AboutPolicyViewProps> = ({
  initialSection = 'about'
}) => {
  const [activeSection, setActiveSection] = useState<'about' | 'terms' | 'privacy' | 'guidelines' | 'payouts' | 'careers' | 'contact'>(initialSection);

  useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection]);

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
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
              Africa's Dedicated Gaming & Learning Hub
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
                The Continental Stage for Esports & Creators
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                To become the premier Africa-first gaming ecosystem, hosting seasonal esports tournaments with six-figure prize pools and scaling low-latency server relays across the globe.
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
        <div className="bg-slate-900 p-7 sm:p-9 rounded-[28px] sm:rounded-[32px] border border-slate-800 shadow-2xl max-w-4xl mx-auto space-y-4 text-xs text-slate-300 leading-relaxed animate-fadeIn">
          <h2 className="text-xl font-black text-white tracking-tight">
            Terms of Service
          </h2>
          <p><strong className="text-white">1. Acceptance:</strong> By accessing Visor Stream, you agree to comply with these terms, our community safety standards, and local cyber regulations.</p>
          <p><strong className="text-white">2. Eligibility:</strong> Users must be at least 13 years old. Creators monetizing content must be authorized in their jurisdiction to receive mobile money or card payments.</p>
          <p><strong className="text-white">3. Content Rights:</strong> Content creators retain full copyright ownership of their live broadcasts and gameplay tutorials. By uploading, creators grant Visor a non-exclusive license to stream and distribute the media.</p>
          <p><strong className="text-white">4. Subscriptions & Refunds:</strong> Subscriptions renew automatically each month. Refunds are issued in cases of verified technical billing errors.</p>
        </div>
      )}

      {/* SECTION 4: PRIVACY POLICY */}
      {activeSection === 'privacy' && (
        <div className="bg-slate-900 p-7 sm:p-9 rounded-[28px] sm:rounded-[32px] border border-slate-800 shadow-2xl max-w-4xl mx-auto space-y-4 text-xs text-slate-300 leading-relaxed animate-fadeIn">
          <h2 className="text-xl font-black text-white tracking-tight">
            Privacy Policy
          </h2>
          <p><strong className="text-white">1. Data Collected:</strong> We collect account profile information (username, email, phone number) and telemetry usage data (latency pings, viewed streams).</p>
          <p><strong className="text-white">2. Payment Security:</strong> All mobile money transactions and credit card information are processed via PCI-DSS compliant gateways (Flutterwave, Paystack, Stripe). Visor does not store raw mobile money PINs.</p>
          <p><strong className="text-white">3. Data Ownership:</strong> We never sell user data to third-party ad brokers. You may request account and data deletion at any time via Settings.</p>
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
          <p>We are building Africa's largest digital gaming and esports company. Open roles include:</p>
          <div className="space-y-2.5 pt-2">
            <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-xs">Esports Tournament Coordinator (Uganda & Kenya)</h4>
                <p className="text-[10px] text-slate-400 font-mono-code">Full-time • Kampala / Nairobi</p>
              </div>
              <span className="text-sky-400 font-bold text-xs font-mono-code">Apply →</span>
            </div>
            <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-xs">Video Streaming & CDN Infrastructure Engineer</h4>
                <p className="text-[10px] text-slate-400 font-mono-code">Remote • Pan-African</p>
              </div>
              <span className="text-sky-400 font-bold text-xs font-mono-code">Apply →</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
