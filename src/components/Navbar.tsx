import React, { useState, useEffect } from 'react';
import { VisorLogo } from './VisorLogo';
import { Currency } from '../types';
import { CURRENCY_RATES, REGIONAL_SERVER_NODES } from '../data/mockData';
import { auth, onAuthStateChanged, type User as FirebaseUser } from '../firebase';
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
  Mail,
  User,
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
  onOpenAuthModal
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

  const navItems = [
    { id: 'live', label: 'Live Streams', icon: Radio, badge: 'LIVE' },
    { id: 'tutorials', label: 'Tutorials & Guides', icon: BookOpen, badge: 'NEW' },
    { id: 'games', label: 'Games', icon: Gamepad2 },
    { id: 'esports', label: 'Esports', icon: Trophy, badge: '$15K' },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'gmail', label: 'Gmail', icon: Mail, badge: 'WORKSPACE' },
    { id: 'pricing', label: 'Pricing', icon: CreditCard },
    { id: 'creator', label: 'Creator Studio', icon: LayoutDashboard, isHighlighted: true },
    { id: 'store', label: 'Store', icon: ShoppingBag },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-40 w-full px-3 sm:px-6 lg:px-8 pt-3 pb-1 transition-all">
      {/* Bento Header Main Container */}
      <div className="max-w-[1720px] mx-auto bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 rounded-2xl px-4 sm:px-6 py-3 shadow-xl shadow-black/40">
        <div className="flex items-center justify-between gap-3">
          {/* Brand Logo & Engine Indicator */}
          <div className="flex items-center gap-4">
            <div 
              className="flex items-center cursor-pointer group"
              onClick={() => setActiveTab('live')}
            >
              <div className="w-11 h-11 bg-gradient-to-tr from-sky-600 to-indigo-600 rounded-xl flex items-center justify-center border border-white/20 shadow-[0_0_20px_rgba(56,189,248,0.35)] group-hover:scale-105 transition-transform">
                <VisorLogo size="sm" showText={false} animated={false} />
              </div>
              <div className="ml-3 hidden sm:flex flex-col">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-none font-rajdhani flex items-center gap-1.5">
                  VISOR <span className="text-sky-400 font-extrabold">STREAM</span>
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-[0.2em] font-mono-code">
                    Bento Engine Active • {activeServer.city.toUpperCase()} ({activeServer.pingMs}ms)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Search bar in center */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search live streams, game guides, tutorials, creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-950/60 border border-slate-800 hover:border-sky-500/50 focus:border-sky-400 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-400 transition-all font-sans"
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

          {/* Telemetry Metric Chips & Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Currency Switcher */}
            <div className="relative">
              <button
                onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800/60 border border-slate-700/60 rounded-xl text-xs font-mono-code text-slate-200 hover:border-sky-400/50 hover:bg-slate-800 transition-all"
                title="Change display currency"
              >
                <Globe className="w-3.5 h-3.5 text-sky-400" />
                <span className="font-bold">{currentCurrency}</span>
              </button>

              {currencyDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-1.5 z-50 overflow-hidden">
                  <div className="px-3.5 py-1 text-[10px] uppercase font-black tracking-wider text-slate-400 border-b border-slate-800">
                    Display Currency
                  </div>
                  {(Object.keys(CURRENCY_RATES) as Currency[]).map((curr) => (
                    <button
                      key={curr}
                      onClick={() => {
                        setCurrentCurrency(curr);
                        setCurrencyDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-800/80 transition-colors ${
                        currentCurrency === curr ? 'text-sky-400 font-bold bg-sky-500/10' : 'text-slate-300'
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
              className="relative p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink-500 text-[9px] font-bold text-white flex items-center justify-center shadow-md shadow-pink-500/50 animate-pulse">
                  {unreadNotifications}
                </span>
              )}
            </button>

            {/* Auth / Account Profile Button */}
            {currentUser ? (
              <button
                onClick={() => setActiveTab('settings')}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-sky-400/50 transition-all text-xs font-mono-code"
                title="Account Settings"
              >
                <img
                  src={currentUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt="Profile"
                  className="w-6 h-6 rounded-lg object-cover border border-sky-400/50"
                />
                <span className="hidden sm:inline font-bold text-white max-w-[90px] truncate">
                  {currentUser.displayName || currentUser.email?.split('@')[0]}
                </span>
              </button>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30 hover:bg-sky-500/25 transition-all text-xs font-bold font-mono-code"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {/* GO LIVE Bento Action Button */}
            <button
              onClick={onOpenGoLive}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl bg-white text-slate-950 font-black text-xs uppercase tracking-widest hover:bg-sky-400 hover:text-slate-950 transition-colors shadow-lg shadow-sky-500/10"
            >
              <Video className="w-4 h-4 text-sky-600" />
              <span className="hidden sm:inline">Go Live</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Secondary Desktop Bento Horizontal Navigation Bar */}
        <nav className="hidden md:flex items-center space-x-1.5 lg:space-x-2 pt-3 mt-2.5 overflow-x-auto no-scrollbar border-t border-slate-800/80">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-sky-500/15 text-sky-400 border border-sky-400/40 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                } ${item.isHighlighted && !isActive ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : ''}`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-400' : item.isHighlighted ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono-code font-bold uppercase ${
                      item.badge === 'LIVE'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                        : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
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

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border border-slate-800 rounded-2xl mx-3 mt-2 px-4 py-3 space-y-2 shadow-2xl animate-fadeIn">
          {/* Mobile Search */}
          <div className="relative w-full mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search streams, guides, games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-1.5">
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
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
                    isActive
                      ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                      : 'bg-slate-800/40 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 text-sky-400" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
