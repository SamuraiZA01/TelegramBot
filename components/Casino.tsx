
import React, { useState, useEffect, useRef } from 'react';
import { CASES } from '../constants.ts';
import { CaseItem, UnboxingCase, Rarity } from '../types.ts';

interface CasinoProps {
  balance: number;
  onWager: (amount: number) => void;
  onWin: (item: CaseItem, price: number) => void;
}

const RARITY_COLORS: Record<Rarity, string> = {
  common: 'border-blue-500 bg-blue-500/10 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]',
  uncommon: 'border-purple-500 bg-purple-500/10 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]',
  rare: 'border-pink-500 bg-pink-500/10 text-pink-400 shadow-[0_0_10px_rgba(236,72,153,0.2)]',
  legendary: 'border-red-500 bg-red-500/10 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]',
  exotic: 'border-amber-500 bg-amber-500/10 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
};

const Casino: React.FC<CasinoProps> = ({ balance, onWager, onWin }) => {
  const [selectedCase, setSelectedCase] = useState<UnboxingCase | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reelItems, setReelItems] = useState<CaseItem[]>([]);
  const [winner, setWinner] = useState<CaseItem | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [offset, setOffset] = useState(0);
  const [useTransition, setUseTransition] = useState(false);
  const reelContainerRef = useRef<HTMLDivElement>(null);

  const WINNING_INDEX = 50;
  const ITEM_WIDTH = 120; // px
  const REEL_LENGTH = 60;

  const generateReel = (caseItems: CaseItem[]) => {
    const items: CaseItem[] = [];
    const byRarity = (r: Rarity) => caseItems.filter(i => i.rarity === r);

    const common = byRarity('common');
    const uncommon = byRarity('uncommon');
    const rare = byRarity('rare');
    const legendary = byRarity('legendary');
    const exotic = byRarity('exotic');

    for (let i = 0; i < REEL_LENGTH; i++) {
      const rand = Math.random() * 100;
      let item: CaseItem;

      if (rand < 0.5 && exotic.length > 0) {
        item = exotic[Math.floor(Math.random() * exotic.length)];
      } else if (rand < 5 && legendary.length > 0) {
        item = legendary[Math.floor(Math.random() * legendary.length)];
      } else if (rand < 15 && rare.length > 0) {
        item = rare[Math.floor(Math.random() * rare.length)];
      } else if (rand < 40 && uncommon.length > 0) {
        item = uncommon[Math.floor(Math.random() * uncommon.length)];
      } else {
        item = common.length > 0 
          ? common[Math.floor(Math.random() * common.length)] 
          : caseItems[Math.floor(Math.random() * caseItems.length)];
      }
      items.push(item);
    }
    return items;
  };

  const startUnboxing = (crate: UnboxingCase) => {
    if (balance < crate.cost || isSpinning) return;

    // 1. Pre-calculate everything
    setUseTransition(false);
    setOffset(0);
    setShowResult(false);

    const newItems = generateReel(crate.items);
    const winningItem = newItems[WINNING_INDEX];
    
    setReelItems(newItems);
    setWinner(winningItem);

    // 2. Trigger animation after state is ready
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        onWager(-crate.cost);
        setIsSpinning(true);
        setUseTransition(true);

        const tg = (window as any).Telegram?.WebApp;
        if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('heavy');

        const containerWidth = reelContainerRef.current?.offsetWidth || 448;
        
        // Ensure randomCardOffset stays within the 120px item width (center ± some variance)
        // Item width is 120px, so 10px to 110px is safe.
        const randomCardOffset = Math.floor(Math.random() * (ITEM_WIDTH - 20)) + 10;
        
        // This math aligns reelItems[WINNING_INDEX] with the center line (containerWidth / 2)
        const targetScroll = (WINNING_INDEX * ITEM_WIDTH) - (containerWidth / 2) + randomCardOffset;

        setOffset(targetScroll);

        setTimeout(() => {
          setIsSpinning(false);
          setShowResult(true);
          onWin(winningItem, crate.cost);
          
          if (tg?.HapticFeedback) {
            if (winningItem.multiplier >= 1) tg.HapticFeedback.notificationOccurred('success');
            else tg.HapticFeedback.notificationOccurred('error');
          }
        }, 8100); 
      });
    });
  };

  const resetForNewSpin = () => {
    setUseTransition(false);
    setOffset(0);
    setShowResult(false);
    setWinner(null);
  };

  if (selectedCase) {
    return (
      <div className="p-4 space-y-6 flex flex-col items-center min-h-[80vh]">
        <div className="w-full flex justify-between items-center mb-4">
          <button 
            onClick={() => !isSpinning && setSelectedCase(null)}
            className="text-slate-400 flex items-center gap-2 font-bold text-xs uppercase tracking-widest"
          >
            ← BACK TO CASES
          </button>
          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase font-black">Case Cost</p>
            <p className="text-amber-500 font-black">${selectedCase.cost.toLocaleString()}</p>
          </div>
        </div>

        <h2 className="text-3xl font-black italic text-center text-white drop-shadow-lg">{selectedCase.name}</h2>

        {/* Unboxing Reel Container */}
        <div 
          ref={reelContainerRef}
          className="relative w-full max-w-md bg-slate-900 border-y-4 border-slate-800 h-40 overflow-hidden shadow-2xl rounded-sm"
        >
          {/* Landing Marker */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-amber-500 z-20 shadow-[0_0_15px_#f59e0b] -translate-x-1/2" />
          
          <div 
            className={`flex h-full items-center ${useTransition ? 'transition-transform duration-[8000ms] cubic-bezier(0.15, 0, 0.15, 1)' : ''}`}
            style={{ 
              transform: `translateX(-${offset}px)`,
              width: `${REEL_LENGTH * ITEM_WIDTH}px`
            }}
          >
            {reelItems.length > 0 ? reelItems.map((item, idx) => (
              <div 
                key={idx}
                className={`flex-shrink-0 w-[120px] h-32 flex flex-col items-center justify-center border-r border-slate-800/50 relative overflow-hidden ${
                  RARITY_COLORS[item.rarity]
                }`}
              >
                <span className="text-4xl mb-1 relative z-10">{item.icon}</span>
                <span className="text-[9px] font-black uppercase text-center px-1 truncate w-full relative z-10">
                  {item.name}
                </span>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 opacity-40 z-0" />
              </div>
            )) : (
               <div className="flex-1 flex items-center justify-center text-slate-600 font-bold uppercase tracking-widest italic w-full">
                  Stocking the Pantry...
               </div>
            )}
          </div>
        </div>

        {!isSpinning && !showResult && (
          <button
            onClick={() => startUnboxing(selectedCase)}
            disabled={balance < selectedCase.cost}
            className={`w-full max-w-xs py-4 rounded-2xl font-black text-xl shadow-lg transition-all active:scale-95 ${
              balance < selectedCase.cost 
              ? 'bg-slate-700 text-slate-500' 
              : 'bg-amber-500 text-slate-900 hover:bg-amber-400 hover:shadow-amber-500/20'
            }`}
          >
            OPEN CASE
          </button>
        )}

        {showResult && winner && (
          <div className="text-center animate-in fade-in zoom-in duration-500 flex flex-col items-center">
            <div className={`p-8 rounded-[2rem] border-4 mb-4 relative ${RARITY_COLORS[winner.rarity]}`}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 px-3 py-1 rounded-full border border-inherit">
                 <p className="text-[10px] font-black uppercase tracking-tighter">NEW ACQUISITION</p>
              </div>
              <span className="text-8xl block mb-2">{winner.icon}</span>
              <h3 className="text-2xl font-black uppercase italic">{winner.name}</h3>
              <p className="text-xs font-bold opacity-70 tracking-widest">RARITY: {winner.rarity.toUpperCase()}</p>
            </div>
            <div className="bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700 w-full max-w-xs shadow-xl">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Estimated Value</p>
              <p className={`text-3xl font-black ${winner.multiplier >= 1 ? 'text-emerald-400' : 'text-rose-400'}`}>
                ${Math.floor(selectedCase.cost * winner.multiplier).toLocaleString()}
              </p>
              <p className="text-[9px] text-slate-500 mt-1 uppercase font-bold italic">Market price based on quality</p>
            </div>
            <button 
              onClick={resetForNewSpin}
              className="mt-6 text-amber-500 font-black tracking-[0.2em] text-xs hover:underline uppercase"
            >
              Click to dismiss
            </button>
          </div>
        )}

        {!isSpinning && !showResult && (
          <div className="mt-8 w-full max-w-md">
            <p className="text-[10px] text-slate-500 font-black uppercase mb-3 tracking-widest text-center">Inside this crate</p>
            <div className="grid grid-cols-4 gap-2 max-h-[160px] overflow-y-auto p-1 bg-slate-900/40 rounded-2xl">
              {selectedCase.items.map(item => (
                <div key={item.id} className={`p-2 rounded-xl border text-center transition-transform hover:scale-105 ${RARITY_COLORS[item.rarity]}`}>
                  <span className="text-xl">{item.icon}</span>
                  <p className="text-[7px] font-black truncate uppercase tracking-tighter mt-1">{item.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-amber-500 italic uppercase">Ingredient Crates</h2>
        <p className="text-slate-500 text-sm">Invest your revenue in rare global ingredients. Big risk, big flavor.</p>
      </div>

      <div className="grid gap-4">
        {CASES.map(crate => (
          <div 
            key={crate.id}
            onClick={() => setSelectedCase(crate)}
            className="group relative bg-slate-800 border-2 border-slate-700 p-6 rounded-[2rem] overflow-hidden cursor-pointer hover:border-amber-500/50 transition-all active:scale-[0.98] shadow-xl"
          >
            <div className="absolute top-0 right-0 p-4 text-7xl opacity-[0.03] group-hover:scale-125 group-hover:rotate-12 transition-transform duration-500">
              {crate.icon}
            </div>
            
            <div className="relative z-10 flex items-center gap-6">
              <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center text-5xl shadow-inner border border-slate-700/50">
                {crate.icon}
              </div>
              <div>
                <h3 className="text-xl font-black italic uppercase tracking-tight">{crate.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                   <p className="text-amber-500 font-black text-2xl tracking-tighter">
                    ${crate.cost.toLocaleString()}
                  </p>
                  <span className="text-[8px] bg-slate-900 px-2 py-0.5 rounded-full text-slate-400 font-black">PER BOX</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Casino;
