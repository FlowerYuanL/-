import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Play, Square, Trophy, Users } from 'lucide-react';
import { Participant, Prize, Winner } from '../types';

interface Props {
  currentPrize: Prize | null;
  participants: Participant[];
  winners: Winner[];
  onDraw: (winners: Participant[]) => void;
  prizes: Prize[];
  onChangePrize: (id: string) => void;
}

export const LotteryScreen: React.FC<Props> = ({ 
  currentPrize, 
  participants, 
  winners, 
  onDraw,
  prizes,
  onChangePrize
}) => {
  const [isRolling, setIsRolling] = useState(false);
  const [displayCandidates, setDisplayCandidates] = useState<Participant[]>([]);
  
  // Audio Refs
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const winSfxRef = useRef<HTMLAudioElement | null>(null);

  // Derived state
  const prizeWinners = useMemo(() => 
    winners.filter(w => w.prizeId === currentPrize?.id),
  [winners, currentPrize]);
  
  const remainingQuota = currentPrize ? currentPrize.totalCount - prizeWinners.length : 0;
  
  // Pool of available people
  const eligiblePool = useMemo(() => {
    const winnerIds = new Set(winners.map(w => w.participant.id));
    return participants.filter(p => !winnerIds.has(p.id)); 
  }, [participants, winners]);
  
  // Privacy masker
  const maskPhone = (phone: string) => {
      return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  };

  // Rolling Animation Logic
  useEffect(() => {
    let interval: any;
    if (isRolling && currentPrize) {
      // Find all eligible candidates (those who haven't won ANY prize)
      const allWinnerIds = new Set(winners.map(w => w.participant.id));
      const candidates = participants.filter(p => !allWinnerIds.has(p.id));

      if (candidates.length === 0) {
        setIsRolling(false);
        alert("No eligible participants left!");
        return;
      }

      interval = setInterval(() => {
        // Pick N random people to show in the rolling animation
        const count = Math.min(currentPrize.drawCount, candidates.length);
        const randoms = [];
        for(let i=0; i<count; i++) {
            const ridx = Math.floor(Math.random() * candidates.length);
            randoms.push(candidates[ridx]);
        }
        setDisplayCandidates(randoms);
      }, 80); // Speed of roll
      
      // Play BGM
      // if (bgmRef.current) bgmRef.current.play();
    } else {
      if (interval) clearInterval(interval);
      // if (bgmRef.current) bgmRef.current.pause();
    }

    return () => clearInterval(interval);
  }, [isRolling, currentPrize, participants, winners]);


  const handleStart = () => {
    if (!currentPrize) return;
    if (remainingQuota <= 0) {
        alert("This prize has already been fully drawn!");
        return;
    }
    const allWinnerIds = new Set(winners.map(w => w.participant.id));
    const eligibleCount = participants.filter(p => !allWinnerIds.has(p.id)).length;
    
    if (eligibleCount === 0) {
        alert("No participants left!");
        return;
    }

    setIsRolling(true);
  };

  const handleStop = () => {
    setIsRolling(false);
    
    // Core Logic: Select Winners
    const allWinnerIds = new Set(winners.map(w => w.participant.id));
    const candidates = participants.filter(p => !allWinnerIds.has(p.id));
    
    // How many to draw? Min(batch size, remaining for this prize, total eligible)
    const countToDraw = Math.min(
        currentPrize?.drawCount || 1, 
        remainingQuota,
        candidates.length
    );

    // Shuffle and slice
    const shuffled = [...candidates].sort(() => 0.5 - Math.random());
    const newWinners = shuffled.slice(0, countToDraw);
    
    setDisplayCandidates(newWinners);
    onDraw(newWinners);

    // Effect
    fireConfetti();
    // if (winSfxRef.current) winSfxRef.current.play();
  };

  const fireConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FFD700', '#FFA500', '#FF0000']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FFD700', '#FFA500', '#FF0000']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  if (!currentPrize) {
      return <div className="text-center text-white p-10">Please configure prizes first.</div>;
  }

  return (
    <div className="flex flex-col h-full relative">
       {/* Prize Navigation - Top Bar */}
       <div className="bg-black/40 backdrop-blur-md border-b border-white/10 p-4 flex items-center justify-center gap-4 overflow-x-auto scrollbar-hide">
          {prizes.map(p => {
              const pWins = winners.filter(w => w.prizeId === p.id).length;
              const isFinished = pWins >= p.totalCount;
              const isActive = currentPrize.id === p.id;
              
              return (
                  <button
                    key={p.id}
                    onClick={() => !isRolling && onChangePrize(p.id)}
                    disabled={isRolling}
                    className={`
                        flex flex-col items-center px-6 py-2 rounded-lg transition-all min-w-[120px]
                        ${isActive ? 'bg-gradient-to-t from-yellow-600/50 to-yellow-500/10 border-yellow-500 border' : 'bg-white/5 border border-transparent hover:bg-white/10'}
                        ${isFinished ? 'opacity-50 grayscale' : ''}
                    `}
                  >
                      <span className={`text-sm font-bold ${isActive ? 'text-yellow-400' : 'text-white/80'}`}>{p.name}</span>
                      <span className="text-xs text-white/50">{pWins} / {p.totalCount}</span>
                  </button>
              )
          })}
       </div>

       {/* Main Stage */}
       <div className="flex-1 flex flex-col items-center justify-center py-8">
            <div className="text-center mb-8 animate-fade-in-up">
                <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-700 tracking-wider drop-shadow-lg mb-4">
                    {currentPrize.name}
                </h1>
                <h2 className="text-3xl text-white/90 font-light tracking-widest uppercase border-y border-white/20 py-2 inline-block px-10 bg-black/20 backdrop-blur">
                    {currentPrize.item}
                </h2>
                <div className="mt-4 text-white/60 font-mono">
                    Remaining: <span className="text-yellow-400 font-bold text-xl">{remainingQuota}</span>
                </div>
            </div>

            {/* The Rolling Box */}
            <div className="w-full max-w-6xl px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 justify-center">
                    {(isRolling || displayCandidates.length > 0) ? (
                        displayCandidates.map((c) => (
                            <div key={c.id} className="relative group perspective">
                                <div className="bg-gradient-to-br from-red-800 to-red-900 border-2 border-yellow-500/50 rounded-xl p-6 text-center shadow-[0_0_30px_rgba(234,179,8,0.2)] transform transition-all duration-300 hover:scale-105">
                                    <div className="w-16 h-16 bg-yellow-500/20 rounded-full mx-auto mb-3 flex items-center justify-center border border-yellow-500/30 text-yellow-300">
                                        <Users />
                                    </div>
                                    <div className="text-2xl font-bold text-white mb-1 truncate">{c.name}</div>
                                    <div className="text-yellow-400/80 font-mono text-lg">{maskPhone(c.phone)}</div>
                                    <div className="text-xs text-white/40 mt-2 uppercase tracking-wide">{c.department}</div>
                                </div>
                            </div>
                        ))
                    ) : (
                        // Placeholder Empty Slots
                        Array.from({ length: Math.min(currentPrize.drawCount, remainingQuota > 0 ? remainingQuota : 0) }).map((_, i) => (
                            <div key={i} className="bg-black/20 border-2 border-dashed border-white/10 rounded-xl p-6 flex items-center justify-center h-[200px]">
                                <Trophy className="w-12 h-12 text-white/10" />
                            </div>
                        ))
                    )}
                </div>
            </div>
       </div>

       {/* Controls - Fixed Bottom */}
       <div className="p-8 pb-12 flex justify-center bg-gradient-to-t from-black/80 to-transparent">
            {!isRolling ? (
                 <button 
                    onClick={handleStart}
                    disabled={remainingQuota <= 0}
                    className="group relative px-12 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full text-2xl font-black text-red-900 shadow-[0_0_40px_rgba(234,179,8,0.4)] hover:shadow-[0_0_60px_rgba(234,179,8,0.6)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                 >
                    <span className="flex items-center gap-3">
                        <Play className="fill-current w-8 h-8" /> START ROLL
                    </span>
                 </button>
            ) : (
                <button 
                    onClick={handleStop}
                    className="group relative px-12 py-4 bg-gradient-to-r from-red-600 to-red-700 rounded-full text-2xl font-black text-white shadow-[0_0_40px_rgba(220,38,38,0.4)] hover:shadow-[0_0_60px_rgba(220,38,38,0.6)] hover:scale-105 active:scale-95 transition-all"
                >
                    <span className="flex items-center gap-3">
                        <Square className="fill-current w-8 h-8" /> STOP
                    </span>
                </button>
            )}
       </div>

       {/* Sound Placeholders */}
       <audio ref={bgmRef} loop src="#" />
       <audio ref={winSfxRef} src="#" />
    </div>
  );
};