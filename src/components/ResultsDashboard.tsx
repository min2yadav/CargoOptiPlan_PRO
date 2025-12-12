import React from 'react';
import { PackingResult } from '@/types/packing';
import { 
  Package, 
  Scale, 
  BarChart3, 
  AlertTriangle,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface ResultsDashboardProps {
  result: PackingResult | null;
  isLoading: boolean;
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  unit, 
  variant = 'default' 
}: { 
  icon: React.ElementType;
  label: string; 
  value: string | number; 
  unit?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
}) {
  const colorMap = {
    default: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-destructive',
  };

  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className={`text-2xl font-bold font-mono ${colorMap[variant]}`}>
            {value}
            {unit && <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>}
          </p>
        </div>
        <div className={`p-2 rounded-lg bg-secondary ${colorMap[variant]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

export function ResultsDashboard({ result, isLoading }: ResultsDashboardProps) {
  if (isLoading) {
    return (
      <div className="glass-panel p-8 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-muted-foreground">Optimizing container packing...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="glass-panel p-8 text-center">
        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <p className="text-muted-foreground">
          Configure your container and items, then click "Optimize Packing" to see results.
        </p>
      </div>
    );
  }

  const fillRateVariant = result.fillRate >= 70 ? 'success' : result.fillRate >= 40 ? 'warning' : 'error';
  const totalItems = result.positions.length;
  const unplacedCount = result.unplacedItems.reduce((sum, item) => sum + item.remainingQuantity, 0);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={BarChart3}
          label="Fill Rate"
          value={result.fillRate.toFixed(1)}
          unit="%"
          variant={fillRateVariant}
        />
        <StatCard
          icon={Scale}
          label="Total Weight"
          value={result.totalWeight.toLocaleString()}
          unit="kg"
        />
        <StatCard
          icon={CheckCircle2}
          label="Items Placed"
          value={totalItems}
          variant="success"
        />
        <StatCard
          icon={unplacedCount > 0 ? XCircle : CheckCircle2}
          label="Unplaced"
          value={unplacedCount}
          variant={unplacedCount > 0 ? 'error' : 'success'}
        />
      </div>

      {/* Summary */}
      <div className="glass-panel p-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">Packing Summary</h3>
        <p className="text-foreground">{result.summary}</p>
        <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
          <span>Container: {(result.containerVolume).toFixed(2)} m³</span>
          <span>Used: {(result.usedVolume).toFixed(2)} m³</span>
        </div>
      </div>

      {/* Unplaced Items */}
      {result.unplacedItems.length > 0 && (
        <div className="glass-panel p-6 border-warning/30">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <h3 className="font-medium text-warning">Unplaced Items</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Item ID</th>
                  <th className="pb-2 font-medium">Remaining Qty</th>
                  <th className="pb-2 font-medium">Reason</th>
                </tr>
              </thead>
              <tbody>
                {result.unplacedItems.map((item, index) => (
                  <tr key={index} className="border-b border-border/30">
                    <td className="py-2 font-mono text-foreground">{item.itemId}</td>
                    <td className="py-2 text-warning">{item.remainingQuantity}</td>
                    <td className="py-2 text-muted-foreground">{item.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
