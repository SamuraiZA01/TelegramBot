
import React from 'react';
import { TabType } from '../types.ts';

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: TabType.KITCHEN, label: 'Kitchen', icon: '🍳' },
    { id: TabType.SHOP, label: 'Shop', icon: '🏪' },
    { id: TabType.SKINS, label: 'Skins', icon: '👕' },
    { id: TabType.CASINO, label: 'Casino', icon: '🎲' },
    { id: TabType.INVENTORY, label: 'Pantry', icon: '📦' },
    { id: TabType.TASKS, label: 'Tasks', icon: '📝' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 px-1 py-3 pb-8 flex justify-around items-center z-50 backdrop-blur-md bg-opacity-90">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex flex-col items-center gap-1 transition-all flex-1 ${
            activeTab === tab.id ? 'scale-110' : 'opacity-40 grayscale'
          }`}
        >
          <span className="text-xl md:text-2xl">{tab.icon}</span>
          <span className={`text-[8px] md:text-[9px] font-bold uppercase tracking-tight ${
            activeTab === tab.id ? 'text-amber-500' : 'text-slate-400'
          }`}>
            {tab.label}
          </span>
          {activeTab === tab.id && (
            <div className="absolute -bottom-1 w-6 h-1 bg-amber-500 rounded-full shadow-[0_0_10px_#f59e0b]" />
          )}
        </button>
      ))}
    </nav>
  );
};

export default Navigation;
