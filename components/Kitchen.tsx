
import React, { useState, useEffect, useRef } from 'react';
import { ClickPop, Particle } from '../types.ts';
import { SKINS } from '../constants.ts';

interface KitchenProps {
  onClick: (x: number, y: number) => void;
  pops: ClickPop[];
  clickPower: number;
  activeSkinId: string;
  combo: number;
  isFrenzy: boolean;
}

const INGREDIENTS = ['🍅', '🧅', '🧂', '🥩', '🥓', '🍞', '🧀', '🧄', '🥦', '🌶️'];

const Kitchen: React.FC<KitchenProps> = ({ onClick, pops, clickPower, activeSkinId, combo, isFrenzy }) => {
  const [isPressed, setIsPressed] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const activeSkin = SKINS.find(s => s.id === activeSkinId) || SKINS[0];

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    // Create particles
    const newParticles: Particle[] = Array.from({ length: 5 }).map(() => ({
      id: Math.random() + Date.now(),
      x: clientX,
      y: clientY,
      vx: (Math.random() - 0.5) * 15,
      vy: (Math.random() - 1) * 15,
      emoji: INGREDIENTS[Math.floor(Math.random() * INGREDIENTS.length)],
      rotation: Math.random() * 360
    }));

    setParticles(prev => [...prev.slice(-30), ...newParticles]);
    onClick(clientX, clientY);
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 80);
  };

  // Particle Physics
  useEffect(() => {
    let frameId: number;
    const loop = () => {
      setParticles(prev => prev.map(p => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy,
        vy: p.vy + 0.6, // Gravity
        rotation: p.rotation + p.vx
      })).filter(p => p.y < window.innerHeight + 50));
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div className={`flex flex-col items-center justify-start min-h-[70vh] relative overflow-hidden pt-32 pb-12 px-6 select-none transition-all duration-700 ${isFrenzy ? 'scale-105' : ''}`}>
      
      {/* Combo Meter Header - Elevated and spaced */}
      <div className="absolute top-4 w-full px-8 text-center z-50">
        <div className="flex justify-between items-end mb-1">
          <span className={`text-[10px] font-black tracking-[0.2em] uppercase transition-colors ${isFrenzy ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`}>
            {isFrenzy ? 'GOURMET FRENZY ACTIVE' : 'Combo Meter'}
          </span>
          <span className={`text-sm font-black italic transition-colors ${isFrenzy ? 'text-amber-300' : 'text-white'}`}>
            {Math.floor(combo)}%
          </span>
        </div>
        <div className="h-3 w-full bg-slate-900 rounded-full border border-slate-700 overflow-hidden shadow-inner p-[2px]">
          <div 
            className={`h-full transition-all duration-300 rounded-full ${isFrenzy ? 'bg-gradient-to-r from-amber-400 via-yellow-100 to-amber-500 shadow-[0_0_20px_#fcd34d] animate-pulse' : 'bg-emerald-500 shadow-[0_0_10px_#10b981]'}`}
            style={{ width: `${combo}%` }}
          />
        </div>
      </div>

      {/* Content Area - Shifted down via pt-32 to completely avoid clipping */}
      <div className="text-center mb-8 w-full relative">
        <h2 className={`text-3xl font-black italic uppercase transition-all duration-500 ${isFrenzy ? 'text-amber-400 scale-110 drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]' : 'text-slate-300'}`}>
          {activeSkin.name}
        </h2>
        <p className={`text-xs font-bold tracking-[0.25em] uppercase mt-2 transition-colors duration-500 ${isFrenzy ? 'text-amber-200 animate-bounce' : 'text-slate-500'}`}>
          {isFrenzy ? '✖5 REVENUE • KEEP TAPPING!' : 'The Art of the Click'}
        </p>
      </div>

      <div 
        className={`relative transition-all duration-75 cursor-pointer z-10 my-4 ${isPressed ? 'scale-95' : 'scale-100'}`}
        style={{ touchAction: 'none' }}
        onMouseDown={handleInteraction}
        onTouchStart={handleInteraction}
      >
        {/* The Chef Hero with Glow */}
        <div className={`w-64 h-64 rounded-full flex items-center justify-center border-8 relative transition-all duration-500 ${isFrenzy ? 'chef-gradient shadow-[0_0_120px_rgba(245,158,11,0.9)] border-white scale-110' : 'bg-slate-800 border-slate-700 shadow-[0_0_40px_rgba(0,0,0,0.5)]'}`}>
          {!isFrenzy && <div className="absolute inset-0 chef-gradient opacity-10 rounded-full" />}
          {isFrenzy && <div className="absolute inset-0 bg-white/20 animate-ping rounded-full" />}
          <span className={`text-9xl transition-transform duration-300 ${isFrenzy ? 'scale-110 animate-pulse' : ''}`}>{activeSkin.icon}</span>
        </div>
        
        {/* Dynamic accessory visuals */}
        <div className={`absolute -top-6 -right-6 p-4 rounded-3xl border-4 transform transition-all duration-500 z-20 ${isFrenzy ? 'bg-white border-amber-400 scale-125 rotate-12 shadow-[0_0_30px_#fff]' : 'bg-slate-800 border-amber-500 rotate-6 shadow-lg'}`}>
          <span className="text-4xl">{isFrenzy ? '⚡' : '🔥'}</span>
        </div>
      </div>

      {/* Floating Numbers & Critical Splash */}
      {pops.map(pop => (
        <div 
          key={pop.id} 
          className={`pop-number select-none pointer-events-none z-30 ${pop.isCrit ? 'text-yellow-300 scale-150 font-black' : 'text-amber-400 font-bold'}`}
          style={{ left: pop.x, top: pop.y }}
        >
          <div className="flex flex-col items-center">
            {pop.isCrit && <span className="text-[10px] font-black uppercase tracking-tighter mb-[-10px] animate-bounce bg-amber-500 text-slate-900 px-2 py-0.5 rounded shadow-lg">MASTERPIECE!</span>}
            +${pop.value.toLocaleString()}
          </div>
        </div>
      ))}

      {/* Burst Particles */}
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute pointer-events-none text-2xl z-0"
          style={{ 
            left: p.x, 
            top: p.y, 
            transform: `rotate(${p.rotation}deg)` 
          }}
        >
          {p.emoji}
        </div>
      ))}

      <div className="mt-auto w-full max-w-xs px-4 pb-4">
         <div className="text-center mb-2">
            <span className={`text-[9px] font-black uppercase tracking-[0.4em] transition-colors ${isFrenzy ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`}>
              Kitchen Momentum
            </span>
         </div>
        <div className="bg-slate-900/80 rounded-full h-3 border border-slate-800 overflow-hidden shadow-inner p-[2px] relative">
          <div 
            className={`h-full transition-all duration-200 rounded-full ${isFrenzy ? 'bg-gradient-to-r from-amber-500 via-white to-amber-500 shadow-[0_0_15px_#fcd34d]' : 'bg-gradient-to-r from-slate-700 to-emerald-500'}`} 
            style={{ width: `${combo}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Kitchen;
