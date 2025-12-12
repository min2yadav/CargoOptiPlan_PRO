import React from 'react';
import { PackingResult, PackingItem, Container } from '@/types/packing';
import { Button } from '@/components/ui/button';
import { Download, Package, Weight, Box, AlertTriangle, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

interface PackingSummaryProps {
  result: PackingResult | null;
  items: PackingItem[];
  container: Container;
  isLoading: boolean;
}

export function PackingSummary({ result, items, container, isLoading }: PackingSummaryProps) {
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalWeight = items.reduce((sum, i) => sum + i.weight * i.quantity, 0);
  const totalVolume = items.reduce((sum, i) => sum + (i.length * i.width * i.height * i.quantity), 0);
  const containerVolume = container.length * container.width * container.height;
  const theoreticalFillRate = Math.min((totalVolume / containerVolume) * 100, 100);

  const handleDownloadReport = () => {
    if (!result) return;

    // Summary sheet data
    const summaryData = [
      { Metric: 'Container Length (mm)', Value: container.length },
      { Metric: 'Container Width (mm)', Value: container.width },
      { Metric: 'Container Height (mm)', Value: container.height },
      { Metric: 'Container Max Weight (kg)', Value: container.maxWeight },
      { Metric: 'Container Volume (m³)', Value: (containerVolume / 1e9).toFixed(3) },
      { Metric: '', Value: '' },
      { Metric: 'Total Items Packed', Value: result.positions.length },
      { Metric: 'Fill Rate (%)', Value: result.fillRate.toFixed(2) },
      { Metric: 'Total Weight Used (kg)', Value: result.totalWeight.toFixed(2) },
      { Metric: 'Used Volume (m³)', Value: (result.usedVolume / 1e9).toFixed(3) },
    ];

    // Original items sheet data (items to pack with their details)
    const itemsData = items.map((item) => ({
      'Item ID': item.id,
      'Type': item.type || 'default',
      'Length (mm)': item.length,
      'Width (mm)': item.width,
      'Height (mm)': item.height,
      'Weight (kg)': item.weight,
      'Quantity': item.quantity,
      'Stackable': item.stackable ? 'Yes' : 'No',
      'Max Stack': item.maxStack,
      'Fragile': item.fragile ? 'Yes' : 'No',
      'Volume per Unit (m³)': ((item.length * item.width * item.height) / 1e9).toFixed(6),
      'Total Volume (m³)': ((item.length * item.width * item.height * item.quantity) / 1e9).toFixed(6),
      'Total Weight (kg)': (item.weight * item.quantity).toFixed(2),
    }));

    // Placed items sheet data
    const placedData = result.positions.map((pos, idx) => ({
      Index: idx + 1,
      ItemID: pos.itemId,
      Type: pos.type,
      Label: pos.label,
      'X (mm)': pos.x,
      'Y (mm)': pos.y,
      'Z (mm)': pos.z,
      'Length (mm)': pos.l,
      'Width (mm)': pos.w,
      'Height (mm)': pos.h,
      'Volume (m³)': ((pos.l * pos.w * pos.h) / 1e9).toFixed(6),
    }));

    // Unplaced items sheet data
    const unplacedData = result.unplacedItems.map((item) => {
      const originalItem = items.find(i => i.id === item.itemId);
      return {
        ItemID: item.itemId,
        Type: originalItem?.type || 'default',
        'Length (mm)': originalItem?.length || 0,
        'Width (mm)': originalItem?.width || 0,
        'Height (mm)': originalItem?.height || 0,
        'Weight (kg)': originalItem?.weight || 0,
        'Remaining Quantity': item.remainingQuantity,
        Reason: item.reason,
      };
    });

    const wb = XLSX.utils.book_new();
    
    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

    const itemsWs = XLSX.utils.json_to_sheet(itemsData);
    XLSX.utils.book_append_sheet(wb, itemsWs, 'Items to Pack');
    
    const placedWs = XLSX.utils.json_to_sheet(placedData);
    XLSX.utils.book_append_sheet(wb, placedWs, 'Placed Items');
    
    if (unplacedData.length > 0) {
      const unplacedWs = XLSX.utils.json_to_sheet(unplacedData);
      XLSX.utils.book_append_sheet(wb, unplacedWs, 'Unplaced Items');
    }

    XLSX.writeFile(wb, 'packing_report.xlsx');
  };

  return (
    <div className="glass-panel p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Packing Summary</h3>
        {result && (
          <Button variant="outline" size="sm" onClick={handleDownloadReport}>
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : result ? (
        <div className="space-y-4">
          {/* Main Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <Package className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-xs text-muted-foreground">Items Packed</p>
              <p className="text-lg font-bold text-foreground">{result.positions.length}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <Box className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-xs text-muted-foreground">Fill Rate</p>
              <p className="text-lg font-bold text-foreground">{result.fillRate.toFixed(1)}%</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <Weight className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-xs text-muted-foreground">Weight Used</p>
              <p className="text-lg font-bold text-foreground">{result.totalWeight.toFixed(0)} kg</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              {result.unplacedItems.length > 0 ? (
                <AlertTriangle className="w-5 h-5 mx-auto mb-1 text-warning" />
              ) : (
                <CheckCircle className="w-5 h-5 mx-auto mb-1 text-success" />
              )}
              <p className="text-xs text-muted-foreground">Unplaced</p>
              <p className="text-lg font-bold text-foreground">{result.unplacedItems.length}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Volume Utilization</span>
              <span>{result.fillRate.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${Math.min(result.fillRate, 100)}%` }}
              />
            </div>
          </div>

          {/* Weight Progress */}
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Weight Capacity</span>
              <span>{((result.totalWeight / container.maxWeight) * 100).toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-secondary transition-all duration-500"
                style={{ width: `${Math.min((result.totalWeight / container.maxWeight) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Unplaced Items Warning */}
          {result.unplacedItems.length > 0 && (
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
              <p className="text-xs font-medium text-warning mb-2">
                {result.unplacedItems.length} item type(s) could not be fully placed:
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                {result.unplacedItems.slice(0, 3).map((item, idx) => (
                  <li key={idx}>• {item.itemId}: {item.remainingQuantity} remaining - {item.reason}</li>
                ))}
                {result.unplacedItems.length > 3 && (
                  <li>...and {result.unplacedItems.length - 3} more</li>
                )}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Pre-optimization stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <Package className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Total Items</p>
              <p className="text-lg font-bold text-foreground">{totalItems}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <Weight className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Total Weight</p>
              <p className="text-lg font-bold text-foreground">{totalWeight.toFixed(0)} kg</p>
            </div>
          </div>

          <div className="text-center py-4 text-muted-foreground text-sm">
            Click "Optimize Packing" to generate results
          </div>
        </div>
      )}
    </div>
  );
}
