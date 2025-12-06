import React, { useState } from 'react';
import { Gift, Plus, Trash, RotateCcw } from 'lucide-react';
import { Prize } from '../types';

interface Props {
  prizes: Prize[];
  setPrizes: (prizes: Prize[]) => void;
  onResetWinners: () => void;
}

export const PrizeConfig: React.FC<Props> = ({ prizes, setPrizes, onResetWinners }) => {
  const [newPrize, setNewPrize] = useState<Partial<Prize>>({
    name: '',
    item: '',
    totalCount: 1,
    drawCount: 1
  });

  const addPrize = () => {
    if (!newPrize.name || !newPrize.item) return;
    const prize: Prize = {
      id: Date.now().toString(),
      name: newPrize.name,
      item: newPrize.item,
      totalCount: Number(newPrize.totalCount) || 1,
      drawCount: Number(newPrize.drawCount) || 1
    };
    setPrizes([...prizes, prize]);
    setNewPrize({ name: '', item: '', totalCount: 1, drawCount: 1 });
  };

  const removePrize = (id: string) => {
    if(window.confirm('Delete this prize?')) {
        setPrizes(prizes.filter(p => p.id !== id));
    }
  };

  const confirmResetWinners = () => {
      if (window.confirm('WARNING: This will delete ALL lottery history/winners. Are you sure?')) {
          onResetWinners();
      }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-yellow-400 flex items-center gap-2">
          <Gift className="w-6 h-6" /> Prize Settings
        </h2>
        <button 
            onClick={confirmResetWinners}
            className="text-sm bg-red-900/50 hover:bg-red-900 text-red-200 px-3 py-1 rounded border border-red-800 flex items-center gap-1 transition-colors"
        >
            <RotateCcw className="w-3 h-3" /> Reset History
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8 bg-black/20 p-4 rounded-lg">
        <input
          placeholder="Prize Name (e.g. 1st Prize)"
          className="bg-white/10 border border-white/20 rounded p-2 text-white placeholder-white/40 focus:outline-none focus:border-yellow-400"
          value={newPrize.name}
          onChange={e => setNewPrize({...newPrize, name: e.target.value})}
        />
        <input
          placeholder="Item Name (e.g. iPhone)"
          className="bg-white/10 border border-white/20 rounded p-2 text-white placeholder-white/40 focus:outline-none focus:border-yellow-400"
          value={newPrize.item}
          onChange={e => setNewPrize({...newPrize, item: e.target.value})}
        />
        <div className="flex gap-2">
            <input
            type="number"
            min="1"
            placeholder="Total Qty"
            className="bg-white/10 border border-white/20 rounded p-2 text-white w-full placeholder-white/40 focus:outline-none focus:border-yellow-400"
            value={newPrize.totalCount}
            onChange={e => setNewPrize({...newPrize, totalCount: parseInt(e.target.value)})}
            />
            <input
            type="number"
            min="1"
            placeholder="Batch Qty"
            className="bg-white/10 border border-white/20 rounded p-2 text-white w-full placeholder-white/40 focus:outline-none focus:border-yellow-400"
            value={newPrize.drawCount}
            onChange={e => setNewPrize({...newPrize, drawCount: parseInt(e.target.value)})}
            />
        </div>
        <button 
          onClick={addPrize}
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold p-2 rounded flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
        {prizes.map((p) => (
          <div key={p.id} className="flex items-center justify-between bg-white/5 p-4 rounded-lg border border-white/5 hover:border-yellow-400/50 transition-all">
            <div>
              <div className="text-yellow-400 font-bold text-lg">{p.name}</div>
              <div className="text-white text-sm">{p.item}</div>
            </div>
            <div className="flex items-center gap-6">
                <div className="text-right">
                    <div className="text-xs text-white/50">Total</div>
                    <div className="font-mono text-white">{p.totalCount}</div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-white/50">Batch</div>
                    <div className="font-mono text-white">{p.drawCount}</div>
                </div>
                <button 
                  onClick={() => removePrize(p.id)}
                  className="p-2 hover:bg-red-500/20 text-white/30 hover:text-red-400 rounded transition-colors"
                >
                  <Trash className="w-5 h-5" />
                </button>
            </div>
          </div>
        ))}
        {prizes.length === 0 && <div className="text-center text-white/30 py-4">No prizes configured.</div>}
      </div>
    </div>
  );
};
