export interface PackingItem {
  id: string;
  length: number; // mm
  width: number;  // mm
  height: number; // mm
  weight: number; // kg
  quantity: number;
  stackable: boolean;
  maxStack: number;
  fragile: boolean;
  type?: ItemType;
}

export type ItemType = 'pallet' | 'crate' | 'drum' | 'box' | 'bag' | 'stand' | 'tray' | 'default';

export interface Container {
  length: number; // mm
  width: number;  // mm
  height: number; // mm
  maxWeight: number; // kg
}

export interface PlacedItem {
  itemId: string;
  x: number;
  y: number;
  z: number;
  l: number;
  w: number;
  h: number;
  color: string;
  label: string;
  type: ItemType;
}

export interface UnplacedItem {
  itemId: string;
  remainingQuantity: number;
  reason: string;
}

export interface PackingResult {
  positions: PlacedItem[];
  fillRate: number;
  totalWeight: number;
  summary: string;
  unplacedItems: UnplacedItem[];
  containerVolume: number;
  usedVolume: number;
}

export const ITEM_COLORS: Record<ItemType, string> = {
  pallet: '#8B5A2B',
  crate: '#FF8C00',
  drum: '#737373',
  box: '#DAA520',
  bag: '#9370DB',
  stand: '#2D2D2D',
  tray: '#FF69B4',
  default: '#22D3EE',
};

export const DEFAULT_CONTAINER: Container = {
  length: 5898,
  width: 2352,
  height: 2393,
  maxWeight: 28000,
};

export const SAMPLE_ITEMS: PackingItem[] = [
  { id: 'PLT-001', length: 1200, width: 1000, height: 150, weight: 25, quantity: 4, stackable: true, maxStack: 3, fragile: false, type: 'pallet' },
  { id: 'CRT-001', length: 600, width: 400, height: 400, weight: 35, quantity: 6, stackable: true, maxStack: 4, fragile: false, type: 'crate' },
  { id: 'BOX-001', length: 300, width: 200, height: 150, weight: 8, quantity: 20, stackable: true, maxStack: 6, fragile: true, type: 'box' },
  { id: 'BAG-001', length: 250, width: 150, height: 100, weight: 2, quantity: 50, stackable: true, maxStack: 10, fragile: true, type: 'bag' },
  { id: 'DRM-001', length: 580, width: 580, height: 880, weight: 180, quantity: 2, stackable: false, maxStack: 1, fragile: false, type: 'drum' },
  { id: 'TRY-001', length: 400, width: 300, height: 80, weight: 5, quantity: 15, stackable: true, maxStack: 8, fragile: true, type: 'tray' },
];
