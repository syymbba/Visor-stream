import {
  LiveStream,
  GamingTutorial,
  GameCategory,
  EsportsTournament,
  SubscriptionPlan,
  CommunityPost,
  CreatorDashboardStats,
  StoreMerchItem,
  ChatMessage,
  ReelClip,
  UserLibraryItem,
  ConnectedThirdPartyAccount,
  UserBadge,
  Achievement,
  CardPaymentMethod,
  CreatorClip,
  CreatorTipJarConfig
} from '../types';

export const CURRENCY_RATES = {
  USD: { symbol: '$', rate: 1, label: 'USD ($)' },
  EUR: { symbol: '€', rate: 0.92, label: 'EUR (€)' },
  UGX: { symbol: 'UGX ', rate: 3750, label: 'UGX (Uganda)' },
  KES: { symbol: 'KES ', rate: 130, label: 'KES (Kenya)' },
  TZS: { symbol: 'TZS ', rate: 2600, label: 'TZS (Tanzania)' },
};

export const INITIAL_STREAMERS = [
  {
    id: 'str_1',
    name: 'Kigozi "Rex" Brian',
    handle: '@RexGamingUG',
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80',
    verified: true,
    country: 'Uganda',
    countryCode: 'UG',
    countryFlag: '🇺🇬',
    subscribers: 28400,
    bio: 'No.1 Apex Mobile & Warzone player in East Africa. Daily tournaments & mission walkthroughs. Powered by MTN MoMo.',
    discordJoined: true,
    mobileMoneySupported: true,
  },
  {
    id: 'str_2',
    name: 'Amina "Valkyrie" Mwangi',
    handle: '@AminaValkyrie',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&auto=format&fit=crop&q=80',
    verified: true,
    country: 'Kenya',
    countryCode: 'KE',
    countryFlag: '🇰🇪',
    subscribers: 41200,
    bio: 'Pro PUBG Mobile & Free Fire Captain @ Nairobi Knights. M-Pesa tips live on screen! Streaming 8 PM EAT.',
    discordJoined: true,
    mobileMoneySupported: true,
  },
  {
    id: 'str_3',
    name: 'Juma "ZanzibarGod" Nassor',
    handle: '@ZanzibarGod',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1200&auto=format&fit=crop&q=80',
    verified: true,
    country: 'Tanzania',
    countryCode: 'TZ',
    countryFlag: '🇹🇿',
    subscribers: 19800,
    bio: 'EA Sports FC 24/25 Continental Champ. Tutorial master & tactical guides. Airtel Money accepted.',
    discordJoined: true,
    mobileMoneySupported: true,
  },
  {
    id: 'str_4',
    name: 'Chidi "Omen" Okafor',
    handle: '@OmenValorant',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=1200&auto=format&fit=crop&q=80',
    verified: true,
    country: 'Nigeria',
    countryCode: 'NG',
    countryFlag: '🇳🇬',
    subscribers: 35600,
    bio: 'Radiant Valorant & CS2 entry fragger. Aim labs training routines & clutch coaching.',
    discordJoined: true,
    mobileMoneySupported: true,
  },
  {
    id: 'str_5',
    name: 'Sarah "Nia" Dlamini',
    handle: '@NiaTekkenQueen',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
    verified: true,
    country: 'South Africa',
    countryCode: 'ZA',
    countryFlag: '🇿🇦',
    subscribers: 15400,
    bio: 'Tekken 8 & Street Fighter 6 specialist. Frame data breakdowns & combo guides for beginners.',
    discordJoined: true,
    mobileMoneySupported: true,
  }
];

