
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TabType, GameState, ClickPop, CaseItem, InventoryItem } from './types.ts';
import { INITIAL_STATE, SAVE_KEY, UPGRADES, SKINS } from './constants.ts';
import Kitchen from './components/Kitchen.tsx';
import Shop from './components/Shop.tsx';
import Skins from './components/Skins.tsx';
import Casino from './components/Casino.tsx';
import Inventory from './components/Inventory.tsx';
import Tasks from './components/Tasks.tsx';
import Header from './components/Header.tsx';
import Navigation from './components/Navigation.tsx';

const App: React.FC = () => {
  const [state, setState] = useState<GameState>(() => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const now = Date.now();
        const elapsedSecs = Math.floor((now - (parsed.lastSaved || now)) / 1000);
        const merged = { ...INITIAL_STATE, ...parsed };
        
        if (elapsedSecs > 0 && merged.passiveIncome > 0) {
          // Cap offline income at 4 hours
          const offlineIncome = Math.min(merged.passiveIncome * elapsedSecs, merged.passiveIncome * 3600 * 4);
          merged.balance += offlineIncome;
          merged.totalEarned += offlineIncome;
        }
        return { ...merged, lastSaved: now };
      } catch (e) {
        return INITIAL_STATE;
      }
    }
    return INITIAL_STATE;
  });

  // Ref to always hold the freshest state for the background saver
  const stateRef = useRef<GameState>(state);
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

  // PERSISTENCE: Background Auto-Save (Fixed Interval)
  useEffect(() => {
    const performSave = () => {
      const dataToSave = { 
        ...stateRef.current, 
        lastSaved: Date.now() 
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(dataToSave));
    };

    const saveInterval = setInterval(performSave, 2000);

    // Save on app lifecycle events
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') performSave();
    };
    
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', performSave);

    return () => {
      clearInterval(saveInterval);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', performSave);
    };
  }, []);

  // Helper for immediate "Priority Saves" on transactions
  const prioritySave = (newState: GameState) => {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ ...newState, lastSaved: Date.now() }));
  };

  // Unified Combo & Frenzy Decay Logic
  useEffect(() => {
    const decayInterval = setInterval(() => {
      setCombo(prev => {
        if (prev <= 0) {
          if (isFrenzy) setIsFrenzy(false);
          return 0;
        }
        
        const timeSinceLastClick = Date.now() - lastClickTimeRef.current;
        let decayAmount = isFrenzy ? 1.2 : 0.8;

        if (timeSinceLastClick > 1200) {
          decayAmount = isFrenzy ? 5.0 : 8.0; 
        } else if (timeSinceLastClick > 600) {
          decayAmount = isFrenzy ? 2.5 : 3.5;
        }

        const nextValue = Math.max(0, prev - decayAmount);
        if (nextValue === 0 && isFrenzy) setIsFrenzy(false);
        return nextValue;
      });
    }, 100);
    return () => clearInterval(decayInterval);
  }, [isFrenzy]);

  // Frenzy Trigger
  useEffect(() => {
    if (combo >= 100 && !isFrenzy) {
      setIsFrenzy(true);
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('warning');
    }
  }, [combo, isFrenzy]);

  // Passive Income Ticker
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
    const frenzyMult = isFrenzy ? 5 : 1;
    const critMult = isCrit ? 10 : 1;
    const power = state.clickPower * frenzyMult * critMult;

    setState(prev => ({
      ...prev,
      balance: prev.balance + power,
      totalEarned: prev.totalEarned + power
    }));

    setCombo(prev => {
      const gain = isFrenzy ? 2.5 : 5.5;
      return Math.min(100, prev + gain);
    });

    const id = Date.now() + Math.random();
    setPops(prev => [...prev, { id, x, y, value: power, isCrit }]);
    setTimeout(() => {
      setPops(prev => prev.filter(p => p.id !== id));
    }, 800);

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
        const newPassive = UPGRADES.reduce((acc, up) => {
          const level = newUpgrades[up.id] || 0;
          return acc + (level * up.incomePerSec);
        }, 0);
        const newState = {
          ...prev,
          balance: prev.balance - cost,
          upgrades: newUpgrades,
          passiveIncome: newPassive,
          clickPower: 1 + Math.floor(newPassive * 0.1)
        };
        prioritySave(newState);
        return newState;
      });
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
    }
  }, [state]);

  const buySkin = useCallback((skinId: string) => {
    const skin = SKINS.find(s => s.id === skinId);
    if (!skin || state.ownedSkins.includes(skinId)) return;

    if (state.balance >= skin.cost) {
      setState(prev => {
        const newState = {
          ...prev,
          balance: prev.balance - skin.cost,
          ownedSkins: [...prev.ownedSkins, skinId],
          activeSkin: skinId
        };
        prioritySave(newState);
        return newState;
      });
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
    }
  }, [state]);

  const equipSkin = useCallback((skinId: string) => {
    if (state.ownedSkins.includes(skinId)) {
      setState(prev => {
        const newState = { ...prev, activeSkin: skinId };
        prioritySave(newState);
        return newState;
      });
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
    }
  }, [state.ownedSkins]);

  const modifyBalance = useCallback((amount: number) => {
    setState(prev => ({
      ...prev,
      balance: Math.max(0, prev.balance + amount),
      totalEarned: amount > 0 ? prev.totalEarned + amount : prev.totalEarned
    }));
  }, []);

  const addToInventory = useCallback((item: CaseItem, purchasePrice: number) => {
    const newEntry: InventoryItem = {
      id: Math.random().toString(36).substr(2, 9) + Date.now(),
      item,
      purchasePrice,
      unboxedAt: Date.now()
    };
    setState(prev => {
      const newState = {
        ...prev,
        inventory: [newEntry, ...prev.inventory]
      };
      prioritySave(newState);
      return newState;
    });
  }, []);

  const sellItem = useCallback((id: string) => {
    setState(prev => {
      const entry = prev.inventory.find(i => i.id === id);
      if (!entry) return prev;
      const saleValue = Math.floor(entry.purchasePrice * entry.item.multiplier);
      const newState = {
        ...prev,
        balance: prev.balance + saleValue,
        inventory: prev.inventory.filter(i => i.id !== id)
      };
      prioritySave(newState);
      return newState;
    });
  }, []);

  const sellAllItems = useCallback(() => {
    setState(prev => {
      const totalSaleValue = prev.inventory.reduce((acc, entry) => {
        return acc + Math.floor(entry.purchasePrice * entry.item.multiplier);
      }, 0);
      const newState = {
        ...prev,
        balance: prev.balance + totalSaleValue,
        inventory: []
      };
      prioritySave(newState);
      return newState;
    });
  }, []);

  const cookDish = useCallback(() => {
    if (state.inventory.length < 3) return;
    
    setState(prev => {
      const itemsToCook = prev.inventory.slice(0, 3);
      const totalCost = itemsToCook.reduce((acc, i) => acc + i.purchasePrice, 0);
      const averageMult = itemsToCook.reduce((acc, i) => acc + i.item.multiplier, 0) / 3;
      const dishValue = Math.floor(totalCost * averageMult * 2.5);
      
      const tg = (window as any).Telegram?.WebApp;
      if (tg) tg.showPopup({ title: 'Masterpiece Cooked!', message: `Your 3-item combo sold for a massive $${dishValue.toLocaleString()}!` });

      const newState = {
        ...prev,
        balance: prev.balance + dishValue,
        inventory: prev.inventory.slice(3)
      };
      prioritySave(newState);
      return newState;
    });
  }, [state.inventory]);

  const claimDaily = useCallback((reward: number) => {
    setState(prev => {
      const newState = {
        ...prev,
        balance: prev.balance + reward,
        totalEarned: prev.totalEarned + reward,
        lastDailyClaim: Date.now()
      };
      prioritySave(newState);
      return newState;
    });
  }, []);

  return (
    <div className={`flex flex-col h-screen text-slate-100 kitchen-bg overflow-hidden transition-colors duration-500 ${isFrenzy ? 'bg-amber-900/20' : ''}`}>
      <Header balance={state.balance} passiveIncome={state.passiveIncome} />
      
      <main className="flex-1 overflow-y-auto pb-24 relative">
        {activeTab === TabType.KITCHEN && (
          <Kitchen 
            onClick={handleManualClick} 
            pops={pops} 
            clickPower={state.clickPower}
            activeSkinId={state.activeSkin}
            combo={combo}
            isFrenzy={isFrenzy}
          />
        )}
        {activeTab === TabType.SHOP && (
          <Shop 
            upgrades={state.upgrades} 
            balance={state.balance} 
            onBuy={buyUpgrade} 
          />
        )}
        {activeTab === TabType.SKINS && (
          <Skins 
            ownedSkins={state.ownedSkins}
            activeSkin={state.activeSkin}
            balance={state.balance}
            onBuy={buySkin}
            onEquip={equipSkin}
          />
        )}
        {activeTab === TabType.CASINO && (
          <Casino 
            balance={state.balance} 
            onWager={modifyBalance} 
            onWin={(item, price) => addToInventory(item, price)}
          />
        )}
        {activeTab === TabType.INVENTORY && (
          <Inventory 
            items={state.inventory}
            onSell={sellItem}
            onSellAll={sellAllItems}
            onCook={cookDish}
          />
        )}
        {activeTab === TabType.TASKS && (
          <Tasks 
            state={state}
            onClaim={claimDaily}
          />
        )}
      </main>

      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default App;
