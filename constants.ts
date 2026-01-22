
import { Upgrade, Skin, CaseItem, UnboxingCase } from './types.ts';

export const APPETIZER_ITEMS: CaseItem[] = [
  { id: 'salt_packet', name: 'Open Salt Packet', icon: '🧂', rarity: 'common', multiplier: 0.05 },
  { id: 'napkin', name: 'Used Napkin', icon: '🧻', rarity: 'common', multiplier: 0.1 },
  { id: 'onion', name: 'Red Onion', icon: '🧅', rarity: 'common', multiplier: 0.15 },
  { id: 'tomato', name: 'Vine Tomato', icon: '🍅', rarity: 'common', multiplier: 0.3 },
  { id: 'lettuce', name: 'Iceberg Lettuce', icon: '🥬', rarity: 'common', multiplier: 0.4 },
  { id: 'bread', name: 'Stale Baguette', icon: '🍞', rarity: 'common', multiplier: 0.5 },
  { id: 'broccoli', name: 'Broccoli', icon: '🥦', rarity: 'common', multiplier: 0.7 },
  { id: 'egg', name: 'Free Range Egg', icon: '🥚', rarity: 'uncommon', multiplier: 1.1 },
  { id: 'cheese', name: 'Cheddar Block', icon: '🧀', rarity: 'uncommon', multiplier: 1.5 },
  { id: 'bacon', name: 'Crispy Bacon', icon: '🥓', rarity: 'uncommon', multiplier: 2.2 },
  { id: 'shrimp', name: 'Fresh Shrimp', icon: '🦐', rarity: 'rare', multiplier: 4.5 },
  { id: 'spices', name: 'Exotic Spices', icon: '🌶️', rarity: 'rare', multiplier: 7.0 },
  { id: 'cider', name: 'Sparkling Cider', icon: '🥂', rarity: 'legendary', multiplier: 18.0 },
];

export const MAIN_COURSE_ITEMS: CaseItem[] = [
  { id: 'burnt_toast', name: 'Burnt Toast', icon: '🍞', rarity: 'common', multiplier: 0.05 },
  { id: 'ketchup', name: 'Expired Ketchup', icon: '🥫', rarity: 'common', multiplier: 0.1 },
  { id: 'pasta', name: 'Fresh Pasta', icon: '🍝', rarity: 'common', multiplier: 0.2 },
  { id: 'chicken', name: 'Organic Chicken', icon: '🍗', rarity: 'common', multiplier: 0.4 },
  { id: 'corn', name: 'Sweet Corn', icon: '🌽', rarity: 'common', multiplier: 0.6 },
  { id: 'steak_mid', name: 'Ribeye Steak', icon: '🥩', rarity: 'uncommon', multiplier: 1.4 },
  { id: 'sushi', name: 'Salmon Nigiri', icon: '🍣', rarity: 'uncommon', multiplier: 2.2 },
  { id: 'avocado', name: 'Perfect Avocado', icon: '🥑', rarity: 'uncommon', multiplier: 2.8 },
  { id: 'lobster', name: 'Maine Lobster', icon: '🦞', rarity: 'rare', multiplier: 5.5 },
  { id: 'wine', name: 'Vintage Wine', icon: '🍷', rarity: 'rare', multiplier: 11.0 },
  { id: 'knife', name: 'Damascus Blade', icon: '🔪', rarity: 'legendary', multiplier: 32.0 },
  { id: 'clock', name: 'Chef Watch', icon: '⌚', rarity: 'legendary', multiplier: 45.0 },
  { id: 'trophy', name: 'Chef Trophy', icon: '🏆', rarity: 'exotic', multiplier: 140.0 },
];

export const GRAND_FEAST_ITEMS: CaseItem[] = [
  { id: 'old_oil', name: 'Used Fryer Oil', icon: '🛢️', rarity: 'common', multiplier: 0.02 },
  { id: 'dirty_rag', name: 'Dish Rag', icon: '🧼', rarity: 'common', multiplier: 0.05 },
  { id: 'lamb', name: 'Rack of Lamb', icon: '🍖', rarity: 'common', multiplier: 0.35 },
  { id: 'omakase', name: 'Premium Omakase', icon: '🍱', rarity: 'uncommon', multiplier: 1.1 },
  { id: 'tuna', name: 'Bluefin Toro', icon: '🐟', rarity: 'uncommon', multiplier: 1.8 },
  { id: 'saffron', name: 'Pure Saffron', icon: '🏵️', rarity: 'rare', multiplier: 5.5 },
  { id: 'truffle_white', name: 'White Truffle', icon: '🍄', rarity: 'rare', multiplier: 9.0 },
  { id: 'wagyu_a5', name: 'A5 Wagyu Beef', icon: '🥩', rarity: 'legendary', multiplier: 28.0 },
  { id: 'caviar_almas', name: 'Almas Caviar', icon: '🥣', rarity: 'legendary', multiplier: 55.0 },
  { id: 'diamond_spoon', name: 'Diamond Spoon', icon: '🥄', rarity: 'exotic', multiplier: 180.0 },
  { id: 'golden_egg', name: 'Golden Phoenix Egg', icon: '🥚', rarity: 'exotic', multiplier: 450.0 },
];

