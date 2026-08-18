import React, { useState } from 'react';
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
import confetti from 'canvas-confetti';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

export function App() {
  const [activeTab, setActiveTab] = useState<
    'live' | 'reels' | 'library' | 'tutorials' | 'games' | 'esports' | 'community' | 'store' | 'creator' | 'pricing' | 'settings' | 'about' | 'terms' | 'privacy' | 'support'
  >('live');

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
  const [searchQuery, setSearchQuery] = useState('');

  // Handle stream broadcast launch
  const handleStartBroadcast = (streamData: { title: string; game: string; resolution: string }) => {
    const newBroadcast: LiveStream = {
      id: 'stream_user_' + Date.now(),
      title: streamData.title,
      game: streamData.game,
      gameId: 'custom_game',
      streamer: {
        id: 'me',
        name: 'You (Creator Live)',
        handle: '@ProGamerLive',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
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
    setActiveTab('live');
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

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-200 flex flex-col font-sans selection:bg-[#38bdf8] selection:text-[#0b0e14] steam-grid-bg">
      {/* Sticky Top Header Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab as any}
        currentCurrency={currentCurrency}
        setCurrentCurrency={setCurrentCurrency}
        onOpenGoLive={() => setIsGoLiveOpen(true)}
        onOpenSubscribe={() => handleOpenPlanCheckout(SUBSCRIPTION_PLANS[1])}
        unreadNotifications={3}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
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
            onOpenCreator={() => setActiveTab('creator')}
          />
        )}

        {activeTab === 'library' && (
          <LibraryView
            currentCurrency={currentCurrency}
            isOfflineMode={isOfflineMode}
            setIsOfflineMode={setIsOfflineMode}
            onNavigateToTutorials={() => setActiveTab('tutorials')}
            onNavigateToReels={() => setActiveTab('reels')}
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
            onSelectCategory={(categoryId) => {
              setActiveTab('live');
            }}
          />
        )}

        {activeTab === 'esports' && (
          <EsportsView
            tournaments={MOCK_TOURNAMENTS}
            currentCurrency={currentCurrency}
            onOpenLiveTournamentStream={() => {
              setSelectedStream(liveStreams[0]);
              setActiveTab('live');
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
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onNavigateToTab={(tab) => setActiveTab(tab as any)}
          />
        )}

        {activeTab === 'terms' && (
          <AboutPolicyView initialSection="terms" />
        )}

        {activeTab === 'privacy' && (
          <AboutPolicyView initialSection="privacy" />
        )}

        {activeTab === 'support' && (
          <AboutPolicyView initialSection="about" />
        )}

        {activeTab === 'about' && (
          <AboutPolicyView initialSection="about" />
        )}
      </main>

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={() => setIsAuthModalOpen(false)}
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
