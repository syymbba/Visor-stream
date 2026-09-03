import React, { useState, useEffect, useRef } from 'react';
import { REGIONAL_SERVER_NODES, PLATFORM_FAQS, MOCK_CONNECTED_ACCOUNTS, MOCK_USER_BADGES, MOCK_ACHIEVEMENTS, CURRENCY_RATES } from '../data/mockData';
import { Currency, UserBadge, Achievement } from '../types';
import { ToggleSwitch } from './ToggleSwitch';
import { AccountDeletionPanel } from './AccountDeletionPanel';
import { LinkedAccountsPanel } from './LinkedAccountsPanel';
import { useLanguage, SUPPORTED_LANGUAGES, Language } from '../lib/i18n';
import {
  auth,
  signOut,
  getAuthHeaders
} from '../firebase';
import { useAuth } from '../hooks/useAuth';
import {
  fetchUserProfile, 
  saveUserProfile, 
  DEFAULT_USER_PROFILE, 
  UserProfile 
} from '../services/userService';
import { useWalletBalance } from '../hooks/useWalletBalance';
import { useMyStream } from '../hooks/useMyStream';
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
  Loader2,
  Camera,
  Upload,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Lock,
  Download,
  FileText,
  Mail,
  ChevronLeft,
  ChevronRight,
  Sliders,
  DollarSign,
  Wallet,
  Layers,
  Sparkles,
  Radio,
  Server,
  Languages,
  Check
} from 'lucide-react';

