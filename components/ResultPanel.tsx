import React from 'react';
import { Download, Trophy } from 'lucide-react';
import { Prize, Winner } from '../types';
import { exportWinners } from '../utils/excel';

interface Props {
  winners: Winner[];
  prizes: Prize[];
}

export const ResultPanel: React.FC<Props> = ({ winners, prizes }) => {
  
  const handleExport = () => {
    exportWinners(winners, prizes);
  };

  // Group winners by prize
  const groupedWinners = prizes.map(prize => ({
      prize,
      list: winners.filter(w => w.prizeId === prize.id).sort((a,b) => b.timestamp - a.timestamp)
  }));

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-yellow-400 flex items-center gap-2">
          <Trophy className="w-6 h-6" /> Winners Podium
        </h2>
        <button 
          onClick={handleExport}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
        >
          <Download className="w-4 h-4" /> Export Excel
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="space-y-8">
            {groupedWinners.map(group => (
                group.list.length > 0 && (
                    <div key={group.prize.id} className="bg-black/20 rounded-xl p-4">
                        <div className="flex items-baseline gap-3 mb-4 border-b border-white/10 pb-2">
                            <h3 className="text-xl font-bold text-yellow-500">{group.prize.name}</h3>
                            <span className="text-sm text-white/50">{group.prize.item}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {group.list.map((w, idx) => (
                                <div key={idx} className="bg-white/5 p-3 rounded flex items-center justify-between hover:bg-white/10 transition-colors">
                                    <div>
                                        <div className="font-bold text-white">{w.participant.name}</div>
                                        <div className="text-xs text-white/50">{w.participant.department}</div>
                                    </div>
                                    <div className="text-right text-yellow-400/80 font-mono text-sm">
                                        {w.participant.phone.slice(-4)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            ))}
            {winners.length === 0 && (
                <div className="text-center text-white/30 py-20 flex flex-col items-center">
                    <Trophy className="w-16 h-16 mb-4 opacity-50" />
                    <p>No winners yet. Start the lottery!</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
