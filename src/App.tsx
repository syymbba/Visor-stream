import React, { lazy, Suspense, useState, useEffect } from 'react';
import {
  MOCK_LIVE_STREAMS,
  MOCK_TUTORIALS,
  MOCK_GAMES,
  MOCK_TOURNAMENTS,
  MOCK_COMMUNITY_POSTS,
  MOCK_STORE_ITEMS,
  MOCK_CREATOR_DASHBOARD,
  SUBSCRIPTION_PLANS
} from './data/mockData';
import { LiveStream, GamingTutorial, Currency, SubscriptionPlan, ReelClip, UserLibraryItem } from './types';
import { Navbar } from './components/Navbar';
import { OfflineBanner } from './components/OfflineBanner';
import { useWalletBalance } from './hooks/useWalletBalance';
import { useOfflineManager } from './hooks/useOfflineManager';
import type { FeatureId } from './components/FeatureInfoView';
import { auth, onAuthStateChanged, User } from './firebase';
import { getUserProfile, UserProfile } from './services/userService';
import confetti from 'canvas-confetti';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

const LandingPageView = lazy(() => import('./components/LandingPageView').then(({ LandingPageView }) => ({ default: LandingPageView })));
const LivePlayerView = lazy(() => import('./components/LivePlayerView').then(({ LivePlayerView }) => ({ default: LivePlayerView })));
const ReelsView = lazy(() => import('./components/ReelsView').then(({ ReelsView }) => ({ default: ReelsView })));
const LibraryView = lazy(() => import('./components/LibraryView').then(({ LibraryView }) => ({ default: LibraryView })));
const TutorialsView = lazy(() => import('./components/TutorialsView').then(({ TutorialsView }) => ({ default: TutorialsView })));
const GamesView = lazy(() => import('./components/GamesView').then(({ GamesView }) => ({ default: GamesView })));
const EsportsView = lazy(() => import('./components/EsportsView').then(({ EsportsView }) => ({ default: EsportsView })));
const CommunityView = lazy(() => import('./components/CommunityView').then(({ CommunityView }) => ({ default: CommunityView })));
const StoreView = lazy(() => import('./components/StoreView').then(({ StoreView }) => ({ default: StoreView })));
const CreatorStudioView = lazy(() => import('./components/CreatorStudioView').then(({ CreatorStudioView }) => ({ default: CreatorStudioView })));
const StreamOverlayWidget = lazy(() => import('./components/StreamOverlayWidget').then(({ StreamOverlayWidget }) => ({ default: StreamOverlayWidget })));
const PricingView = lazy(() => import('./components/PricingView').then(({ PricingView }) => ({ default: PricingView })));
const PricingModal = lazy(() => import('./components/PricingModal').then(({ PricingModal }) => ({ default: PricingModal })));
const SettingsView = lazy(() => import('./components/SettingsView').then(({ SettingsView }) => ({ default: SettingsView })));
const AboutPolicyView = lazy(() => import('./components/AboutPolicyView').then(({ AboutPolicyView }) => ({ default: AboutPolicyView })));
const PrivacyPolicyPage = lazy(() => import('./components/PrivacyPolicyPage').then(({ PrivacyPolicyPage }) => ({ default: PrivacyPolicyPage })));
const TermsOfServicePage = lazy(() => import('./components/TermsOfServicePage').then(({ TermsOfServicePage }) => ({ default: TermsOfServicePage })));
const FeatureInfoView = lazy(() => import('./components/FeatureInfoView').then(({ FeatureInfoView }) => ({ default: FeatureInfoView })));
const PaymentStatusView = lazy(() => import('./components/PaymentStatusView').then(({ PaymentStatusView }) => ({ default: PaymentStatusView })));
const PaymentHistory = lazy(() => import('./components/PaymentHistory').then(({ PaymentHistory }) => ({ default: PaymentHistory })));
const GoLiveModal = lazy(() => import('./components/GoLiveModal').then(({ GoLiveModal }) => ({ default: GoLiveModal })));
const NotificationsModal = lazy(() => import('./components/NotificationsModal').then(({ NotificationsModal }) => ({ default: NotificationsModal })));
const AuthModal = lazy(() => import('./components/AuthModal').then(({ AuthModal }) => ({ default: AuthModal })));

