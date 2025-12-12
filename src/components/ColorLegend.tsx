import React from 'react';
import { ITEM_COLORS, ItemType } from '@/types/packing';

const LEGEND_ITEMS: { type: ItemType; label: string }[] = [
  { type: 'pallet', label: 'Pallet' },
  { type: 'crate', label: 'Crate' },
  { type: 'drum', label: 'Drum' },
  { type: 'box', label: 'Box' },
  { type: 'bag', label: 'Bag' },
  { type: 'stand', label: 'Stand' },
  { type: 'tray', label: 'Tray' },
  { type: 'default', label: 'Other' },
];

export function ColorLegend() {
  return (
    <div className="glass-panel p-4">
      <h4 className="text-sm font-medium text-muted-foreground mb-3">Item Types</h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {LEGEND_ITEMS.map(({ type, label }) => (
          <div key={type} className="legend-item">
            <div 
              className="legend-dot" 
              style={{ backgroundColor: ITEM_COLORS[type] }}
            />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
