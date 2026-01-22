
import React from 'react';
import { GameState } from '../types.ts';

interface TasksProps {
  state: GameState;
  onClaim: (reward: number) => void;
}

const Tasks: React.FC<TasksProps> = ({ state, onClaim }) => {
  const now = Date.now();
  const lastClaim = state.lastDailyClaim || 0;
  const canClaimDaily = now - lastClaim > 86400000;
  const isClaimedToday = !canClaimDaily && lastClaim !== 0;

  const handleClaimDaily = () => {
    if (canClaimDaily) {
      const reward = 1000 + (state.passiveIncome * 600); // 10 minutes of passive income
      onClaim(reward);
      
      const tg = (window as any).Telegram?.WebApp;
      const message = `You've received $${reward.toLocaleString()} from the Health Inspector! (Wait, why did he give us money?)`;
      
      if (tg) {
        // showAlert is supported in version 6.0+
        tg.showAlert(message);
      } else {
        alert(message);
      }
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-amber-500">Kitchen Objectives</h2>
        <p className="text-slate-500 text-sm">Complete tasks for instant injections of cash.</p>
      </div>

      <div className={`bg-slate-800 rounded-2xl p-4 border transition-all ${isClaimedToday ? 'border-slate-700 opacity-60 grayscale' : 'border-emerald-500/30'}`}>
        <div className="flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <span className="text-4xl">{isClaimedToday ? '✅' : '🎁'}</span>
            <div>
              <h3 className={`font-bold ${isClaimedToday ? 'text-slate-400' : 'text-white'}`}>Daily Health Check</h3>
              <p className="text-xs text-slate-400">Claim your government kitchen grant.</p>
            </div>
          </div>
          <button
            onClick={handleClaimDaily}
            disabled={!canClaimDaily}
            className={`px-4 py-2 rounded-xl font-bold text-xs min-w-[80px] transition-colors ${
              canClaimDaily 
              ? 'bg-emerald-500 text-slate-900 hover:bg-emerald-400' 
              : 'bg-slate-700 text-slate-500'
            }`}
          >
            {isClaimedToday ? 'CLAIMED' : canClaimDaily ? 'CLAIM' : 'WAIT'}
          </button>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-2xl p-4 border border-dashed border-slate-700 opacity-70">
        <div className="flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <span className="text-4xl">🐦</span>
            <div>
              <h3 className="font-bold">Follow the Head Chef</h3>
              <p className="text-xs text-slate-400">Coming soon to Twitter/X</p>
            </div>
          </div>
          <span className="text-[10px] bg-slate-700 px-2 py-1 rounded text-slate-400 font-bold uppercase">Locked</span>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-2xl p-4 border border-dashed border-slate-700 opacity-70">
        <div className="flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <span className="text-4xl">👥</span>
            <div>
              <h3 className="font-bold">Hire Friends</h3>
              <p className="text-xs text-slate-400">Refer friends to join your kitchen staff.</p>
            </div>
          </div>
          <span className="text-[10px] bg-slate-700 px-2 py-1 rounded text-slate-400 font-bold uppercase">Locked</span>
        </div>
      </div>
    </div>
  );
};

export default Tasks;
