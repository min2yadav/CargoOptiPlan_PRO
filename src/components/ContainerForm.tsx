import React from 'react';
import { Container } from '@/types/packing';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Box } from 'lucide-react';

interface ContainerFormProps {
  container: Container;
  onChange: (container: Container) => void;
}

export function ContainerForm({ container, onChange }: ContainerFormProps) {
  const handleChange = (field: keyof Container, value: string) => {
    const numValue = parseFloat(value) || 0;
    onChange({ ...container, [field]: numValue });
  };

  return (
    <div className="glass-panel p-6 space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <Box className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Container Dimensions</h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="length" className="text-muted-foreground text-sm">
            Length (mm)
          </Label>
          <Input
            id="length"
            type="number"
            value={container.length}
            onChange={(e) => handleChange('length', e.target.value)}
            placeholder="5898"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="width" className="text-muted-foreground text-sm">
            Width (mm)
          </Label>
          <Input
            id="width"
            type="number"
            value={container.width}
            onChange={(e) => handleChange('width', e.target.value)}
            placeholder="2352"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="height" className="text-muted-foreground text-sm">
            Height (mm)
          </Label>
          <Input
            id="height"
            type="number"
            value={container.height}
            onChange={(e) => handleChange('height', e.target.value)}
            placeholder="2393"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxWeight" className="text-muted-foreground text-sm">
            Max Weight (kg)
          </Label>
          <Input
            id="maxWeight"
            type="number"
            value={container.maxWeight}
            onChange={(e) => handleChange('maxWeight', e.target.value)}
            placeholder="28000"
          />
        </div>
      </div>

      <div className="pt-2 text-xs text-muted-foreground">
        Default: 20ft Standard Container (5898 × 2352 × 2393 mm, 28,000 kg max)
      </div>
    </div>
  );
}
