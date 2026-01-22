
import React from 'react';

interface HeaderProps {
  balance: number;
  passiveIncome: number;
  syncStatus?: 'idle' | 'syncing' | 'success' | 'error';
}

const Header: React.FC<HeaderProps> = ({ balance, passiveIncome, syncStatus = 'idle' }) => {
  return (
    <header className="p-4 bg-slate-900 border-b border-slate-700 shadow-xl flex justify-between items-center z-50">
      <div className="flex items-center gap-3">
        {/* Sync Indicator */}
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
          syncStatus === 'syncing' ? 'border-amber-500/50 bg-amber-500/10' :
          syncStatus === 'success' ? 'border-emerald-500/50 bg-emerald-500/10' :
          syncStatus === 'error' ? 'border-rose-500/50 bg-rose-500/10' :
          'border-slate-800 bg-slate-950'
        }`}>
          {syncStatus === 'syncing' && <span className="text-amber-500 animate-spin text-sm">☁️</span>}
          {syncStatus === 'success' && <span className="text-emerald-500 text-sm">✅</span>}
          {syncStatus === 'error' && <span className="text-rose-500 text-sm">❌</span>}
          {syncStatus === 'idle' && <span className="text-slate-700 text-sm">☁️</span>}
        </div>
        
        <div>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Balance</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-amber-500">
              ${Math.floor(balance).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Production</p>
        <p className="text-lg font-bold text-emerald-400">
          +${passiveIncome.toLocaleString()}/s
        </p>
      </div>
    </header>
  );
};

export default Header;
