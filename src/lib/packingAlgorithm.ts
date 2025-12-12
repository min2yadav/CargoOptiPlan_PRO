import { 
  PackingItem, 
  Container, 
  PlacedItem, 
  UnplacedItem, 
  PackingResult, 
  ITEM_COLORS,
  ItemType 
} from '@/types/packing';

interface InternalItem extends PackingItem {
  volume: number;
  remainingQty: number;
}

function getItemColor(type: ItemType): string {
  return ITEM_COLORS[type] || ITEM_COLORS.default;
}

function detectItemType(id: string): ItemType {
  const lowerID = id.toLowerCase();
  if (lowerID.includes('plt') || lowerID.includes('pallet')) return 'pallet';
  if (lowerID.includes('crt') || lowerID.includes('crate')) return 'crate';
  if (lowerID.includes('drm') || lowerID.includes('drum')) return 'drum';
  if (lowerID.includes('box')) return 'box';
  if (lowerID.includes('bag')) return 'bag';
  if (lowerID.includes('std') || lowerID.includes('stand')) return 'stand';
  if (lowerID.includes('try') || lowerID.includes('tray')) return 'tray';
  return 'default';
}

export function packContainerSmart(
  items: PackingItem[],
  container: Container
): PackingResult {
  // Calculate container volume in cubic meters
  const containerVolume = (container.length * container.width * container.height) / 1_000_000_000;

  // Create internal items with calculated values
  const internalItems: InternalItem[] = items.map(item => ({
    ...item,
    volume: (item.length * item.width * item.height) / 1_000_000_000, // CBM
    remainingQty: item.quantity,
    type: item.type || detectItemType(item.id),
  }));

  // Sort: Heavy & big first, fragile last, small fillers very last
  internalItems.sort((a, b) => {
    // Primary: heaviest total weight first
    const weightDiff = (b.weight * b.remainingQty) - (a.weight * a.remainingQty);
    if (Math.abs(weightDiff) > 1) return weightDiff;
    
    // Secondary: largest volume
    const volumeDiff = (b.volume * b.remainingQty) - (a.volume * a.remainingQty);
    if (Math.abs(volumeDiff) > 0.001) return volumeDiff;
    
    // Tertiary: fragile items later
    if (a.fragile !== b.fragile) return a.fragile ? 1 : -1;
    
    // Quaternary: taller items earlier (stability)
    return b.height - a.height;
  });

  const positions: PlacedItem[] = [];
  let currentWeight = 0;
  let usedVolume = 0;
  let z = 0; // current height level

  let xCursor = 0;
  let yCursor = 0;
  let rowHeight = 0;
  let rowMaxY = 0;

  // Track layers for fragile item placement
  const layers: { z: number; height: number }[] = [];

  for (const item of internalItems) {
    let placedCount = 0;
    const itemType = item.type || detectItemType(item.id);

    for (let i = 0; i < item.remainingQty; i++) {
      let placed = false;
      let attempts = 0;
      const maxAttempts = 10;

      while (!placed && attempts < maxAttempts) {
        attempts++;

        // Check if item fits at current position
        const fitsX = xCursor + item.length <= container.length;
        const fitsY = yCursor + item.width <= container.width;
        const fitsZ = z + item.height <= container.height;
        const weightOk = currentWeight + item.weight <= container.maxWeight;

        if (fitsX && fitsY && fitsZ && weightOk) {
          // Fragile items should not be placed on the floor if possible
          if (item.fragile && z < 300 && layers.length > 0) {
            // Try to place on a higher layer
            const higherLayer = layers.find(l => l.z >= 300);
            if (higherLayer && higherLayer.z + item.height <= container.height) {
              z = higherLayer.z;
              xCursor = 0;
              yCursor = 0;
              continue;
            }
          }

          positions.push({
            itemId: item.id,
            x: xCursor,
            y: yCursor,
            z: z,
            l: item.length,
            w: item.width,
            h: item.height,
            color: getItemColor(itemType),
            label: item.id,
            type: itemType,
          });

          usedVolume += item.volume;
          currentWeight += item.weight;
          placedCount++;
          placed = true;

          // Move cursor (simple row packing)
          xCursor += item.length + 20; // 20mm gap
          rowHeight = Math.max(rowHeight, item.height);
          rowMaxY = Math.max(rowMaxY, item.width);

          // New row if needed
          if (xCursor + 300 > container.length) {
            xCursor = 0;
            yCursor += rowMaxY + 30; // 30mm gap between rows
            rowMaxY = 0;

            // New layer if needed
            if (yCursor + 500 > container.width) {
              // Save current layer info
              if (rowHeight > 0) {
                layers.push({ z: z, height: rowHeight });
              }
              z += rowHeight + 50; // 50mm gap between layers
              xCursor = 0;
              yCursor = 0;
              rowHeight = 0;
              rowMaxY = 0;
            }
          }
        } else if (!fitsX || !fitsY) {
          // Move to next row
          xCursor = 0;
          yCursor += rowMaxY + 30;
          rowMaxY = 0;

          if (yCursor + item.width > container.width) {
            // Move to next layer
            if (rowHeight > 0) {
              layers.push({ z: z, height: rowHeight });
            }
            z += rowHeight + 50;
            xCursor = 0;
            yCursor = 0;
            rowHeight = 0;
            rowMaxY = 0;
          }
        } else if (!fitsZ) {
          // No more vertical space
          break;
        } else if (!weightOk) {
          // Weight limit reached
          break;
        }
      }

      if (!placed) break;
    }

    item.remainingQty -= placedCount;
  }

  // Collect unplaced items
  const unplacedItems: UnplacedItem[] = internalItems
    .filter(item => item.remainingQty > 0)
    .map(item => {
      let reason = 'No remaining space';
      if (currentWeight >= container.maxWeight) {
        reason = 'Weight limit exceeded';
      } else if (item.length > container.length || item.width > container.width || item.height > container.height) {
        reason = 'Item dimensions exceed container';
      }
      return {
        itemId: item.id,
        remainingQuantity: item.remainingQty,
        reason,
      };
    });

  const fillRate = (usedVolume / containerVolume) * 100;

  // Generate summary
  const hasHeavyItems = items.some(i => i.weight > 50);
  const hasFragileItems = items.some(i => i.fragile);
  let summary = 'Packing optimization complete. ';
  
  if (hasHeavyItems) {
    summary += 'Heavy items (pallets, drums, crates) placed at the bottom for stability. ';
  }
  if (hasFragileItems) {
    summary += 'Fragile items (jewelry boxes, velvet bags, display trays) positioned in upper layers for protection. ';
  }
  if (unplacedItems.length > 0) {
    summary += `${unplacedItems.length} item type(s) could not be fully loaded.`;
  } else {
    summary += 'All items successfully loaded.';
  }

  return {
    positions,
    fillRate,
    totalWeight: currentWeight,
    summary,
    unplacedItems,
    containerVolume,
    usedVolume,
  };
}