export const MOCK_LIVE_STREAMS: LiveStream[] = [
  {
    id: 'live_1',
    title: '🔥 [GRAND FINALS] East Africa Invitational Cup — Apex Mobile Champions Squad!',
    streamer: INITIAL_STREAMERS[0],
    game: 'Apex Legends Mobile',
    gameId: 'apex_legends',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
    videoPreviewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    viewersCount: 3420,
    isLive: true,
    resolution: '1080p60',
    bitrate: '6500 Kbps',
    fps: 60,
    uptime: '02:44:18',
    tags: ['Esports', 'Ranked Master', 'Drops Enabled', 'East Africa'],
    description: 'We are in match 5 of 6 in the regional finals. Tips via MTN MoMo and M-Pesa trigger on-screen cyber HUD alerts!',
  },
  {
    id: 'live_2',
    title: 'PUBG Mobile: 1v4 Squad Wipe Solo Conqueror Push + Giveaway at 500 Subs!',
    streamer: INITIAL_STREAMERS[1],
    game: 'PUBG Mobile',
    gameId: 'pubg_mobile',
    thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80',
    videoPreviewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    viewersCount: 2190,
    isLive: true,
    resolution: '1080p60',
    bitrate: '5800 Kbps',
    fps: 60,
    uptime: '01:18:42',
    tags: ['Gyro 400%', 'Mobile Pro', 'M-Pesa Live', 'Kenya'],
    description: 'Pushing to Conqueror Tier today. Showing you my full gyroscope sensitivity and 4-finger claw setup.',
  },
  {
    id: 'live_3',
    title: 'EA FC 24 Ultimate Team Weekend League 20-0 Unbeaten Run (Custom Tactics)',
    streamer: INITIAL_STREAMERS[2],
    game: 'EA Sports FC 24',
    gameId: 'fc_24',
    thumbnail: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=80',
    videoPreviewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    viewersCount: 1650,
    isLive: true,
    resolution: '4K UHD',
    bitrate: '12000 Kbps',
    fps: 60,
    uptime: '03:10:05',
    tags: ['FUT Champs', 'Meta Tactics', 'Tanzania', 'Rank 1'],
    description: 'Unveiling the 4-3-2-1 hybrid build that dismantled top pro players across the CECAFA esports circuit.',
  },
  {
    id: 'live_4',
    title: 'VALORANT Radiant Rank Gameplay — Omen Smoke Setups & Aim Secrets',
    streamer: INITIAL_STREAMERS[3],
    game: 'Valorant',
    gameId: 'valorant',
    thumbnail: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=800&auto=format&fit=crop&q=80',
    videoPreviewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    viewersCount: 1240,
    isLive: true,
    resolution: '1080p60',
    bitrate: '6000 Kbps',
    fps: 144,
    uptime: '00:54:19',
    tags: ['Radiant', 'Clutch', 'Aim Coach', 'PC'],
    description: 'High level ranked lobbies on Frankfurt low latency routing. Answering chat questions on crosshair placement.',
  },
  {
    id: 'live_5',
    title: 'Tekken 8 Reign: Reina EWGF & Mishima Wavedash Masterclass (Live Combos)',
    streamer: INITIAL_STREAMERS[4],
    game: 'Tekken 8',
    gameId: 'tekken_8',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
    videoPreviewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    viewersCount: 890,
    isLive: true,
    resolution: '1080p60',
    bitrate: '6200 Kbps',
    fps: 60,
    uptime: '02:01:30',
    tags: ['FGC', 'Tekken 8', 'Combos', 'South Africa'],
    description: 'Breaking down frame data, punishment guides, and wall bounce setups for competitive tournament play.',
  },
  {
    id: 'live_6',
    title: 'Warzone Mobile: Resurgence Ranked Season Drop + New Sniper Meta Guide',
    streamer: INITIAL_STREAMERS[0],
    game: 'Call of Duty: Warzone Mobile',
    gameId: 'cod_warzone',
    thumbnail: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80',
    videoPreviewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    viewersCount: 2890,
    isLive: true,
    resolution: '1080p60',
    bitrate: '7000 Kbps',
    fps: 60,
    uptime: '04:12:49',
    tags: ['Warzone', 'Sniper Meta', 'Loadouts', 'Multiplayer'],
    description: 'The definitive sniper guide for season 4. Fastest ADS attachments and bullet velocity tunings.',
  }
];

