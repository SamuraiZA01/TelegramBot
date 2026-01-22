
import React from 'react';
import { SKINS } from '../constants.ts';

interface SkinsProps {
  ownedSkins: string[];
  activeSkin: string;
  balance: number;
  onBuy: (id: string) => void;
  onEquip: (id: string) => void;
}

const Skins: React.FC<SkinsProps> = ({ ownedSkins, activeSkin, balance, onBuy, onEquip }) => {
  return (
    <div className="p-4 space-y-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-amber-500">Chef Wardrobe</h2>
        <p className="text-slate-500 text-sm">Look the part while you build your empire.</p>
      </div>

      <div className="grid gap-4">
        {SKINS.map(skin => {
          const isOwned = ownedSkins.includes(skin.id);
          const isActive = activeSkin === skin.id;
          const canAfford = balance >= skin.cost;

          return (
            <div 
              key={skin.id}
              className={`p-4 rounded-2xl border-2 transition-all ${
                isActive 
                ? 'bg-slate-800 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                : isOwned 
                ? 'bg-slate-800 border-slate-700' 
                : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex gap-4 items-center">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-4xl ${
                    isActive ? 'bg-amber-500/20' : 'bg-slate-700'
                  }`}>
                    {skin.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{skin.name}</h3>
                    <p className="text-slate-400 text-xs">{skin.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  {isOwned ? (
                    <button
                      onClick={() => onEquip(skin.id)}
                      disabled={isActive}
                      className={`px-4 py-2 rounded-xl font-bold text-xs transition-colors ${
                        isActive 
                        ? 'bg-amber-500 text-slate-900 cursor-default' 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {isActive ? 'EQUIPPED' : 'EQUIP'}
                    </button>
                  ) : (
                    <button
                      onClick={() => onBuy(skin.id)}
                      disabled={!canAfford}
                      className={`px-4 py-2 rounded-xl font-bold text-xs ${
                        canAfford 
                        ? 'bg-emerald-500 text-slate-900 hover:bg-emerald-400' 
                        : 'bg-slate-700 text-slate-500 opacity-50'
                      }`}
                    >
                      ${skin.cost.toLocaleString()}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Skins;
