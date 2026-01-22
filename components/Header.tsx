
import React, { useState } from 'react';

interface HeaderProps {
  balance: number;
  passiveIncome: number;
  syncStatus?: 'idle' | 'syncing' | 'success' | 'error';
  lastError?: string | null;
  onRetrySync?: () => void;
}

const Header: React.FC<HeaderProps> = ({ balance, passiveIncome, syncStatus = 'idle', lastError, onRetrySync }) => {
  const [showError, setShowError] = useState(false);

  return (
    <header className="p-4 bg-slate-900 border-b border-slate-700 shadow-xl flex justify-between items-center z-50 relative">
      <div className="flex items-center gap-3">
        {/* Sync Indicator */}
        <div 
          onClick={() => {
            if (syncStatus === 'error') setShowError(!showError);
            else if (syncStatus === 'idle' && onRetrySync) onRetrySync();
          }}
          className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${
          syncStatus === 'syncing' ? 'border-amber-500/50 bg-amber-500/10' :
          syncStatus === 'success' ? 'border-emerald-500/50 bg-emerald-500/10' :
          syncStatus === 'error' ? 'border-rose-500/50 bg-rose-500/10 animate-pulse' :
          'border-slate-800 bg-slate-950 hover:border-slate-600'
        }`}>
          {syncStatus === 'syncing' && <span className="text-amber-500 animate-spin text-sm">☁️</span>}
          {syncStatus === 'success' && <span className="text-emerald-500 text-sm">✅</span>}
          {syncStatus === 'error' && <span className="text-rose-500 text-sm">❌</span>}
          {syncStatus === 'idle' && <span className="text-slate-700 text-sm">☁️</span>}
        </div>
        
        {/* Error Info Box */}
        {showError && syncStatus === 'error' && (
          <div className="absolute top-16 left-4 right-4 bg-rose-950 border border-rose-500 p-4 rounded-2xl shadow-2xl z-[100] animate-in slide-in-from-top-2 duration-200">
            <h4 className="text-rose-400 font-black text-[10px] uppercase tracking-widest mb-1">Database Error</h4>
            <p className="text-white text-xs leading-tight font-bold mb-3">
              {lastError || "Check your Supabase URL and Anon Key."}
            </p>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowError(false); onRetrySync?.(); }}
              className="w-full bg-rose-500 text-white py-2 rounded-xl text-[10px] font-black uppercase"
            >
              Dismiss & Retry
            </button>
          </div>
        )}
        
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