interface SettingsViewProps {
  currentCurrency: Currency;
  setCurrentCurrency: (curr: Currency) => void;
  showBalanceInHeader: boolean;
  setShowBalanceInHeader: (show: boolean) => void;
  onOpenSubscribe: () => void;
  onOpenAuthModal?: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentCurrency,
  setCurrentCurrency,
  showBalanceInHeader,
  setShowBalanceInHeader,
  onOpenSubscribe,
  onOpenAuthModal,
  onNavigateToTab
}) => {
  const { language, setLanguage, t } = useLanguage();

  const [activeTab, setActiveTab] = useState<
    'account' | 'language' | 'payments' | 'streaming' | 'integrations' | 'privacy' | 'gamification' | 'technical' | 'support'
  >('account');

  // Mobile Drilldown state: when on small screens and a category is chosen
  const [mobileDrilldownOpen, setMobileDrilldownOpen] = useState(false);

  const { currentUser, userProfile } = useAuth();
  // Real Mux live stream (RTMP URL + secret stream key + status), backed by
  // GET /api/streams/me - shared with CreatorStudioView and GoLiveModal via
  // the same useMyStream() hook, replacing the Firestore-seeded mock fields
  // (`profile.streamKey`/`profile.rtmpServer`) that used to populate this tab.
  const myStream = useMyStream({ enabled: Boolean(currentUser) });
  const [isRegeneratingKey, setIsRegeneratingKey] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form Fields
  const [username, setUsername] = useState(DEFAULT_USER_PROFILE.displayName);
  const [email, setEmail] = useState(DEFAULT_USER_PROFILE.email);
  const [bio, setBio] = useState(DEFAULT_USER_PROFILE.bio);
  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_USER_PROFILE.photoURL);
  const [networkProvider, setNetworkProvider] = useState<'mtn' | 'airtel' | 'mpesa' | 'card'>(DEFAULT_USER_PROFILE.networkProvider);
  const [mobileNumber, setMobileNumber] = useState(DEFAULT_USER_PROFILE.mobileNumber);
  const [lowDataMode, setLowDataMode] = useState(DEFAULT_USER_PROFILE.lowDataMode);
  const [notificationsEnabled, setNotificationsEnabled] = useState(DEFAULT_USER_PROFILE.notificationsEnabled);

  // Privacy Fields
  const [profileVisibility, setProfileVisibility] = useState<'public' | 'friends' | 'private'>(DEFAULT_USER_PROFILE.privacyProfileVisibility || 'public');
  const [directMessages, setDirectMessages] = useState<'everyone' | 'subs' | 'nobody'>(DEFAULT_USER_PROFILE.privacyDirectMessages || 'everyone');
  // Two-factor auth state is now backend-authoritative (real TOTP, verified
  // server-side on every payout request) rather than a client-only boolean -
  // see /api/auth/2fa/* in server.ts. `twoFactorEnabled` here mirrors the
  // backend's current status; `twoFactorSetup` holds the in-progress
  // enrollment (secret + otpauth URI) between /2fa/setup and /2fa/verify.
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorSetup, setTwoFactorSetup] = useState<{ secret: string; otpauthUrl: string } | null>(null);
  const [twoFactorCodeInput, setTwoFactorCodeInput] = useState('');
  const [twoFactorDisableCodeInput, setTwoFactorDisableCodeInput] = useState('');
  const [twoFactorBusy, setTwoFactorBusy] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);
  const [blockedUsers, setBlockedUsers] = useState<string[]>(DEFAULT_USER_PROFILE.blockedUsers || ['toxic_troll99', 'spambot_ke']);
  const [newBlockedUser, setNewBlockedUser] = useState('');

  // Streaming & Ingest Fields. streamKey/rtmpServer are no longer
  // Firestore-seeded mock fields - they're rendered straight from
  // myStream.stream (GET /api/streams/me) below. Ultra Low-Latency Mode is
  // now also read/written straight from myStream.stream.latencyMode (a real
  // Mux per-live-stream setting) rather than a client-only profile boolean -
  // see handleToggleLowLatency below. The old Adaptive Bitrate Cap control
  // was removed entirely: Mux's API has no way to cap a creator's outgoing
  // OBS bitrate, so there was nothing real to wire it to.
  const [showStreamKey, setShowStreamKey] = useState(false);
  const [isSavingLatency, setIsSavingLatency] = useState(false);
  const [copiedStreamKey, setCopiedStreamKey] = useState(false);
  const [copiedRtmp, setCopiedRtmp] = useState(false);

  // Payment methods: cards are collected only on Pesapal's hosted checkout.
  // Never capture PAN/CVV in this SPA.

  const [userBadges] = useState<UserBadge[]>(MOCK_USER_BADGES);
  const [achievements] = useState<Achievement[]>(MOCK_ACHIEVEMENTS);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const user = currentUser;
      if (user) {
        setIsLoading(true);
        const fetched = await fetchUserProfile(user.uid);
        if (cancelled) return;
        if (fetched) {
          setProfile(fetched);
          setUsername(fetched.displayName || '');
          setEmail(fetched.email || user.email || '');
          setBio(fetched.bio || '');
          setAvatarUrl(fetched.photoURL || user.photoURL || DEFAULT_USER_PROFILE.photoURL);
          setNetworkProvider(fetched.networkProvider || 'mtn');
          setMobileNumber(fetched.mobileNumber || '');
          setLowDataMode(fetched.lowDataMode ?? false);
          setNotificationsEnabled(fetched.notificationsEnabled ?? true);
          setProfileVisibility(fetched.privacyProfileVisibility || 'public');
          setDirectMessages(fetched.privacyDirectMessages || 'everyone');
          setBlockedUsers(fetched.blockedUsers || ['toxic_troll99', 'spambot_ke']);
        } else {
          setUsername(user.displayName || user.email?.split('@')[0] || 'VisorGamer');
          setEmail(user.email || '');
          setAvatarUrl(user.photoURL || DEFAULT_USER_PROFILE.photoURL);
        }
        setIsLoading(false);
      } else {
        setProfile(DEFAULT_USER_PROFILE);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  // Load the real, backend-authoritative 2FA status whenever the signed-in
  // user changes (separate from the Firestore profile fetch above, since 2FA
  // state now lives in Postgres and is never exposed via Firestore).
  useEffect(() => {
    if (!currentUser) {
      setTwoFactorEnabled(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/auth/2fa/status', { headers: await getAuthHeaders() });
        const data = await res.json();
        if (!cancelled && data?.success) {
          setTwoFactorEnabled(Boolean(data.enabled));
        }
      } catch (err) {
        console.warn('Could not load 2FA status:', err);
      }
    })();
    return () => { cancelled = true; };
  }, [currentUser]);

  const handleStartTwoFactorSetup = async () => {
    setTwoFactorError(null);
    setTwoFactorBusy(true);
    try {
      const res = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Could not start 2FA setup');
      }
      setTwoFactorSetup({ secret: data.secret, otpauthUrl: data.otpauthUrl });
      setTwoFactorCodeInput('');
    } catch (err: any) {
      setTwoFactorError(err.message || 'Could not start 2FA setup');
    } finally {
      setTwoFactorBusy(false);
    }
  };

  const handleConfirmTwoFactorSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFactorError(null);
    setTwoFactorBusy(true);
    try {
      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
        body: JSON.stringify({ token: twoFactorCodeInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid verification code');
      }
      setTwoFactorEnabled(true);
      setTwoFactorSetup(null);
      setTwoFactorCodeInput('');
      showToast('Two-factor authentication enabled! Payouts now require a code from your authenticator app.');
    } catch (err: any) {
      setTwoFactorError(err.message || 'Invalid verification code');
    } finally {
      setTwoFactorBusy(false);
    }
  };

  const handleDisableTwoFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFactorError(null);
    setTwoFactorBusy(true);
    try {
      const res = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
        body: JSON.stringify({ token: twoFactorDisableCodeInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Could not disable 2FA');
      }
      setTwoFactorEnabled(false);
      setTwoFactorDisableCodeInput('');
      showToast('Two-factor authentication disabled.');
    } catch (err: any) {
      setTwoFactorError(err.message || 'Could not disable 2FA');
    } finally {
      setTwoFactorBusy(false);
    }
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image is larger than 5MB. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        setAvatarUrl(result);
        const updated: UserProfile = {
          ...profile,
          photoURL: result,
          uid: currentUser ? currentUser.uid : 'guest'
        };
        const saved = await saveUserProfile(updated);
        if (saved) {
          setProfile(updated);
          showToast('Profile photo updated and synced!');
        } else {
          showToast('Could not save your photo right now. Please try again.');
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Optional event param: called from the Account tab's <form onSubmit>
  // (which passes a real FormEvent) as well as from a plain onClick Save
  // button on the Payments and Privacy tabs (called with no event at all),
  // so every tab with persistable fields shares this one save path instead
  // of duplicating the save logic per tab.
  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsLoading(true);

    const updated: UserProfile = {
      ...profile,
      uid: currentUser ? currentUser.uid : 'guest',
      displayName: username,
      email,
      bio,
      photoURL: avatarUrl,
      networkProvider,
      mobileNumber,
      lowDataMode,
      notificationsEnabled,
      privacyProfileVisibility: profileVisibility,
      privacyDirectMessages: directMessages,
      blockedUsers,
      showBalanceInHeader
    };

    const saved = await saveUserProfile(updated);
    setIsLoading(false);
    if (saved) {
      setProfile(updated);
      setSaveSuccess(true);
      showToast('Settings saved and synchronized with Cloud database!');
      setTimeout(() => setSaveSuccess(false), 3500);
    } else {
      showToast('Failed to save settings. Please check your connection and try again.');
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setProfile(DEFAULT_USER_PROFILE);
    showToast('Signed out successfully.');
  };

  const handleRegenerateKey = async () => {
    setIsRegeneratingKey(true);
    try {
      await myStream.regenerateKey();
      showToast('New stream key generated!');
    } catch (err: any) {
      showToast(err?.message || 'Could not regenerate stream key. Please try again.');
    } finally {
      setIsRegeneratingKey(false);
    }
  };

  const handleCopy = (text: string, type: 'key' | 'rtmp') => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    if (type === 'key') {
      setCopiedStreamKey(true);
      setTimeout(() => setCopiedStreamKey(false), 2000);
    } else {
      setCopiedRtmp(true);
      setTimeout(() => setCopiedRtmp(false), 2000);
    }
    showToast(`${type === 'key' ? 'Stream Key' : 'RTMP URL'} copied to clipboard!`);
  };

  // Wires "Ultra Low-Latency Mode" to Mux's real per-live-stream
  // `latency_mode` setting via PATCH /api/streams/me, instead of the old
  // client-only profile boolean that was never actually saved (lowLatencyMode
  // was excluded from CLIENT_WRITABLE_PROFILE_FIELDS). ON maps to Mux's
  // `'low'` (LL-HLS) latency mode, OFF restores `'standard'`.
  const handleToggleLowLatency = async (checked: boolean) => {
    setIsSavingLatency(true);
    try {
      await myStream.updateMeta({ latencyMode: checked ? 'low' : 'standard' });
      showToast(checked ? 'Ultra low-latency mode enabled for your stream.' : 'Standard latency mode restored.');
    } catch (err: any) {
      showToast(err?.message || 'Could not update latency mode. Please try again.');
    } finally {
      setIsSavingLatency(false);
    }
  };

  const handleAddBlockedUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockedUser.trim()) return;
    if (blockedUsers.includes(newBlockedUser.trim())) {
      showToast('User is already blocked');
      return;
    }
    setBlockedUsers(prev => [...prev, newBlockedUser.trim()]);
    setNewBlockedUser('');
    showToast('User added to blocked list');
  };

  const handleUnblockUser = (name: string) => {
    setBlockedUsers(prev => prev.filter(u => u !== name));
    showToast(`Unblocked ${name}`);
  };

  const { balanceUSD: liveBalanceUSD, formattedBalance: liveFormattedBalance } = useWalletBalance({
    userId: currentUser?.uid,
    enabled: Boolean(currentUser),
    pollIntervalMs: 15000,
    currentCurrency,
  });

  const handleDownloadUserDataArchive = () => {
    const archiveData = {
      user: {
        uid: profile.uid,
        displayName: username,
        email,
        bio,
        balanceUSD: liveBalanceUSD || profile.balanceUSD || 0,
        currency: currentCurrency,
        level: gamificationLevel,
        xp: gamificationXp,
        networkProvider,
        mobileNumber,
        profileVisibility,
        directMessages,
        twoFactorEnabled,
        blockedUsers,
      },
      exportTimestamp: new Date().toISOString(),
      platform: 'Visor Stream Pro',
      version: '2.5.0-steam-slate'
    };

    const blob = new Blob([JSON.stringify(archiveData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `visor-data-archive-${username || 'user'}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('JSON Data archive downloaded!');
  };

  // Real, backend-authoritative level/XP (see UserProfile.userLevel/userXp
  // in src/services/userService.ts) rather than the hardcoded "24" /
  // "4,850 / 5,000 XP" literals this tab used to render for every user.
  // Mux/the backend have no per-level XP curve yet, so 5,000 XP-per-level is
  // a display-only scaling constant (matches the original Steam-style design
  // intent) used purely to draw the progress bar - not a fetched value.
  const gamificationLevel = userProfile?.userLevel ?? DEFAULT_USER_PROFILE.userLevel ?? 1;
  const gamificationXp = userProfile?.userXp ?? DEFAULT_USER_PROFILE.userXp ?? 0;
  const gamificationXpPerLevel = 5000;
  const gamificationXpIntoLevel = gamificationXp % gamificationXpPerLevel;
  const gamificationProgressPct = Math.min(100, Math.round((gamificationXpIntoLevel / gamificationXpPerLevel) * 100));

  const tabs = [
    { id: 'account', label: 'Account & Profile', icon: User, desc: 'Profile photo, gamer tag, email & cloud sync' },
    { id: 'language', label: t('settings.lang_tab'), icon: Languages, desc: t('settings.lang_tab_desc') },
    { id: 'payments', label: 'Cards & Wallet', icon: CreditCard, desc: 'Visa/Mastercard, Mobile Money & Balance' },
    { id: 'streaming', label: 'Streaming Ingest', icon: Video, desc: 'RTMP stream keys & low-latency mode' },
    { id: 'integrations', label: 'Connected Accounts', icon: Layers, desc: 'Discord, Steam, Twitch, Xbox, PlayStation' },
    { id: 'privacy', label: 'Privacy & 2FA', icon: Shield, desc: 'Visibility, blocked users, direct messages' },
    { id: 'gamification', label: 'XP & Badges', icon: Award, desc: `Level ${gamificationLevel}, badges, achievements & flair` },
    { id: 'technical', label: 'Edge Network', icon: Globe, desc: 'Nairobi & Kampala low-latency servers' },
    { id: 'support', label: 'Support & Legal', icon: HelpCircle, desc: 'Contact developer, Terms, Privacy Policy' },
  ];

  const rate = CURRENCY_RATES[currentCurrency]?.rate || 1;
  const symbol = CURRENCY_RATES[currentCurrency]?.symbol || '$';
  const balanceUSD = liveBalanceUSD || profile.balanceUSD || 0;
  const formattedBalance = liveFormattedBalance || (balanceUSD * rate).toLocaleString(undefined, {
    minimumFractionDigits: currentCurrency === 'UGX' || currentCurrency === 'TZS' ? 0 : 2,
    maximumFractionDigits: currentCurrency === 'UGX' || currentCurrency === 'TZS' ? 0 : 2,
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#171a21] border border-[#38bdf8] text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-2xl animate-fadeIn flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#38bdf8]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Settings Header Banner */}
      <div className="steam-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#2a475e]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#1b2838] text-[#38bdf8] flex items-center justify-center border border-[#2a475e] shadow-[0_0_15px_rgba(56,189,248,0.2)]">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white font-rajdhani uppercase tracking-wide">
                Visor Settings & Account
              </h1>
              <p className="text-xs text-slate-400">
                Full-featured control center for account security, payment cards, stream ingest, and edge routing.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Account Balance Widget */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1b2838] border border-[#2a475e] rounded-xl text-xs font-mono-code">
              <Wallet className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span className="text-slate-400">Balance:</span>
              <strong className="text-white">{symbol}{formattedBalance}</strong>
            </div>

            {currentUser ? (
              <button
                onClick={handleSignOut}
                className="px-3.5 py-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('settings.sign_out')}</span>
              </button>
            ) : (
              onOpenAuthModal && (
                <button
                  onClick={onOpenAuthModal}
                  className="px-3.5 py-2 rounded-xl bg-[#38bdf8] text-[#0b0e14] font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md hover:bg-[#66c0f4] transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Main Settings Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar Navigation (Desktop view or Mobile Overview) */}
        <div className={`lg:col-span-4 space-y-1.5 steam-card p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-[#2a475e] h-fit shadow-xl ${
          mobileDrilldownOpen ? 'hidden lg:block' : 'block'
        }`}>
          <div className="px-3 py-2 text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono-code border-b border-[#2a475e]/60 mb-2">
            Settings Categories
          </div>

          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setMobileDrilldownOpen(true);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                  isActive
                    ? 'bg-[#0284c7]/10 text-sky-300 border border-[#0369a1]/35 shadow-[0_0_10px_rgba(2,132,199,0.12)]'
                    : 'text-slate-300 hover:bg-[#1b2838] hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                  <div>
                    <div className="text-xs font-bold">{tab.label}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[190px]">{tab.desc}</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 lg:hidden" />
              </button>
            );
          })}
        </div>

        {/* Right Content Panel (Desktop + Mobile Full-page drilldown) */}
        <div className={`lg:col-span-8 steam-card p-4 sm:p-7 rounded-2xl sm:rounded-3xl border border-[#2a475e] shadow-xl space-y-6 ${
          mobileDrilldownOpen ? 'block' : 'hidden lg:block'
        }`}>
          {/* Mobile Back button header on small screens */}
          <div className="flex items-center justify-between pb-3 border-b border-[#2a475e] lg:hidden">
            <button
              onClick={() => setMobileDrilldownOpen(false)}
              className="flex items-center gap-1.5 text-xs font-bold text-[#38bdf8] hover:underline"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Settings</span>
            </button>
            <span className="text-xs font-mono-code uppercase font-bold text-slate-400">
              {tabs.find(t => t.id === activeTab)?.label}
            </span>
          </div>

          {/* TAB 1: Account Management & Profile Photo */}
          {activeTab === 'account' && (
            <form onSubmit={handleSave} className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-[#2a475e] pb-4">
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-white">
                    Gamer Profile & Cloud Identity
                  </h3>
                  <p className="text-xs text-slate-400">Manage avatar, display identity, and bio</p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 rounded-xl bg-[#38bdf8] text-[#0b0e14] hover:bg-[#66c0f4] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 disabled:opacity-50 transition-all"
                >
                  {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{isLoading ? t('settings.saving') : t('settings.save')}</span>
                </button>
              </div>

              {/* Profile Avatar Upload Section */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-[#0b0e14] rounded-2xl border border-[#2a475e]">
                <div className="relative group shrink-0">
                  <img
                    src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt="Avatar"
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-[#38bdf8] shadow-lg"
                    referrerPolicy="no-referrer"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/60 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Change profile picture"
                  >
                    <Camera className="w-5 h-5 text-[#38bdf8]" />
                    <span className="text-[9px] font-bold mt-1">Upload</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                    className="hidden"
                  />
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-[#1b2838] border border-[#2a475e] hover:border-[#38bdf8] text-xs font-bold text-slate-200 rounded-xl flex items-center gap-1.5 transition-all"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#38bdf8]" />
                      <span>Choose Avatar Image</span>
                    </button>
                    <span className="text-[11px] text-slate-400 font-mono-code">PNG, JPG or WebP up to 5MB</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Or paste direct image URL..."
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#171a21] border border-[#2a475e] rounded-xl text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-[#38bdf8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono-code">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Gamer Handle / Display Name</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0b0e14] border border-[#2a475e] rounded-xl text-xs text-white focus:outline-none focus:border-[#38bdf8]"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Account Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0b0e14] border border-[#2a475e] rounded-xl text-xs text-white focus:outline-none focus:border-[#38bdf8]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Player Bio / Stream Description</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-[#0b0e14] border border-[#2a475e] rounded-xl text-xs text-white focus:outline-none focus:border-[#38bdf8]"
                  placeholder="Tell viewers about your main games, stream schedule, or clan..."
                />
              </div>

              <div className="p-4 bg-[#0b0e14] rounded-2xl border border-[#2a475e] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Low-Bandwidth Data Saver Mode</h4>
                  <p className="text-[11px] text-slate-400">Restricts live feeds to 720p to conserve mobile data</p>
                </div>
                <ToggleSwitch
                  checked={lowDataMode}
                  onChange={setLowDataMode}
                />
              </div>

              {/* Quick Language Switcher card inside Account profile */}
              <div className="p-4 bg-[#0b0e14] rounded-2xl border border-[#2a475e] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sky-400">
                    <Languages className="w-4 h-4" />
                    <span className="text-xs font-bold text-white">Interface Language & Region</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('language')}
                    className="text-xs text-sky-400 hover:underline font-bold"
                  >
                    View All Dialects →
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SUPPORTED_LANGUAGES.map((langOption) => {
                    const isSelected = language === langOption.code;
                    return (
                      <button
                        key={langOption.code}
                        type="button"
                        onClick={() => {
                          setLanguage(langOption.code);
                          showToast(`${t('settings.lang_applied')} ${langOption.nativeName}`);
                        }}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                          isSelected
                            ? 'bg-[#0284c7]/10 border-[#0369a1]/40 text-sky-300 shadow-[0_0_10px_rgba(2,132,199,0.12)]'
                            : 'bg-[#171a21] border-[#2a475e] text-slate-300 hover:bg-[#1b2838]'
                        }`}
                      >
                        <span className="text-lg">{langOption.flag}</span>
                        <div className="truncate">
                          <div className="text-xs font-bold truncate">{langOption.nativeName}</div>
                          <div className="text-[10px] text-slate-400 truncate">{langOption.name}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: Language Switcher & Localization */}
          {activeTab === 'language' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-[#2a475e] pb-4">
                <h3 className="font-bold text-base sm:text-lg text-white flex items-center gap-2">
                  <Languages className="w-5 h-5 text-[#38bdf8]" />
                  <span>{t('settings.lang_select_title')}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {t('settings.lang_select_desc')}
                </p>
              </div>

              {/* Language Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SUPPORTED_LANGUAGES.map((langOption) => {
                  const isSelected = language === langOption.code;
                  return (
                    <div
                      key={langOption.code}
                      onClick={() => {
                        setLanguage(langOption.code);
                        showToast(`${t('settings.lang_applied')} ${langOption.nativeName}`);
                      }}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#0284c7]/10 border-[#0369a1]/40 text-sky-300 shadow-[0_0_15px_rgba(2,132,199,0.15)] ring-1 ring-[#0369a1]/30'
                          : 'bg-[#0b0e14] border-[#2a475e] text-slate-300 hover:bg-[#1b2838]'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{langOption.flag}</span>
                          <div>
                            <div className="font-bold text-sm text-white flex items-center gap-2">
                              <span>{langOption.nativeName}</span>
                              <span className="text-[10px] font-mono-code uppercase px-1.5 py-0.5 rounded bg-[#171a21] text-slate-400 border border-[#2a475e]">
                                {langOption.code}
                              </span>
                            </div>
                            <div className="text-xs text-slate-300">{langOption.name}</div>
                          </div>
                        </div>

                        {isSelected ? (
                          <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full border border-slate-700 bg-[#171a21]" />
                        )}
                      </div>

                      <div className="mt-3 pt-3 border-t border-[#2a475e]/60 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-mono-code">{langOption.region}</span>
                        <span className="text-sky-400 font-semibold italic">"{langOption.greeting}"</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Regional Formatting & Currency Note Card */}
              <div className="p-4 bg-[#0b0e14] rounded-2xl border border-[#2a475e] space-y-3">
                <div className="flex items-center gap-2 text-[#38bdf8]">
                  <Globe className="w-4 h-4" />
                  <h4 className="font-bold text-xs text-white uppercase font-mono-code">
                    Regional Localization & Dialect Engine
                  </h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Visor Stream delivers seamless multilingual accessibility across global gaming hubs, featuring dedicated support for Swahili (Kenya, Tanzania), Luganda (Uganda), French (DRC, Rwanda, France), Portuguese (Angola, Mozambique, Portugal), and Arabic (MENA). Changing your language automatically adapts live stream badges, donation tip jar units, and studio creator telemetry.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1 font-mono-code text-xs">
                  <span className="px-2.5 py-1 rounded-xl bg-[#171a21] border border-[#2a475e] text-slate-300">
                    Active Locale: <strong className="text-sky-300">{language.toUpperCase()}</strong>
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-[#171a21] border border-[#2a475e] text-slate-300">
                    Active Currency: <strong className="text-emerald-400">{currentCurrency}</strong>
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-[#171a21] border border-[#2a475e] text-slate-300">
                    Encoding: <strong className="text-sky-300">UTF-8 Full Unicode</strong>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Payment Cards, Wallet & Balance */}
          {activeTab === 'payments' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-[#2a475e] pb-4">
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-white">
                    Cards, Mobile Money & Financial Balance
                  </h3>
                  <p className="text-xs text-slate-400">Manage payment methods, display currency and balances</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onOpenSubscribe}
                    className="px-3.5 py-2 rounded-xl bg-[#38bdf8] text-[#0b0e14] font-bold text-xs flex items-center gap-1.5 hover:bg-[#66c0f4]"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Pay with Pesapal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSave()}
                    disabled={isLoading}
                    className="px-4 py-2 rounded-xl bg-[#38bdf8] text-[#0b0e14] hover:bg-[#66c0f4] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 disabled:opacity-50 transition-all"
                  >
                    {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{isLoading ? t('settings.saving') : t('settings.save')}</span>
                  </button>
                </div>
              </div>

              {/* Balance Widget & Header Toggle */}
              <div className="p-4 bg-[#0b0e14] rounded-2xl border border-[#2a475e] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/30">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono-code uppercase text-slate-400 font-semibold">Account Balance</span>
                    <h2 className="text-2xl font-black text-white font-mono-code">
                      {symbol}{formattedBalance}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono-code text-slate-300">Show Balance in Header</span>
                  <ToggleSwitch
                    checked={showBalanceInHeader}
                    onChange={setShowBalanceInHeader}
                    size="sm"
                  />
                </div>
              </div>

              {/* Currency Selector */}
              <div className="p-4 bg-[#0b0e14] rounded-2xl border border-[#2a475e] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase font-mono-code">Display Currency</span>
                  <span className="text-[10px] font-mono-code text-slate-400">Real-time exchange conversion</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(Object.keys(CURRENCY_RATES) as Currency[]).map(curr => (
                    <button
                      key={curr}
                      onClick={() => {
                        setCurrentCurrency(curr);
                        showToast(`Display currency changed to ${curr}`);
                      }}
                      className={`p-2.5 rounded-xl text-xs font-mono-code font-bold text-center border transition-all ${
                        currentCurrency === curr
                          ? 'bg-[#0284c7]/10 border-[#0369a1]/40 text-sky-300 shadow-[0_0_10px_rgba(2,132,199,0.12)]'
                          : 'bg-[#171a21] border-[#2a475e] text-slate-300 hover:bg-[#1b2838]'
                      }`}
                    >
                      <div>{curr}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{CURRENCY_RATES[curr].symbol}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-[#0b0e14] rounded-2xl border border-[#2a475e] space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase font-mono-code">Card Payments</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Card numbers and CVV are never collected or stored in Visor Stream. When you subscribe or send a tip, Pesapal&apos;s hosted checkout collects those details directly so the platform stays out of PCI cardholder-data scope.
                </p>
              </div>

              {/* Mobile Money Settings Form */}
              <div className="p-4 bg-[#0b0e14] rounded-2xl border border-[#2a475e] space-y-3 font-mono-code">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase">Mobile Money Account Configuration</span>
                  <span className="text-[10px] text-emerald-400 font-bold">INSTANT SETTLEMENT</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">Primary Provider</label>
                    <select
                      value={networkProvider}
                      onChange={(e) => setNetworkProvider(e.target.value as any)}
                      className="w-full px-3 py-2 bg-[#171a21] border border-[#2a475e] rounded-xl text-xs text-white focus:border-[#38bdf8] focus:outline-none"
                    >
                      <option value="mtn">🇺🇬 MTN Mobile Money (Uganda)</option>
                      <option value="airtel">🔴 Airtel Money (Mobile Wallet)</option>
                      <option value="mpesa">🇰🇪 Safaricom M-Pesa (Kenya)</option>
                      <option value="card">International Cards</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">Payout Phone Number</label>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="+256 780 123 456"
                      className="w-full px-3 py-2 bg-[#171a21] border border-[#2a475e] rounded-xl text-xs text-white focus:border-[#38bdf8] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Streaming & Ingest Settings */}
          {activeTab === 'streaming' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-[#2a475e] pb-4">
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-white">
                    Stream Ingest & OBS Studio Configuration
                  </h3>
                  <p className="text-xs text-slate-400">RTMP keys, low-latency edge servers and bitrate caps</p>
                </div>
                <button
                  onClick={handleRegenerateKey}
                  disabled={!myStream.stream || isRegeneratingKey}
                  className="px-3 py-1.5 rounded-xl bg-[#1b2838] border border-[#2a475e] hover:border-[#38bdf8] text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#38bdf8] ${isRegeneratingKey ? 'animate-spin' : ''}`} />
                  <span>Regenerate Key</span>
                </button>
              </div>

              {/* Stream Key Field */}
              <div className="space-y-2 font-mono-code">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>RTMP Stream Key (Keep Private)</span>
                  <button
                    type="button"
                    onClick={() => setShowStreamKey(!showStreamKey)}
                    className="text-[11px] text-[#38bdf8] flex items-center gap-1"
                  >
                    {showStreamKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showStreamKey ? 'Hide' : 'Reveal'}</span>
                  </button>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type={showStreamKey ? 'text' : 'password'}
                    value={myStream.isLoading ? 'Loading…' : myStream.stream?.muxStreamKey || '—'}
                    readOnly
                    className="flex-1 px-3.5 py-2.5 bg-[#0b0e14] border border-[#2a475e] rounded-xl text-xs text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(myStream.stream?.muxStreamKey || '', 'key')}
                    disabled={!myStream.stream}
                    className="px-4 py-2.5 bg-[#38bdf8] text-[#0b0e14] rounded-xl font-bold text-xs hover:bg-[#66c0f4] flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedStreamKey ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* RTMP Server URL - real Mux ingest URL from GET
                  /api/streams/me. Mux uses one fixed global RTMP endpoint,
                  so this is now read-only rather than freely editable. */}
              <div className="space-y-2 font-mono-code">
                <label className="text-xs font-bold text-slate-300">Primary Ingest Server URL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={myStream.isLoading ? 'Loading…' : myStream.stream?.rtmpUrl || '—'}
                    className="flex-1 px-3.5 py-2.5 bg-[#0b0e14] border border-[#2a475e] rounded-xl text-xs text-white focus:outline-none focus:border-[#38bdf8]"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(myStream.stream?.rtmpUrl || '', 'rtmp')}
                    disabled={!myStream.stream}
                    className="px-4 py-2.5 bg-[#1b2838] border border-[#2a475e] hover:border-[#38bdf8] text-slate-200 rounded-xl font-bold text-xs flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Copy className="w-3.5 h-3.5 text-[#38bdf8]" />
                    <span>{copiedRtmp ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Ultra Low-Latency Mode - wired to Mux's real per-live-stream
                  latency_mode via PATCH /api/streams/me (see
                  handleToggleLowLatency). The old "Adaptive Bitrate Cap"
                  control was removed: Mux's API has no way to cap a
                  creator's outgoing OBS bitrate, so it had nothing real to
                  connect to - that's an OBS-side setting only. */}
              <div className="p-4 bg-[#0b0e14] rounded-2xl border border-[#2a475e] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Ultra Low-Latency Mode</h4>
                  <p className="text-[11px] text-slate-400">Sub-second delay for live chat reactions (Mux LL-HLS)</p>
                </div>
                <ToggleSwitch
                  checked={myStream.stream?.latencyMode === 'low'}
                  onChange={handleToggleLowLatency}
                  disabled={!myStream.stream || myStream.isLoading || isSavingLatency}
                />
              </div>
            </div>
          )}

          {/* TAB 4: Third-Party Account Integrations. No real OAuth flow
              exists for any of these platforms yet (would need a registered
              developer app + credentials per platform - PlayStation in
              particular isn't realistically available to an indie project),
              so every card is a non-interactive "Coming Soon" placeholder
              rather than a Connect button that flips fake local state. */}
          {activeTab === 'integrations' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-[#2a475e] pb-4">
                <h3 className="font-bold text-base sm:text-lg text-white">
                  Third-Party Gaming & Platform Connections
                </h3>
                <p className="text-xs text-slate-400">
                  Discord, Steam, Twitch, Xbox, PlayStation and more are planned integrations - account linking isn&apos;t live yet, so nothing below is connected.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {MOCK_CONNECTED_ACCOUNTS.map(account => (
                  <div
                    key={account.id}
                    className="p-4 bg-[#0b0e14] border border-[#2a475e] rounded-2xl flex items-center justify-between gap-3 text-xs opacity-75"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#171a21] border border-[#2a475e] flex items-center justify-center font-bold text-[#38bdf8] text-sm">
                        {account.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white">{account.name}</div>
                        <div className="text-[11px] font-mono-code text-slate-400">{account.handle}</div>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[9px] font-mono-code font-bold uppercase tracking-wider">
                      Coming Soon
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: Privacy & 2FA */}
          {activeTab === 'privacy' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-[#2a475e] pb-4">
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-white">
                    Privacy, Security & Two-Factor Authentication
                  </h3>
                  <p className="text-xs text-slate-400">Account visibility, direct messages, and blocked users</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSave()}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-xl bg-[#38bdf8] text-[#0b0e14] hover:bg-[#66c0f4] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 disabled:opacity-50 transition-all"
                >
                  {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{isLoading ? t('settings.saving') : t('settings.save')}</span>
                </button>
              </div>

              <div className="space-y-4">
                {/* 2FA - real backend-verified TOTP, not a cosmetic toggle */}
                <div className="p-4 bg-[#0b0e14] rounded-2xl border border-[#2a475e] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-[#0284c7]/10 text-sky-400 border border-[#0369a1]/30">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Two-Factor Authentication (2FA)</h4>
                        <p className="text-[11px] text-slate-400">
                          {twoFactorEnabled
                            ? 'Enabled - a verification code is required to request payouts'
                            : 'Protect your creator channel and payouts with authenticator codes'}
                        </p>
                      </div>
                    </div>
                    <ToggleSwitch
                      checked={twoFactorEnabled}
                      onChange={(checked) => {
                        setTwoFactorError(null);
                        if (checked) {
                          handleStartTwoFactorSetup();
                        } else {
                          setTwoFactorSetup(null);
                          setTwoFactorDisableCodeInput('__pending__'); // opens the disable confirmation panel below
                        }
                      }}
                    />
                  </div>

                  {twoFactorError && (
                    <p className="text-[11px] text-rose-400 font-mono-code">{twoFactorError}</p>
                  )}

                  {/* Enrollment panel: shown after starting setup, until confirmed */}
                  {twoFactorSetup && (
                    <form onSubmit={handleConfirmTwoFactorSetup} className="pt-3 border-t border-[#2a475e]/60 space-y-3 animate-fadeIn">
                      <p className="text-[11px] text-slate-300">
                        Scan this in your authenticator app (Google Authenticator, Authy, 1Password, etc.),
                        or enter the code manually, then confirm with a 6-digit code to finish enabling 2FA.
                      </p>
                      <div className="p-2.5 bg-[#171a21] border border-[#2a475e] rounded-xl font-mono-code text-[11px] text-sky-300 break-all">
                        {twoFactorSetup.secret}
                      </div>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="6-digit code"
                        value={twoFactorCodeInput}
                        onChange={(e) => setTwoFactorCodeInput(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3 py-2 bg-[#171a21] border border-[#2a475e] rounded-xl text-xs text-white font-mono-code focus:outline-none focus:border-[#38bdf8]"
                        required
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => { setTwoFactorSetup(null); setTwoFactorError(null); }}
                          className="px-3 py-1.5 bg-[#1b2838] text-slate-300 rounded-xl hover:bg-slate-700 text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={twoFactorBusy || twoFactorCodeInput.length !== 6}
                          className="px-3 py-1.5 bg-sky-500 text-slate-950 font-bold rounded-xl hover:bg-sky-400 text-xs disabled:opacity-50"
                        >
                          {twoFactorBusy ? 'Verifying...' : 'Confirm & Enable'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Disable confirmation panel */}
                  {twoFactorEnabled && twoFactorDisableCodeInput !== '' && (
                    <form onSubmit={handleDisableTwoFactor} className="pt-3 border-t border-[#2a475e]/60 space-y-3 animate-fadeIn">
                      <p className="text-[11px] text-slate-300">
                        Enter a current 6-digit code from your authenticator app to disable 2FA.
                      </p>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="6-digit code"
                        value={twoFactorDisableCodeInput === '__pending__' ? '' : twoFactorDisableCodeInput}
                        onChange={(e) => setTwoFactorDisableCodeInput(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3 py-2 bg-[#171a21] border border-[#2a475e] rounded-xl text-xs text-white font-mono-code focus:outline-none focus:border-[#38bdf8]"
                        autoFocus
                        required
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => { setTwoFactorDisableCodeInput(''); setTwoFactorError(null); }}
                          className="px-3 py-1.5 bg-[#1b2838] text-slate-300 rounded-xl hover:bg-slate-700 text-xs"
                        >
                          Keep 2FA On
                        </button>
                        <button
                          type="submit"
                          disabled={twoFactorBusy || twoFactorDisableCodeInput.length !== 6}
                          className="px-3 py-1.5 bg-rose-500 text-slate-950 font-bold rounded-xl hover:bg-rose-400 text-xs disabled:opacity-50"
                        >
                          {twoFactorBusy ? 'Disabling...' : 'Disable 2FA'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Profile Visibility */}
                <div className="p-4 bg-[#0b0e14] rounded-2xl border border-[#2a475e] space-y-2">
                  <label className="text-xs font-bold text-white uppercase font-mono-code">Profile Visibility</label>
                  <select
                    value={profileVisibility}
                    onChange={(e) => setProfileVisibility(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#171a21] border border-[#2a475e] rounded-xl text-xs text-white focus:outline-none focus:border-[#38bdf8]"
                  >
                    <option value="public">Public (Visible to all viewers and search engines)</option>
                    <option value="friends">Followers & Clan Members Only</option>
                    <option value="private">Private (Hidden profile)</option>
                  </select>
                </div>

                {/* Direct Messages */}
                <div className="p-4 bg-[#0b0e14] rounded-2xl border border-[#2a475e] space-y-2">
                  <label className="text-xs font-bold text-white uppercase font-mono-code">Direct Message Restrictions</label>
                  <select
                    value={directMessages}
                    onChange={(e) => setDirectMessages(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#171a21] border border-[#2a475e] rounded-xl text-xs text-white focus:outline-none focus:border-[#38bdf8]"
                  >
                    <option value="everyone">Allow DMs from Everyone</option>
                    <option value="subs">Subscribers & Pro Members Only</option>
                    <option value="nobody">Nobody (Turn off Direct Messages)</option>
                  </select>
                </div>

                {/* Blocked Users Management */}
                <div className="p-4 bg-[#0b0e14] rounded-2xl border border-[#2a475e] space-y-3">
                  <label className="text-xs font-bold text-white uppercase font-mono-code">Blocked Users List</label>
                  <form onSubmit={handleAddBlockedUser} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter username to block..."
                      value={newBlockedUser}
                      onChange={(e) => setNewBlockedUser(e.target.value)}
                      className="flex-1 px-3 py-2 bg-[#171a21] border border-[#2a475e] rounded-xl text-xs text-white focus:outline-none focus:border-[#38bdf8]"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 bg-[#1b2838] border border-[#2a475e] hover:border-[#38bdf8] text-xs font-bold text-slate-200 rounded-xl"
                    >
                      Block
                    </button>
                  </form>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {blockedUsers.map(user => (
                      <span
                        key={user}
                        className="px-2.5 py-1 bg-[#171a21] border border-[#2a475e] rounded-lg text-xs text-slate-300 font-mono-code flex items-center gap-1.5"
                      >
                        <span>{user}</span>
                        <button
                          type="button"
                          onClick={() => handleUnblockUser(user)}
                          className="text-slate-400 hover:text-rose-400"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Data Export Button */}
                <div className="p-4 bg-[#0b0e14] rounded-2xl border border-[#2a475e] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">Download Account Data Archive</h4>
                    <p className="text-[11px] text-slate-400">Export your full activity log, stats, and profile in JSON format</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadUserDataArchive}
                    className="px-3.5 py-2 bg-[#1b2838] border border-[#2a475e] hover:border-[#38bdf8] text-xs font-bold text-[#38bdf8] rounded-xl flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export JSON</span>
                  </button>
                </div>

                {/* Linked Sign-In Methods (Google / Apple link-unlink) */}
                <LinkedAccountsPanel />

                {/* Account Deletion (Danger Zone) */}
                <AccountDeletionPanel onNavigateToTab={onNavigateToTab} />
              </div>
            </div>
          )}

          {/* TAB 6: Gamification & Badges */}
          {activeTab === 'gamification' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-[#2a475e] pb-4">
                <h3 className="font-bold text-base sm:text-lg text-white">
                  Gamification, Level Progression & Badges
                </h3>
                <p className="text-xs text-slate-400">Steam-style level progress, seasonal achievements and unlocked badges</p>
              </div>

              {/* Steam-Style Level Card - level/XP now come from the real,
                  backend-authoritative UserProfile.userLevel/userXp fields
                  (via useAuth().userProfile) instead of hardcoded literals.
                  RANK is still a hardcoded placeholder: there is no backend
                  "rank" concept anywhere in this codebase to compute it
                  from, so it's left as-is rather than fabricating a number. */}
              <div className="p-5 bg-gradient-to-r from-[#171a21] to-[#1b2838] border border-[#2a475e] rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#38bdf8]/15 border-2 border-[#38bdf8] flex items-center justify-center font-black text-lg text-[#38bdf8] font-rajdhani">
                      {gamificationLevel}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">Level {gamificationLevel} Master Streamer</h4>
                      <span className="text-[11px] font-mono-code text-slate-400">
                        {gamificationXpIntoLevel.toLocaleString()} / {gamificationXpPerLevel.toLocaleString()} XP ({gamificationProgressPct}% to Level {gamificationLevel + 1})
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono-code font-bold rounded">
                    RANK #12 REGIONAL MASTERS
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2.5 bg-[#0b0e14] rounded-full overflow-hidden border border-[#2a475e]">
                  <div className="h-full bg-[#38bdf8] rounded-full shadow-[0_0_10px_rgba(56,189,248,0.5)]" style={{ width: `${gamificationProgressPct}%` }} />
                </div>
              </div>

              {/* Badges Showcase */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white uppercase font-mono-code">Unlocked Badges</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {userBadges.map(badge => (
                    <div
                      key={badge.id}
                      className={`p-3 rounded-2xl border flex flex-col justify-between text-xs ${
                        badge.unlocked
                          ? 'bg-[#0b0e14] border-[#38bdf8]/50 shadow-[0_0_10px_rgba(56,189,248,0.1)]'
                          : 'bg-[#0b0e14]/50 border-[#2a475e]/40 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{badge.icon}</span>
                        <div>
                          <div className="font-bold text-white truncate">{badge.name}</div>
                          <div className="text-[9px] font-mono-code uppercase text-[#38bdf8]">{badge.rarity}</div>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2 line-clamp-2">{badge.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white uppercase font-mono-code">Season Achievements</h4>
                <div className="space-y-2">
                  {achievements.map(ach => (
                    <div
                      key={ach.id}
                      className="p-3 bg-[#0b0e14] border border-[#2a475e] rounded-xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{ach.icon}</span>
                        <div>
                          <div className="font-bold text-white">{ach.title}</div>
                          <div className="text-[10px] text-slate-400 font-mono-code">{ach.category} • +{ach.xp} XP</div>
                        </div>
                      </div>
                      {ach.completed ? (
                        <span className="text-emerald-400 text-xs font-bold flex items-center gap-1 font-mono-code">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Done
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs font-mono-code">
                          {ach.progress} / {ach.target}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: Regional Edge Nodes. Mux ingest is one fixed global
              anycast RTMP endpoint (rtmps://global-live.mux.com/app) - there
              is no real per-region routing to select, so these cards are now
              read-only reference info (no onClick, no "routed to X" toast,
              no selected/clickable affordance) rather than a fake region
              picker. */}
          {activeTab === 'technical' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-[#2a475e] pb-4">
                <h3 className="font-bold text-base sm:text-lg text-white">
                  Global Edge Network
                </h3>
                <p className="text-xs text-slate-400">
                  Visor Stream ingests over a single global endpoint - Mux automatically routes each viewer to their nearest edge, so there&apos;s no server to pick manually. Reference latency to nearby points of presence below.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {REGIONAL_SERVER_NODES.map(node => (
                  <div
                    key={node.id}
                    className="p-4 rounded-2xl border bg-[#0b0e14] border-[#2a475e] text-slate-300"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-white flex items-center gap-1.5">
                        <span>{node.flag}</span>
                        <span>{node.city}, {node.country}</span>
                      </span>
                      <span className="text-xs font-mono-code font-bold text-emerald-400">{node.pingMs}ms</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono-code text-slate-400 mt-2">
                      <span>Status: {node.status}</span>
                      <span>Load: {node.load}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: Support & Legal Documentation */}
          {activeTab === 'support' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-[#2a475e] pb-4">
                <h3 className="font-bold text-base sm:text-lg text-white">
                  Developer Support & Legal Compliance
                </h3>
                <p className="text-xs text-slate-400">Contact information, Terms of Service, and Privacy Policy</p>
              </div>

              {/* Developer Contact Card */}
              <div className="p-4 bg-[#0b0e14] rounded-2xl border border-[#2a475e] space-y-2">
                <div className="flex items-center gap-2 text-[#38bdf8]">
                  <Mail className="w-5 h-5" />
                  <h4 className="font-bold text-sm text-white">Developer Technical Contact</h4>
                </div>
                <p className="text-xs text-slate-300">
                  For platform inquiries, developer integration, or Google Workspace verification:
                </p>
                <div className="font-mono-code text-xs text-[#38bdf8] font-bold bg-[#171a21] p-2 rounded-xl border border-[#2a475e]">
                  syymbba@gmail.com
                </div>
              </div>

              {/* Legal Documentation Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div 
                  onClick={() => onNavigateToTab && onNavigateToTab('terms')}
                  className="p-4 bg-[#0b0e14] border border-[#2a475e] hover:border-[#38bdf8] rounded-2xl cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-5 h-5 text-[#38bdf8]" />
                    <div>
                      <div className="font-bold text-xs text-white">Terms of Service</div>
                      <div className="text-[10px] text-slate-400">Platform rules & subscriptions</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>

                <div 
                  onClick={() => onNavigateToTab && onNavigateToTab('privacy')}
                  className="p-4 bg-[#0b0e14] border border-[#2a475e] hover:border-[#38bdf8] rounded-2xl cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-5 h-5 text-[#38bdf8]" />
                    <div>
                      <div className="font-bold text-xs text-white">Privacy Policy</div>
                      <div className="text-[10px] text-slate-400">OAuth & Data governance</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* FAQs */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-white uppercase font-mono-code">Frequently Asked Questions</h4>
                <div className="space-y-2">
                  {PLATFORM_FAQS.slice(0, 3).map((faq, idx) => (
                    <div key={idx} className="p-3 bg-[#0b0e14] rounded-xl border border-[#2a475e] text-xs">
                      <div className="font-bold text-white mb-1">{faq.q}</div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
