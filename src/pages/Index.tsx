import React, { useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { PackingSidebar } from '@/components/PackingSidebar';
import { PackingSummary } from '@/components/PackingSummary';
import { ContainerVisualization } from '@/components/ContainerVisualization';
import { ColorLegend } from '@/components/ColorLegend';
import { Button } from '@/components/ui/button';
import { UserMenu } from '@/components/auth/UserMenu';
import { useAuth } from '@/contexts/AuthContext';
import { packContainerSmart } from '@/lib/packingAlgorithm';
import { 
  Container, 
  PackingItem, 
  PackingResult,
  DEFAULT_CONTAINER,
  SAMPLE_ITEMS 
} from '@/types/packing';
import { Truck, Sparkles, RotateCcw, PanelLeftClose, PanelLeft, Route, HelpCircle, Users, TruckIcon, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

const Index = () => {
  const { user, role } = useAuth();
  const [container, setContainer] = useState<Container>(DEFAULT_CONTAINER);
  const [items, setItems] = useState<PackingItem[]>(SAMPLE_ITEMS);
  const [result, setResult] = useState<PackingResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOptimize = useCallback(() => {
    if (container.length <= 0 || container.width <= 0 || container.height <= 0) {
      toast.error('Container dimensions must be positive values');
      return;
    }

    if (container.maxWeight <= 0) {
      toast.error('Max weight must be a positive value');
      return;
    }

    if (items.length === 0) {
      toast.error('Add at least one item to pack');
      return;
    }

    const invalidItems = items.filter(
      item => item.length <= 0 || item.width <= 0 || item.height <= 0 || item.weight <= 0
    );

    if (invalidItems.length > 0) {
      toast.error('All item dimensions and weights must be positive values');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      try {
        const packingResult = packContainerSmart(items, container);
        setResult(packingResult);
        
        if (packingResult.unplacedItems.length > 0) {
          toast.warning(`Optimization complete. ${packingResult.unplacedItems.length} item type(s) could not be fully placed.`);
        } else {
          toast.success(`Optimization complete! ${packingResult.fillRate.toFixed(1)}% fill rate achieved.`);
        }
      } catch (error) {
        toast.error('An error occurred during optimization');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }, 500);
  }, [container, items]);

  const handleReset = () => {
    setContainer(DEFAULT_CONTAINER);
    setItems(SAMPLE_ITEMS);
    setResult(null);
    toast.info('Reset to default configuration');
  };

  const handleDownloadSample = () => {
    const sampleData = [
      { id: 'ITEM-001', type: 'pallet', length: 1200, width: 800, height: 150, weight: 25, quantity: 2, stackable: true, maxStack: 3, fragile: false },
      { id: 'ITEM-002', type: 'crate', length: 600, width: 400, height: 400, weight: 15, quantity: 4, stackable: true, maxStack: 4, fragile: false },
      { id: 'ITEM-003', type: 'box', length: 400, width: 300, height: 250, weight: 8, quantity: 10, stackable: true, maxStack: 5, fragile: false },
      { id: 'ITEM-004', type: 'bag', length: 300, width: 200, height: 100, weight: 2, quantity: 20, stackable: false, maxStack: 1, fragile: true },
      { id: 'ITEM-005', type: 'drum', length: 600, width: 600, height: 900, weight: 50, quantity: 2, stackable: false, maxStack: 1, fragile: false },
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Items');
    XLSX.writeFile(wb, 'cargo_items_sample.xlsx');
    toast.success('Sample Excel file downloaded');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const parsedItems: PackingItem[] = jsonData.map((row: any, index: number) => ({
          id: String(row.id || `ITEM-${String(index + 1).padStart(3, '0')}`),
          type: row.type || 'box',
          length: Number(row.length) || 500,
          width: Number(row.width) || 400,
          height: Number(row.height) || 300,
          weight: Number(row.weight) || 10,
          quantity: Number(row.quantity) || 1,
          stackable: row.stackable === true || row.stackable === 'true' || row.stackable === 1,
          maxStack: Number(row.maxStack) || 5,
          fragile: row.fragile === true || row.fragile === 'true' || row.fragile === 1,
        }));

        setItems(parsedItems);
        setResult(null);
        toast.success(`Loaded ${parsedItems.length} items from Excel`);
      } catch (error) {
        toast.error('Failed to parse Excel file. Please check the format.');
        console.error(error);
      }
    };
    reader.readAsArrayBuffer(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50 shrink-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="shrink-0"
            >
              {sidebarOpen ? (
                <PanelLeftClose className="w-5 h-5" />
              ) : (
                <PanelLeft className="w-5 h-5" />
              )}
            </Button>
            <div className="p-2 rounded-xl bg-primary/10">
              <Truck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">CargoOpt & Planner</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">3D Container Packing Optimizer</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Link to="/route-planner">
              <Button variant="outline" size="sm">
                <Route className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">Route Planner</span>
              </Button>
            </Link>
            {role === 'driver' && (
              <Link to="/driver">
                <Button variant="outline" size="sm">
                  <TruckIcon className="w-4 h-4 sm:mr-1" />
                  <span className="hidden sm:inline">Driver</span>
                </Button>
              </Link>
            )}
            {role === 'admin' && (
              <Link to="/admin/users">
                <Button variant="outline" size="sm">
                  <Users className="w-4 h-4 sm:mr-1" />
                  <span className="hidden sm:inline">Admin</span>
                </Button>
              </Link>
            )}
            <Link to="/help">
              <Button variant="outline" size="sm">
                <HelpCircle className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">Help</span>
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
            <Button 
              variant="glow" 
              size="default" 
              onClick={handleOptimize}
              disabled={isLoading}
            >
              <Sparkles className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Optimize Packing</span>
              <span className="sm:hidden">Optimize</span>
            </Button>
            {user ? (
              <UserMenu />
            ) : (
              <Link to="/login">
                <Button variant="outline" size="sm">
                  <LogIn className="w-4 h-4 sm:mr-1" />
                  <span className="hidden sm:inline">Login</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside 
          className={`border-r border-border bg-card shrink-0 transition-all duration-300 overflow-hidden ${
            sidebarOpen ? 'w-80 lg:w-96' : 'w-0'
          }`}
        >
          <PackingSidebar
            container={container}
            onContainerChange={setContainer}
            items={items}
            onItemsChange={setItems}
            onDownloadSample={handleDownloadSample}
            onUploadClick={() => fileInputRef.current?.click()}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
          />
        </aside>

        {/* Main Visualization Area */}
        <main className="flex-1 flex flex-col overflow-hidden p-4 gap-4">
          {/* Summary Section */}
          <PackingSummary 
            result={result} 
            items={items} 
            container={container}
            isLoading={isLoading} 
          />

          {/* 3D Visualization */}
          <div className="flex-1 glass-panel p-4 flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-foreground">3D Visualization</h3>
              <p className="text-xs text-muted-foreground">
                Drag to rotate • Scroll to zoom
              </p>
            </div>
            <div className="flex-1 relative">
              {result && result.positions.length > 0 ? (
                <ContainerVisualization 
                  container={container} 
                  placedItems={result.positions} 
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Truck className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="text-sm">Run optimization to see 3D packing visualization</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Color Legend */}
          {result && result.positions.length > 0 && <ColorLegend />}
          
          {/* Footer */}
          <footer className="text-center text-xs text-muted-foreground py-2">
            <p>CargoOpt & Planner</p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Index;