export const MICHELIN_GALA_ITEMS: CaseItem[] = [
  { id: 'broken_glass', name: 'Broken Flute', icon: '🥂', rarity: 'common', multiplier: 0.01 },
  { id: 'stray_hair', name: 'The Hair in Soup', icon: '🍜', rarity: 'common', multiplier: 0.05 },
  { id: 'vintage_champagne', name: '1945 Champagne', icon: '🍾', rarity: 'uncommon', multiplier: 1.4 },
  { id: 'royal_feast', name: 'Royal Banquet', icon: '🍽️', rarity: 'rare', multiplier: 4.5 },
  { id: 'meteorite_salt', name: 'Meteorite Salt', icon: '☄️', rarity: 'rare', multiplier: 11.0 },
  { id: 'emerald_kale', name: 'Emerald Kale', icon: '🥬', rarity: 'legendary', multiplier: 38.0 },
  { id: 'liquid_gold', name: 'Liquid Gold Oil', icon: '🏺', rarity: 'legendary', multiplier: 75.0 },
  { id: 'michelin_star_medal', name: 'The 3rd Star', icon: '🎖️', rarity: 'exotic', multiplier: 280.0 },
  { id: 'god_pan', name: 'The Pan of Olympus', icon: '🍳', rarity: 'exotic', multiplier: 900.0 },
];

export const CASES: UnboxingCase[] = [
  { id: 'budget_case', name: 'The Appetizer', cost: 100, icon: '🥡', items: APPETIZER_ITEMS },
  { id: 'pro_case', name: 'The Main Course', cost: 5000, icon: '🍱', items: MAIN_COURSE_ITEMS },
  { id: 'elite_case', name: 'The Grand Feast', cost: 100000, icon: '🍽️', items: GRAND_FEAST_ITEMS },
  { id: 'michelin_case', name: 'The Michelin Gala', cost: 2500000, icon: '✨', items: MICHELIN_GALA_ITEMS }
];

export const UPGRADES: Upgrade[] = [
  { id: 'intern_chef', name: 'Dishwasher', description: 'Scrubbing pans for pennies.', baseCost: 50, incomePerSec: 1, icon: '🧽', type: 'staff' },
  { id: 'sous_chef', name: 'Sous Chef', description: 'Actually knows how to chop onions.', baseCost: 1000, incomePerSec: 6, icon: '🔪', type: 'staff' },
  { id: 'fancy_stove', name: 'Gas Stove', description: 'Now you are cooking with gas!', baseCost: 7500, incomePerSec: 30, icon: '🔥', type: 'equipment' },
  { id: 'head_chef', name: 'Head Chef', description: 'Expert at yelling and flavoring.', baseCost: 35000, incomePerSec: 120, icon: '👨‍🍳', type: 'staff' },
  { id: 'industrial_fridge', name: 'Walk-in Fridge', description: 'Fresh ingredients mean fresh profits.', baseCost: 150000, incomePerSec: 450, icon: '🧊', type: 'equipment' },
  { id: 'conveyor_belt', name: 'Kitchen Belt', description: 'Automated sushi delivery system.', baseCost: 800000, incomePerSec: 1800, icon: '🍣', type: 'equipment' },
  { id: 'celebrity_chef', name: 'Celebrity Chef', description: 'Brings TV cameras and big crowds.', baseCost: 5000000, incomePerSec: 9000, icon: '📸', type: 'staff' },
  { id: 'molecular_lab', name: 'Molecular Lab', description: 'Turning liquids into edible bubbles.', baseCost: 25000000, incomePerSec: 40000, icon: '🧪', type: 'equipment' },
  { id: 'michelin_star', name: 'Michelin Star', description: 'Global recognition brings the whales.', baseCost: 150000000, incomePerSec: 180000, icon: '⭐', type: 'equipment' },
  { id: 'kitchen_ai', name: 'Gourmet AI', description: 'Algorithmically perfect flavors.', baseCost: 2000000000, incomePerSec: 1200000, icon: '🧠', type: 'equipment' },
  { id: 'orbital_galley', name: 'Orbital Galley', description: 'Catering for the galactic elite.', baseCost: 10000000000, incomePerSec: 8000000, icon: '🚀', type: 'equipment' }
];

export const SKINS: Skin[] = [
  { id: 'default_chef', name: 'Classic Chef', cost: 0, icon: '👨‍🍳', description: 'The original master of the kitchen.' },
  { id: 'line_cook', name: 'Sweaty Line Cook', cost: 5000, icon: '🥵', description: 'Surviving on energy drinks and spite.' },
  { id: 'ninja_chef', name: 'Ninja Cook', cost: 50000, icon: '🥷', description: 'Slices onions faster than the eye can see.' },
  { id: 'viking_chef', name: 'Norse Griller', cost: 500000, icon: '🧔', description: 'Roasting boars over an open flame.' },
  { id: 'robot_chef', name: 'Cyber-Cook 3000', cost: 5000000, icon: '🤖', description: 'Automated culinary perfection.' },
  { id: 'ghost_chef', name: 'Specter of Salt', cost: 50000000, icon: '👻', description: 'His secret ingredient is Ethereal Herbs.' },
  { id: 'king_chef', name: 'Golden King', cost: 250000000, icon: '👑', description: "Royalty doesn't cook, they command." },
  { id: 'alien_chef', name: 'Galactic Gourmet', cost: 1000000000, icon: '👽', description: 'Cooking with ingredients from Sector 7.' },
  { id: 'god_chef', name: 'Culinary Deity', cost: 5000000000, icon: '🌌', description: 'Creates universes and seasons them with stardust.' }
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

export const SAVE_KEY = 'master_chef_save_v2';