export const MOCK_TUTORIALS: GamingTutorial[] = [
  {
    id: 'tut_1',
    title: 'PUBG Mobile: Pro Gyroscope 400% Calibration & Zero Recoil 6x Spray Guide',
    game: 'PUBG Mobile',
    gameCategory: 'Battle Royale',
    author: INITIAL_STREAMERS[1],
    thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    difficulty: 'Pro',
    duration: '14:28',
    views: 68400,
    rating: 4.9,
    likes: 5420,
    missionName: 'Sensitivity & Gyro Zero-Recoil Blueprint',
    platform: 'Mobile',
    updatedAt: '2 days ago',
    description: 'Learn how to calibrate your phone gyroscope to achieve laser-like accuracy with M416 and Beryl M762 across 100m+ distances without screen shaking.',
    keyTakeaways: [
      'Set ADS Gyroscope to 360% for Red Dot and 280% for 3x/6x pulled to 3x',
      'Use ergonomic finger positioning to avoid wrist strain during long sessions',
      'Optimize device refresh rate and disable dynamic resolution scaling'
    ],
    recommendedLoadout: ['M416 (Compensator + Angled Grip + Tact Stock)', 'AWM / Kar98k', 'Smoke Grenades x5'],
    chapters: [
      { id: 'ch_1', title: 'Introduction & Camera Sensitivity Basics', timestamp: '00:00', durationSeconds: 120 },
      { id: 'ch_2', title: 'Gyroscope Calibration on High Hz Displays', timestamp: '02:00', durationSeconds: 240 },
      { id: 'ch_3', title: 'M416 Laser Spray 100m Live Demo', timestamp: '06:00', durationSeconds: 300 },
      { id: 'ch_4', title: 'Attachment Breakdown (Angled vs Half Grip)', timestamp: '11:00', durationSeconds: 208 },
    ]
  },
  {
    id: 'tut_2',
    title: 'EA Sports FC 24: Unstoppable Corner Kick Meta & 4-3-2-1 Custom Tactics Breakdown',
    game: 'EA Sports FC 24',
    gameCategory: 'Sports / Football',
    author: INITIAL_STREAMERS[2],
    thumbnail: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    difficulty: 'Intermediate',
    duration: '18:50',
    views: 49200,
    rating: 4.8,
    likes: 3890,
    missionName: 'Elite Division & Weekend League Dominance',
    platform: 'Cross-Platform',
    updatedAt: '1 week ago',
    description: 'Master the near-post bike kick glitch and the midfield overload custom tactics that led to a 20-0 regional tournament victory.',
    keyTakeaways: [
      'Set Width to 42 and Direct Passing chance creation for tight triangle passes',
      'Inside forwards set to "Cut Inside" and "Get in Behind"',
      'Manual goalkeeper movement on defensive set pieces'
    ],
    recommendedLoadout: ['Trivela Specialist Midfielder', 'Power Header Striker', 'Shadow Chem Styles'],
    chapters: [
      { id: 'ch_21', title: 'Formation Overview (4-3-2-1)', timestamp: '00:00', durationSeconds: 180 },
      { id: 'ch_22', title: 'Player Instructions & Work Rates', timestamp: '03:00', durationSeconds: 360 },
      { id: 'ch_23', title: 'Near Post Glitch Corner Kick Setup', timestamp: '09:00', durationSeconds: 320 },
      { id: 'ch_24', title: 'Real Match Gameplay Analysis', timestamp: '14:20', durationSeconds: 270 },
    ]
  },
  {
    id: 'tut_3',
    title: 'Apex Legends Mobile / Warzone: Mastering Slide-Jumps & Low-Latency Routing',
    game: 'Apex Legends Mobile',
    gameCategory: 'Battle Royale',
    author: INITIAL_STREAMERS[0],
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    difficulty: 'Master',
    duration: '22:15',
    views: 82000,
    rating: 5.0,
    likes: 7120,
    missionName: 'Advanced Movement Mechanics Masterclass',
    platform: 'Mobile',
    updatedAt: '3 days ago',
    description: 'Detailed tutorial on tap-strafing on touchscreens, super-glides off low geometry, and configuring Visor low-latency African CDN nodes for 15ms ping.',
    keyTakeaways: [
      'Timing slide-jump at the peak of momentum vector',
      'Switching weapons while jumping to cancel animation recovery',
      'Selecting Nairobi / Johannesburg low-latency server relays'
    ],
    recommendedLoadout: ['R-99 (Laser Sight + Ext Mag)', 'Peacekeeper', 'Wingman'],
    chapters: [
      { id: 'ch_31', title: 'Physics Engine & Momentum Vector', timestamp: '00:00', durationSeconds: 240 },
      { id: 'ch_32', title: 'Step-by-Step Touchscreen Superglide', timestamp: '04:00', durationSeconds: 450 },
      { id: 'ch_33', title: 'High Ground Reset Techniques', timestamp: '11:30', durationSeconds: 400 },
      { id: 'ch_34', title: 'Ping & Network Jitter Optimization', timestamp: '18:10', durationSeconds: 245 },
    ]
  },
  {
    id: 'tut_4',
    title: 'Free Fire: One-Tap Headshot Mechanics & Custom HUD (2-Finger / 4-Finger)',
    game: 'Free Fire',
    gameCategory: 'Battle Royale',
    author: INITIAL_STREAMERS[1],
    thumbnail: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    difficulty: 'Beginner',
    duration: '11:04',
    views: 94000,
    rating: 4.9,
    likes: 8300,
    missionName: 'Drag Headshot & Fast Gloo Wall Placement',
    platform: 'Mobile',
    updatedAt: '5 days ago',
    description: 'The ultimate guide for Free Fire players wanting to hit crisp drag headshots with Desert Eagle and M1887 shotgun consistently.',
    keyTakeaways: [
      'Drag fire button in an inverted J-curve for close combat',
      'Place Gloo Wall in under 0.2 seconds using crouch-touch method',
      'General Sensitivity set to 95–100'
    ],
    recommendedLoadout: ['Desert Eagle', 'M1887 Shotgun', 'Alok Character Skill'],
    chapters: [
      { id: 'ch_41', title: 'Drag Shot Physics & Distance Ranges', timestamp: '00:00', durationSeconds: 190 },
      { id: 'ch_42', title: 'J-Curve Fire Button Technique', timestamp: '03:10', durationSeconds: 220 },
      { id: 'ch_43', title: 'Instant Sit-Up Gloo Wall Trick', timestamp: '06:50', durationSeconds: 254 },
    ]
  },
  {
    id: 'tut_5',
    title: 'Tekken 8: Beginner to Red Ranks — Frame Data, Whiff Punishment & Heat System',
    game: 'Tekken 8',
    gameCategory: 'Fighting',
    author: INITIAL_STREAMERS[4],
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    difficulty: 'Intermediate',
    duration: '26:40',
    views: 31500,
    rating: 4.9,
    likes: 2900,
    missionName: 'Fighting Game Fundamentals',
    platform: 'PC',
    updatedAt: '2 weeks ago',
    description: 'Demystifying plus frames, unsafe moves on block, how to optimize Heat Burst extensions, and executing safe hopkick punishes.',
    keyTakeaways: [
      'Know your 10-frame jab punisher and 15-frame launcher',
      'Do not press buttons when -4 or worse on block',
      'Use Heat Dash to extend wall splat damage'
    ],
    recommendedLoadout: ['Arcade Stick / DualSense Controller', 'Reina / Jin Character Preset'],
    chapters: [
      { id: 'ch_51', title: 'What is Frame Data & Why it Matters', timestamp: '00:00', durationSeconds: 300 },
      { id: 'ch_52', title: '10-Frame to 15-Frame Punishment Guide', timestamp: '05:00', durationSeconds: 420 },
      { id: 'ch_53', title: 'Mastering Heat Burst & Heat Dash', timestamp: '12:00', durationSeconds: 480 },
      { id: 'ch_54', title: 'Live Sparring Match Analysis', timestamp: '20:00', durationSeconds: 400 },
    ]
  },
  {
    id: 'tut_6',
    title: 'Valorant: Crosshair Placement & Micro-Adjustments on High Ping Lobbies',
    game: 'Valorant',
    gameCategory: 'Tactical Shooter',
    author: INITIAL_STREAMERS[3],
    thumbnail: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    difficulty: 'Pro',
    duration: '16:15',
    views: 42000,
    rating: 4.8,
    likes: 3600,
    missionName: 'Aim Mechanics & Angle Peeking',
    platform: 'PC',
    updatedAt: '4 days ago',
    description: 'How to compensate for 50-80ms ping when peeking common angles on Ascent, Haven, and Sunset maps.',
    keyTakeaways: [
      'Always slice the pie when clearing corners',
      'Use counter-strafing to stop instantaneous velocity before clicking',
      'Aim for head height based on box geometry references'
    ],
    recommendedLoadout: ['Vandal (Phantom for close quarters)', 'Ghost Pistol', 'Light Armor Round 1'],
    chapters: [
      { id: 'ch_61', title: 'Angle Geometry & Peeker Advantage', timestamp: '00:00', durationSeconds: 260 },
      { id: 'ch_62', title: 'Ascent Map Crosshair Alignments', timestamp: '04:20', durationSeconds: 340 },
      { id: 'ch_63', title: 'Deathmatch Warmup Routine in 10 Mins', timestamp: '10:00', durationSeconds: 375 },
    ]
  }
];

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
    title: 'East Africa Gaming Invitational Season 4',
    game: 'PUBG Mobile & Free Fire',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80',
    prizePoolUSD: 15000,
    prizePoolFormatted: '$15,000 USD (56M+ UGX / 1.95M KES)',
    status: 'Live Now',
    startDate: 'Aug 16–18, 2026',
    region: 'Nairobi & Kampala LAN Finals',
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
    region: 'East Africa Online',
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
    region: 'Pan-African Server Node',
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

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'fan',
    name: 'Fan / Gamer Pass',
    badge: 'FAN PASS',
    priceUSD: 2,
    priceUGX: 7500,
    priceKES: 260,
    priceTZS: 5200,
    accentColor: '#38BDF8',
    description: 'Affordable entry pass designed for everyday African gamers. Enjoy uninterrupted viewing and basic community perks.',
    features: [
      '100% Ad-Free Video & Stream Viewing',
      'Access to exclusive highlights, guides & secret clip vault',
      'Basic community perks: custom profile badge & gamer tag',
      'Affordable mobile money checkout (M-Pesa, MTN, Airtel)',
      'Direct support for your favorite local creators'
    ],
    payoutShareStreamer: 0.70,
  },
  {
    id: 'pro',
    name: 'Pro / Pro Gamer',
    badge: 'PRO GAMER',
    priceUSD: 5,
    priceUGX: 18500,
    priceKES: 650,
    priceTZS: 13000,
    accentColor: '#00B4D8',
    popular: true,
    description: 'The golden balance of perks. Unlock premium streams, priority chat, private Discord groups and early tournament passes.',
    features: [
      'All Fan Pass perks included',
      'Full access to subscriber-only live streams & Masterclass walkthroughs',
      'Priority highlighted chat in live streams with streamer mention audio',
      'Private Discord VIP channel integration & private scrim groups',
      'Early access to Visor esports tournament brackets & free registrations',
      'Pro Gamer animated avatar frame & glowing profile badge'
    ],
    payoutShareStreamer: 0.70,
  },
  {
    id: 'legend',
    name: 'Legend / VIP Champion',
    badge: 'VIP CHAMPION',
    priceUSD: 10,
    priceUGX: 37000,
    priceKES: 1300,
    priceTZS: 26000,
    accentColor: '#F59E0B',
    description: 'The ultimate VIP tier. 4K ultra-low latency streams, monthly 1-on-1 coaching/Q&A with top streamers, and VIP shoutouts.',
    features: [
      'All Pro Gamer & Fan perks included',
      'VIP recognition: Custom gold chat badge, live stream on-screen shoutouts',
      '4K UHD Ultra-Low Latency streaming tier (Bunny.net/Mux CDN unlocked)',
      'Access to VIP-only closed tournaments, custom lobbies & pro coaching',
      'Direct 1-on-1 streamer interaction opportunities and custom game replays',
      '15% discount on all official Visor merchandise & gaming gear drops'
    ],
    payoutShareStreamer: 0.70,
  }
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  { id: 'c1', sender: 'Musa_Uganda', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&auto=format&fit=crop&q=80', text: 'That slide-jump maneuver was insane bro!! 🔥', timestamp: '2m ago', badge: 'PRO' },
  { id: 'c2', sender: 'NairobiGamer', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=60&auto=format&fit=crop&q=80', text: 'M-Pesa tip incoming! Show us the sensitivity settings again', timestamp: '1m ago', badge: 'VIP', isDonation: true, donationAmount: '500 KES', donationCurrency: 'KES', donationMessage: 'Keep repping East Africa king! 👑' },
  { id: 'c3', sender: 'Sarah_Kampala', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&auto=format&fit=crop&q=80', text: 'Best tutorial on the platform hands down.', timestamp: 'Just now', badge: 'FAN' },
  { id: 'c4', sender: 'RexGamingUG', avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=60&auto=format&fit=crop&q=80', text: 'Thanks for the love everyone! We are pushing to 30k subs today! 🚀', timestamp: 'Just now', badge: 'CREATOR' }
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
    content: 'East Africa Invitational LAN finals bracket is OUT! Nairobi CyberKnights vs Kampala Kings this Saturday at 7 PM EAT. Who are you putting your M-Pesa on? Drop your predictions below! 🔥🏆',
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

export const MOCK_CREATOR_DASHBOARD: CreatorDashboardStats = {
  streamTitle: '🔥 [GRAND FINALS] East Africa Invitational Cup — Apex Mobile Champions Squad!',
  gameCategory: 'Apex Legends Mobile',
  streamKey: 'live_vsr_af90248c89b12049e7a90f1',
  serverIngestUrl: 'rtmp://ingest.nairobi.visorstream.com/live',
  currentViewers: 3420,
  peakViewers: 4890,
  averageViewers: 2840,
  followersGainedToday: 184,
  totalSubscribers: 1248,
  liveBitrateKbps: 6540,
  frameDropRate: 0.08,
  streamHealth: 'Excellent',
  fps: 60,
  cpuLoad: 24,
  uptimeSeconds: 9858, // ~2h 44m
  revenueThisMonthUSD: 2480,
  payoutBreakdown: {
    fanSubs: 420, // $840
    proSubs: 210, // $1050
    legendSubs: 35, // $350
    adImpressionsRevenue: 280, // ~$5-8 CPM
    ppvTicketRevenue: 460, // $2 tickets
    sponsorshipRevenue: 300,
    platformFeeRate: 0.30, // 30% platform fee, 70% streamer
    grossTotalUSD: 3280,
    netPayoutUSD: 2480,
  },
  recentPayouts: [
    {
      id: 'po_091',
      date: 'Aug 01, 2026',
      amountUSD: 1840,
      method: 'MTN MoMo',
      account: '+256 78*** **** (UGX 6,900,000)',
      status: 'Completed'
    },
    {
      id: 'po_090',
      date: 'Jul 01, 2026',
      amountUSD: 1420,
      method: 'MTN MoMo',
      account: '+256 78*** **** (UGX 5,325,000)',
      status: 'Completed'
    },
    {
      id: 'po_089',
      date: 'Jun 01, 2026',
      amountUSD: 980,
      method: 'M-Pesa',
      account: '+254 71*** **** (KES 127,400)',
      status: 'Completed'
    }
  ]
};

export const MOCK_STORE_ITEMS: StoreMerchItem[] = [
  {
    id: 'merch_1',
    name: 'Visor Pro Esports Jersey (Africa Edition)',
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

export const REGIONAL_SERVER_NODES = [
  { id: 'srv_nbi', city: 'Nairobi', country: 'Kenya', flag: '🇰🇪', pingMs: 14, status: 'Optimal', load: '38%' },
  { id: 'srv_kla', city: 'Kampala', country: 'Uganda', flag: '🇺🇬', pingMs: 19, status: 'Optimal', load: '42%' },
  { id: 'srv_dar', city: 'Dar es Salaam', country: 'Tanzania', flag: '🇹🇿', pingMs: 24, status: 'Optimal', load: '31%' },
  { id: 'srv_jnb', city: 'Johannesburg', country: 'South Africa', flag: '🇿🇦', pingMs: 38, status: 'Optimal', load: '55%' },
  { id: 'srv_lag', city: 'Lagos', country: 'Nigeria', flag: '🇳🇬', pingMs: 46, status: 'Optimal', load: '49%' },
  { id: 'srv_fra', city: 'Frankfurt (EU Relay)', country: 'Germany', flag: '🇩🇪', pingMs: 82, status: 'Backup Relay', load: '22%' },
];

export const MOCK_REELS: ReelClip[] = [
  {
    id: 'reel_1',
    title: '⚡ INSANE 1v4 Squad Wipe Clutch in Apex Mobile Ranked Master Tier!',
    creator: INITIAL_STREAMERS[0],
    game: 'Apex Legends Mobile',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
    views: 48200,
    likes: 3840,
    commentsCount: 245,
    sharesCount: 512,
    isLiked: true,
    isSaved: false,
    timestamp: '2 hours ago',
    duration: '0:45',
    tags: ['Clutch', 'ApexMobile', 'UgandaEsports', 'Rank1']
  },
  {
    id: 'reel_2',
    title: '🎯 400m AWM Headshot through Smoke — Nairobi Knights Scrims',
    creator: INITIAL_STREAMERS[1],
    game: 'PUBG Mobile',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80',
    views: 62100,
    likes: 5120,
    commentsCount: 380,
    sharesCount: 890,
    isLiked: false,
    isSaved: true,
    timestamp: '5 hours ago',
    duration: '0:32',
    tags: ['AWM', 'PUBG', 'SniperKing', 'Kenya']
  },
  {
    id: 'reel_3',
    title: '🔥 Unstoppable 40-Yard Free Kick Curve in EA Sports FC 24 Weekend League',
    creator: INITIAL_STREAMERS[2],
    game: 'EA Sports FC 24',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&auto=format&fit=crop&q=80',
    views: 31500,
    likes: 2900,
    commentsCount: 160,
    sharesCount: 340,
    isLiked: false,
    isSaved: false,
    timestamp: '1 day ago',
    duration: '0:28',
    tags: ['FC24', 'FreeKick', 'FUT', 'Tanzania']
  },
  {
    id: 'reel_4',
    title: '👑 Perfect Mishima Electric Wind God Fist Combo into Wall Break (Tekken 8)',
    creator: INITIAL_STREAMERS[4],
    game: 'Tekken 8',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
    views: 54000,
    likes: 4780,
    commentsCount: 310,
    sharesCount: 620,
    isLiked: true,
    isSaved: true,
    timestamp: '2 days ago',
    duration: '0:50',
    tags: ['Tekken8', 'EWGF', 'Reina', 'FGC']
  }
];

export const MOCK_LIBRARY_ITEMS: UserLibraryItem[] = [
  {
    id: 'lib_down_1',
    title: 'Apex Mobile Masterclass: Complete Gyroscope & Recoil Mastery',
    type: 'downloaded',
    game: 'Apex Legends Mobile',
    author: INITIAL_STREAMERS[0],
    duration: '24:15',
    fileSize: '342 MB',
    downloadedAt: 'Downloaded 2 days ago',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
    progressPercent: 65,
    isOfflineAvailable: true,
  },
  {
    id: 'lib_down_2',
    title: 'PUBG Mobile 4-Finger Claw Sensitivity Guide & Rotations',
    type: 'downloaded',
    game: 'PUBG Mobile',
    author: INITIAL_STREAMERS[1],
    duration: '18:40',
    fileSize: '215 MB',
    downloadedAt: 'Downloaded yesterday',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80',
    progressPercent: 100,
    isOfflineAvailable: true,
  },
  {
    id: 'lib_saved_1',
    title: 'EA FC 24 Weekend League 20-0 Uncut VOD (Meta Tactics Explained)',
    type: 'saved',
    game: 'EA Sports FC 24',
    author: INITIAL_STREAMERS[2],
    duration: '1:45:20',
    savedAt: 'Saved 3 days ago',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&auto=format&fit=crop&q=80',
    progressPercent: 30,
    isOfflineAvailable: false,
  },
  {
    id: 'lib_saved_2',
    title: 'VALORANT Radiant Omen Smoke Setups on Ascent & Lotus',
    type: 'saved',
    game: 'Valorant',
    author: INITIAL_STREAMERS[3],
    duration: '32:10',
    savedAt: 'Saved last week',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=600&auto=format&fit=crop&q=80',
    progressPercent: 0,
    isOfflineAvailable: false,
  },
  {
    id: 'lib_vod_1',
    title: 'My Broadcast: East Africa Invitational Qualifier Day 1',
    type: 'created_vod',
    game: 'Apex Legends Mobile',
    author: {
      id: 'me',
      name: 'You (Creator)',
      handle: '@ProGamerLive',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      verified: true,
      country: 'Uganda',
      countryCode: 'UG',
      countryFlag: '🇺🇬',
      subscribers: 250,
      bio: 'Visor streamer',
      mobileMoneySupported: true
    },
    duration: '2:14:08',
    savedAt: 'Recorded Aug 15, 2026',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
    fileSize: '1.4 GB',
    isOfflineAvailable: true,
  },
  {
    id: 'lib_vod_2',
    title: 'Highlight Clip: 1v3 Clutch with Wingman Headshots',
    type: 'created_vod',
    game: 'Apex Legends Mobile',
    author: {
      id: 'me',
      name: 'You (Creator)',
      handle: '@ProGamerLive',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      verified: true,
      country: 'Uganda',
      countryCode: 'UG',
      countryFlag: '🇺🇬',
      subscribers: 250,
      bio: 'Visor streamer',
      mobileMoneySupported: true
    },
    duration: '0:42',
    savedAt: 'Clipped yesterday',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80',
    fileSize: '45 MB',
    isOfflineAvailable: true,
  }
];

export const MOCK_CONNECTED_ACCOUNTS: ConnectedThirdPartyAccount[] = [
  { id: 'conn_1', provider: 'discord', name: 'Discord', handle: 'VisorGamer#4482', connected: true, connectedAt: 'Linked Aug 10, 2026', avatar: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=80&auto=format&fit=crop&q=80' },
  { id: 'conn_2', provider: 'twitch', name: 'Twitch', handle: 'visor_streamer_ug', connected: true, connectedAt: 'Linked Aug 12, 2026', avatar: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=80&auto=format&fit=crop&q=80' },
  { id: 'conn_3', provider: 'steam', name: 'Steam', handle: 'SteamID: 765611980289', connected: true, connectedAt: 'Linked Jul 28, 2026', avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80&auto=format&fit=crop&q=80' },
  { id: 'conn_4', provider: 'youtube', name: 'YouTube Gaming', handle: '@VisorGamingAfrica', connected: false },
  { id: 'conn_5', provider: 'epic', name: 'Epic Games', handle: 'RexVisor_Official', connected: true, connectedAt: 'Linked Aug 01, 2026' },
  { id: 'conn_6', provider: 'xbox', name: 'Xbox Live / Game Pass', handle: 'Not Connected', connected: false },
  { id: 'conn_7', provider: 'playstation', name: 'PlayStation Network', handle: 'Not Connected', connected: false }
];

export const MOCK_USER_BADGES: UserBadge[] = [
  { id: 'b_1', name: 'Visor Pioneer', icon: '👑', description: 'Early access continental streamer & founder member', rarity: 'legendary', unlocked: true, unlockedAt: 'Aug 2026' },
  { id: 'b_2', name: 'Stream Champion', icon: '🏆', description: 'Broadcasted over 50 hours of live competitive gameplay', rarity: 'epic', unlocked: true, unlockedAt: 'Aug 2026' },
  { id: 'b_3', name: 'MoMo Patron', icon: '💸', description: 'Sent 10+ Mobile Money live super tips to fellow creators', rarity: 'rare', unlocked: true, unlockedAt: 'Aug 2026' },
  { id: 'b_4', name: 'Tactics Scholar', icon: '📚', description: 'Completed 15 interactive video tutorials and loadout guides', rarity: 'rare', unlocked: true, unlockedAt: 'Aug 2026' },
  { id: 'b_5', name: 'Tournament Finalist', icon: '⚔️', description: 'Reached top 8 in an official CECAFA esports invitational', rarity: 'epic', unlocked: false, progress: 3, maxProgress: 5 },
  { id: 'b_6', name: 'Grand Master 100K', icon: '🌟', description: 'Amass 100,000 total watch minutes on your channel', rarity: 'legendary', unlocked: false, progress: 42000, maxProgress: 100000 },
];

export const MOCK_ACHIEVEMENTS: Achievement[] = [
  { id: 'ach_1', title: 'First Blood Stream', category: 'Broadcasting', xp: 500, icon: '🎮', completed: true, completedDate: 'Aug 04, 2026', progress: 1, target: 1 },
  { id: 'ach_2', title: 'East Africa Edge Routing', category: 'Networking', xp: 350, icon: '🌐', completed: true, completedDate: 'Aug 08, 2026', progress: 1, target: 1 },
  { id: 'ach_3', title: 'High-Bitrate Pioneer (1080p60)', category: 'Quality', xp: 600, icon: '📺', completed: true, completedDate: 'Aug 12, 2026', progress: 1, target: 1 },
  { id: 'ach_4', title: 'Community Pillar (100 Chat Messages)', category: 'Social', xp: 400, icon: '💬', completed: true, completedDate: 'Aug 14, 2026', progress: 100, target: 100 },
  { id: 'ach_5', title: 'Clan Master (Host a Scrim)', category: 'Esports', xp: 800, icon: '🛡️', completed: false, progress: 2, target: 5 },
  { id: 'ach_6', title: 'Mobile Money Supporter Level 3', category: 'Monetization', xp: 1200, icon: '💎', completed: false, progress: 7, target: 10 },
];

export const MOCK_CARDS: CardPaymentMethod[] = [
  { id: 'card_1', cardHolder: 'Brian Kigozi', last4: '4242', expMonth: '08', expYear: '28', brand: 'visa', isDefault: true },
  { id: 'card_2', cardHolder: 'Brian Kigozi', last4: '8831', expMonth: '11', expYear: '27', brand: 'mastercard', isDefault: false },
];

export const MOCK_CREATOR_CLIPS: CreatorClip[] = [
  { id: 'clip_1', title: 'Wingman 1v3 clutch in last ring', game: 'Apex Legends Mobile', duration: '0:34', createdAt: '2 hours ago', views: 1240, thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=80', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
  { id: 'clip_2', title: 'Triple grenade bounce squad wipe', game: 'PUBG Mobile', duration: '0:22', createdAt: 'Yesterday', views: 2890, thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500&auto=format&fit=crop&q=80', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
  { id: 'clip_3', title: 'Corner kick Olimpico goal', game: 'EA Sports FC 24', duration: '0:18', createdAt: '3 days ago', views: 950, thumbnail: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=500&auto=format&fit=crop&q=80', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' },
];

export const MOCK_CREATOR_TIP_JAR: CreatorTipJarConfig = {
  enabled: true,
  minTipUSD: 1.0,
  presetAmountsUSD: [1.5, 3.0, 5.0, 10.0, 25.0],
  bannerHeadline: 'Support the Stream & Fuel the High-FPS Dream!',
  thankYouMessage: 'Massive love to all donors! All tips directly upgrade the streaming rig and regional clan tourneys.',
  soundAlertEnabled: true,
  confettiEnabled: true,
  activeGoal: {
    id: 'goal_sm7b_rig',
    title: '🎙️ Shure SM7B Studio Mic & Dedicated Capture Card',
    targetAmountUSD: 450,
    currentAmountUSD: 335,
    currency: 'USD',
    description: 'Upgrading audio fidelity for crystal clear tournament commentary and 1080p60 zero-latency capture.',
    active: true
  },
  recentTips: [
    {
      id: 'tip_rec_1',
      donorName: 'Kampala_Sniper_99',
      donorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80',
      amountUSD: 15,
      amountFormatted: '50,000 UGX',
      currency: 'UGX',
      network: 'MTN MoMo',
      message: 'That Wingman headshot in round 4 was pure art! Keep grinding bro 👑🔥',
      timestamp: '12 mins ago',
      badge: 'VIP'
    },
    {
      id: 'tip_rec_2',
      donorName: 'Nairobi_GamerGirl',
      donorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&auto=format&fit=crop&q=80',
      amountUSD: 8,
      amountFormatted: '1,000 KES',
      currency: 'KES',
      network: 'M-Pesa',
      message: 'Much love from Nairobi! Thanks for the PUBG sensitivity setup tips 🙌',
      timestamp: '45 mins ago',
      badge: 'PRO'
    },
    {
      id: 'tip_rec_3',
      donorName: 'ApexLegend_TZ',
      donorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80',
      amountUSD: 5,
      amountFormatted: '12,500 TZS',
      currency: 'TZS',
      network: 'Airtel Money',
      message: 'Best movement player in East Africa without doubt. Let’s get this mic goal done!',
      timestamp: '2 hours ago',
      badge: 'FAN'
    },
    {
      id: 'tip_rec_4',
      donorName: 'CyberNinja_KLA',
      donorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80',
      amountUSD: 25,
      amountFormatted: '$25.00 USD',
      currency: 'USD',
      network: 'Visa Card',
      message: 'Dropping a mega tip for the upcoming tournament championship!',
      timestamp: '5 hours ago',
      badge: 'VIP'
    }
  ]
};

export const PLATFORM_FAQS = [
  {
    q: 'How do I subscribe to Visor Stream?',
    a: 'Choose one of our accessible subscription tiers — Fan ($2), Pro ($5), or Legend ($10). Click the subscription button under your chosen plan and pay seamlessly using Mobile Money (M-Pesa, MTN MoMo, Airtel Money) or global cards (Visa, Mastercard, Stripe, PayPal). Once confirmed, all perks unlock instantly across your account!'
  },
  {
    q: 'How do streamers get paid on Visor?',
    a: 'Streamers earn a clear 70% share from channel subscriptions, 60% from in-stream ads, 80% from Pay-Per-View tournament tickets, plus 100% of tips. Payouts are automated monthly directly to local Mobile Money accounts (M-Pesa, MTN, Airtel) or PayPal with zero unnecessary bank conversion delays.'
  },
  {
    q: 'What makes Visor different from Twitch or YouTube?',
    a: 'Global platforms charge high subscription fees without local payment integration, lack low-latency African server routes, and offer little focus on regional esports. Visor offers $2–$10 localized pricing, instant mobile money support, dedicated gaming tutorials & walkthroughs, and low-latency servers in Nairobi, Kampala, and Dar es Salaam.'
  },
  {
    q: 'How do I access gaming tutorials and walkthroughs?',
    a: 'Visit the "Tutorials & Guides" tab. You can filter by game (PUBG Mobile, FC 24, Apex, Free Fire, Tekken), difficulty level (Beginner to Master), platform, or specific mission. Every tutorial features interactive chapters, loadout recommendations, and key takeaways.'
  },
  {
    q: 'Can I change or cancel my plan anytime?',
    a: 'Yes. Simply navigate to Settings > Subscription & Payments. You can upgrade, downgrade, or cancel your active subscription anytime with no hidden penalties.'
  },
  {
    q: 'How can I become a streamer or upload tutorials on Visor?',
    a: 'Click the "Go Live" button in the top navigation or visit the Creator Studio. Set up your channel in under 2 minutes, get your unique RTMP Stream Key, and start broadcasting via OBS Studio, Streamlabs, or direct mobile screen capture.'
  }
];

