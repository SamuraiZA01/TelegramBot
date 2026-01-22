
import { Upgrade, Skin, CaseItem, UnboxingCase } from './types';

// Appetizer Case Items (Budget)
export const APPETIZER_ITEMS: CaseItem[] = [
  { id: 'onion', name: 'Red Onion', icon: '🧅', rarity: 'common', multiplier: 0.1 },
  { id: 'tomato', name: 'Vine Tomato', icon: '🍅', rarity: 'common', multiplier: 0.3 },
  { id: 'bread', name: 'Stale Baguette', icon: '🍞', rarity: 'common', multiplier: 0.6 },
  { id: 'broccoli', name: 'Broccoli', icon: '🥦', rarity: 'common', multiplier: 0.8 },
  { id: 'cheese', name: 'Cheddar Block', icon: '🧀', rarity: 'uncommon', multiplier: 1.5 },
  { id: 'bacon', name: 'Crispy Bacon', icon: '🥓', rarity: 'uncommon', multiplier: 2.5 },
  { id: 'shrimp', name: 'Fresh Shrimp', icon: '🦐', rarity: 'rare', multiplier: 5.0 },
  { id: 'cider', name: 'Sparkling Cider', icon: '🥂', rarity: 'legendary', multiplier: 15.0 },
];

// Main Course Case Items (Mid-tier)
export const MAIN_COURSE_ITEMS: CaseItem[] = [
  { id: 'pasta', name: 'Fresh Pasta', icon: '🍝', rarity: 'common', multiplier: 0.2 },
  { id: 'chicken', name: 'Organic Chicken', icon: '🍗', rarity: 'common', multiplier: 0.5 },
  { id: 'steak_mid', name: 'Ribeye Steak', icon: '🥩', rarity: 'uncommon', multiplier: 1.8 },
  { id: 'sushi', name: 'Salmon Nigiri', icon: '🍣', rarity: 'uncommon', multiplier: 2.2 },
  { id: 'lobster', name: 'Maine Lobster', icon: '🦞', rarity: 'rare', multiplier: 4.5 },
  { id: 'wine', name: 'Vintage Wine', icon: '🍷', rarity: 'rare', multiplier: 10.0 },
  { id: 'knife', name: 'Damascus Blade', icon: '🔪', rarity: 'legendary', multiplier: 30.0 },
  { id: 'trophy', name: 'Chef Trophy', icon: '🏆', rarity: 'exotic', multiplier: 100.0 },
];

// Grand Feast Case Items (High-roller)
export const GRAND_FEAST_ITEMS: CaseItem[] = [
  { id: 'lamb', name: 'Rack of Lamb', icon: '🍖', rarity: 'common', multiplier: 0.4 },
  { id: 'omakase', name: 'Premium Omakase', icon: '🍱', rarity: 'uncommon', multiplier: 1.2 },
  { id: 'saffron', name: 'Pure Saffron', icon: '🏵️', rarity: 'rare', multiplier: 6.0 },
  { id: 'truffle_white', name: 'White Truffle', icon: '🍄', rarity: 'rare', multiplier: 8.0 },
  { id: 'wagyu_a5', name: 'A5 Wagyu Beef', icon: '🥩', rarity: 'legendary', multiplier: 25.0 },
  { id: 'caviar_almas', name: 'Almas Caviar', icon: '🥣', rarity: 'legendary', multiplier: 50.0 },
  { id: 'golden_egg', name: 'Golden Phoenix Egg', icon: '🥚', rarity: 'exotic', multiplier: 250.0 },
];

export const CASES: UnboxingCase[] = [
  {
    id: 'budget_case',
    name: 'The Appetizer',
    cost: 50,
    icon: '🥡',
    items: APPETIZER_ITEMS
  },
  {
    id: 'pro_case',
    name: 'The Main Course',
    cost: 1000,
    icon: '🍱',
    items: MAIN_COURSE_ITEMS
  },
  {
    id: 'elite_case',
    name: 'The Grand Feast',
    cost: 25000,
    icon: '🍽️',
    items: GRAND_FEAST_ITEMS
  }
];

export const UPGRADES: Upgrade[] = [
  {
    id: 'intern_chef',
    name: 'Dishwasher',
    description: 'Scrubbing pans for pennies.',
    baseCost: 15,
    incomePerSec: 1,
    icon: '🧽',
    type: 'staff'
  },
  {
    id: 'sous_chef',
    name: 'Sous Chef',
    description: 'Actually knows how to chop onions.',
    baseCost: 100,
    incomePerSec: 5,
    icon: '🔪',
    type: 'staff'
  },
  {
    id: 'fancy_stove',
    name: 'Gas Stove',
    description: 'Now you are cooking with gas!',
    baseCost: 500,
    incomePerSec: 15,
    icon: '🔥',
    type: 'equipment'
  },
  {
    id: 'head_chef',
    name: 'Head Chef',
    description: 'Expert at yelling and flavoring.',
    baseCost: 2500,
    incomePerSec: 60,
    icon: '👨‍🍳',
    type: 'staff'
  },
  {
    id: 'industrial_fridge',
    name: 'Walk-in Fridge',
    description: 'Fresh ingredients mean fresh profits.',
    baseCost: 10000,
    incomePerSec: 200,
    icon: '🧊',
    type: 'equipment'
  },
  {
    id: 'michelin_star',
    name: 'Michelin Star',
    description: 'Global recognition brings the whales.',
    baseCost: 50000,
    incomePerSec: 800,
    icon: '⭐',
    type: 'equipment'
  }
];

export const SKINS: Skin[] = [
  {
    id: 'default_chef',
    name: 'Classic Chef',
    cost: 0,
    icon: '👨‍🍳',
    description: 'The original master of the kitchen.'
  },
  {
    id: 'ninja_chef',
    name: 'Ninja Cook',
    cost: 5000,
    icon: '🥷',
    description: 'Slices onions faster than the eye can see.'
  },
  {
    id: 'robot_chef',
    name: 'Cyber-Cook 3000',
    cost: 25000,
    icon: '🤖',
    description: 'Automated culinary perfection.'
  },
  {
    id: 'king_chef',
    name: 'Golden King',
    cost: 100000,
    icon: '👑',
    description: "Royalty doesn't cook, they command."
  },
  {
    id: 'alien_chef',
    name: 'Galactic Gourmet',
    cost: 500000,
    icon: '👽',
    description: 'Cooking with ingredients from Sector 7.'
  }
];

export const INITIAL_STATE = {
  balance: 0,
  totalEarned: 0,
  passiveIncome: 0,
  clickPower: 1,
  upgrades: {},
  ownedSkins: ['default_chef'],
  activeSkin: 'default_chef',
  inventory: [],
  lastSaved: Date.now(),
  dailyStreak: 0,
  lastDailyClaim: 0,
  unlockedDishes: ['Burger']
};

export const SAVE_KEY = 'master_chef_save_v1';
