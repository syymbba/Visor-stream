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
import { LiveStream, GamingTutorial, Currency, SubscriptionPlan } from './types';
import { Navbar } from './components/Navbar';
import { LivePlayerView } from './components/LivePlayerView';
import { TutorialsView } from './components/TutorialsView';
import { GamesView } from './components/GamesView';
import { EsportsView } from './components/EsportsView';
import { CommunityView } from './components/CommunityView';
import { StoreView } from './components/StoreView';
import { CreatorStudioView } from './components/CreatorStudioView';
import { GmailView } from './components/GmailView';
import { PricingView } from './components/PricingView';
import { PricingModal } from './components/PricingModal';
import { SettingsView } from './components/SettingsView';
import { AboutPolicyView } from './components/AboutPolicyView';
import { GoLiveModal } from './components/GoLiveModal';
import { NotificationsModal } from './components/NotificationsModal';
import { AuthModal } from './components/AuthModal';
import {
  Radio,
  BookOpen,
  Gamepad2,
  Trophy,
  Users,
  ShoppingBag,
  LayoutDashboard,
  CreditCard,
  Settings,
  Info,
  Mail
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function App() {
  const [activeTab, setActiveTab] = useState<
    'live' | 'tutorials' | 'games' | 'esports' | 'community' | 'gmail' | 'store' | 'creator' | 'pricing' | 'settings' | 'about'
  >('live');

  const [currentCurrency, setCurrentCurrency] = useState<Currency>('UGX');
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
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Main Navbar */}
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
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {activeTab === 'live' && (
          <LivePlayerView
            currentStream={selectedStream}
            allStreams={liveStreams}
            onSelectStream={setSelectedStream}
            currentCurrency={currentCurrency}
            onOpenSubscribe={() => handleOpenPlanCheckout(SUBSCRIPTION_PLANS[1])}
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

        {activeTab === 'gmail' && (
          <GmailView
            onNavigateToLive={() => setActiveTab('live')}
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
            onOpenSubscribe={() => handleOpenPlanCheckout(SUBSCRIPTION_PLANS[1])}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}

        {activeTab === 'about' && (
          <AboutPolicyView />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-3 left-3 right-3 z-40 bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl px-2 py-2 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => setActiveTab('live')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[10px] font-mono-code font-bold transition-all ${
            activeTab === 'live' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'text-slate-400'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Live</span>
        </button>

        <button
          onClick={() => setActiveTab('tutorials')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[10px] font-mono-code font-bold transition-all ${
            activeTab === 'tutorials' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'text-slate-400'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Guides</span>
        </button>

        <button
          onClick={() => setActiveTab('esports')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[10px] font-mono-code font-bold transition-all ${
            activeTab === 'esports' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Esports</span>
        </button>

        <button
          onClick={() => setActiveTab('creator')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[10px] font-mono-code font-bold transition-all ${
            activeTab === 'creator' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Studio</span>
        </button>

        <button
          onClick={() => setActiveTab('gmail')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[10px] font-mono-code font-bold transition-all ${
            activeTab === 'gmail' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-slate-400'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Gmail</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[10px] font-mono-code font-bold transition-all ${
            activeTab === 'settings' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-400'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </nav>

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
    </div>
  );
}

export default App;
