// Demo-only content: Games, Esports Tournaments, Community Posts, and Store items have
// no backing database table yet — this is placeholder data for a phased backend rollout.
import {
  GameCategory,
  EsportsTournament,
  CommunityPost,
  StoreMerchItem,
} from '../types';
import { INITIAL_STREAMERS } from './mockData';

export const MOCK_GAMES: GameCategory[] = [
  {
    id: 'apex_legends',
    name: 'Apex Legends Mobile',
    cover: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&auto=format&fit=crop&q=80',
    viewers: 14500,
    liveStreamsCount: 84,
    genre: 'Battle Royale / Hero Shooter',
    platforms: ['Mobile', 'Tablet'],
    trendingRank: 1,
  },
  {
    id: 'pubg_mobile',
    name: 'PUBG Mobile',
    cover: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&auto=format&fit=crop&q=80',
    viewers: 28900,
    liveStreamsCount: 162,
    genre: 'Tactical Battle Royale',
    platforms: ['Mobile', 'Tablet'],
    trendingRank: 2,
  },
  {
    id: 'fc_24',
    name: 'EA Sports FC 24 / 25',
    cover: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&auto=format&fit=crop&q=80',
    viewers: 19800,
    liveStreamsCount: 110,
    genre: 'Football / Esports Simulation',
    platforms: ['PC', 'Console', 'Mobile'],
    trendingRank: 3,
  },
  {
    id: 'free_fire',
    name: 'Garena Free Fire',
    cover: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=400&auto=format&fit=crop&q=80',
    viewers: 34200,
    liveStreamsCount: 220,
    genre: 'Fast Battle Royale',
    platforms: ['Mobile'],
    trendingRank: 4,
  },
  {
    id: 'cod_warzone',
    name: 'Call of Duty: Warzone',
    cover: 'https://images.unsplash.com/photo-1589241062272-c0a000072dfa?w=400&auto=format&fit=crop&q=80',
    viewers: 17300,
    liveStreamsCount: 95,
    genre: 'First-Person Shooter',
    platforms: ['PC', 'Console', 'Mobile'],
    trendingRank: 5,
  },
  {
    id: 'valorant',
    name: 'Valorant',
    cover: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=400&auto=format&fit=crop&q=80',
    viewers: 12400,
    liveStreamsCount: 68,
    genre: 'Tactical Hero Shooter',
    platforms: ['PC', 'Console'],
    trendingRank: 6,
  },
  {
    id: 'tekken_8',
    name: 'Tekken 8',
    cover: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&auto=format&fit=crop&q=80',
    viewers: 8600,
    liveStreamsCount: 42,
    genre: '3D Fighting',
    platforms: ['PC', 'Console'],
    trendingRank: 7,
  },
  {
    id: 'mortal_kombat_1',
    name: 'Mortal Kombat 1',
    cover: 'https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?w=400&auto=format&fit=crop&q=80',
    viewers: 6200,
    liveStreamsCount: 31,
    genre: 'Fighting / Action',
    platforms: ['PC', 'Console'],
    trendingRank: 8,
  }
];

export const MOCK_TOURNAMENTS: EsportsTournament[] = [
  {
    id: 'tourn_1',
    title: 'Visor Gaming Invitational Season 4',
    game: 'PUBG Mobile & Free Fire',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80',
    prizePoolUSD: 15000,
    prizePoolFormatted: '$15,000 USD (56M+ UGX / 1.95M KES)',
    status: 'Live Now',
    startDate: 'Aug 16–18, 2026',
    region: 'Pro Masters LAN Finals',
    registeredTeams: 32,
    maxTeams: 32,
    isPayPerView: false,
    ticketPriceUSD: 0,
    organizer: 'Visor Esports Circuit',
    sponsor: 'MTN Uganda & Safaricom M-Pesa',
    matches: [
      { id: 'm1', teamA: 'Kampala Kings Esports', teamB: 'Nairobi CyberKnights', scoreA: 3, scoreB: 2, time: 'Live Now', stage: 'Grand Finals Map 5' },
      { id: 'm2', teamA: 'Dar Warriors TZ', teamB: 'Kigali Titans', scoreA: 1, scoreB: 3, time: 'Completed', stage: 'Semi Finals' }
    ]
  },
  {
    id: 'tourn_2',
    title: 'CECAFA EA FC 24 Masters Championship',
    game: 'EA Sports FC 24',
    banner: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1200&auto=format&fit=crop&q=80',
    prizePoolUSD: 5000,
    prizePoolFormatted: '$5,000 USD (18.7M UGX / 650K KES)',
    status: 'Upcoming',
    startDate: 'Aug 22, 2026',
    region: 'Pro Global Online',
    registeredTeams: 64,
    maxTeams: 128,
    isPayPerView: true,
    ticketPriceUSD: 2,
    organizer: 'Visor Continental League',
    sponsor: 'Red Bull Gaming & Airtel Money',
    matches: [
      { id: 'm3', teamA: 'RexGamingUG', teamB: 'ZanzibarGod', time: 'Aug 22 • 19:00 EAT', stage: 'Round of 16' },
      { id: 'm4', teamA: 'LagosBlaze', teamB: 'CapeTownRival', time: 'Aug 22 • 20:30 EAT', stage: 'Round of 16' }
    ]
  },
  {
    id: 'tourn_3',
    title: 'Visor Mobile Showdown: Apex Mobile Cup',
    game: 'Apex Legends Mobile',
    banner: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&auto=format&fit=crop&q=80',
    prizePoolUSD: 3500,
    prizePoolFormatted: '$3,500 USD (13.1M UGX / 455K KES)',
    status: 'Upcoming',
    startDate: 'Aug 29, 2026',
    region: 'Direct Edge Server Node',
    registeredTeams: 48,
    maxTeams: 60,
    isPayPerView: false,
    ticketPriceUSD: 0,
    organizer: 'Visor Community Hub',
    sponsor: 'Hostinger Cloud & Cloudflare',
    matches: [
      { id: 'm5', teamA: 'Shadow Clan', teamB: 'Apex Predators UG', time: 'Aug 29 • 18:00 EAT', stage: 'Group Stage A' }
    ]
  }
];

