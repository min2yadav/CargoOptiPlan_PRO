import React from 'react';
import { Stop } from '@/types/route';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, MapPin, Clock, Flag } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface StopsListProps {
  stops: Stop[];
  selectedDepotId: string | null;
  onRemoveStop: (id: string) => void;
  onSetDepot: (id: string) => void;
  onUpdateStop: (id: string, updates: Partial<Stop>) => void;
}

export const StopsList: React.FC<StopsListProps> = ({
  stops,
  selectedDepotId,
  onRemoveStop,
  onSetDepot,
  onUpdateStop
}) => {
  if (stops.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No stops added yet</p>
        <p className="text-xs mt-1">Search or click on the map to add stops</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-3 pr-4">
        {stops.map((stop, index) => (
          <div 
            key={stop.id}
            className={`p-3 rounded-lg border transition-colors ${
              stop.id === selectedDepotId 
                ? 'border-success bg-success/5' 
                : 'border-border bg-card hover:bg-muted/50'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  stop.id === selectedDepotId 
                    ? 'bg-success text-success-foreground' 
                    : 'bg-primary text-primary-foreground'
                }`}>
                  {stop.id === selectedDepotId ? 'D' : index + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{stop.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{stop.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant={stop.id === selectedDepotId ? "secondary" : "outline"}
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onSetDepot(stop.id)}
                  title="Set as depot"
                >
                  <Flag className={`w-3 h-3 ${stop.id === selectedDepotId ? 'text-success' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => onRemoveStop(stop.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground">Service (min)</Label>
                <Input
                  type="number"
                  value={stop.serviceTime}
                  onChange={(e) => onUpdateStop(stop.id, { serviceTime: parseInt(e.target.value) || 0 })}
                  className="h-7 text-xs"
                  min={0}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Window Start</Label>
                <Input
                  type="time"
                  value={stop.timeWindowStart || ''}
                  onChange={(e) => onUpdateStop(stop.id, { timeWindowStart: e.target.value || undefined })}
                  className="h-7 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Window End</Label>
                <Input
                  type="time"
                  value={stop.timeWindowEnd || ''}
                  onChange={(e) => onUpdateStop(stop.id, { timeWindowEnd: e.target.value || undefined })}
                  className="h-7 text-xs"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
