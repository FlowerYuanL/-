import React, { useState, useEffect } from 'react';
import { Settings, Home, List, PartyPopper } from 'lucide-react';
import { AppView, LotteryState, Participant, Prize, Winner } from './types';
import { loadState, saveState } from './utils/storage';
import { ImportPanel } from './components/ImportPanel';
import { PrizeConfig } from './components/PrizeConfig';
import { LotteryScreen } from './components/LotteryScreen';
import { ResultPanel } from './components/ResultPanel';

function App() {
  const [view, setView] = useState<AppView>('lottery');
  
  // State
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [currentPrizeId, setCurrentPrizeId] = useState<string | null>(null);

  // Initialization
  useEffect(() => {
    const saved = loadState();
    setParticipants(saved.participants);
    setPrizes(saved.prizes);
    setWinners(saved.winners);
    setCurrentPrizeId(saved.currentPrizeId || (saved.prizes.length > 0 ? saved.prizes[0].id : null));
  }, []);

  // Persistence
  useEffect(() => {
    saveState({
      participants,
      prizes,
      winners,
      currentPrizeId
    });
  }, [participants, prizes, winners, currentPrizeId]);

  // Handlers
  const handleImport = (data: Participant[]) => {
    setParticipants(data);
    alert(`Successfully imported ${data.length} participants.`);
  };

  const handleClearData = () => {
    setParticipants([]);
    setWinners([]);
    saveState({ ...loadState(), participants: [], winners: [] });
  };

  const handleResetWinners = () => {
      setWinners([]);
  };

  const handleDraw = (newWinners: Participant[]) => {
    if (!currentPrizeId) return;
    
    const winRecords: Winner[] = newWinners.map(p => ({
        prizeId: currentPrizeId,
        participant: p,
        timestamp: Date.now()
    }));
    
    setWinners(prev => [...prev, ...winRecords]);
  };

  const currentPrize = prizes.find(p => p.id === currentPrizeId) || null;

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900 via-red-950 to-black text-white selection:bg-yellow-500 selection:text-black">
      
      {/* Dynamic Background Particles (CSS only for simplicity) */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-2 rounded-lg shadow-lg shadow-yellow-500/20">
                <PartyPopper className="w-6 h-6 text-red-900" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500 uppercase">
                Annual Gala Lottery
            </h1>
        </div>

        <div className="flex items-center gap-2 bg-white/5 rounded-full p-1 border border-white/10">
            <button 
                onClick={() => setView('lottery')}
                className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium transition-all ${view === 'lottery' ? 'bg-yellow-500 text-black shadow-lg' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
            >
                <Home className="w-4 h-4" /> Stage
            </button>
            <button 
                onClick={() => setView('result')}
                className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium transition-all ${view === 'result' ? 'bg-yellow-500 text-black shadow-lg' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
            >
                <List className="w-4 h-4" /> Winners
            </button>
            <button 
                onClick={() => setView('settings')}
                className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium transition-all ${view === 'settings' ? 'bg-yellow-500 text-black shadow-lg' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
            >
                <Settings className="w-4 h-4" /> Config
            </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="pt-24 pb-12 px-6 container mx-auto h-screen flex flex-col">
        {view === 'settings' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
                <ImportPanel 
                    participants={participants} 
                    onImport={handleImport} 
                    onClear={handleClearData} 
                />
                <PrizeConfig 
                    prizes={prizes} 
                    setPrizes={setPrizes}
                    onResetWinners={handleResetWinners}
                />
            </div>
        )}

        {view === 'lottery' && (
            <div className="flex-1 animate-fade-in h-full">
                <LotteryScreen 
                    currentPrize={currentPrize}
                    participants={participants}
                    winners={winners}
                    onDraw={handleDraw}
                    prizes={prizes}
                    onChangePrize={setCurrentPrizeId}
                />
            </div>
        )}

        {view === 'result' && (
            <div className="h-full animate-fade-in">
                <ResultPanel winners={winners} prizes={prizes} />
            </div>
        )}
      </main>
    </div>
  );
}

export default App;
