
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TabType, GameState, ClickPop, CaseItem, InventoryItem } from './types.ts';
import { INITIAL_STATE, SAVE_KEY, UPGRADES, SKINS } from './constants.ts';
import Kitchen from './components/Kitchen.tsx';
import Shop from './components/Shop.tsx';
import Skins from './components/Skins.tsx';
import Casino from './components/Casino.tsx';
import Inventory from './components/Inventory.tsx';
import Tasks from './components/Tasks.tsx';
import Leaderboard from './components/Leaderboard.tsx';
import Header from './components/Header.tsx';
import Navigation from './components/Navigation.tsx';
import { supabase } from './lib/supabase.ts';

const App: React.FC = () => {
  const [state, setState] = useState<GameState>(() => {
    const saved = localStorage.getItem(SAVE_KEY);
    const tg = (window as any).Telegram?.WebApp;
    const user = tg?.initDataUnsafe?.user;
    
    const defaultIdentity = {
      userId: user?.id?.toString() || 'guest_' + Math.random().toString(36).substr(2, 9),
      username: user?.first_name || 'Anonymous Chef'
    };

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const now = Date.now();
        const elapsedSecs = Math.max(0, Math.floor((now - (parsed.lastSaved || now)) / 1000));
        const merged = { ...INITIAL_STATE, ...defaultIdentity, ...parsed };
        
        if (elapsedSecs > 0 && merged.passiveIncome > 0) {
          const offlineIncome = Math.min(merged.passiveIncome * elapsedSecs, merged.passiveIncome * 3600 * 4);
          merged.balance += offlineIncome;
          merged.totalEarned += offlineIncome;
        }
        return { ...merged, lastSaved: now };
      } catch (e) {
        return { ...INITIAL_STATE, ...defaultIdentity };
      }
    }
    return { ...INITIAL_STATE, ...defaultIdentity };
  });

  const stateRef = useRef<GameState>(state);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const [activeTab, setActiveTab] = useState<TabType>(TabType.KITCHEN);
  const [pops, setPops] = useState<ClickPop[]>([]);
  const [combo, setCombo] = useState(0);
  const [isFrenzy, setIsFrenzy] = useState(false);
  const lastClickTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      tg.enableClosingConfirmation();
    }
  }, []);

  // PERSISTENCE: Sync with Supabase Leaderboard
  const syncToSupabase = useCallback(async (data: GameState) => {
    setSyncStatus('syncing');
    setLastError(null);
    try {
      const { error } = await supabase
        .from('leaderboard')
        .upsert({
          user_id: data.userId,
          username: data.username,
          total_earned: Math.floor(data.totalEarned),
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      
      if (error) {
        console.error("Supabase Sync Error:", error);
        setSyncStatus('error');
        setLastError(error.message || "Table 'leaderboard' not found or RLS denied.");
      } else {
        setSyncStatus('success');
        setTimeout(() => setSyncStatus('idle'), 3000);
      }
    } catch (err: any) {
      console.error("Supabase Connection Fail:", err);
      setSyncStatus('error');
      setLastError(err.message || "Connection Failed. Check your Internet or API Key.");
    }
  }, []);

  // Initial Sync on Mount
  useEffect(() => {
    syncToSupabase(state);
  }, []);

  const saveNow = useCallback((customState?: GameState) => {
    const data = customState || stateRef.current;
    const toSave = { ...data, lastSaved: Date.now() };
    localStorage.setItem(SAVE_KEY, JSON.stringify(toSave));
    
    // Only sync to cloud on major state changes to save bandwidth
    if (customState) {
      syncToSupabase(toSave);
    }
  }, [syncToSupabase]);

  useEffect(() => {
    const interval = setInterval(() => {
      saveNow();
    }, 5000); // Background auto-save for local balance

    const handleExit = () => saveNow();
    window.addEventListener('beforeunload', handleExit);
    window.addEventListener('pagehide', handleExit);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleExit);
    };
  }, [saveNow]);

  // Combo & Passive Income Logics
  useEffect(() => {
    const decayInterval = setInterval(() => {
      setCombo(prev => {
        if (prev <= 0) {
          if (isFrenzy) setIsFrenzy(false);
          return 0;
        }
        const timeSinceLastClick = Date.now() - lastClickTimeRef.current;
        let decayAmount = isFrenzy ? 1.4 : 0.9;
        if (timeSinceLastClick > 1200) decayAmount = isFrenzy ? 6.0 : 9.0;
        const nextValue = Math.max(0, prev - decayAmount);
        if (nextValue === 0 && isFrenzy) setIsFrenzy(false);
        return nextValue;
      });
    }, 100);
    return () => clearInterval(decayInterval);
  }, [isFrenzy]);

  useEffect(() => {
    if (combo >= 100 && !isFrenzy) {
      setIsFrenzy(true);
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('warning');
    }
  }, [combo, isFrenzy]);

  useEffect(() => {
    const ticker = setInterval(() => {
      setState(prev => ({
        ...prev,
        balance: prev.balance + (prev.passiveIncome / 10),
        totalEarned: prev.totalEarned + (prev.passiveIncome / 10)
      }));
    }, 100);
    return () => clearInterval(ticker);
  }, []);

  const handleManualClick = useCallback((x: number, y: number) => {
    lastClickTimeRef.current = Date.now();
    const isCrit = Math.random() < 0.05;
    const power = state.clickPower * (isFrenzy ? 5 : 1) * (isCrit ? 10 : 1);
    setState(prev => ({ ...prev, balance: prev.balance + power, totalEarned: prev.totalEarned + power }));
    setCombo(prev => Math.min(100, prev + (isFrenzy ? 2.5 : 6.0)));
    const id = Date.now() + Math.random();
    setPops(prev => [...prev, { id, x, y, value: power, isCrit }]);
    setTimeout(() => setPops(prev => prev.filter(p => p.id !== id)), 800);
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred(isCrit ? 'heavy' : 'light');
  }, [state.clickPower, isFrenzy]);

  const buyUpgrade = useCallback((upgradeId: string) => {
    const upgrade = UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return;
    const currentLevel = state.upgrades[upgradeId] || 0;
    const cost = Math.floor(upgrade.baseCost * Math.pow(1.5, currentLevel));
    if (state.balance >= cost) {
      setState(prev => {
        const newUpgrades = { ...prev.upgrades, [upgradeId]: currentLevel + 1 };
        const newPassive = UPGRADES.reduce((acc, up) => acc + ((newUpgrades[up.id] || 0) * up.incomePerSec), 0);
        const newState = { ...prev, balance: prev.balance - cost, upgrades: newUpgrades, passiveIncome: newPassive, clickPower: 1 + Math.floor(newPassive * 0.1) };
        saveNow(newState);
        return newState;
      });
    }
  }, [state.balance, state.upgrades, saveNow]);

  const buySkin = useCallback((skinId: string) => {
    const skin = SKINS.find(s => s.id === skinId);
    if (!skin || state.ownedSkins.includes(skinId)) return;
    if (state.balance >= skin.cost) {
      setState(prev => {
        const newState = { ...prev, balance: prev.balance - skin.cost, ownedSkins: [...prev.ownedSkins, skinId], activeSkin: skinId };
        saveNow(newState);
        return newState;
      });
    }
  }, [state.balance, state.ownedSkins, saveNow]);

  const equipSkin = useCallback((skinId: string) => {
    if (state.ownedSkins.includes(skinId)) {
      setState(prev => {
        const newState = { ...prev, activeSkin: skinId };
        saveNow(newState);
        return newState;
      });
    }
  }, [state.ownedSkins, saveNow]);

  const modifyBalance = useCallback((amount: number) => {
    setState(prev => ({ ...prev, balance: Math.max(0, prev.balance + amount), totalEarned: amount > 0 ? prev.totalEarned + amount : prev.totalEarned }));
  }, []);

  const addToInventory = useCallback((item: CaseItem, purchasePrice: number) => {
    const newEntry: InventoryItem = { id: Math.random().toString(36).substr(2, 9) + Date.now(), item, purchasePrice, unboxedAt: Date.now() };
    setState(prev => {
      const newState = { ...prev, inventory: [newEntry, ...prev.inventory] };
      saveNow(newState);
      return newState;
    });
  }, [saveNow]);

  const sellItem = useCallback((id: string) => {
    setState(prev => {
      const entry = prev.inventory.find(i => i.id === id);
      if (!entry) return prev;
      const saleValue = Math.floor(entry.purchasePrice * entry.item.multiplier);
      const newState = { ...prev, balance: prev.balance + saleValue, inventory: prev.inventory.filter(i => i.id !== id) };
      saveNow(newState);
      return newState;
    });
  }, [saveNow]);

  const cookDish = useCallback(() => {
    if (state.inventory.length < 3) return;
    setState(prev => {
      const itemsToCook = prev.inventory.slice(0, 3);
      const totalCost = itemsToCook.reduce((acc, i) => acc + i.purchasePrice, 0);
      const averageMult = itemsToCook.reduce((acc, i) => acc + i.item.multiplier, 0) / 3;
      const dishValue = Math.floor(totalCost * averageMult * 2.5);
      const newState = { ...prev, balance: prev.balance + dishValue, inventory: prev.inventory.slice(3) };
      saveNow(newState);
      return newState;
    });
  }, [state.inventory, saveNow]);

  const claimDaily = useCallback((reward: number) => {
    setState(prev => {
      const newState = { ...prev, balance: prev.balance + reward, totalEarned: prev.totalEarned + reward, lastDailyClaim: Date.now() };
      saveNow(newState);
      return newState;
    });
  }, [saveNow]);

  return (
    <div className={`flex flex-col h-screen text-slate-100 kitchen-bg overflow-hidden transition-colors duration-500 ${isFrenzy ? 'bg-amber-900/20' : ''}`}>
      <Header 
        balance={state.balance} 
        passiveIncome={state.passiveIncome} 
        syncStatus={syncStatus} 
        lastError={lastError}
        onRetrySync={() => syncToSupabase(state)}
      />
      <main className="flex-1 overflow-y-auto pb-24 relative">
        {activeTab === TabType.KITCHEN && <Kitchen onClick={handleManualClick} pops={pops} clickPower={state.clickPower} activeSkinId={state.activeSkin} combo={combo} isFrenzy={isFrenzy} />}
        {activeTab === TabType.SHOP && <Shop upgrades={state.upgrades} balance={state.balance} onBuy={buyUpgrade} />}
        {activeTab === TabType.LEADERBOARD && <Leaderboard userEarnings={state.totalEarned} userId={state.userId} />}
        {activeTab === TabType.SKINS && <Skins ownedSkins={state.ownedSkins} activeSkin={state.activeSkin} balance={state.balance} onBuy={buySkin} onEquip={equipSkin} />}
        {activeTab === TabType.CASINO && <Casino balance={state.balance} onWager={modifyBalance} onWin={addToInventory} />}
        {activeTab === TabType.INVENTORY && <Inventory items={state.inventory} onSell={sellItem} onSellAll={() => {}} onCook={cookDish} />}
        {activeTab === TabType.TASKS && <Tasks state={state} onClaim={claimDaily} />}
      </main>
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default App;
