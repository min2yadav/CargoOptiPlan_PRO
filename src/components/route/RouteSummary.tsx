import React from 'react';
import { OptimizedRoute } from '@/types/route';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Route, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  Download,
  Navigation
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface RouteSummaryProps {
  route: OptimizedRoute | null;
  isOptimizing: boolean;
}

export const RouteSummary: React.FC<RouteSummaryProps> = ({ route, isOptimizing }) => {
  const formatDistance = (meters: number): string => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} min`;
  };

  const handleDownloadReport = () => {
    if (!route) return;

    // Summary sheet
    const summaryData = [
      { Metric: 'Total Distance', Value: formatDistance(route.totalDistance) },
      { Metric: 'Total Duration', Value: formatDuration(route.totalDuration) },
      { Metric: 'Number of Stops', Value: route.orderedStops.length - 1 }, // Exclude return to depot
      { Metric: 'Time Window Violations', Value: route.timeWindowViolations.length }
    ];

    // Route order sheet
    const routeData = route.orderedStops.map((stop, index) => {
      const eta = route.perStopETA.find(e => e.stopId === stop.id);
      const leg = index > 0 ? route.legs[index - 1] : null;
      return {
        Order: index,
        Name: stop.name,
        Address: stop.address,
        ETA: eta?.eta || '-',
        Departure: eta?.departure || '-',
        'Service Time (min)': stop.serviceTime,
        'Time Window': stop.timeWindowStart ? `${stop.timeWindowStart} - ${stop.timeWindowEnd}` : '-',
        'Leg Distance': leg ? formatDistance(leg.distance) : '-',
        'Leg Duration': leg ? formatDuration(leg.duration) : '-'
      };
    });

    // Turn by turn sheet
    const turnByTurnData = route.legs.flatMap((leg, legIndex) => 
      leg.steps.map((step, stepIndex) => ({
        Leg: legIndex + 1,
        Step: stepIndex + 1,
        From: leg.fromStop.name,
        To: leg.toStop.name,
        Instruction: step.instruction,
        Road: step.name,
        Distance: formatDistance(step.distance),
        Duration: formatDuration(step.duration)
      }))
    );

    // Violations sheet
    const violationsData = route.timeWindowViolations.map(v => {
      const stop = route.orderedStops.find(s => s.id === v.stopId);
      return {
        Stop: stop?.name || v.stopId,
        Reason: v.reason
      };
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryData), 'Summary');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(routeData), 'Route Order');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(turnByTurnData), 'Turn by Turn');
    if (violationsData.length > 0) {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(violationsData), 'Violations');
    }

    XLSX.writeFile(wb, 'route_report.xlsx');
  };

  if (!route) {
    return (
      <div className="glass-panel p-4 h-full flex flex-col items-center justify-center text-muted-foreground">
        <Route className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-sm">Add stops and optimize to see route summary</p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Navigation className="w-4 h-4 text-primary" />
          Route Summary
        </h3>
        <Button variant="outline" size="sm" onClick={handleDownloadReport}>
          <Download className="w-4 h-4 mr-1" />
          Export
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="stat-card p-3">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Route className="w-4 h-4" />
            <span className="text-xs">Total Distance</span>
          </div>
          <p className="text-lg font-bold text-foreground">{formatDistance(route.totalDistance)}</p>
        </div>
        <div className="stat-card p-3">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs">Total Duration</span>
          </div>
          <p className="text-lg font-bold text-foreground">{formatDuration(route.totalDuration)}</p>
        </div>
      </div>

      {/* Violations */}
      {route.timeWindowViolations.length > 0 && (
        <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 text-warning mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">{route.timeWindowViolations.length} Time Window Violation(s)</span>
          </div>
          {route.timeWindowViolations.map((v, i) => {
            const stop = route.orderedStops.find(s => s.id === v.stopId);
            return (
              <p key={i} className="text-xs text-muted-foreground">
                • {stop?.name}: {v.reason}
              </p>
            );
          })}
        </div>
      )}

      {/* Route Order */}
      <h4 className="text-sm font-medium text-foreground mb-2">Route Order</h4>
      <ScrollArea className="flex-1">
        <div className="space-y-2 pr-4">
          {route.orderedStops.map((stop, index) => {
            const isLast = index === route.orderedStops.length - 1;
            if (isLast && stop.id === route.orderedStops[0].id) {
              return (
                <div key={`${stop.id}-return`} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center">
                    <MapPin className="w-3 h-3 text-success" />
                  </div>
                  <span>Return to Depot</span>
                </div>
              );
            }

            const eta = route.perStopETA.find(e => e.stopId === stop.id);
            const leg = index > 0 ? route.legs[index - 1] : null;

            return (
              <div key={stop.id} className="border-l-2 border-primary/30 pl-3 py-1">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    stop.isDepot || index === 0 
                      ? 'bg-success text-success-foreground' 
                      : 'bg-primary text-primary-foreground'
                  }`}>
                    {index}
                  </span>
                  <span className="font-medium text-sm">{stop.name}</span>
                </div>
                <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                  {eta && <span>ETA: {eta.eta}</span>}
                  {eta && <span>Depart: {eta.departure}</span>}
                  {leg && <span>{formatDistance(leg.distance)}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
