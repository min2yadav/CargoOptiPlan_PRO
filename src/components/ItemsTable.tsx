import React from 'react';
import { PackingItem, ItemType } from '@/types/packing';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Package } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ItemsTableProps {
  items: PackingItem[];
  onChange: (items: PackingItem[]) => void;
}

const ITEM_TYPES: { value: ItemType; label: string }[] = [
  { value: 'pallet', label: 'Pallet' },
  { value: 'crate', label: 'Crate' },
  { value: 'drum', label: 'Drum' },
  { value: 'box', label: 'Box' },
  { value: 'bag', label: 'Bag' },
  { value: 'stand', label: 'Stand' },
  { value: 'tray', label: 'Tray' },
  { value: 'default', label: 'Other' },
];

export function ItemsTable({ items, onChange }: ItemsTableProps) {
  const addItem = () => {
    const newItem: PackingItem = {
      id: `ITEM-${String(items.length + 1).padStart(3, '0')}`,
      length: 500,
      width: 400,
      height: 300,
      weight: 10,
      quantity: 1,
      stackable: true,
      maxStack: 5,
      fragile: false,
      type: 'box',
    };
    onChange([...items, newItem]);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof PackingItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="glass-panel p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Items to Pack</h2>
          <span className="text-sm text-muted-foreground">({items.length} items)</span>
        </div>
        <Button onClick={addItem} variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Add Item
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="pb-3 pr-2 font-medium">ID</th>
              <th className="pb-3 pr-2 font-medium">Type</th>
              <th className="pb-3 pr-2 font-medium">L (mm)</th>
              <th className="pb-3 pr-2 font-medium">W (mm)</th>
              <th className="pb-3 pr-2 font-medium">H (mm)</th>
              <th className="pb-3 pr-2 font-medium">Weight (kg)</th>
              <th className="pb-3 pr-2 font-medium">Qty</th>
              <th className="pb-3 pr-2 font-medium text-center">Stack</th>
              <th className="pb-3 pr-2 font-medium">Max</th>
              <th className="pb-3 pr-2 font-medium text-center">Fragile</th>
              <th className="pb-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="table-row">
                <td className="py-3 pr-2">
                  <Input
                    value={item.id}
                    onChange={(e) => updateItem(index, 'id', e.target.value)}
                    className="w-24 h-8 text-xs"
                  />
                </td>
                <td className="py-3 pr-2">
                  <Select
                    value={item.type || 'box'}
                    onValueChange={(value) => updateItem(index, 'type', value as ItemType)}
                  >
                    <SelectTrigger className="w-20 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ITEM_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="py-3 pr-2">
                  <Input
                    type="number"
                    value={item.length}
                    onChange={(e) => updateItem(index, 'length', parseFloat(e.target.value) || 0)}
                    className="w-20 h-8 text-xs"
                  />
                </td>
                <td className="py-3 pr-2">
                  <Input
                    type="number"
                    value={item.width}
                    onChange={(e) => updateItem(index, 'width', parseFloat(e.target.value) || 0)}
                    className="w-20 h-8 text-xs"
                  />
                </td>
                <td className="py-3 pr-2">
                  <Input
                    type="number"
                    value={item.height}
                    onChange={(e) => updateItem(index, 'height', parseFloat(e.target.value) || 0)}
                    className="w-20 h-8 text-xs"
                  />
                </td>
                <td className="py-3 pr-2">
                  <Input
                    type="number"
                    value={item.weight}
                    onChange={(e) => updateItem(index, 'weight', parseFloat(e.target.value) || 0)}
                    className="w-16 h-8 text-xs"
                  />
                </td>
                <td className="py-3 pr-2">
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    className="w-14 h-8 text-xs"
                    min={1}
                  />
                </td>
                <td className="py-3 pr-2 text-center">
                  <Checkbox
                    checked={item.stackable}
                    onCheckedChange={(checked) => updateItem(index, 'stackable', checked)}
                  />
                </td>
                <td className="py-3 pr-2">
                  <Input
                    type="number"
                    value={item.maxStack}
                    onChange={(e) => updateItem(index, 'maxStack', parseInt(e.target.value) || 1)}
                    className="w-14 h-8 text-xs"
                    min={1}
                    disabled={!item.stackable}
                  />
                </td>
                <td className="py-3 pr-2 text-center">
                  <Checkbox
                    checked={item.fragile}
                    onCheckedChange={(checked) => updateItem(index, 'fragile', checked)}
                  />
                </td>
                <td className="py-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {items.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No items added. Click "Add Item" to start.
        </div>
      )}
    </div>
  );
}
