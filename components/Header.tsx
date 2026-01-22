
import React from 'react';

interface HeaderProps {
  balance: number;
  passiveIncome: number;
}

const Header: React.FC<HeaderProps> = ({ balance, passiveIncome }) => {
  return (
    <header className="p-4 bg-slate-900 border-b border-slate-700 shadow-xl flex justify-between items-center z-50">
      <div>
        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Restaurant Balance</p>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-amber-500">
            ${Math.floor(balance).toLocaleString()}
          </span>
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
