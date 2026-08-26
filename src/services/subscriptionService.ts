export type ProTier = 'free' | 'fan' | 'pro' | 'legend';

export interface TierPerkConfig {
  id: ProTier;
  name: string;
  badgeLabel: string;
  priceUSD: number;
  maxResolution: string;
  canAccess1080p: boolean;
  canAccess4K: boolean;
  isAdFree: boolean;
  hasSubBadge: boolean;
  hasExclusiveEmotes: boolean;
  hasUnlimitedVod: boolean;
}

export const TIER_CONFIGS: Record<ProTier, TierPerkConfig> = {
  free: {
    id: 'free',
    name: 'Free Tier',
    badgeLabel: 'FREE',
    priceUSD: 0,
    maxResolution: '720p HD',
    canAccess1080p: false,
    canAccess4K: false,
    isAdFree: false,
    hasSubBadge: false,
    hasExclusiveEmotes: false,
    hasUnlimitedVod: false,
  },
  fan: {
    id: 'fan',
    name: 'Gamer Pass',
    badgeLabel: 'PASS',
    priceUSD: 2,
    maxResolution: '1080p60',
    canAccess1080p: true,
    canAccess4K: false,
    isAdFree: true,
    hasSubBadge: true,
    hasExclusiveEmotes: true,
    hasUnlimitedVod: true,
  },
  pro: {
    id: 'pro',
    name: 'Pro Streamer',
    badgeLabel: 'PRO',
    priceUSD: 5,
    maxResolution: '1080p60 / 120 FPS',
    canAccess1080p: true,
    canAccess4K: true,
    isAdFree: true,
    hasSubBadge: true,
    hasExclusiveEmotes: true,
    hasUnlimitedVod: true,
  },
  legend: {
    id: 'legend',
    name: 'VIP Champion',
    badgeLabel: 'VIP',
    priceUSD: 10,
    maxResolution: '4K UHD / 120 FPS',
    canAccess1080p: true,
    canAccess4K: true,
    isAdFree: true,
    hasSubBadge: true,
    hasExclusiveEmotes: true,
    hasUnlimitedVod: true,
  },
};

export const SUBSCRIBER_EXCLUSIVE_EMOTES = ['👑', '💎', '🚀', '💥', '🏆', '⭐'];
export const STANDARD_EMOTES = ['🔥', '🎮', 'GG', 'W', 'LFG', '⚡'];

export function getTierConfig(tier?: string): TierPerkConfig {
  const normalized = (tier?.toLowerCase() || 'free') as ProTier;
  return TIER_CONFIGS[normalized] || TIER_CONFIGS.free;
}

export function canAccessStreamQuality(
  tier: string | undefined,
  quality: '4K' | '1080p' | '720p' | '480p' | 'Audio-Only' | 'Auto'
): boolean {
  const config = getTierConfig(tier);
  if (quality === '4K') return config.canAccess4K;
  if (quality === '1080p') return config.canAccess1080p;
  return true; // 720p, 480p, Audio-Only, Auto are available to all
}

export function canUseSubscriberEmote(tier: string | undefined, emote: string): boolean {
  if (!SUBSCRIBER_EXCLUSIVE_EMOTES.includes(emote)) return true;
  const config = getTierConfig(tier);
  return config.hasExclusiveEmotes;
}

export function canUseSubscriberBadge(tier: string | undefined, badge: string): boolean {
  const normalizedBadge = badge.toUpperCase();
  if (normalizedBadge === 'VIP' || normalizedBadge === 'PRO' || normalizedBadge === 'SUB') {
    const config = getTierConfig(tier);
    return config.hasSubBadge;
  }
  return true; // standard or viewer badges
}
