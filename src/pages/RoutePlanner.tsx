import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RouteMap } from '@/components/route/RouteMap';
import { StopsList } from '@/components/route/StopsList';
import { AddressSearch } from '@/components/route/AddressSearch';
import { RouteSummary } from '@/components/route/RouteSummary';
import { Stop, OptimizedRoute } from '@/types/route';
import { optimizeRoute, reverseGeocode } from '@/lib/routeOptimization';
import { 
  Truck, 
  Route, 
  Sparkles, 
  RotateCcw, 
  PanelLeftClose, 
  PanelLeft,
  Package,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

const RoutePlanner = () => {
  const [stops, setStops] = useState<Stop[]>([]);
  const [selectedDepotId, setSelectedDepotId] = useState<string | null>(null);
  const [optimizedRoute, setOptimizedRoute] = useState<OptimizedRoute | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [departureTime, setDepartureTime] = useState('08:00');

  const handleAddStop = useCallback(async (lat: number, lng: number, displayName?: string) => {
    const address = displayName || await reverseGeocode(lat, lng);
    const newStop: Stop = {
      id: `stop-${Date.now()}`,
      name: address.split(',')[0],
      address,
      lat,
      lng,
      serviceTime: 15,
    };

    setStops(prev => {
      const updated = [...prev, newStop];
      // Auto-set first stop as depot
      if (updated.length === 1) {
        setSelectedDepotId(newStop.id);
      }
      return updated;
    });
    
    setOptimizedRoute(null);
    toast.success('Stop added');
  }, []);

  const handleRemoveStop = useCallback((id: string) => {
    setStops(prev => prev.filter(s => s.id !== id));
    if (selectedDepotId === id) {
      setSelectedDepotId(null);
    }
    setOptimizedRoute(null);
  }, [selectedDepotId]);

  const handleSetDepot = useCallback((id: string) => {
    setSelectedDepotId(id);
    setOptimizedRoute(null);
    toast.success('Depot set');
  }, []);

  const handleUpdateStop = useCallback((id: string, updates: Partial<Stop>) => {
    setStops(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    setOptimizedRoute(null);
  }, []);

  const handleOptimize = useCallback(async () => {
    if (stops.length < 2) {
      toast.error('Add at least 2 stops to optimize');
      return;
    }

    if (!selectedDepotId) {
      toast.error('Please select a depot (starting point)');
      return;
    }

    setIsOptimizing(true);
    try {
      const result = await optimizeRoute(stops, selectedDepotId, departureTime);
      setOptimizedRoute(result);
      
      if (result.timeWindowViolations.length > 0) {
        toast.warning(`Route optimized with ${result.timeWindowViolations.length} time window violation(s)`);
      } else {
        toast.success('Route optimized successfully!');
      }
    } catch (error) {
      console.error('Optimization error:', error);
      toast.error('Failed to optimize route');
    } finally {
      setIsOptimizing(false);
    }
  }, [stops, selectedDepotId, departureTime]);

  const handleReset = () => {
    setStops([]);
    setSelectedDepotId(null);
    setOptimizedRoute(null);
    toast.info('Route cleared');
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
              <Route className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">CargoOpt & Planner</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Route Optimization</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="outline" size="sm">
                <Package className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">Packing</span>
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.open('https://hackathon-gemba.streamlit.app/Vehicle_Routing', '_blank')}
            >
              <Clock className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Scheduler</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
            <Button 
              variant="glow" 
              size="default" 
              onClick={handleOptimize}
              disabled={isOptimizing || stops.length < 2}
            >
              <Sparkles className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Optimize Route</span>
              <span className="sm:hidden">Optimize</span>
            </Button>
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
          <div className="h-full overflow-y-auto p-4 space-y-4">
            {/* Departure Time */}
            <Collapsible defaultOpen>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">Departure Settings</span>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3 space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Departure Time</Label>
                  <Input
                    type="time"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Address Search */}
            <Collapsible defaultOpen>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <div className="flex items-center gap-2">
                  <Route className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">Add Stops</span>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3">
                <AddressSearch onSelectAddress={handleAddStop} />
                <p className="text-xs text-muted-foreground mt-2">
                  Or click on the map to add a stop
                </p>
              </CollapsibleContent>
            </Collapsible>

            {/* Stops List */}
            <Collapsible defaultOpen>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">Stops ({stops.length})</span>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3">
                <StopsList
                  stops={stops}
                  selectedDepotId={selectedDepotId}
                  onRemoveStop={handleRemoveStop}
                  onSetDepot={handleSetDepot}
                  onUpdateStop={handleUpdateStop}
                />
              </CollapsibleContent>
            </Collapsible>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden p-4 gap-4">
          {/* Map */}
          <div className="flex-1 glass-panel p-4 flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-foreground">Route Map</h3>
              <p className="text-xs text-muted-foreground">
                Click to add stops • Drag to pan
              </p>
            </div>
            <div className="flex-1 relative rounded-lg overflow-hidden">
              <RouteMap
                stops={stops}
                optimizedRoute={optimizedRoute}
                onMapClick={handleAddStop}
                selectedDepotId={selectedDepotId}
              />
            </div>
          </div>

          {/* Route Summary */}
          <div className="lg:w-80 shrink-0">
            <RouteSummary route={optimizedRoute} isOptimizing={isOptimizing} />
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-muted-foreground py-2 border-t border-border">
        <p>CargoOpt & Planner — Created by Min2 Yadav</p>
      </footer>
    </div>
  );
};

export default RoutePlanner;
