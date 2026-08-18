import React, { useState, useEffect } from 'react';
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
import { LandingPageView } from './components/LandingPageView';
import { LivePlayerView } from './components/LivePlayerView';
import { ReelsView } from './components/ReelsView';
import { LibraryView } from './components/LibraryView';
import { TutorialsView } from './components/TutorialsView';
import { GamesView } from './components/GamesView';
import { EsportsView } from './components/EsportsView';
import { CommunityView } from './components/CommunityView';
import { StoreView } from './components/StoreView';
import { CreatorStudioView } from './components/CreatorStudioView';
import { PricingView } from './components/PricingView';
import { PricingModal } from './components/PricingModal';
import { SettingsView } from './components/SettingsView';
import { AboutPolicyView } from './components/AboutPolicyView';
import { GoLiveModal } from './components/GoLiveModal';
import { NotificationsModal } from './components/NotificationsModal';
import { AuthModal } from './components/AuthModal';
import { auth, onAuthStateChanged, User } from './firebase';
import { getUserProfile, UserProfile } from './services/userService';
import confetti from 'canvas-confetti';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

type AppTab = 'landing' | 'live' | 'reels' | 'library' | 'tutorials' | 'games' | 'esports' | 'community' | 'store' | 'creator' | 'pricing' | 'settings' | 'about' | 'terms' | 'privacy' | 'support';

export function App() {
  // Parse initial route from URL path or hash
  const getInitialTabFromUrl = (): AppTab => {
    const path = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
    const hash = window.location.hash.toLowerCase().replace(/^#/, '');

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

  const [currentCurrency, setCurrentCurrency] = useState<Currency>('UGX');
  const [showBalanceInHeader, setShowBalanceInHeader] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [userBalanceUSD, setUserBalanceUSD] = useState(245.50);

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

  // Check if current view is public legal standalone page
  const isPublicLegal = activeTab === 'privacy' || activeTab === 'terms' || activeTab === 'about';

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-200 flex flex-col font-sans selection:bg-[#38bdf8] selection:text-[#0b0e14] steam-grid-bg">
      
      {/* 1. PUBLIC LANDING PAGE (Shown for guest visitors on root `/` or when Landing is selected) */}
      {activeTab === 'landing' && (
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
        />
      )}

      {/* 2. PUBLIC LEGAL PAGES (Directly accessible without forcing login) */}
      {isPublicLegal && (
        <div>
          <AboutPolicyView
            initialSection={activeTab as any}
            isStandalone={true}
            onBackToLanding={() => handleNavigateTab('landing')}
            onEnterApp={() => handleNavigateTab('live')}
          />
        </div>
      )}

      {/* 3. MAIN WEB APPLICATION DASHBOARD & FEED (Rendered for authenticated users or active app tabs) */}
      {activeTab !== 'landing' && !isPublicLegal && (
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
          />

          {/* Main Content Viewport */}
          <main className="flex-1 max-w-[1720px] w-full mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-6">
            {activeTab === 'live' && (
              <LivePlayerView
                currentStream={selectedStream}
                allStreams={liveStreams}
                onSelectStream={setSelectedStream}
                currentCurrency={currentCurrency}
                onOpenSubscribe={() => handleOpenPlanCheckout(SUBSCRIPTION_PLANS[1])}
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
                isOfflineMode={isOfflineMode}
                setIsOfflineMode={setIsOfflineMode}
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
          </main>
        </>
      )}

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
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

      <GoLiveModal
        isOpen={isGoLiveOpen}
        onClose={() => setIsGoLiveOpen(false)}
        onStartBroadcast={handleStartBroadcast}
      />

      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        selectedPlan={selectedPlanForModal}
        currentCurrency={currentCurrency}
        onSuccess={handleSubscriptionSuccess}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      {/* Vercel Web Analytics */}
      <Analytics />
      <SpeedInsights />
    </div>
  );
}

export default App;

