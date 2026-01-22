
import React, { useState, useEffect, useCallback } from 'react';
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
        const elapsedSecs = Math.floor((now - parsed.lastSaved) / 1000);
        const merged = { ...INITIAL_STATE, ...parsed };
        
        if (elapsedSecs > 0 && merged.passiveIncome > 0) {
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

  const [activeTab, setActiveTab] = useState<TabType>(TabType.KITCHEN);
  const [pops, setPops] = useState<ClickPop[]>([]);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setState(prev => {
        const newState = { ...prev, lastSaved: Date.now() };
        localStorage.setItem(SAVE_KEY, JSON.stringify(newState));
        return newState;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, []);

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
    const power = state.clickPower;
    setState(prev => ({
      ...prev,
      balance: prev.balance + power,
      totalEarned: prev.totalEarned + power
    }));

    const id = Date.now();
    setPops(prev => [...prev, { id, x, y, value: power }]);
    setTimeout(() => {
      setPops(prev => prev.filter(p => p.id !== id));
    }, 800);

    const tg = (window as any).Telegram?.WebApp;
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('medium');
    }
  }, [state.clickPower]);

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
        return {
          ...prev,
          balance: prev.balance - cost,
          upgrades: newUpgrades,
          passiveIncome: newPassive,
          clickPower: 1 + Math.floor(newPassive * 0.1)
        };
      });
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
    }
  }, [state]);

  const buySkin = useCallback((skinId: string) => {
    const skin = SKINS.find(s => s.id === skinId);
    if (!skin || state.ownedSkins.includes(skinId)) return;

    if (state.balance >= skin.cost) {
      setState(prev => ({
        ...prev,
        balance: prev.balance - skin.cost,
        ownedSkins: [...prev.ownedSkins, skinId],
        activeSkin: skinId
      }));
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
    }
  }, [state]);

  const equipSkin = useCallback((skinId: string) => {
    if (state.ownedSkins.includes(skinId)) {
      setState(prev => ({ ...prev, activeSkin: skinId }));
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

  const claimDaily = useCallback((reward: number) => {
    setState(prev => ({
      ...prev,
      balance: prev.balance + reward,
      totalEarned: prev.totalEarned + reward,
      lastDailyClaim: Date.now()
    }));
  }, []);

  const addToInventory = useCallback((item: CaseItem, purchasePrice: number) => {
    const newEntry: InventoryItem = {
      id: Math.random().toString(36).substr(2, 9) + Date.now(),
      item,
      purchasePrice,
      unboxedAt: Date.now()
    };
    setState(prev => ({
      ...prev,
      inventory: [newEntry, ...prev.inventory]
    }));
  }, []);

  const sellItem = useCallback((id: string) => {
    setState(prev => {
      const entry = prev.inventory.find(i => i.id === id);
      if (!entry) return prev;
      const saleValue = Math.floor(entry.purchasePrice * entry.item.multiplier);
      return {
        ...prev,
        balance: prev.balance + saleValue,
        inventory: prev.inventory.filter(i => i.id !== id)
      };
    });
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
  }, []);

  const sellAllItems = useCallback(() => {
    setState(prev => {
      const totalSaleValue = prev.inventory.reduce((acc, entry) => {
        return acc + Math.floor(entry.purchasePrice * entry.item.multiplier);
      }, 0);
      return {
        ...prev,
        balance: prev.balance + totalSaleValue,
        inventory: []
      };
    });
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
  }, []);

  return (
    <div className="flex flex-col h-screen text-slate-100 kitchen-bg overflow-hidden">
      <Header balance={state.balance} passiveIncome={state.passiveIncome} />
      
      <main className="flex-1 overflow-y-auto pb-24 relative">
        {activeTab === TabType.KITCHEN && (
          <Kitchen 
            onClick={handleManualClick} 
            pops={pops} 
            clickPower={state.clickPower}
            activeSkinId={state.activeSkin}
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
