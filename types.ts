
export enum TabType {
  KITCHEN = 'KITCHEN',
  SHOP = 'SHOP',
  SKINS = 'SKINS',
  CASINO = 'CASINO',
  TASKS = 'TASKS',
  INVENTORY = 'INVENTORY',
  LEADERBOARD = 'LEADERBOARD'
}

export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary' | 'exotic';

export interface CaseItem {
  id: string;
  name: string;
  icon: string;
  rarity: Rarity;
  multiplier: number;
}

export interface InventoryItem {
  id: string; 
  item: CaseItem;
  purchasePrice: number;
  unboxedAt: number;
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  incomePerSec: number;
  icon: string;
  type: 'staff' | 'equipment';
}

export interface Skin {
  id: string;
  name: string;
  cost: number;
  icon: string;
  description: string;
}

export interface UnboxingCase {
  id: string;
  name: string;
  cost: number;
  icon: string;
  items: CaseItem[];
}

export interface ActiveBoost {
  multiplier: number;
  endTime: number;
}

export interface GameState {
  userId: string;
  username: string;
  balance: number;
  totalEarned: number;
  passiveIncome: number;
  clickPower: number;
  upgrades: Record<string, number>; 
  ownedSkins: string[]; 
  activeSkin: string; 
  inventory: InventoryItem[];
  lastSaved: number;
  dailyStreak: number;
  lastDailyClaim: number;
  unlockedDishes: string[];
  activeBoost?: ActiveBoost;
}

export interface ClickPop {
  id: number;
  x: number;
  y: number;
  value: number;
  isCrit: boolean;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  emoji: string;
  rotation: number;
}