export const MOCK_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'p_1',
    author: INITIAL_STREAMERS[0],
    timestamp: '1 hour ago',
    content: 'Just uploaded the new 400% Gyroscope sensitivity guide on the Tutorials tab! Thank you to our 450+ new Pro Gamer subscribers this week. Payouts processed smoothly via MTN MoMo today! 🎮✨ Let me know in the comments what mission guide you need next.',
    mediaUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image',
    likesCount: 342,
    commentsCount: 58,
    sharesCount: 19,
    badge: 'VERIFIED CREATOR',
    clanTag: 'REX',
    isLiked: true,
  },
  {
    id: 'p_2',
    author: INITIAL_STREAMERS[1],
    timestamp: '4 hours ago',
    content: 'Visor Invitational LAN finals bracket is OUT! Nairobi CyberKnights vs Kampala Kings this Saturday at 7 PM EAT. Who are you putting your M-Pesa on? Drop your predictions below! 🔥🏆',
    mediaUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image',
    likesCount: 512,
    commentsCount: 94,
    sharesCount: 43,
    badge: 'PRO LEAGUE',
    clanTag: 'NCK',
    isLiked: false,
  },
  {
    id: 'p_3',
    author: INITIAL_STREAMERS[2],
    timestamp: 'Yesterday',
    content: 'Tanzania FC 24 community meetup was legendary. Over 60 gamers showed up at the Dar Esports Hub. Visor low-latency servers gave us 18ms ping all night. Huge thanks to everyone who joined our VIP Legend tier! 🇹🇿⚽',
    likesCount: 278,
    commentsCount: 31,
    sharesCount: 14,
    badge: 'CHAMPION',
    clanTag: 'DAR',
    isLiked: true,
  }
];

export const MOCK_STORE_ITEMS: StoreMerchItem[] = [
  {
    id: 'merch_1',
    name: 'Visor Pro Esports Jersey (Championship Edition)',
    category: 'Apparel',
    priceUSD: 25,
    originalPriceUSD: 35,
    image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewsCount: 142,
    inStock: true,
    badge: 'BESTSELLER',
    creatorAffiliate: 'RexGamingUG'
  },
  {
    id: 'merch_2',
    name: 'Ultra-Conductive Mobile Gaming Finger Sleeves (Pack of 4)',
    category: 'Gear',
    priceUSD: 6,
    originalPriceUSD: 10,
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviewsCount: 389,
    inStock: true,
    badge: 'HOT GEAR',
    creatorAffiliate: 'AminaValkyrie'
  },
  {
    id: 'merch_3',
    name: 'Visor RGB Magnetic Phone Cooler Fan (0°C Drop)',
    category: 'Peripherals',
    priceUSD: 18,
    originalPriceUSD: 24,
    image: 'https://images.unsplash.com/photo-1612287233207-6b45d2f6406e?w=400&auto=format&fit=crop&q=80',
    rating: 5.0,
    reviewsCount: 88,
    inStock: true,
    badge: 'NEW ARRIVAL',
  },
  {
    id: 'merch_4',
    name: 'Visor Cyberpunk Streamer Desk Mat (900x400mm)',
    category: 'Gear',
    priceUSD: 15,
    originalPriceUSD: 20,
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewsCount: 95,
    inStock: true,
  }
];
