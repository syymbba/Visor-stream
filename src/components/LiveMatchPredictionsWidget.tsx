import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Coins,
  CheckCircle2,
  Clock,
  TrendingUp,
  Award,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Shield,
  Zap,
  Gamepad2
} from 'lucide-react';

interface LiveMatchPredictionsWidgetProps {
  streamTitle?: string;
  gameCategory?: string;
}

export const LiveMatchPredictionsWidget: React.FC<LiveMatchPredictionsWidgetProps> = ({
  streamTitle,
  gameCategory,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userLoyaltyPoints, setUserLoyaltyPoints] = useState(1250);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | null>(null);
  const [wagerAmount, setWagerAmount] = useState(250);
  const [hasVoted, setHasVoted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(140); // seconds
  const [isResolved, setIsResolved] = useState(false);
  const [winningOption, setWinningOption] = useState<'A' | 'B' | null>(null);

  // Prediction State
  const [prediction, setPrediction] = useState({
    id: 'pred-uganda-vs-kenya',
    question: 'Will Uganda Vipers win Game 2 against Nairobi Kings?',
    optionA: 'Uganda Vipers (Yes)',
    optionB: 'Nairobi Kings (No)',
    poolA: 42000,
    poolB: 28500,
    totalVoters: 184,
  });

  // Calculate dynamic percentages and odds
  const totalPool = prediction.poolA + prediction.poolB;
  const percentA = Math.round((prediction.poolA / totalPool) * 100) || 50;
  const percentB = 100 - percentA;
  const oddsA = (totalPool / prediction.poolA).toFixed(2);
  const oddsB = (totalPool / prediction.poolB).toFixed(2);

  useEffect(() => {
    if (timeLeft <= 0 || isResolved) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isResolved]);

  const handleVote = (choice: 'A' | 'B') => {
    if (hasVoted || userLoyaltyPoints < wagerAmount || timeLeft <= 0) return;

    setSelectedOption(choice);
    setUserLoyaltyPoints((pts) => pts - wagerAmount);
    setHasVoted(true);

    // Update pool
    setPrediction((prev) => ({
      ...prev,
      poolA: choice === 'A' ? prev.poolA + wagerAmount : prev.poolA,
      poolB: choice === 'B' ? prev.poolB + wagerAmount : prev.poolB,
      totalVoters: prev.totalVoters + 1,
    }));
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  // Mock resolve prediction
  const handleResolvePrediction = (winner: 'A' | 'B') => {
    setIsResolved(true);
    setWinningOption(winner);
    if (selectedOption === winner) {
      const payoutOdds = winner === 'A' ? parseFloat(oddsA) : parseFloat(oddsB);
      const winnings = Math.round(wagerAmount * payoutOdds);
      setUserLoyaltyPoints((pts) => pts + winnings);
    }
  };

  return (
    <div className="relative rounded-2xl bg-slate-900 border border-purple-500/30 p-3.5 shadow-xl animate-fadeIn space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-white uppercase tracking-wide">
                MATCH PREDICTION
              </span>
              <span className="px-1.5 py-0.2 rounded-md bg-purple-500/20 text-purple-300 font-mono-code font-bold text-[10px] border border-purple-500/40">
                {timeLeft > 0 ? `Submissions Open (${formatTime(timeLeft)})` : 'Voting Locked'}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium flex items-center gap-1.5">
              <Gamepad2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              {prediction.question}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono-code text-amber-400 font-bold flex items-center gap-1">
            <Coins className="w-3 h-3" />
            <span>{userLoyaltyPoints.toLocaleString()} PTS</span>
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="space-y-3 pt-1">
          {/* Progress Bar of Options */}
          <div className="space-y-1">
            <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden flex border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
                style={{ width: `${percentA}%` }}
              ></div>
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-500"
                style={{ width: `${percentB}%` }}
              ></div>
            </div>

            <div className="flex justify-between text-[11px] font-mono-code">
              <span className="text-cyan-400 font-bold">
                {percentA}% ({oddsA}x) • {prediction.poolA.toLocaleString()} pts
              </span>
              <span className="text-rose-400 font-bold">
                {percentB}% ({oddsB}x) • {prediction.poolB.toLocaleString()} pts
              </span>
            </div>
          </div>

          {/* Voting Action Buttons */}
          {!hasVoted && timeLeft > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Wager Channel Points:</span>
                <div className="flex items-center gap-1">
                  {[100, 250, 500, 1000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setWagerAmount(amt)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-mono-code font-bold transition-colors ${
                        wagerAmount === amt
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {amt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleVote('A')}
                  className="py-2 px-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 font-bold text-xs flex flex-col items-center gap-0.5 transition-transform active:scale-95"
                >
                  <span>{prediction.optionA}</span>
                  <span className="text-[10px] font-mono-code text-blue-400">Vote A • {oddsA}x Returns</span>
                </button>

                <button
                  onClick={() => handleVote('B')}
                  className="py-2 px-3 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-bold text-xs flex flex-col items-center gap-0.5 transition-transform active:scale-95"
                >
                  <span>{prediction.optionB}</span>
                  <span className="text-[10px] font-mono-code text-rose-400">Vote B • {oddsB}x Returns</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300">
                  You predicted:{' '}
                  <strong className="text-white">
                    {selectedOption === 'A' ? prediction.optionA : prediction.optionB}
                  </strong>{' '}
                  ({wagerAmount} pts)
                </span>
              </div>
              <span className="text-[11px] font-mono-code text-purple-400 font-bold">
                Potential Return:{' '}
                {Math.round(wagerAmount * parseFloat(selectedOption === 'A' ? oddsA : oddsB))} pts
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
