
import React from 'react';
import { UPGRADES } from '../constants';

interface ShopProps {
  upgrades: Record<string, number>;
  balance: number;
  onBuy: (id: string) => void;
}

const Shop: React.FC<ShopProps> = ({ upgrades, balance, onBuy }) => {
  return (
    <div className="p-4 space-y-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-amber-500">Restaurant Upgrades</h2>
        <p className="text-slate-500 text-sm">Scale your business, automate the prep.</p>
      </div>

      <div className="grid gap-3">
        {UPGRADES.map(u => {
          const level = upgrades[u.id] || 0;
          const cost = Math.floor(u.baseCost * Math.pow(1.5, level));
          const canAfford = balance >= cost;

          return (
            <div 
              key={u.id}
              onClick={() => canAfford && onBuy(u.id)}
              className={`p-4 rounded-2xl border-2 transition-all active:scale-95 ${
                canAfford 
                ? 'bg-slate-800 border-slate-700 shadow-md cursor-pointer hover:border-amber-500/50' 
                : 'bg-slate-900 border-slate-800 opacity-60 grayscale'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className="w-14 h-14 bg-slate-700 rounded-xl flex items-center justify-center text-3xl">
                    {u.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight">{u.name}</h3>
                    <p className="text-slate-400 text-xs">{u.description}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded-full text-slate-300 font-bold uppercase">
                        Lv. {level}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold">
                        +${u.incomePerSec}/s
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-black ${canAfford ? 'text-amber-500' : 'text-slate-500'}`}>
                    ${cost.toLocaleString()}
                  </p>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Buy {u.type}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Shop;
