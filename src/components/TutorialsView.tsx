import React, { useState } from 'react';
import { GamingTutorial } from '../types';
import { getMuxPlaybackUrl } from '../lib/mux';
import { createMuxDirectUpload } from '../services/muxService';
import {
  BookOpen,
  Play,
  Clock,
  Star,
  ThumbsUp,
  Bookmark,
  CheckCircle2,
  Filter,
  Layers,
  Crosshair,
  Shield,
  Smartphone,
  Monitor,
  Gamepad,
  Sparkles,
  PlusCircle,
  X,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TutorialsViewProps {
  tutorials: GamingTutorial[];
  onUploadTutorial?: (tutorial: GamingTutorial) => void;
  onOpenSubscribe: () => void;
}

export const TutorialsView: React.FC<TutorialsViewProps> = ({
  tutorials,
  onUploadTutorial,
  onOpenSubscribe,
}) => {
  const [selectedGame, setSelectedGame] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [activeTutorial, setActiveTutorial] = useState<GamingTutorial>(tutorials[0]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(['tut_1']);
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // New tutorial form state
  const [newTitle, setNewTitle] = useState('');
  const [newGame, setNewGame] = useState('PUBG Mobile');
  const [newDifficulty, setNewDifficulty] = useState<'Beginner' | 'Intermediate' | 'Pro' | 'Master'>('Intermediate');
  const [newPlatform, setNewPlatform] = useState<'Mobile' | 'PC' | 'Console' | 'Cross-Platform'>('Mobile');
  const [newMission, setNewMission] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [uploadingVideo, setUploadingVideo] = useState<File | null>(null);
  const [muxUploadStatus, setMuxUploadStatus] = useState<string | null>(null);

  const gamesList = ['all', 'PUBG Mobile', 'EA Sports FC 24', 'Apex Legends Mobile', 'Free Fire', 'Tekken 8', 'Valorant'];
  const difficulties = ['all', 'Beginner', 'Intermediate', 'Pro', 'Master'];

  const filteredTutorials = tutorials.filter((tut) => {
    if (selectedGame !== 'all' && tut.game !== selectedGame) return false;
    if (selectedDifficulty !== 'all' && tut.difficulty !== selectedDifficulty) return false;
    if (selectedPlatform !== 'all' && tut.platform !== selectedPlatform) return false;
    return true;
  });

  const toggleBookmark = (id: string) => {
    if (bookmarkedIds.includes(id)) {
      setBookmarkedIds(bookmarkedIds.filter(b => b !== id));
    } else {
      setBookmarkedIds([...bookmarkedIds, id]);
      confetti({ particleCount: 20, spread: 40 });
    }
  };

  const handleCreateTutorial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created: GamingTutorial = {
      id: 'tut_' + Date.now(),
      title: newTitle,
      game: newGame,
      gameCategory: 'Action / Strategy',
      author: {
        id: 'user_me',
        name: 'You (Creator)',
        handle: '@ProGamer',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        verified: true,
        country: 'Uganda',
        countryCode: 'UG',
        countryFlag: '🇺🇬',
        subscribers: 1200,
        bio: 'Community content creator on Visor.',
        mobileMoneySupported: true,
      },
      thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      difficulty: newDifficulty,
      duration: '12:30',
      views: 1,
      rating: 5.0,
      likes: 1,
      missionName: newMission || 'Mission & Skill Walkthrough',
      platform: newPlatform,
      updatedAt: 'Just now',
      description: newDesc || 'Community walkthrough guide published on Visor Stream.',
      keyTakeaways: [
        'Master the fundamental mechanics and timing',
        'Use optimized sensitivities for maximum control',
        'Learn positioning to isolate 1v1 engagements'
      ],
      recommendedLoadout: ['Primary Meta Weapon', 'Tactical Gear Kit', 'Low-Latency Server Routing'],
      chapters: [
        { id: 'c1', title: 'Mission Overview & Objective', timestamp: '00:00', durationSeconds: 150 },
        { id: 'c2', title: 'Execution & Boss Fight Tactic', timestamp: '02:30', durationSeconds: 300 },
        { id: 'c3', title: 'Summary & Key Takeaways', timestamp: '07:30', durationSeconds: 300 },
      ]
    };

    if (onUploadTutorial) {
      onUploadTutorial(created);
    }
    setActiveTutorial(created);
    setUploadModalOpen(false);
    confetti({ particleCount: 70, spread: 60 });
  };

  const handleMuxVideoUpload = async (file: File) => {
    setUploadingVideo(file);
    setMuxUploadStatus('Requesting Mux upload URL...');
    const { uploadUrl } = await createMuxDirectUpload();
    setMuxUploadStatus('Uploading video to Mux...');
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type || 'video/mp4',
      },
      body: file,
    });
    if (!uploadRes.ok) {
      throw new Error('Mux upload failed');
    }
    setMuxUploadStatus('Upload sent to Mux. Waiting for processing...');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner: Tutorials & Mission Guides Bento Hero Header */}
      <div className="relative rounded-[28px] sm:rounded-[32px] overflow-hidden bg-slate-900 p-6 sm:p-8 border border-slate-800 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/30 text-xs font-mono-code font-bold uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              <span>VISOR GAMING ACADEMY & MISSION GUIDES</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Master Every Mission. Level Up Your Skills.
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Step-by-step video tutorials, zero-recoil sensitivity blueprints, frame data breakdowns, and pro meta tactics crafted by top-ranked tournament champions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setUploadModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-950 hover:bg-sky-400 transition-colors font-black text-xs uppercase tracking-widest shadow-lg shadow-sky-500/10"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="text-slate-950">Publish A Tutorial</span>
            </button>

            <button
              onClick={onOpenSubscribe}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase font-mono-code"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-white">Unlock Masterclass Tier</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Focus: Featured Tutorial Master Player & Chapters (Bento Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Active Player (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative aspect-video w-full bg-slate-950 rounded-[28px] sm:rounded-[32px] overflow-hidden border border-slate-800 shadow-2xl">
            <video
              key={activeTutorial.id}
              src={getMuxPlaybackUrl(activeTutorial.muxPlaybackId) || activeTutorial.videoUrl}
              controls
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex items-center gap-2 pointer-events-none">
              <span className="px-3 py-1 rounded-xl bg-sky-500 text-slate-950 font-black text-xs uppercase shadow">
                TUTORIAL • {activeTutorial.difficulty}
              </span>
              <span className="px-3 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md text-white text-xs font-mono-code border border-slate-800">
                {activeTutorial.game}
              </span>
            </div>
          </div>

          {/* Tutorial Details Card */}
          <div className="bg-slate-900 rounded-[28px] p-6 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-sky-400 font-bold uppercase font-mono-code">
                  <span>{activeTutorial.missionName || activeTutorial.gameCategory}</span>
                  <span>•</span>
                  <span>{activeTutorial.platform} Platform</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {activeTutorial.title}
                </h2>
                <div className="flex items-center gap-4 text-xs text-slate-400 font-mono-code">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-sky-400" />
                    {activeTutorial.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    {activeTutorial.rating} / 5.0 ({activeTutorial.views.toLocaleString()} views)
                  </span>
                  <span>Updated {activeTutorial.updatedAt}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleBookmark(activeTutorial.id)}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                    bookmarkedIds.includes(activeTutorial.id)
                      ? 'bg-sky-500/20 text-sky-400 border-sky-500'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                  title="Bookmark Guide"
                >
                  <Bookmark className={`w-4 h-4 ${bookmarkedIds.includes(activeTutorial.id) ? 'fill-sky-400' : ''}`} />
                  <span>Save</span>
                </button>
              </div>
            </div>

            {/* Author Profile */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
              <img
                src={activeTutorial.author.avatar}
                alt={activeTutorial.author.name}
                className="w-11 h-11 rounded-2xl object-cover border-2 border-sky-400/80 shadow-md shadow-sky-400/20"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-white">
                    {activeTutorial.author.name}
                  </span>
                  <span className="text-xs">{activeTutorial.author.countryFlag}</span>
                  {activeTutorial.author.verified && (
                    <CheckCircle2 className="w-4 h-4 text-sky-400" />
                  )}
                </div>
                <p className="text-xs text-slate-400 font-mono-code">{activeTutorial.author.handle} • Verified Instructor</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {activeTutorial.description}
            </p>

            {/* Key Takeaways & Recommended Loadout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
              {/* Key Takeaways */}
              <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase font-mono-code text-sky-400">
                  <Crosshair className="w-4 h-4" />
                  <span>Key Mission Rules & Tactics</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {activeTutorial.keyTakeaways.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-sky-400 font-bold">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Pro Loadout */}
              <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase font-mono-code text-amber-400">
                  <Shield className="w-4 h-4" />
                  <span>Recommended Pro Setup</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {activeTutorial.recommendedLoadout.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">★</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Chapter Scrubber & Guide Content (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 rounded-[28px] sm:rounded-[32px] p-6 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                <h3 className="font-black text-xs uppercase text-slate-400 tracking-widest font-mono-code">
                  Tutorial Chapters
                </h3>
              </div>
              <span className="text-[11px] font-mono-code text-sky-400 font-bold">
                {activeTutorial.chapters.length} Chapters
              </span>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {activeTutorial.chapters.map((ch, idx) => (
                <div
                  key={ch.id}
                  onClick={() => setActiveChapterIndex(idx)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    activeChapterIndex === idx
                      ? 'bg-sky-500/15 border-sky-400 text-white shadow-sm'
                      : 'bg-slate-800/50 border-slate-800 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono-code font-bold text-sky-400">
                      {ch.timestamp}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono-code">
                      Chapter {idx + 1}
                    </span>
                  </div>
                  <p className="text-xs font-semibold leading-snug">
                    {ch.title}
                  </p>
                </div>
              ))}
            </div>

            {/* Quick Practice Challenge */}
            <div className="p-4 bg-slate-950/80 border border-sky-500/30 rounded-2xl text-xs space-y-1.5">
              <div className="font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span>Mission Mastery Test</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-normal">
                Complete this guide's drill to earn 150 Visor XP points and unlock the "Tactical Specialist" profile badge.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Browse All Tutorials Section */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="font-black text-lg text-white uppercase tracking-wider font-rajdhani flex items-center gap-2">
              <Filter className="w-4 h-4 text-sky-400" />
              <span>Explore All Gaming Walkthroughs & Missions ({filteredTutorials.length})</span>
            </h3>
            <p className="text-xs text-slate-400">
              Filter by favorite titles, mission difficulty, and platform
            </p>
          </div>

          {/* Game filter chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            {gamesList.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGame(g)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedGame === g
                    ? 'bg-[#0284c7]/20 text-sky-300 border border-[#0369a1]/40 shadow-[0_0_10px_rgba(2,132,199,0.15)]'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {g === 'all' ? 'All Games' : g}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty secondary bar */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-mono-code font-bold">Difficulty:</span>
          {difficulties.map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono-code transition-colors ${
                selectedDifficulty === diff
                  ? 'bg-[#0284c7]/20 text-sky-300 font-bold border border-[#0369a1]/40 shadow-[0_0_8px_rgba(2,132,199,0.12)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>

        {/* Tutorial Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredTutorials.map((tut) => (
            <div
              key={tut.id}
              onClick={() => {
                setActiveTutorial(tut);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`group bg-slate-900 rounded-2xl overflow-hidden border cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                activeTutorial.id === tut.id
                  ? 'border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.25)]'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={tut.thumbnail}
                  alt={tut.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-md text-sky-400 font-bold text-[10px] font-mono-code border border-sky-500/40">
                    {tut.difficulty}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-mono-code">
                    {tut.platform}
                  </span>
                </div>
                <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-slate-950/80 text-[10px] font-mono-code text-slate-300">
                  {tut.duration}
                </div>
              </div>

              <div className="p-4 space-y-2.5">
                <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2 group-hover:text-sky-400 transition-colors leading-snug">
                  {tut.title}
                </h4>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <span className="text-sky-400 font-mono-code truncate font-semibold">{tut.game}</span>
                  <span className="flex items-center gap-1 font-mono-code">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    {tut.rating}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Creator Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#121824] border border-white/[0.15] rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-[#00B4D8]/20 text-[#00B4D8]">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-rajdhani font-bold text-lg text-white">
                    Publish Gaming Tutorial / Walkthrough
                  </h3>
                  <p className="text-xs text-slate-400">Share your skill & earn creator revenue</p>
                </div>
              </div>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTutorial} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Video File</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleMuxVideoUpload(file).catch((err) => {
                        setMuxUploadStatus(err instanceof Error ? err.message : 'Mux upload failed');
                      });
                    }
                  }}
                  className="w-full text-xs text-slate-300"
                />
                {muxUploadStatus && <p className="text-[11px] text-sky-300">{muxUploadStatus}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Tutorial Title</label>
                <input
                  type="text"
                  placeholder="e.g. EA FC 24: Guaranteed Corner Kick Routine"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#171e2b] border border-white/[0.1] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00B4D8]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Game</label>
                  <select
                    value={newGame}
                    onChange={(e) => setNewGame(e.target.value)}
                    className="w-full px-3 py-2 bg-[#171e2b] border border-white/[0.1] rounded-lg text-xs text-slate-200 focus:outline-none focus:border-[#00B4D8]"
                  >
                    <option value="PUBG Mobile">PUBG Mobile</option>
                    <option value="EA Sports FC 24">EA Sports FC 24</option>
                    <option value="Apex Legends Mobile">Apex Legends Mobile</option>
                    <option value="Free Fire">Free Fire</option>
                    <option value="Tekken 8">Tekken 8</option>
                    <option value="Valorant">Valorant</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Difficulty</label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#171e2b] border border-white/[0.1] rounded-lg text-xs text-slate-200 focus:outline-none focus:border-[#00B4D8]"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Pro">Pro</option>
                    <option value="Master">Master</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Mission Name or Concept</label>
                <input
                  type="text"
                  placeholder="e.g. Sensitivity Calibration, Boss Fight Strategy"
                  value={newMission}
                  onChange={(e) => setNewMission(e.target.value)}
                  className="w-full px-3 py-2 bg-[#171e2b] border border-white/[0.1] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00B4D8]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Detailed Description & Tips</label>
                <textarea
                  rows={3}
                  placeholder="Provide step by step explanations to help players overcome this mission..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-[#171e2b] border border-white/[0.1] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00B4D8]"
                />
              </div>

              <div className="p-3 bg-[#0d141f] rounded-lg border border-white/[0.04] text-[11px] text-slate-400 space-y-1">
                <span className="text-[#00B4D8] font-bold">💡 Creator Tip:</span>
                <p>Tutorials on Visor earn 70% share from subscription views and are eligible for monthly Visor Creator Grants.</p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#0074e4] to-[#00B4D8] hover:opacity-95 text-white font-rajdhani font-bold text-sm tracking-wider uppercase shadow-lg shadow-[#0074e4]/30 transition-transform active:scale-98"
                >
                  Publish Tutorial to Visor Academy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
