export type Currency = 'USD' | 'EUR' | 'UGX' | 'KES' | 'TZS';
export type Language = 'en' | 'sw' | 'lg' | 'fr' | 'pt' | 'ar';

export interface CreatorTipGoal {
  id: string;
  title: string;
  targetAmountUSD: number;
  currentAmountUSD: number;
  currency: Currency;
  description: string;
  active: boolean;
}

export interface CreatorTipItem {
  id: string;
  donorName: string;
  donorAvatar?: string;
  amountUSD: number;
  amountFormatted: string;
  currency: string;
  network: string;
  message: string;
  timestamp: string;
  badge?: string;
}

export interface CreatorTipJarConfig {
  enabled: boolean;
  minTipUSD: number;
  presetAmountsUSD: number[];
  bannerHeadline: string;
  thankYouMessage: string;
  soundAlertEnabled: boolean;
  confettiEnabled: boolean;
  activeGoal: CreatorTipGoal;
  recentTips: CreatorTipItem[];
}

export interface CardPaymentMethod {
  id: string;
  cardHolder: string;
  last4: string;
  expMonth: string;
  expYear: string;
  brand: 'visa' | 'mastercard';
  isDefault: boolean;
}

export interface ConnectedThirdPartyAccount {
  id: string;
  provider: 'discord' | 'twitch' | 'steam' | 'youtube' | 'epic' | 'xbox' | 'playstation';
  name: string;
  handle: string;
  connected: boolean;
  connectedAt?: string;
  avatar?: string;
}

export interface UserBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
  unlockedAt?: string;
}

export interface Achievement {
  id: string;
  title: string;
  category: string;
  xp: number;
  icon: string;
  completed: boolean;
  completedDate?: string;
  progress: number;
  target: number;
}

export interface ReelClip {
  id: string;
  title: string;
  creator: Streamer;
  game: string;
  videoUrl: string;
  posterUrl: string;
  views: number;
  likes: number;
  commentsCount: number;
  sharesCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  timestamp: string;
  duration: string;
  tags: string[];
}

export interface UserLibraryItem {
  id: string;
  title: string;
  type: 'downloaded' | 'saved' | 'created_vod';
  game: string;
  author: Streamer;
  duration: string;
  fileSize?: string;
  downloadedAt?: string;
  savedAt?: string;
  videoUrl: string;
  thumbnail: string;
  progressPercent?: number;
  isOfflineAvailable?: boolean;
}

export interface CreatorClip {
  id: string;
  title: string;
  game: string;
  duration: string;
  createdAt: string;
  views: number;
  thumbnail: string;
  videoUrl: string;
}

export interface Streamer {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  banner?: string;
  verified: boolean;
  country: string;
  countryCode: string;
  countryFlag: string;
  subscribers: number;
  bio: string;
  discordJoined?: boolean;
  mobileMoneySupported: boolean;
}

export interface LiveStream {
  id: string;
  title: string;
  streamer: Streamer;
  game: string;
  gameId: string;
  thumbnail: string;
  videoPreviewUrl: string;
  viewersCount: number;
  isLive: boolean;
  resolution: '720p' | '1080p60' | '4K UHD';
  bitrate: string;
  fps: number;
  uptime: string;
  tags: string[];
  chatSlowMode?: boolean;
  subscriberOnlyChat?: boolean;
  tierRequirement?: 'free' | 'fan' | 'pro' | 'legend';
  description: string;
}

export interface TutorialChapter {
  id: string;
  title: string;
  timestamp: string;
  durationSeconds: number;
}

export interface GamingTutorial {
  id: string;
  title: string;
  game: string;
  gameCategory: string;
  author: Streamer;
  thumbnail: string;
  videoUrl: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Pro' | 'Master';
  duration: string;
  views: number;
  rating: number;
  likes: number;
  missionName?: string;
  chapters: TutorialChapter[];
  description: string;
  keyTakeaways: string[];
  recommendedLoadout: string[];
  platform: 'PC' | 'Mobile' | 'Console' | 'Cross-Platform';
  updatedAt: string;
}

export interface GameCategory {
  id: string;
  name: string;
  cover: string;
  viewers: number;
  liveStreamsCount: number;
  genre: string;
  platforms: string[];
  trendingRank: number;
}

export interface TournamentMatch {
  id: string;
  teamA: string;
  teamB: string;
  scoreA?: number;
  scoreB?: number;
  time: string;
  stage: string;
}

export interface EsportsTournament {
  id: string;
  title: string;
  game: string;
  banner: string;
  prizePoolUSD: number;
  prizePoolFormatted: string;
  status: 'Live Now' | 'Upcoming' | 'Completed';
  startDate: string;
  region: string;
  registeredTeams: number;
  maxTeams: number;
  isPayPerView: boolean;
  ticketPriceUSD: number;
  matches: TournamentMatch[];
  organizer: string;
  sponsor: string;
}

export interface SubscriptionPlan {
  id: 'fan' | 'pro' | 'legend';
  name: string;
  badge: string;
  priceUSD: number;
  priceUGX: number;
  priceKES: number;
  priceTZS: number;
  accentColor: string;
  popular?: boolean;
  description: string;
  features: string[];
  payoutShareStreamer: number; // e.g. 0.70
}

export interface CommunityPost {
  id: string;
  author: Streamer;
  timestamp: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'clip';
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked?: boolean;
  badge?: string;
  clanTag?: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  avatar: string;
  badge?: 'VIP' | 'PRO' | 'MOD' | 'CREATOR' | 'FAN';
  text: string;
  timestamp: string;
  isDonation?: boolean;
  donationAmount?: string;
  donationCurrency?: string;
  donationMessage?: string;
}

export interface CreatorDashboardStats {
  streamTitle: string;
  gameCategory: string;
  streamKey: string;
  serverIngestUrl: string;
  currentViewers: number;
  peakViewers: number;
  averageViewers: number;
  followersGainedToday: number;
  totalSubscribers: number;
  liveBitrateKbps: number;
  frameDropRate: number;
  streamHealth: 'Excellent' | 'Good' | 'Fair' | 'Degraded';
  fps: number;
  cpuLoad: number;
  uptimeSeconds: number;
  revenueThisMonthUSD: number;
  payoutBreakdown: {
    fanSubs: number;
    proSubs: number;
    legendSubs: number;
    adImpressionsRevenue: number;
    ppvTicketRevenue: number;
    sponsorshipRevenue: number;
    platformFeeRate: number; // 0.30
    grossTotalUSD: number;
    netPayoutUSD: number;
  };
  recentPayouts: {
    id: string;
    date: string;
    amountUSD: number;
    method: 'M-Pesa' | 'MTN MoMo' | 'Airtel Money' | 'PayPal' | 'Bank Transfer';
    account: string;
    status: 'Completed' | 'Processing' | 'Pending';
  }[];
}

export interface StoreMerchItem {
  id: string;
  name: string;
  category: 'Apparel' | 'Peripherals' | 'Gear' | 'Digital';
  priceUSD: number;
  originalPriceUSD?: number;
  image: string;
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  badge?: string;
  creatorAffiliate?: string;
}
