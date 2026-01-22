
import React from 'react';
import { InventoryItem, Rarity } from '../types.ts';

interface InventoryProps {
  items: InventoryItem[];
  onSell: (id: string) => void;
  onSellAll: () => void;
}

const RARITY_COLORS: Record<Rarity, string> = {
  common: 'border-blue-500 bg-blue-500/10 text-blue-400',
  uncommon: 'border-purple-500 bg-purple-500/10 text-purple-400',
  rare: 'border-pink-500 bg-pink-500/10 text-pink-400',
  legendary: 'border-red-500 bg-red-500/10 text-red-400',
  exotic: 'border-amber-500 bg-amber-500/10 text-amber-400'
};

const Inventory: React.FC<InventoryProps> = ({ items, onSell, onSellAll }) => {
  const totalValue = items.reduce((acc, entry) => {
    return acc + Math.floor(entry.purchasePrice * entry.item.multiplier);
  }, 0);

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-black text-amber-500 italic uppercase">Ingredient Pantry</h2>
          <p className="text-slate-500 text-sm">Stored unboxed items ready for market.</p>
        </div>
        {items.length > 0 && (
          <div className="text-right">
            <p className="text-[10px] text-slate-500 font-black uppercase">Net Worth</p>
            <p className="text-emerald-400 font-black">${totalValue.toLocaleString()}</p>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
          <span className="text-6xl mb-4">📦</span>
          <p className="text-xl font-bold">Your pantry is empty.</p>
          <p className="text-sm">Head to the Casino to unbox some ingredients!</p>
        </div>
      ) : (
        <div className="space-y-4">
          <button
            onClick={onSellAll}
            className="w-full py-4 bg-emerald-500 text-slate-900 font-black rounded-2xl shadow-lg hover:bg-emerald-400 transition-colors active:scale-95"
          >
            SELL ALL ITEMS (${totalValue.toLocaleString()})
          </button>

          <div className="grid grid-cols-1 gap-3">
            {items.map((entry) => {
              const value = Math.floor(entry.purchasePrice * entry.item.multiplier);
              const isProfit = entry.item.multiplier >= 1;

              return (
                <div 
                  key={entry.id}
                  className={`flex justify-between items-center p-3 rounded-2xl border-2 bg-slate-800 transition-all ${RARITY_COLORS[entry.item.rarity]}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-900/50 rounded-xl flex items-center justify-center text-3xl">
                      {entry.item.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm leading-none mb-1">{entry.item.name}</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
                        {entry.item.rarity}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`text-sm font-black ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                        ${value.toLocaleString()}
                      </p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Market Price</p>
                    </div>
                    <button
                      onClick={() => onSell(entry.id)}
                      className="px-4 py-2 bg-slate-700 hover:bg-rose-500 text-white font-black text-[10px] rounded-xl transition-colors"
                    >
                      SELL
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
