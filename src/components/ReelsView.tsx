import React, { useState, useRef, useEffect } from 'react';
import { ReelClip, Currency } from '../types';
import { MOCK_REELS, CURRENCY_RATES } from '../data/mockData';
import { getMuxPlaybackUrl, getMuxPosterUrl } from '../lib/mux';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Send,
  X,
  Flame,
  CheckCircle2,
  Music
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../lib/i18n';

interface ReelsViewProps {
  currentCurrency: Currency;
  onSaveToLibrary?: (clip: ReelClip) => void;
  onOpenCreator?: (creatorId: string) => void;
}

export const ReelsView: React.FC<ReelsViewProps> = ({
  currentCurrency,
  onSaveToLibrary,
  onOpenCreator
}) => {
  const { t } = useLanguage();
  const [reels, setReels] = useState<ReelClip[]>(MOCK_REELS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [commentsList, setCommentsList] = useState([
    { id: 'c_1', user: 'KampalaGamer99', text: 'That flick shot was completely unreal! 🔥', time: '2m ago' },
    { id: 'c_2', user: 'NairobiSniper', text: 'What sensitivity are you using on gyro?', time: '12m ago' },
    { id: 'c_3', user: 'ApexPredator_99', text: 'Visor Stream esports is unmatched! 🔥🎮', time: '1h ago' }
  ]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const currentClip = reels[currentIndex] || reels[0];
  const currentVideoUrl = getMuxPlaybackUrl(currentClip?.muxPlaybackId) || currentClip.videoUrl;
  const currentPosterUrl = getMuxPosterUrl(currentClip?.muxPlaybackId) || currentClip.posterUrl;

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < reels.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0); // loop
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      setCurrentIndex(reels.length - 1);
    }
  };

  const handleTogglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  const handleToggleLike = () => {
    setReels(prev => prev.map((item, idx) => {
      if (idx === currentIndex) {
        const nextLiked = !item.isLiked;
        if (nextLiked) {
          confetti({
            particleCount: 40,
            spread: 60,
            origin: { x: 0.5, y: 0.6 }
          });
        }
        return {
          ...item,
          isLiked: nextLiked,
          likes: nextLiked ? item.likes + 1 : item.likes - 1
        };
      }
      return item;
    }));
  };

  const handleToggleSave = () => {
    setReels(prev => prev.map((item, idx) => {
      if (idx === currentIndex) {
        const nextSaved = !item.isSaved;
        if (nextSaved && onSaveToLibrary) {
          onSaveToLibrary(item);
        }
        setToastMessage(nextSaved ? t('reels.toast_saved') : t('reels.toast_removed'));
        setTimeout(() => setToastMessage(null), 3000);
        return {
          ...item,
          isSaved: nextSaved
        };
      }
      return item;
    }));
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`https://visorstream.live/reels/${currentClip.id}`);
    }
    setToastMessage(t('reels.toast_share_copied'));
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setCommentsList(prev => [
      { id: `c_${Date.now()}`, user: 'You (Gamer)', text: commentInput.trim(), time: 'Just now' },
      ...prev
    ]);
    setCommentInput('');
    setReels(prev => prev.map((item, idx) => idx === currentIndex ? { ...item, commentsCount: item.commentsCount + 1 } : item));
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-2 sm:py-6 px-2 sm:px-4">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#171a21] border border-[#38bdf8] text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-2xl animate-fadeIn flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#38bdf8]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Reel Viewport */}
      <div className="relative flex flex-col md:flex-row items-center justify-center gap-4">
        {/* Navigation Up / Down buttons on desktop */}
        <div className="hidden md:flex flex-col gap-3 z-10">
          <button
            onClick={handlePrev}
            className="p-3 rounded-full bg-[#171a21] border border-[#2a475e] text-slate-300 hover:text-white hover:border-[#38bdf8] transition-all"
            title="Previous clip (Up)"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="p-3 rounded-full bg-[#171a21] border border-[#2a475e] text-slate-300 hover:text-white hover:border-[#38bdf8] transition-all"
            title="Next clip (Down)"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        {/* Video Card Container */}
        <div className="relative w-full max-w-[420px] aspect-[9/16] bg-[#0b0e14] border border-[#2a475e] rounded-3xl overflow-hidden shadow-2xl shadow-black/80 flex items-center justify-center">
          <video
            ref={videoRef}
            src={currentVideoUrl}
            poster={currentPosterUrl}
            loop
            muted={isMuted}
            playsInline
            autoPlay
            onClick={handleTogglePlay}
            className="w-full h-full object-cover cursor-pointer"
          />

          {/* Play/Pause Overlay indicator on pause */}
          {!isPlaying && (
            <div 
              onClick={handleTogglePlay}
              className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-[#171a21]/90 border border-[#38bdf8] flex items-center justify-center text-[#38bdf8] shadow-2xl">
                <Play className="w-8 h-8 fill-current ml-1" />
              </div>
            </div>
          )}

          {/* Top Controls: Sound Mute/Unmute & Game Badge */}
          <div className="absolute top-4 inset-x-4 flex items-center justify-between z-20 pointer-events-none">
            <div className="px-3 py-1 bg-[#171a21]/80 backdrop-blur-md border border-[#2a475e] rounded-xl text-xs font-mono-code text-[#38bdf8] font-bold pointer-events-auto">
              {currentClip.game}
            </div>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-xl bg-[#171a21]/80 backdrop-blur-md border border-[#2a475e] text-white hover:text-[#38bdf8] transition-all pointer-events-auto"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#38bdf8]" />}
            </button>
          </div>

          {/* Right Action Floating Sidebar */}
          <div className="absolute right-3 bottom-24 flex flex-col items-center gap-4 z-20">
            {/* Like */}
            <button
              onClick={handleToggleLike}
              className="flex flex-col items-center gap-1 group"
            >
              <div className={`p-3 rounded-full backdrop-blur-md border transition-all ${
                currentClip.isLiked 
                  ? 'bg-rose-500 text-white border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.5)] scale-110' 
                  : 'bg-[#171a21]/80 text-slate-200 border-[#2a475e] hover:border-rose-400'
              }`}>
                <Heart className={`w-5 h-5 ${currentClip.isLiked ? 'fill-current' : ''}`} />
              </div>
              <span className="text-[11px] font-mono-code font-bold text-white drop-shadow">
                {currentClip.likes.toLocaleString()}
              </span>
            </button>

            {/* Comments */}
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex flex-col items-center gap-1 group"
            >
              <div className="p-3 rounded-full bg-[#171a21]/80 backdrop-blur-md border border-[#2a475e] text-slate-200 hover:border-[#38bdf8] hover:text-[#38bdf8] transition-all">
                <MessageCircle className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono-code font-bold text-white drop-shadow">
                {currentClip.commentsCount}
              </span>
            </button>

            {/* Bookmark / Save to Library */}
            <button
              onClick={handleToggleSave}
              className="flex flex-col items-center gap-1 group"
            >
              <div className={`p-3 rounded-full backdrop-blur-md border transition-all ${
                currentClip.isSaved 
                  ? 'bg-[#38bdf8] text-[#0b0e14] border-[#38bdf8] shadow-[0_0_15px_rgba(56,189,248,0.5)]' 
                  : 'bg-[#171a21]/80 text-slate-200 border-[#2a475e] hover:border-[#38bdf8]'
              }`}>
                <Bookmark className={`w-5 h-5 ${currentClip.isSaved ? 'fill-current' : ''}`} />
              </div>
              <span className="text-[11px] font-mono-code font-bold text-white drop-shadow">
                {t('reels.save_label')}
              </span>
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="flex flex-col items-center gap-1 group"
            >
              <div className="p-3 rounded-full bg-[#171a21]/80 backdrop-blur-md border border-[#2a475e] text-slate-200 hover:border-[#38bdf8] hover:text-[#38bdf8] transition-all">
                <Share2 className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono-code font-bold text-white drop-shadow">
                {t('reels.share_label')}
              </span>
            </button>
          </div>

          {/* Bottom Gradient Overlay & Meta info */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0b0e14] via-[#0b0e14]/80 to-transparent pt-12 pb-4 px-4 z-10 pointer-events-none">
            <div className="flex items-center gap-2.5 mb-2 pointer-events-auto">
              <img
                src={currentClip.creator.avatar}
                alt={currentClip.creator.name}
                className="w-10 h-10 rounded-xl object-cover border border-[#38bdf8]"
                referrerPolicy="no-referrer"
              />
              <div className="flex flex-col leading-tight">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-white text-sm">{currentClip.creator.name}</span>
                  {currentClip.creator.verified && <CheckCircle2 className="w-3.5 h-3.5 text-[#38bdf8]" />}
                </div>
                <span className="text-xs font-mono-code text-slate-400">{currentClip.creator.handle}</span>
              </div>
              <button 
                onClick={() => {
                  setToastMessage(`Subscribed to ${currentClip.creator.name}!`);
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                className="ml-auto px-3 py-1 rounded-lg bg-[#38bdf8] text-[#0b0e14] text-xs font-bold uppercase tracking-wider hover:bg-[#66c0f4] transition-all shadow-md"
              >
                {t('reels.follow_button')}
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 mb-2 pointer-events-auto font-medium">
              {currentClip.title}
            </p>

            <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto">
              {currentClip.tags.map(tag => (
                <span key={tag} className="text-[10px] font-mono-code text-[#38bdf8] bg-[#38bdf8]/10 px-2 py-0.5 rounded-md border border-[#38bdf8]/20">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Swipe Buttons below player */}
        <div className="flex md:hidden items-center justify-between w-full max-w-[420px] px-4 pt-1">
          <button
            onClick={handlePrev}
            className="flex-1 py-2 mr-2 bg-[#171a21] border border-[#2a475e] rounded-xl text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5"
          >
            <ChevronUp className="w-4 h-4" /> Previous Clip
          </button>
          <button
            onClick={handleNext}
            className="flex-1 py-2 bg-[#38bdf8] text-[#0b0e14] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
          >
            Next Clip <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Comments Drawer Modal Overlay */}
      {showComments && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-[#171a21] border border-[#2a475e] rounded-t-3xl sm:rounded-2xl shadow-2xl p-4 max-h-[80vh] flex flex-col animate-slideUp">
            <div className="flex items-center justify-between pb-3 border-b border-[#2a475e]">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#38bdf8]" />
                <h3 className="text-sm font-bold text-white">{t('reels.comments_title')} ({commentsList.length})</h3>
              </div>
              <button
                onClick={() => setShowComments(false)}
                className="p-1 rounded-lg hover:bg-[#1b2838] text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable comments list */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3 scroll-contained">
              {commentsList.map(c => (
                <div key={c.id} className="p-2.5 rounded-xl bg-[#0b0e14] border border-[#2a475e]/60 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#38bdf8]">{c.user}</span>
                    <span className="text-[10px] font-mono-code text-slate-500">{c.time}</span>
                  </div>
                  <p className="text-slate-300">{c.text}</p>
                </div>
              ))}
            </div>

            {/* Comment input form */}
            <form onSubmit={handleAddComment} className="pt-2 border-t border-[#2a475e] flex gap-2">
              <input
                type="text"
                placeholder={t('reels.comment_input_placeholder')}
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                className="flex-1 px-3 py-2 bg-[#0b0e14] border border-[#2a475e] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#38bdf8]"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-[#38bdf8] text-[#0b0e14] font-bold hover:bg-[#66c0f4]"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
