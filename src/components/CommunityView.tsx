import React, { useState } from 'react';
import { CommunityPost } from '../types';
import { TipModal } from './TipModal';
import { useLanguage } from '../lib/i18n';
import {
  Users,
  MessageSquare,
  Heart,
  Share2,
  Image as ImageIcon,
  Send,
  Sparkles,
  Award,
  Flame,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  Gift
} from 'lucide-react';

interface CommunityViewProps {
  posts: CommunityPost[];
  onOpenSubscribe: () => void;
}

export const CommunityView: React.FC<CommunityViewProps> = ({
  posts,
  onOpenSubscribe,
}) => {
  const { t } = useLanguage();
  const [feedPosts, setFeedPosts] = useState<CommunityPost[]>(posts);
  const [newPostContent, setNewPostContent] = useState('');
  const [likedPostIds, setLikedPostIds] = useState<string[]>(['p_1', 'p_3']);
  const [activeTipStreamer, setActiveTipStreamer] = useState<{ id: string; name: string } | null>(null);

  const leaderboardUsers = [
    { rank: 1, name: 'RexGamingUG', xp: '18,450 XP', clan: 'REX', badge: 'Apex Legend', avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=80&auto=format&fit=crop&q=80' },
    { rank: 2, name: 'AminaValkyrie', xp: '16,200 XP', clan: 'NCK', badge: 'Conqueror', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80' },
    { rank: 3, name: 'ZanzibarGod', xp: '14,890 XP', clan: 'DAR', badge: 'Master Strategist', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80' },
    { rank: 4, name: 'OmenValorant', xp: '12,400 XP', clan: 'NIG', badge: 'Radiant Sniper', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80' },
    { rank: 5, name: 'You (Gamer)', xp: '4,250 XP', clan: 'VSR', badge: 'Pro Specialist', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80' },
  ];

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const created: CommunityPost = {
      id: 'post_' + Date.now(),
      author: {
        id: 'me',
        name: 'You (Gamer)',
        handle: '@ProGamerUG',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80',
        verified: true,
        country: 'Uganda',
        countryCode: 'UG',
        countryFlag: '🇺🇬',
        subscribers: 120,
        bio: 'Visor Community Member',
        mobileMoneySupported: true,
      },
      timestamp: 'Just now',
      content: newPostContent,
      likesCount: 1,
      commentsCount: 0,
      sharesCount: 0,
      badge: 'PRO GAMER',
      clanTag: 'VSR',
      isLiked: true,
    };

    setFeedPosts([created, ...feedPosts]);
    setLikedPostIds([...likedPostIds, created.id]);
    setNewPostContent('');
  };

  const toggleLike = (postId: string) => {
    if (likedPostIds.includes(postId)) {
      setLikedPostIds(likedPostIds.filter(id => id !== postId));
      setFeedPosts(feedPosts.map(p => p.id === postId ? { ...p, likesCount: p.likesCount - 1 } : p));
    } else {
      setLikedPostIds([...likedPostIds, postId]);
      setFeedPosts(feedPosts.map(p => p.id === postId ? { ...p, likesCount: p.likesCount + 1 } : p));
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Community Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-[28px] sm:rounded-[32px] border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {t('community.header_title')}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[9px] font-mono-code font-bold uppercase tracking-wider">
                  {t('common.demo_content_badge')}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {t('community.header_desc')}
              </p>
            </div>
          </div>
        </div>

        {/* Discord Join Button */}
        <a
          href="https://discord.com"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#5865F2] hover:bg-[#4752c4] text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-[#5865F2]/25 transition-transform active:scale-95"
        >
          <ExternalLink className="w-4 h-4" />
          <span>{t('community.join_discord_button')}</span>
        </a>
      </div>

      {/* Grid: Feed + Gamification Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Create Post & Feed */}
        <div className="lg:col-span-8 space-y-4">
          {/* Post Creation Box */}
          <div className="bg-slate-900 p-5 rounded-[28px] border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-start gap-3">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"
                alt="Your Avatar"
                className="w-10 h-10 rounded-2xl object-cover border border-sky-500/50"
              />
              <textarea
                rows={2}
                placeholder={t('community.post_input_placeholder')}
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-400 rounded-2xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none resize-none font-mono-code"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono-code">
                <button className="flex items-center gap-1.5 hover:text-white px-3 py-1.5 rounded-xl hover:bg-slate-800">
                  <ImageIcon className="w-4 h-4 text-sky-400" />
                  <span>{t('community.attach_clip_button')}</span>
                </button>
              </div>

              <button
                onClick={handleCreatePost}
                className="px-5 py-2.5 rounded-xl bg-white text-slate-950 hover:bg-sky-400 transition-colors font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t('community.post_to_hub_button')}</span>
              </button>
            </div>
          </div>

          {/* Feed Posts */}
          <div className="space-y-4">
            {feedPosts.map((post) => {
              const isLiked = likedPostIds.includes(post.id);
              return (
                <div
                  key={post.id}
                  className="bg-slate-900 p-6 rounded-[28px] border border-slate-800 shadow-xl space-y-3.5 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="w-10 h-10 rounded-2xl object-cover border border-sky-500/40"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-white">
                            {post.author.name}
                          </span>
                          <span className="text-xs">{post.author.countryFlag}</span>
                          {post.author.verified && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                          )}
                          {post.clanTag && (
                            <span className="text-[9px] px-2 py-0.5 rounded-md font-mono-code font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                              [{post.clanTag}]
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono-code">{post.author.handle} • {post.timestamp}</p>
                      </div>
                    </div>

                    {post.badge && (
                      <span className="text-[9px] px-2.5 py-1 rounded-xl font-mono-code font-bold uppercase bg-amber-500/10 text-amber-300 border border-amber-500/30">
                        {post.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {post.content}
                  </p>

                  {post.mediaUrl && (
                    <div className="relative rounded-2xl overflow-hidden aspect-video border border-slate-800">
                      <img
                        src={post.mediaUrl}
                        alt="Post media"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Post Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800 text-xs text-slate-400 font-mono-code">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleLike(post.id)}
                        className={`flex items-center gap-1.5 hover:text-white transition-colors ${
                          isLiked ? 'text-rose-400 font-bold' : ''
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                        <span>{post.likesCount} {t('community.likes_suffix')}</span>
                      </button>

                      <button className="flex items-center gap-1.5 hover:text-white transition-colors">
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.commentsCount}</span>
                      </button>

                      <button className="flex items-center gap-1.5 hover:text-white transition-colors">
                        <Share2 className="w-4 h-4" />
                        <span>{post.sharesCount}</span>
                      </button>
                    </div>

                    <button
                      onClick={() => setActiveTipStreamer({ id: post.id, name: post.author.name })}
                      className="px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 font-bold transition-all"
                      title="Tip Creator via Mobile Money Tip Jar"
                    >
                      <Gift className="w-3.5 h-3.5 text-amber-400" />
                      <span>{t('community.tip_creator_button')}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tip Modal */}
        {activeTipStreamer && (
          <TipModal
            isOpen={!!activeTipStreamer}
            onClose={() => setActiveTipStreamer(null)}
            streamId={activeTipStreamer.id}
            streamerName={activeTipStreamer.name}
          />
        )}

        {/* Right 4 Cols: Gamipress XP Leaderboard & Clan Perks */}
        <div className="lg:col-span-4 space-y-4">
          {/* XP Leaderboard */}
          <div className="bg-slate-900 p-6 rounded-[28px] border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <h3 className="font-black text-sm uppercase text-white tracking-wider font-rajdhani">
                  {t('community.leaderboard_title')}
                </h3>
              </div>
              <span className="text-[10px] font-mono-code text-slate-400 uppercase">Season 4</span>
            </div>

            <div className="space-y-2.5">
              {leaderboardUsers.map((u) => (
                <div
                  key={u.rank}
                  className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                    u.rank === 1
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : u.rank === 2
                      ? 'bg-slate-300/10 border-slate-300/20'
                      : u.rank === 3
                      ? 'bg-orange-500/10 border-orange-500/20'
                      : 'bg-slate-800/40 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-5 text-center font-bold text-sm font-mono-code ${
                      u.rank === 1 ? 'text-amber-400' : u.rank === 2 ? 'text-slate-300' : u.rank === 3 ? 'text-orange-400' : 'text-slate-500'
                    }`}>
                      #{u.rank}
                    </span>
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-8 h-8 rounded-xl object-cover border border-slate-700"
                    />
                    <div>
                      <div className="flex items-center gap-1 font-bold text-white">
                        <span>{u.name}</span>
                        <span className="text-[9px] text-sky-400 font-mono-code">[{u.clan}]</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono-code">{u.badge}</p>
                    </div>
                  </div>

                  <span className="font-mono-code font-bold text-emerald-400 text-xs">
                    {u.xp}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={onOpenSubscribe}
              className="w-full py-3 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 font-black text-xs uppercase tracking-wider transition-colors"
            >
              Earn 2x XP Boost with Pro Gamer ($5)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
