
import React, { useState } from 'react';
import { ClickPop } from '../types.ts';
import { SKINS } from '../constants.ts';

interface KitchenProps {
  onClick: (x: number, y: number) => void;
  pops: ClickPop[];
  clickPower: number;
  activeSkinId: string;
}

const Kitchen: React.FC<KitchenProps> = ({ onClick, pops, clickPower, activeSkinId }) => {
  const [isPressed, setIsPressed] = useState(false);
  const activeSkin = SKINS.find(s => s.id === activeSkinId) || SKINS[0];

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    onClick(clientX, clientY);
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 80);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] relative overflow-hidden p-6 select-none">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black italic text-slate-300 uppercase">Mastering {activeSkin.name}</h2>
        <p className="text-slate-500 text-sm">Every tap creates a culinary masterpiece</p>
      </div>

      <div 
        className={`relative transition-transform duration-75 cursor-pointer ${isPressed ? 'scale-90' : 'scale-100 active:scale-95'}`}
        style={{ touchAction: 'none' }}
        onMouseDown={handleInteraction}
        onTouchStart={handleInteraction}
      >
        {/* The Chef Hero */}
        <div className="w-64 h-64 chef-gradient rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(245,158,11,0.4)] border-8 border-slate-800">
          <span className="text-9xl">{activeSkin.icon}</span>
        </div>
        
        {/* Accessory Visuals */}
        <div className="absolute -top-4 -right-4 bg-slate-800 p-3 rounded-2xl border-2 border-amber-500 transform rotate-12 shadow-lg">
          <span className="text-3xl">🔥</span>
        </div>
        <div className="absolute -bottom-4 -left-4 bg-slate-800 p-3 rounded-2xl border-2 border-amber-500 transform -rotate-12 shadow-lg">
          <span className="text-3xl">🧂</span>
        </div>
      </div>

      {/* Floating Numbers */}
      {pops.map(pop => (
        <div 
          key={pop.id} 
          className="pop-number text-amber-400 select-none"
          style={{ left: pop.x, top: pop.y }}
        >
          +${pop.value}
        </div>
      ))}

      <div className="mt-12 w-full max-w-xs">
        <div className="bg-slate-800/50 rounded-full h-3 border border-slate-700 overflow-hidden">
          <div className="h-full bg-amber-500 animate-pulse" style={{ width: '100%' }}></div>
        </div>
        <p className="text-center mt-2 text-slate-400 text-xs font-bold uppercase tracking-widest">Kitchen Heat: MAXIMUM</p>
      </div>
    </div>
  );
};

export default Kitchen;
