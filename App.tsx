
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

const ADSGRAM_BLOCK_ID = "21602"; 

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
  const [isAdSdkReady, setIsAdSdkReady] = useState(false);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // SDK Polling Logic
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 20; // 10 seconds total
    const interval = setInterval(() => {
      const adsgram = (window as any).Adsgram || (window as any).AdsGram;
      if (adsgram) {
        setIsAdSdkReady(true);
        clearInterval(interval);
        console.log("AdsGram SDK Detected and Ready.");
      }
      attempts++;
      if (attempts >= maxAttempts) {
        clearInterval(interval);
        console.warn("AdsGram SDK failed to load after 10s.");
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const [activeTab, setActiveTab] = useState<TabType>(TabType.KITCHEN);
  const [pops, setPops] = useState<ClickPop[]>([]);
  const [combo, setCombo] = useState(0);
  const [isFrenzy, setIsFrenzy] = useState(false);
  const lastClickTimeRef = useRef<number>(Date.now());

  const isBoostActive = state.activeBoost && state.activeBoost.endTime > Date.now();
  const currentMultiplier = isBoostActive ? 2 : 1;

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      tg.enableClosingConfirmation();
    }
  }, []);

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
        setSyncStatus('error');
        setLastError(error.message);
      } else {
        setSyncStatus('success');
        setTimeout(() => setSyncStatus('idle'), 3000);
      }
    } catch (err: any) {
      setSyncStatus('error');
      setLastError(err.message);
    }
  }, []);

  useEffect(() => {
    syncToSupabase(state);
  }, []);

  const saveNow = useCallback((customState?: GameState) => {
    const data = customState || stateRef.current;
    const toSave = { ...data, lastSaved: Date.now() };
    localStorage.setItem(SAVE_KEY, JSON.stringify(toSave));
    if (customState) {
      syncToSupabase(toSave);
    }
  }, [syncToSupabase]);

  useEffect(() => {
    const interval = setInterval(() => saveNow(), 5000);
    return () => clearInterval(interval);
  }, [saveNow]);

  useEffect(() => {
    const decayInterval = setInterval(() => {
      setCombo(prev => {
        if (prev <= 0) { if (isFrenzy) setIsFrenzy(false); return 0; }
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
      (window as any).Telegram?.WebApp?.HapticFeedback?.notificationOccurred('warning');
    }
  }, [combo, isFrenzy]);

  useEffect(() => {
    const ticker = setInterval(() => {
      setState(prev => {
        const boostVal = prev.activeBoost && prev.activeBoost.endTime > Date.now() ? 2 : 1;
        const perTick = (prev.passiveIncome * boostVal) / 10;
        return {
          ...prev,
          balance: prev.balance + perTick,
          totalEarned: prev.totalEarned + perTick
        };
      });
    }, 100);
    return () => clearInterval(ticker);
  }, []);

  const handleManualClick = useCallback((x: number, y: number) => {
    lastClickTimeRef.current = Date.now();
    const isCrit = Math.random() < 0.05;
    const boostMult = (stateRef.current.activeBoost && stateRef.current.activeBoost.endTime > Date.now()) ? 2 : 1;
    const power = state.clickPower * (isFrenzy ? 5 : 1) * (isCrit ? 10 : 1) * boostMult;
    
    setState(prev => ({ ...prev, balance: prev.balance + power, totalEarned: prev.totalEarned + power }));
    setCombo(prev => Math.min(100, prev + (isFrenzy ? 2.5 : 6.0)));
    const id = Date.now() + Math.random();
    setPops(prev => [...prev, { id, x, y, value: power, isCrit }]);
    setTimeout(() => setPops(prev => prev.filter(p => p.id !== id)), 800);
    (window as any).Telegram?.WebApp?.HapticFeedback?.impactOccurred(isCrit ? 'heavy' : 'light');
  }, [state.clickPower, isFrenzy]);

  const showAppAlert = (message: string) => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.showAlert) {
      tg.showAlert(message);
    } else {
      alert(message);
    }
  };

  const triggerAdsGramAd = useCallback(() => {
    const tg = (window as any).Telegram?.WebApp;
    const adsgram = (window as any).Adsgram || (window as any).AdsGram;
    
    if (!adsgram) {
      showAppAlert("Ad system is currently unavailable. This may be due to a poor connection or the network being temporarily down in your region.");
      return;
    }

    try {
      tg?.HapticFeedback?.impactOccurred('medium');
      const AdController = adsgram.init({ blockId: ADSGRAM_BLOCK_ID });

      AdController.show()
        .then((result: any) => {
          if (result && result.done) {
            activateBoost(300000); 
            showAppAlert("Success! 2x Revenue activated for 5 minutes.");
          } else {
            showAppAlert("The ad wasn't fully watched, so no boost was rewarded.");
          }
        })
        .catch((err: any) => {
          console.error("AdsGram Show Catch:", err);
          const msg = err?.description || "No ads available in your area right now. Please try again in a few minutes!";
          showAppAlert(msg);
        });
    } catch (e) {
      console.error("AdsGram Crash:", e);
      showAppAlert("Failed to start the ad player. Please try again later.");
    }
  }, []);

  const activateBoost = (durationMs: number) => {
    setState(prev => {
      const newState = { 
        ...prev, 
        activeBoost: { 
          multiplier: 2, 
          endTime: Date.now() + durationMs 
        } 
      };
      saveNow(newState);
      return newState;
    });
  };

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

  const sellAllItems = useCallback(() => {
    setState(prev => {
      if (prev.inventory.length === 0) return prev;
      const totalSale = prev.inventory.reduce((acc, entry) => acc + Math.floor(entry.purchasePrice * entry.item.multiplier), 0);
      const newState = { ...prev, balance: prev.balance + totalSale, inventory: [] };
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
        passiveIncome={state.passiveIncome * currentMultiplier} 
        syncStatus={syncStatus} 
        lastError={lastError} 
        onRetrySync={() => syncToSupabase(state)}
        boostEndTime={state.activeBoost?.endTime}
      />
      <main className="flex-1 overflow-y-auto pb-24 relative">
        {activeTab === TabType.KITCHEN && (
          <Kitchen 
            onClick={handleManualClick} 
            pops={pops} 
            clickPower={state.clickPower} 
            activeSkinId={state.activeSkin} 
            combo={combo} 
            isFrenzy={isFrenzy} 
            isBoostActive={isBoostActive}
            isAdSdkReady={isAdSdkReady}
            onWatchAd={triggerAdsGramAd}
          />
        )}
        {activeTab === TabType.SHOP && <Shop upgrades={state.upgrades} balance={state.balance} onBuy={buyUpgrade} />}
        {activeTab === TabType.LEADERBOARD && <Leaderboard userEarnings={state.totalEarned} userId={state.userId} />}
        {activeTab === TabType.SKINS && <Skins ownedSkins={state.ownedSkins} activeSkin={state.activeSkin} balance={state.balance} onBuy={buySkin} onEquip={equipSkin} />}
        {activeTab === TabType.CASINO && <Casino balance={state.balance} onWager={modifyBalance} onWin={addToInventory} />}
        {activeTab === TabType.INVENTORY && <Inventory items={state.inventory} onSell={sellItem} onSellAll={sellAllItems} onCook={cookDish} />}
        {activeTab === TabType.TASKS && <Tasks state={state} onClaim={claimDaily} />}
      </main>
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default App;
