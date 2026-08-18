import React, { useState, useEffect } from 'react';
import { VisorLogo } from './VisorLogo';
import { Currency } from '../types';
import { CURRENCY_RATES, REGIONAL_SERVER_NODES } from '../data/mockData';
import { auth, onAuthStateChanged, type User as FirebaseUser } from '../firebase';
import { useLanguage } from '../lib/i18n';
import {
  Radio,
  Gamepad2,
  BookOpen,
  Trophy,
  Users,
  CreditCard,
  LayoutDashboard,
  ShoppingBag,
  Settings,
  Info,
  Search,
  Bell,
  Video,
  Menu,
  X,
  Globe,
  Film,
  FolderDown,
  Wallet,
  Eye,
  EyeOff,
  Headphones,
  FileText,
  Shield,
  LogIn
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentCurrency: Currency;
  setCurrentCurrency: (curr: Currency) => void;
  onOpenGoLive: () => void;
  onOpenSubscribe: () => void;
  unreadNotifications: number;
  onOpenNotifications: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenAuthModal?: () => void;
  userBalanceUSD?: number;
  showBalanceInHeader?: boolean;
  onToggleBalanceVisibility?: () => void;
  customLogoUrl?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentCurrency,
  setCurrentCurrency,
  onOpenGoLive,
  onOpenSubscribe,
  unreadNotifications,
  onOpenNotifications,
  searchQuery,
  setSearchQuery,
  onOpenAuthModal,
  userBalanceUSD = 245.50,
  showBalanceInHeader = true,
  onToggleBalanceVisibility,
  customLogoUrl
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [activeServer] = useState(REGIONAL_SERVER_NODES[0]);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(auth.currentUser);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  const { t } = useLanguage();

  const navItems = [
    { id: 'live', label: t('nav.live'), icon: Radio, badge: 'LIVE' },
    { id: 'reels', label: t('nav.reels'), icon: Film, badge: 'CLIPS' },
    { id: 'library', label: t('nav.library'), icon: FolderDown, badge: 'OFFLINE' },
    { id: 'tutorials', label: t('nav.tutorials'), icon: BookOpen, badge: 'GUIDES' },
    { id: 'games', label: t('nav.games'), icon: Gamepad2 },
    { id: 'esports', label: t('nav.esports'), icon: Trophy, badge: '$15K' },
    { id: 'community', label: t('nav.community'), icon: Users },
    { id: 'creator', label: t('nav.creator'), icon: LayoutDashboard, isHighlighted: true },
    { id: 'store', label: t('nav.store'), icon: ShoppingBag },
    { id: 'pricing', label: t('nav.pricing'), icon: CreditCard },
    { id: 'about', label: 'About', icon: Info },
    { id: 'settings', label: t('nav.settings'), icon: Settings },
  ];

  const rate = CURRENCY_RATES[currentCurrency]?.rate || 1;
  const symbol = CURRENCY_RATES[currentCurrency]?.symbol || '$';
  const formattedBalance = (userBalanceUSD * rate).toLocaleString(undefined, {
    minimumFractionDigits: currentCurrency === 'UGX' || currentCurrency === 'TZS' ? 0 : 2,
    maximumFractionDigits: currentCurrency === 'UGX' || currentCurrency === 'TZS' ? 0 : 2,
  });

  return (
    <header className="sticky top-0 z-40 w-full px-2 sm:px-4 lg:px-8 pt-2.5 pb-1 transition-all">
      {/* Main Steam/Prime Video Slate Header */}
      <div className="max-w-[1720px] mx-auto bg-[#171a21]/90 backdrop-blur-xl border border-[#2a475e]/70 rounded-2xl px-3 sm:px-6 py-2.5 shadow-xl shadow-black/50">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Logo & Regional Routing Indicator */}
          <div className="flex items-center gap-3">
            <div 
              className="flex items-center cursor-pointer group"
              onClick={() => setActiveTab('live')}
            >
              <div className="flex items-center justify-center group-hover:scale-105 transition-transform">
                <VisorLogo size="md" showText={false} animated={false} customLogoUrl={customLogoUrl} glow={true} />
              </div>
              <div className="ml-2.5 hidden sm:flex flex-col">
                <h1 className="text-xl font-black tracking-tight text-white leading-none font-rajdhani flex items-center gap-1.5">
                  VISOR <span className="text-[#38bdf8] font-extrabold">STREAM</span>
                </h1>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                  <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider font-mono-code">
                    East Africa Edge • {activeServer.city.toUpperCase()} ({activeServer.pingMs}ms)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Search bar in center */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-2 xl:mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={t('nav.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#0b0e14]/80 border border-[#2a475e]/60 hover:border-[#38bdf8]/50 focus:border-[#38bdf8] rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#38bdf8] transition-all font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right Header Controls: Balance, Currency, Notifications, Profile, Go Live */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Account Balance Widget */}
            <div 
              onClick={() => setActiveTab('settings')}
              className="cursor-pointer hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#1b2838] border border-[#2a475e] hover:border-[#38bdf8]/50 rounded-xl text-xs transition-all touch-active-state"
              title="Click to view wallet in settings"
            >
              <Wallet className="w-3.5 h-3.5 text-[#38bdf8]" />
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[9px] uppercase font-mono-code text-slate-400 font-semibold">Balance</span>
                <span className="font-bold font-mono-code text-slate-100">
                  {showBalanceInHeader ? `${symbol}${formattedBalance}` : '••••••'}
                </span>
              </div>
            </div>

            {/* Currency Switcher */}
            <div className="relative">
              <button
                onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 bg-[#1b2838] border border-[#2a475e] rounded-xl text-xs font-mono-code text-slate-200 hover:border-[#38bdf8]/50 transition-all touch-active-state"
                title="Change display currency"
              >
                <Globe className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span className="font-bold">{currentCurrency}</span>
              </button>

              {currencyDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#171a21] border border-[#2a475e] rounded-2xl shadow-2xl py-1.5 z-50 overflow-hidden">
                  <div className="px-3.5 py-1 text-[10px] uppercase font-black tracking-wider text-slate-400 border-b border-[#2a475e]">
                    Select Currency
                  </div>
                  {(Object.keys(CURRENCY_RATES) as Currency[]).map((curr) => (
                    <button
                      key={curr}
                      onClick={() => {
                        setCurrentCurrency(curr);
                        setCurrencyDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-[#1b2838] transition-colors ${
                        currentCurrency === curr ? 'text-[#38bdf8] font-bold bg-[#38bdf8]/10' : 'text-slate-300'
                      }`}
                    >
                      <span>{CURRENCY_RATES[curr].label}</span>
                      <span className="text-[10px] font-mono-code text-slate-400">
                        {CURRENCY_RATES[curr].symbol}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications Button */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2.5 rounded-xl bg-[#1b2838] border border-[#2a475e] hover:border-[#38bdf8]/50 text-slate-300 hover:text-white transition-colors touch-active-state"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink-500 text-[9px] font-bold text-white flex items-center justify-center shadow-md shadow-pink-500/50 animate-pulse">
                  {unreadNotifications}
                </span>
              )}
            </button>

            {/* Auth / Account Profile Button (Hide Sign In / Sign Up triggers when user is logged in) */}
            {currentUser ? (
              <button
                onClick={() => setActiveTab('settings')}
                className="flex items-center gap-2 p-1 sm:p-1.5 sm:pr-3 rounded-xl bg-[#1b2838] border border-[#2a475e] hover:border-[#38bdf8]/50 transition-all text-xs font-mono-code touch-active-state"
                title="Account Settings"
              >
                <img
                  src={currentUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt="Profile"
                  className="w-7 h-7 rounded-lg object-cover border border-[#38bdf8]/60"
                  referrerPolicy="no-referrer"
                />
                <span className="hidden sm:inline font-bold text-slate-200 max-w-[90px] truncate">
                  {currentUser.displayName || currentUser.email?.split('@')[0]}
                </span>
              </button>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/40 hover:bg-[#38bdf8]/25 transition-all text-xs font-bold font-mono-code touch-active-state"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {/* GO LIVE Steam Action Button */}
            <button
              onClick={onOpenGoLive}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-[#38bdf8] text-[#0b0e14] font-black text-xs uppercase tracking-wider hover:bg-[#66c0f4] transition-colors shadow-lg shadow-sky-500/20 touch-active-state"
            >
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">Go Live</span>
            </button>

            {/* Mobile Navigation Drawer Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-[#1b2838] border border-[#2a475e] text-slate-300 hover:text-white touch-active-state"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Secondary Desktop Horizontal Navigation Bar */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5 pt-2.5 mt-2 overflow-x-auto no-scrollbar border-t border-[#2a475e]/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 touch-active-state ${
                  isActive
                    ? 'bg-[#0284c7]/10 text-sky-300 border border-[#0369a1]/35 shadow-[0_0_10px_rgba(2,132,199,0.12)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#1b2838] border border-transparent'
                } ${item.isHighlighted && !isActive ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : ''}`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-400' : item.isHighlighted ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono-code font-bold uppercase ${
                      item.badge === 'LIVE'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                        : item.badge === 'CLIPS'
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        : 'bg-[#0284c7]/15 text-sky-300 border border-[#0369a1]/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Top Navigation Drawer (No Bottom Bar) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#171a21] border border-[#2a475e] rounded-2xl mx-2 mt-2 px-3.5 py-3 space-y-2.5 shadow-2xl animate-fadeIn z-50">
          {/* Mobile Search Input */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search streams, clips, guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#0b0e14] border border-[#2a475e] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#38bdf8]"
            />
          </div>

          {/* Mobile Balance Quick View */}
          <div className="flex items-center justify-between p-2.5 bg-[#1b2838] border border-[#2a475e] rounded-xl text-xs font-mono-code">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-[#38bdf8]" />
              <span className="text-slate-400">Balance:</span>
              <span className="font-bold text-white">{symbol}{formattedBalance}</span>
            </div>
            <button
              onClick={() => {
                setActiveTab('settings');
                setMobileMenuOpen(false);
              }}
              className="text-[#38bdf8] text-[11px] font-bold underline"
            >
              Manage
            </button>
          </div>

          {/* Mobile Navigation Grid */}
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold text-left transition-all touch-active-state ${
                    isActive
                      ? 'bg-[#0284c7]/10 text-sky-300 border border-[#0369a1]/35 shadow-[0_0_10px_rgba(2,132,199,0.12)]'
                      : 'bg-[#1b2838]/60 text-slate-300 hover:bg-[#1b2838] border border-[#2a475e]/40'
                  }`}
                >
                  <Icon className="w-4 h-4 text-sky-400 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick links to Support, Terms, Privacy */}
          <div className="flex items-center justify-around pt-2 border-t border-[#2a475e]/60 text-[11px] text-slate-400 font-medium">
            <button 
              onClick={() => { setActiveTab('support'); setMobileMenuOpen(false); }}
              className="hover:text-[#38bdf8] transition-colors"
            >
              Support & Help
            </button>
            <span>•</span>
            <button 
              onClick={() => { setActiveTab('terms'); setMobileMenuOpen(false); }}
              className="hover:text-[#38bdf8] transition-colors"
            >
              Terms of Service
            </button>
            <span>•</span>
            <button 
              onClick={() => { setActiveTab('privacy'); setMobileMenuOpen(false); }}
              className="hover:text-[#38bdf8] transition-colors"
            >
              Privacy Policy
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

