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
import { useLanguage } from '../lib/i18n';

// NOTE: Privacy Policy and Terms of Service are intentionally NOT sections of
// this component. They are dedicated, standalone pages
// (src/components/PrivacyPolicyPage.tsx, src/components/TermsOfServicePage.tsx,
// routed at /privacy and /terms in App.tsx) with no tab-switcher and no
// access to any other app content, as required for Google OAuth
// verification. This component used to also embed shorter, drifted copies of
// both documents here (with different effective dates and even incorrect
// payment-provider names), which risked showing reviewers inconsistent
// policy text depending on which link they clicked. Do not re-add 'privacy'
// or 'terms' sections here - link out to /privacy and /terms instead.
interface AboutPolicyViewProps {
  initialSection?: 'about' | 'guidelines' | 'payouts' | 'careers' | 'contact';
  onBackToLanding?: () => void;
  onBackToApp?: () => void;
  onEnterApp?: () => void;
  onNavigateLegal?: (section: 'privacy' | 'terms') => void;
  isStandalone?: boolean;
}

export const AboutPolicyView: React.FC<AboutPolicyViewProps> = ({
  initialSection = 'about',
  onBackToLanding,
  onBackToApp,
  onEnterApp,
  onNavigateLegal,
  isStandalone = false
}) => {
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState<'about' | 'guidelines' | 'payouts' | 'careers' | 'contact'>(initialSection);

  useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection]);

  return (
    <div className={`space-y-8 animate-fadeIn pb-16 ${isStandalone ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6' : ''}`}>
      {/* Top Bar for In-App Back Navigation or Standalone Legal Route */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-900/90 backdrop-blur-md rounded-[24px] border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          {onBackToApp ? (
            <button
              onClick={onBackToApp}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-mono-code font-bold text-xs flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-sky-400" />
              <span>{t('about.nav.backToStream')}</span>
            </button>
          ) : onBackToLanding ? (
            <button
              onClick={onBackToLanding}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-mono-code font-bold text-xs flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Landing Page</span>
            </button>
          ) : null}
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

      {/* Navigation Header for Legal / Info Pages */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar p-2 bg-slate-900 rounded-[24px] border border-slate-800 text-xs font-mono-code">
        {[
          { id: 'about', label: t('about.tabs.about'), icon: Info },
          { id: 'payouts', label: t('about.tabs.payouts'), icon: DollarSign },
          { id: 'guidelines', label: t('about.tabs.guidelines'), icon: Shield },
          { id: 'careers', label: t('about.tabs.careers'), icon: Briefcase },
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

        {/* Real links (not tab-switcher buttons) to the standalone legal
            pages - clicking these navigates to their own dedicated page
            rather than swapping content inside this component. The `href`
            keeps them real, crawlable, right-click-able links; onClick
            intercepts a normal left-click to route through the app's own
            client-side navigation instead of a full page reload (a full
            reload to a deep path like /terms will 404 on hosts that aren't
            configured with an SPA fallback rewrite). */}
        <a
          href="/terms"
          onClick={(e) => { if (onNavigateLegal) { e.preventDefault(); onNavigateLegal('terms'); } }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <FileText className="w-4 h-4" />
          <span>Terms of Service</span>
        </a>
        <a
          href="/privacy"
          onClick={(e) => { if (onNavigateLegal) { e.preventDefault(); onNavigateLegal('privacy'); } }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <Lock className="w-4 h-4" />
          <span>Privacy Policy</span>
        </a>
      </div>

      {/* SECTION 1: ABOUT VISOR */}
      {activeSection === 'about' && (
        <div className="space-y-8 max-w-4xl mx-auto animate-fadeIn">
          <div className="text-center space-y-3">
            <VisorLogo size="xl" glow={true} className="justify-center" />
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight mt-4">
              {t('about.hero.title')}
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
                {t('about.mission.title')}
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
                {t('about.vision.title')}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                To become the premier creator-first gaming ecosystem, hosting seasonal esports tournaments with six-figure prize pools and scaling ultra low-latency server relays across the globe.
              </p>
            </div>
          </div>

          {/* Core Values */}
          <div className="bg-slate-900 p-7 rounded-[28px] sm:rounded-[32px] border border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-lg font-black text-white uppercase tracking-tight">
              {t('about.values.title')}
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
                {t('about.payouts.title')}
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

      {/* SECTION 5: COMMUNITY GUIDELINES */}
      {activeSection === 'guidelines' && (
        <div className="bg-slate-900 p-7 sm:p-9 rounded-[28px] sm:rounded-[32px] border border-slate-800 shadow-2xl max-w-4xl mx-auto space-y-4 text-xs text-slate-300 leading-relaxed animate-fadeIn">
          <h2 className="text-xl font-black text-white tracking-tight">
            {t('about.guidelines.title')}
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
            {t('about.careers.title')}
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
