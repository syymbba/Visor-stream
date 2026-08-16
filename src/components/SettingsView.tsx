import React, { useState, useEffect } from 'react';
import { REGIONAL_SERVER_NODES, PLATFORM_FAQS } from '../data/mockData';
import {
  auth,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser
} from '../firebase';
import { 
  fetchUserProfile, 
  saveUserProfile, 
  DEFAULT_USER_PROFILE, 
  UserProfile 
} from '../services/userService';
import {
  Settings,
  User,
  CreditCard,
  Video,
  Shield,
  Award,
  Globe,
  HelpCircle,
  CheckCircle2,
  Bell,
  Smartphone,
  Save,
  Key,
  Wifi,
  ExternalLink,
  Zap,
  LogIn,
  LogOut,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SettingsViewProps {
  onOpenSubscribe: () => void;
  onOpenAuthModal?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onOpenSubscribe,
  onOpenAuthModal
}) => {
  const [activeTab, setActiveTab] = useState<
    'account' | 'payments' | 'streaming' | 'privacy' | 'rewards' | 'technical' | 'support'
  >('account');

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedServer, setSelectedServer] = useState(REGIONAL_SERVER_NODES[0].id);

  // Form Fields
  const [username, setUsername] = useState(DEFAULT_USER_PROFILE.displayName);
  const [email, setEmail] = useState(DEFAULT_USER_PROFILE.email);
  const [bio, setBio] = useState(DEFAULT_USER_PROFILE.bio);
  const [networkProvider, setNetworkProvider] = useState<'mtn' | 'airtel' | 'mpesa' | 'card'>(DEFAULT_USER_PROFILE.networkProvider);
  const [mobileNumber, setMobileNumber] = useState(DEFAULT_USER_PROFILE.mobileNumber);
  const [lowDataMode, setLowDataMode] = useState(DEFAULT_USER_PROFILE.lowDataMode);
  const [notificationsEnabled, setNotificationsEnabled] = useState(DEFAULT_USER_PROFILE.notificationsEnabled);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setIsLoading(true);
        const fetched = await fetchUserProfile(user.uid);
        if (fetched) {
          setProfile(fetched);
          setUsername(fetched.displayName || '');
          setEmail(fetched.email || user.email || '');
          setBio(fetched.bio || '');
          setNetworkProvider(fetched.networkProvider || 'mtn');
          setMobileNumber(fetched.mobileNumber || '');
          setLowDataMode(fetched.lowDataMode ?? false);
          setNotificationsEnabled(fetched.notificationsEnabled ?? true);
        } else {
          setUsername(user.displayName || user.email?.split('@')[0] || 'VisorGamer');
          setEmail(user.email || '');
        }
        setIsLoading(false);
      } else {
        setProfile(DEFAULT_USER_PROFILE);
      }
    });

    return () => unsub();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const updated: UserProfile = {
      ...profile,
      uid: currentUser ? currentUser.uid : 'guest',
      displayName: username,
      email,
      bio,
      networkProvider,
      mobileNumber,
      lowDataMode,
      notificationsEnabled
    };

    await saveUserProfile(updated);
    setProfile(updated);
    setIsLoading(false);
    setSaveSuccess(true);
    confetti({ particleCount: 35, spread: 50 });
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setProfile(DEFAULT_USER_PROFILE);
  };

  const tabs = [
    { id: 'account', label: 'Account Management', icon: User },
    { id: 'payments', label: 'Subscription & Payouts', icon: CreditCard },
    { id: 'streaming', label: 'Streaming & Ingest', icon: Video },
    { id: 'privacy', label: 'Community & Privacy', icon: Shield },
    { id: 'rewards', label: 'Gamification & Badges', icon: Award },
    { id: 'technical', label: 'Regional Edge Nodes', icon: Globe },
    { id: 'support', label: 'Support & FAQs', icon: HelpCircle },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Settings Header Bento */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-[28px] sm:rounded-[32px] border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Visor Platform Settings & Account
              </h1>
              <p className="text-xs text-slate-400">
                Cloud Firestore synchronization, Mobile Money payout accounts, and low-bandwidth Data Saver
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono-code font-bold animate-fadeIn">
              <CheckCircle2 className="w-4 h-4" />
              <span>Synced with Firestore!</span>
            </div>
          )}

          {currentUser ? (
            <button
              onClick={handleSignOut}
              className="px-3.5 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          ) : (
            onOpenAuthModal && (
              <button
                onClick={onOpenAuthModal}
                className="px-3.5 py-2 rounded-xl bg-sky-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md hover:bg-sky-400 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In / Register</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Main Settings Layout: Sidebar Tabs + Content Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar Navigation (4 Cols) */}
        <div className="lg:col-span-4 space-y-1.5 bg-slate-900 p-4 rounded-[28px] border border-slate-800 h-fit shadow-xl">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-mono-code font-bold text-left transition-all ${
                  isActive
                    ? 'bg-sky-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Tab Content Container (8 Cols) */}
        <div className="lg:col-span-8 bg-slate-900 p-6 sm:p-7 rounded-[28px] sm:rounded-[32px] border border-slate-800 shadow-xl space-y-6">
          {/* TAB 1: Account Management */}
          {activeTab === 'account' && (
            <form onSubmit={handleSave} className="space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-lg text-white tracking-tight">
                    Gamer Profile & Cloud Sync
                  </h3>
                  <span className="text-[10px] font-mono-code bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded border border-sky-500/20">
                    {currentUser ? 'AUTHENTICATED' : 'GUEST MODE'}
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 rounded-xl bg-white text-slate-950 hover:bg-sky-400 transition-colors font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save to Firestore</span>
                </button>
              </div>

              <div className="flex items-center gap-4">
                <img
                  src={profile.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt="Avatar"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-sky-400"
                />
                <div>
                  <h4 className="font-bold text-sm text-white">{username}</h4>
                  <p className="text-[11px] text-slate-400 font-mono-code">{email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono-code">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">Gamer Handle</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-400"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-400"
                    required
                  />
                </div>
              </div>

              {/* Mobile Money Payout Settings */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 font-mono-code">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase">
                    Mobile Money Payout Configuration
                  </span>
                  <span className="text-[10px] text-amber-400 font-bold">INSTANT SETTLEMENT</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">Primary Provider</label>
                    <select
                      value={networkProvider}
                      onChange={(e) => setNetworkProvider(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-sky-400 focus:outline-none"
                    >
                      <option value="mtn">🇺🇬 MTN Mobile Money (Uganda)</option>
                      <option value="airtel">🔴 Airtel Money (East Africa)</option>
                      <option value="mpesa">🇰🇪 Safaricom M-Pesa (Kenya)</option>
                      <option value="card">💳 International Debit/Credit</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">Payout Phone Number</label>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="+256 780 123 456"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-sky-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 font-mono-code">
                <label className="text-xs font-bold text-slate-400">Gamer Bio</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-400 resize-none"
                />
              </div>
            </form>
          )}

          {/* TAB 2: Subscriptions & Payments */}
          {activeTab === 'payments' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-black text-lg text-white tracking-tight">
                  Subscription & Billing History
                </h3>
              </div>

              <div className="p-5 bg-sky-500/10 rounded-2xl border border-sky-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono-code uppercase font-bold text-sky-400">
                    CURRENT ACTIVE PLAN
                  </span>
                  <h4 className="text-lg font-black text-white">
                    PRO GAMER PASS ($5.00 / mo)
                  </h4>
                  <p className="text-xs text-slate-300 font-mono-code">
                    Billed via {networkProvider.toUpperCase()} ({mobileNumber}). Renews Sep 16, 2026.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onOpenSubscribe}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md hover:bg-amber-400 transition-colors"
                  >
                    Upgrade to Legend VIP ($10)
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                <h4 className="text-xs font-mono-code font-bold uppercase text-slate-400">
                  Recent Invoices & Mobile Money Receipts
                </h4>
                <div className="space-y-2 text-xs font-mono-code">
                  <div className="p-3.5 bg-slate-800/40 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white">Pro Gamer Monthly Pass</span>
                      <p className="text-[10px] text-slate-400">Aug 16, 2026 • MTN MoMo (UGX 18,500)</p>
                    </div>
                    <span className="text-emerald-400 font-bold">PAID</span>
                  </div>
                  <div className="p-3.5 bg-slate-800/40 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white">East Africa Invitational Match Pass</span>
                      <p className="text-[10px] text-slate-400">Aug 10, 2026 • M-Pesa (KES 260)</p>
                    </div>
                    <span className="text-emerald-400 font-bold">PAID</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Streaming Ingest & Data Saver Mode */}
          {activeTab === 'streaming' && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="font-black text-lg text-white tracking-tight border-b border-slate-800 pb-3">
                Broadcasting & Bandwidth Preferences
              </h3>

              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Zap className="w-5 h-5 text-amber-400" />
                    <div>
                      <h4 className="font-bold text-xs text-white">Mobile Data Saver Mode</h4>
                      <p className="text-[11px] text-slate-300">
                        Limits video resolution to 360p / audio-optimized (&lt;1MB/min) for 3G/4G cellular hotspots.
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={lowDataMode}
                    onChange={(e) => setLowDataMode(e.target.checked)}
                    className="w-5 h-5 accent-amber-500 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono-code">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">Default Playback Stream Quality</label>
                  <select
                    value={lowDataMode ? 'Data-Saver' : '1080p60'}
                    disabled={lowDataMode}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-400 disabled:opacity-50"
                  >
                    <option value="4K UHD">4K UHD (60 FPS Ultra)</option>
                    <option value="1080p60">1080p60 (Source)</option>
                    <option value="720p">720p (Adaptive Bandwidth)</option>
                    <option value="Data-Saver">Data Saver (360p Low Bandwidth)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Technical & Server Nodes */}
          {activeTab === 'technical' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="font-black text-lg text-white tracking-tight">
                  Regional CDN Edge & Low-Latency Relay Nodes
                </h3>
                <p className="text-xs text-slate-400">
                  Select the nearest datacenter to reduce stream buffer delays and gaming ping
                </p>
              </div>

              <div className="space-y-2.5">
                {REGIONAL_SERVER_NODES.map((node) => (
                  <div
                    key={node.id}
                    onClick={() => setSelectedServer(node.id)}
                    className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                      selectedServer === node.id
                        ? 'bg-sky-500/10 border-sky-400 shadow-md'
                        : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="text-2xl">{node.flag}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white">{node.city}, {node.country}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-mono-code font-bold">
                            {node.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono-code">Server Capacity: {node.load} loaded</p>
                      </div>
                    </div>

                    <div className="text-right font-mono-code">
                      <span className="font-bold text-emerald-400 text-sm">
                        {node.pingMs} ms
                      </span>
                      <span className="text-[10px] text-slate-400 block">Round-Trip Ping</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: Support & FAQs */}
          {activeTab === 'support' && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="font-black text-lg text-white tracking-tight border-b border-slate-800 pb-3">
                Help Center & Platform FAQs
              </h3>

              <div className="space-y-3">
                {PLATFORM_FAQS.map((faq, i) => (
                  <div key={i} className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800 space-y-1.5">
                    <h4 className="font-bold text-xs text-white flex items-center gap-2">
                      <HelpCircle className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                      <span>{faq.q}</span>
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed pl-5.5">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fallback for privacy & rewards */}
          {(activeTab === 'privacy' || activeTab === 'rewards') && (
            <div className="space-y-4 animate-fadeIn text-xs text-slate-300 font-mono-code">
              <h3 className="font-black text-lg text-white tracking-tight border-b border-slate-800 pb-3">
                {activeTab === 'privacy' ? 'Community & Privacy Guard' : 'GamiPress XP Badges & Rewards'}
              </h3>
              <p>
                Manage your notification alerts, two-factor authentication, and Gamipress milestone badges.
              </p>
              <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800 flex items-center justify-between">
                <span>Push Notifications for Favorite Live Streamers</span>
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  className="w-4 h-4 accent-sky-400 rounded"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