function PageLoader() {
  return <div className="min-h-[12rem]" aria-busy="true" />;
}

type AppTab =
  | 'landing'
  | 'live'
  | 'reels'
  | 'library'
  | 'tutorials'
  | 'games'
  | 'esports'
  | 'community'
  | 'store'
  | 'creator'
  | 'overlay'
  | 'pricing'
  | 'settings'
  | 'about'
  | 'terms'
  | 'privacy'
  | 'support'
  | 'payment-status'
  | 'payments'
  | 'features-high-fps-streaming'
  | 'features-game-vault-sync'
  | 'features-vertical-feed'
  | 'features-creator-monetization'
  | 'features-creative-tools'
  | 'features-ai-clips';

export function App() {
  // Parse initial route from URL path or hash
  const getInitialTabFromUrl = (): AppTab => {
    const path = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
    const hash = window.location.hash.toLowerCase().replace(/^#/, '');
    const search = window.location.search;

    if (path === '/overlay' || hash === 'overlay') return 'overlay';
    if (
      path === '/payment-status' ||
      hash === 'payment-status' ||
      search.includes('OrderTrackingId') ||
      search.includes('trackingId') ||
      search.includes('payment=')
    ) {
      return 'payment-status';
    }
    if (path === '/payments' || hash === 'payments' || path === '/history') return 'payments';
    if (path.startsWith('/features') || hash.startsWith('features-') || hash.startsWith('feature-')) {
      const featId = (hash || path).replace(/^(\/|#)?(features-|feature-|features\/)/, '');
      const validFeat = `features-${featId}` as AppTab;
      return validFeat;
    }
    if (path === '/privacy' || hash === 'privacy') return 'privacy';
    if (path === '/terms' || hash === 'terms') return 'terms';
    if (path === '/about' || hash === 'about') return 'about';
    if (path === '/feed' || path === '/live' || hash === 'live' || hash === 'feed') return 'live';
    if (path === '/reels' || hash === 'reels') return 'reels';
    if (path === '/store' || hash === 'store') return 'store';
    if (path === '/games' || hash === 'games') return 'games';
    if (path === '/esports' || hash === 'esports') return 'esports';
    if (path === '/community' || hash === 'community') return 'community';
    if (path === '/creator' || hash === 'creator') return 'creator';
    if (path === '/pricing' || hash === 'pricing') return 'pricing';
    if (path === '/settings' || hash === 'settings') return 'settings';
    if (path === '/landing' || hash === 'landing') return 'landing';

    // Default root path: start as landing until auth state verifies
    return 'landing';
  };

  const [activeTab, setActiveTab] = useState<AppTab>(getInitialTabFromUrl());
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Real-Time Dynamic Wallet Balance Hook
  const wallet = useWalletBalance({ userId: currentUser?.uid, enabled: Boolean(currentUser) });

  // Offline Mode Manager Hook
  const offlineManager = useOfflineManager();

  const [currentCurrency, setCurrentCurrency] = useState<Currency>('UGX');
  const [showBalanceInHeader, setShowBalanceInHeader] = useState(true);
  const [userBalanceUSD, setUserBalanceUSD] = useState(0);

  // Sync wallet balance
  useEffect(() => {
    setUserBalanceUSD(wallet.balanceUSD);
  }, [wallet.balanceUSD]);

  const [liveStreams, setLiveStreams] = useState<LiveStream[]>(MOCK_LIVE_STREAMS);
  const [tutorials, setTutorials] = useState<GamingTutorial[]>(MOCK_TUTORIALS);
  const [selectedStream, setSelectedStream] = useState<LiveStream>(MOCK_LIVE_STREAMS[0]);
  const [selectedTutorial, setSelectedTutorial] = useState<GamingTutorial>(MOCK_TUTORIALS[0]);

  // Modals state
  const [isGoLiveOpen, setIsGoLiveOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [selectedPlanForModal, setSelectedPlanForModal] = useState<SubscriptionPlan>(SUBSCRIPTION_PLANS[1]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentNotice, setPaymentNotice] = useState<{ status: 'success' | 'pending' | 'error'; orderId?: string; amount?: string; currency?: string } | null>(null);
  const [paymentCallbackData, setPaymentCallbackData] = useState<{
    orderTrackingId?: string | null;
    merchantReference?: string | null;
    statusParam?: 'success' | 'pending' | 'error' | 'failed' | 'cancelled' | null;
    initialAmount?: string | null;
    initialCurrency?: string | null;
    statusCode?: string | null;
    statusDesc?: string | null;
    errorCode?: string | null;
    errorMessage?: string | null;
    paymentMethod?: string | null;
  } | null>(null);

  // Check URL parameters for Pesapal payment callback outcomes
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentStatus = urlParams.get('payment') as any;
      const trackingId = urlParams.get('OrderTrackingId') || urlParams.get('orderTrackingId') || urlParams.get('trackingId');
      const orderId = urlParams.get('orderId') || urlParams.get('OrderMerchantReference') || urlParams.get('orderMerchantReference') || undefined;
      const amount = urlParams.get('amount') || undefined;
      const currency = urlParams.get('currency') || undefined;
      const statusCode = urlParams.get('statusCode') || undefined;
      const statusDesc = urlParams.get('statusDesc') || undefined;
      const errorCode = urlParams.get('errorCode') || undefined;
      const errorMessage = urlParams.get('errorMessage') || urlParams.get('message') || undefined;
      const paymentMethod = urlParams.get('paymentMethod') || undefined;

      if (paymentStatus || trackingId || orderId) {
        setPaymentCallbackData({
          orderTrackingId: trackingId,
          merchantReference: orderId,
          statusParam: paymentStatus,
          initialAmount: amount,
          initialCurrency: currency,
          statusCode,
          statusDesc,
          errorCode,
          errorMessage,
          paymentMethod,
        });

        if (paymentStatus === 'success') {
          setPaymentNotice({ status: 'success', orderId, amount, currency });
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
          });
        } else if (paymentStatus === 'pending') {
          setPaymentNotice({ status: 'pending', orderId, amount, currency });
        } else if (paymentStatus === 'error' || paymentStatus === 'failed' || paymentStatus === 'cancelled') {
          setPaymentNotice({ status: 'error', orderId });
        }
      }
    } catch (e) {
      console.warn('Payment callback query error:', e);
    }
  }, []);


  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
        } catch (err) {
          console.error('Error loading user profile:', err);
        }

        // Returning authenticated user on root URL `/` -> auto-bypass landing page and go to live feed
        const path = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
        const hash = window.location.hash.toLowerCase().replace(/^#/, '');
        if ((path === '/' || path === '' || hash === '') && activeTab === 'landing') {
          setActiveTab('live');
        }
      } else {
        setUserProfile(null);
        // If guest on root URL, ensure landing page is shown
        const path = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
        if (path === '/' && activeTab === 'landing') {
          setActiveTab('landing');
        }
      }
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, []);

  // Sync URL history state when tab changes
  const handleNavigateTab = (tab: AppTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    let targetPath = '/';
    if (tab === 'landing') targetPath = '/';
    else if (tab === 'live') targetPath = '/feed';
    else if (tab === 'privacy') targetPath = '/privacy';
    else if (tab === 'terms') targetPath = '/terms';
    else if (tab === 'about') targetPath = '/about';
    else targetPath = `/${tab}`;

    if (window.location.pathname !== targetPath) {
      window.history.pushState({ tab }, '', targetPath);
    }
  };

  // Listen to browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setActiveTab(getInitialTabFromUrl());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handle stream broadcast launch
  const handleStartBroadcast = (streamData: { title: string; game: string; resolution: string }) => {
    const newBroadcast: LiveStream = {
      id: 'stream_user_' + Date.now(),
      title: streamData.title,
      game: streamData.game,
      gameId: 'custom_game',
      streamer: {
        id: currentUser?.uid || 'me',
        name: currentUser?.displayName || 'You (Creator Live)',
        handle: currentUser ? `@${currentUser.displayName?.replace(/\s+/g, '').toLowerCase()}` : '@ProGamerLive',
        avatar: currentUser?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        verified: true,
        country: 'Uganda',
        countryCode: 'UG',
        countryFlag: '🇺🇬',
        subscribers: 250,
        bio: 'Live broadcast now streaming on Visor!',
        mobileMoneySupported: true,
      },
      viewersCount: 1,
      thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
      videoPreviewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      isLive: true,
      resolution: (streamData.resolution as any) || '1080p60',
      bitrate: '6000 Kbps',
      fps: 60,
      uptime: '00:00:15',
      tags: ['Live', streamData.game, 'Mobile Money'],
      description: 'Live broadcast active. Tips via MTN MoMo and M-Pesa enabled.',
    };

    setLiveStreams([newBroadcast, ...liveStreams]);
    setSelectedStream(newBroadcast);
    handleNavigateTab('live');
  };

  // Open Checkout Modal
  const handleOpenPlanCheckout = (plan: SubscriptionPlan) => {
    setSelectedPlanForModal(plan);
    setIsPricingModalOpen(true);
  };

  const handleSubscriptionSuccess = (plan: SubscriptionPlan) => {
    confetti({
      particleCount: 100,
      spread: 70,
    });
  };

  const openAuthLogin = () => {
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
  };

  const openAuthSignUp = () => {
    setAuthModalMode('signup');
    setIsAuthModalOpen(true);
  };

  // Standalone OBS / vMix Overlay View
  if (activeTab === 'overlay') {
    return (
      <Suspense fallback={<PageLoader />}>
        <div className="min-h-screen bg-transparent p-4 flex flex-col justify-start">
          <StreamOverlayWidget standalone={true} />
        </div>
      </Suspense>
    );
  }

  // Check if current view is public legal standalone page
  const isPublicLegal = activeTab === 'privacy' || activeTab === 'terms' || activeTab === 'about';
  // Privacy and Terms are dedicated, self-contained pages (required for Google
  // OAuth verification: each must be its own page with no access to other app
  // content), separate from the "About" info page which still uses the
  // tabbed AboutPolicyView.
  const isStandaloneLegalDoc = activeTab === 'privacy' || activeTab === 'terms';

  // Check if current view is public feature deep-dive page
  const isFeatureView = activeTab.startsWith('features-');
  const currentFeatureId: FeatureId = isFeatureView
    ? (activeTab.replace('features-', '') as FeatureId)
    : 'high-fps-streaming';

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0b0e14]" />}>
      <div className="min-h-screen bg-[#0b0e14] text-slate-200 flex flex-col font-sans selection:bg-[#38bdf8] selection:text-[#0b0e14] steam-grid-bg">
      
      {/* 1. PUBLIC LANDING PAGE (Shown for guest visitors on root `/` or when Landing is selected) */}
      {activeTab === 'landing' && (
        <Suspense fallback={<PageLoader />}>
          <LandingPageView
            isAuthenticated={Boolean(currentUser)}
            userDisplayName={currentUser?.displayName}
            userAvatar={currentUser?.photoURL}
            onOpenLogin={openAuthLogin}
            onOpenSignUp={openAuthSignUp}
            onEnterApp={() => handleNavigateTab('live')}
            onSelectStream={(stream) => {
              setSelectedStream(stream);
              handleNavigateTab('live');
            }}
            onNavigateLegal={(section) => handleNavigateTab(section as AppTab)}
            onNavigateTab={(tab) => handleNavigateTab(tab as AppTab)}
            onSelectFeature={(featureId) => handleNavigateTab(`features-${featureId}` as AppTab)}
          />
        </Suspense>
      )}

      {/* 2a. STANDALONE PRIVACY POLICY / TERMS OF SERVICE PAGES
          Each is its own dedicated, fully self-contained page (no navbar, no
          tab-switcher, no access to any other app content) so they satisfy
          Google OAuth verification's requirement for a standalone, publicly
          accessible privacy policy / terms of service document. When a
          signed-in user reaches these from inside the app (e.g. Settings >
          Support & Legal), onBackToApp gives them a way back without a full
          page reload. */}
      {activeTab === 'privacy' && (
        <Suspense fallback={<PageLoader />}>
          <PrivacyPolicyPage onBackToApp={currentUser ? () => handleNavigateTab('live') : undefined} />
        </Suspense>
      )}
      {activeTab === 'terms' && (
        <Suspense fallback={<PageLoader />}>
          <TermsOfServicePage onBackToApp={currentUser ? () => handleNavigateTab('live') : undefined} />
        </Suspense>
      )}

      {/* 2b. PUBLIC "ABOUT" INFO PAGE (Directly accessible without forcing login) */}
      {isPublicLegal && !isStandaloneLegalDoc && (
        <div>
          <Suspense fallback={<PageLoader />}>
            <AboutPolicyView
              initialSection={activeTab as any}
              isStandalone={true}
              onBackToLanding={() => handleNavigateTab('landing')}
              onBackToApp={currentUser ? () => handleNavigateTab('live') : undefined}
              onEnterApp={() => handleNavigateTab('live')}
              onNavigateLegal={(section) => handleNavigateTab(section)}
            />
          </Suspense>
        </div>
      )}

      {/* 3. PUBLIC FEATURE DEEP-DIVE PAGES (Architecture, Ingest Specs & Live HUD details) */}
      {isFeatureView && (
        <div>
          <Suspense fallback={<PageLoader />}>
            <FeatureInfoView
              featureId={currentFeatureId}
              onBackToLanding={() => handleNavigateTab('landing')}
              onSelectFeature={(id) => handleNavigateTab(`features-${id}` as AppTab)}
              onEnterApp={() => handleNavigateTab('live')}
            />
          </Suspense>
        </div>
      )}

      {/* 4. MAIN WEB APPLICATION DASHBOARD & FEED (Rendered for authenticated users or active app tabs) */}
      {activeTab !== 'landing' && !isPublicLegal && !isFeatureView && (
        <>
          {/* Sticky Top Header Navigation */}
          <Navbar
            activeTab={activeTab}
            setActiveTab={(tab) => handleNavigateTab(tab as AppTab)}
            currentCurrency={currentCurrency}
            setCurrentCurrency={setCurrentCurrency}
            onOpenGoLive={() => setIsGoLiveOpen(true)}
            onOpenSubscribe={() => handleOpenPlanCheckout(SUBSCRIPTION_PLANS[1])}
            unreadNotifications={3}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onOpenAuthModal={openAuthLogin}
            userBalanceUSD={userBalanceUSD}
            showBalanceInHeader={showBalanceInHeader}
            onToggleBalanceVisibility={() => setShowBalanceInHeader(!showBalanceInHeader)}
            isOfflineMode={offlineManager.isOfflineMode}
            onToggleOfflineMode={() => offlineManager.toggleOfflineMode()}
          />

          {/* Offline Mode Banner Alert */}
          <OfflineBanner
            isOffline={offlineManager.isOfflineMode}
            onDisableOffline={() => offlineManager.toggleOfflineMode(false)}
            onNavigateToLibrary={() => handleNavigateTab('library')}
          />

          {/* Main Content Viewport */}
          <main className="flex-1 max-w-[1720px] w-full mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-6">
            {/* Pesapal Payment Settlement Notification Banner */}
            {paymentNotice && (
              <div
                className={`mb-6 p-4 rounded-2xl border flex items-center justify-between shadow-2xl animate-fadeIn ${
                  paymentNotice.status === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                    : paymentNotice.status === 'pending'
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                    : 'bg-red-500/10 border-red-500/40 text-red-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base ${
                      paymentNotice.status === 'success'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : paymentNotice.status === 'pending'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {paymentNotice.status === 'success' ? '✓' : paymentNotice.status === 'pending' ? '⏳' : '✕'}
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-white flex items-center gap-2">
                      <span>
                        {paymentNotice.status === 'success'
                          ? 'Payment Confirmed & Membership Activated!'
                          : paymentNotice.status === 'pending'
                          ? 'Payment Processing...'
                          : 'Payment Unsuccessful'}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 font-mono-code">
                        70% Direct to Creator
                      </span>
                    </h4>
                    <p className="text-xs text-slate-300 font-mono-code mt-0.5">
                      {paymentNotice.status === 'success'
                        ? `Transaction ${paymentNotice.orderId ? `(${paymentNotice.orderId})` : ''} settled successfully. Instant streamer allocation credited.`
                        : paymentNotice.status === 'pending'
                        ? 'Your transaction is being confirmed by your mobile provider. Your balance will update automatically.'
                        : 'The payment could not be finalized. Please try again or choose another payment rail.'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setPaymentNotice(null)}
                  className="p-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-mono-code transition-colors"
                >
                  Dismiss
                </button>
              </div>
            )}

            <Suspense fallback={<PageLoader />}>
              {activeTab === 'live' && (
                <LivePlayerView
                  currentStream={selectedStream}
                  allStreams={liveStreams}
                  onSelectStream={setSelectedStream}
                  currentCurrency={currentCurrency}
                  userTier={(userProfile?.proGamerTier as any) || 'free'}
                  onOpenSubscribe={() => handleOpenPlanCheckout(SUBSCRIPTION_PLANS[1])}
                  isOfflineMode={offlineManager.isOfflineMode}
                  onNavigateToLibrary={() => handleNavigateTab('library')}
                />
              )}

              {activeTab === 'reels' && (
                <ReelsView
                  currentCurrency={currentCurrency}
                  onSaveToLibrary={() => {}}
                  onOpenCreator={() => handleNavigateTab('creator')}
                />
              )}

              {activeTab === 'library' && (
                <LibraryView
                  currentCurrency={currentCurrency}
                  isOfflineMode={offlineManager.isOfflineMode}
                  setIsOfflineMode={offlineManager.toggleOfflineMode}
                  onNavigateToTutorials={() => handleNavigateTab('tutorials')}
                  onNavigateToReels={() => handleNavigateTab('reels')}
                />
              )}

              {activeTab === 'tutorials' && (
                <TutorialsView
                  tutorials={tutorials}
                  selectedTutorial={selectedTutorial}
                  onSelectTutorial={setSelectedTutorial}
                  currentCurrency={currentCurrency}
                  onOpenSubscribe={() => handleOpenPlanCheckout(SUBSCRIPTION_PLANS[1])}
                />
              )}

              {activeTab === 'games' && (
                <GamesView
                  games={MOCK_GAMES}
                  onSelectCategory={() => {
                    handleNavigateTab('live');
                  }}
                />
              )}

              {activeTab === 'esports' && (
                <EsportsView
                  tournaments={MOCK_TOURNAMENTS}
                  currentCurrency={currentCurrency}
                  onOpenLiveTournamentStream={() => {
                    setSelectedStream(liveStreams[0]);
                    handleNavigateTab('live');
                  }}
                />
              )}

              {activeTab === 'community' && (
                <CommunityView
                  posts={MOCK_COMMUNITY_POSTS}
                  onOpenSubscribe={() => handleOpenPlanCheckout(SUBSCRIPTION_PLANS[1])}
                />
              )}

              {activeTab === 'store' && (
                <StoreView
                  items={MOCK_STORE_ITEMS}
                  currentCurrency={currentCurrency}
                />
              )}

              {activeTab === 'creator' && (
                <CreatorStudioView
                  stats={MOCK_CREATOR_DASHBOARD}
                  currentCurrency={currentCurrency}
                  onStartBroadcast={() => setIsGoLiveOpen(true)}
                />
              )}

              {activeTab === 'pricing' && (
                <PricingView
                  currentCurrency={currentCurrency}
                  setCurrentCurrency={setCurrentCurrency}
                  onSubscribePlan={handleOpenPlanCheckout}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsView
                  currentCurrency={currentCurrency}
                  setCurrentCurrency={setCurrentCurrency}
                  showBalanceInHeader={showBalanceInHeader}
                  setShowBalanceInHeader={setShowBalanceInHeader}
                  onOpenSubscribe={() => handleOpenPlanCheckout(SUBSCRIPTION_PLANS[1])}
                  onOpenAuthModal={openAuthLogin}
                  onNavigateToTab={(tab) => handleNavigateTab(tab as AppTab)}
                />
              )}

              {activeTab === 'payments' && (
                <PaymentHistory
                  currentCurrency={currentCurrency}
                  userId={currentUser?.uid}
                />
              )}

              {activeTab === 'payment-status' && (
                <PaymentStatusView
                  orderTrackingId={paymentCallbackData?.orderTrackingId}
                  merchantReference={paymentCallbackData?.merchantReference}
                  statusParam={paymentCallbackData?.statusParam}
                  initialAmount={paymentCallbackData?.initialAmount}
                  initialCurrency={paymentCallbackData?.initialCurrency}
                  statusCode={paymentCallbackData?.statusCode}
                  statusDesc={paymentCallbackData?.statusDesc}
                  errorCode={paymentCallbackData?.errorCode}
                  errorMessage={paymentCallbackData?.errorMessage}
                  paymentMethod={paymentCallbackData?.paymentMethod}
                  onNavigateHome={() => handleNavigateTab('live')}
                  onNavigateStudio={() => handleNavigateTab('creator')}
                  onNavigateLive={() => handleNavigateTab('live')}
                  onTryAgain={() => handleOpenPlanCheckout(SUBSCRIPTION_PLANS[1])}
                />
              )}
            </Suspense>
          </main>
        </>
      )}

      {/* Global Modals */}
      {isAuthModalOpen && (
        <Suspense fallback={null}>
          <AuthModal
            isOpen
            initialMode={authModalMode}
            onClose={() => setIsAuthModalOpen(false)}
            onAuthSuccess={(profile) => {
              setUserProfile(profile);
              setIsAuthModalOpen(false);
              if (activeTab === 'landing') {
                handleNavigateTab('live');
              }
            }}
          />
        </Suspense>
      )}

      {isGoLiveOpen && (
        <Suspense fallback={null}>
          <GoLiveModal
            isOpen
            onClose={() => setIsGoLiveOpen(false)}
            onStartBroadcast={handleStartBroadcast}
          />
        </Suspense>
      )}

      {isPricingModalOpen && (
        <Suspense fallback={null}>
          <PricingModal
            isOpen
            onClose={() => setIsPricingModalOpen(false)}
            selectedPlan={selectedPlanForModal}
            currentCurrency={currentCurrency}
            onSuccess={handleSubscriptionSuccess}
          />
        </Suspense>
      )}

      {isNotificationsOpen && (
        <Suspense fallback={null}>
          <NotificationsModal
            isOpen
            onClose={() => setIsNotificationsOpen(false)}
          />
        </Suspense>
      )}

      {/* Vercel Web Analytics */}
      <Analytics />
      <SpeedInsights />
      </div>
    </Suspense>
  );
}

export default App;
