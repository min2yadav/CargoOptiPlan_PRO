import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Stop, OptimizedRoute } from '@/types/route';

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface RouteMapProps {
  stops: Stop[];
  optimizedRoute: OptimizedRoute | null;
  onMapClick: (lat: number, lng: number) => void;
  selectedDepotId: string | null;
}

const depotIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="background: hsl(142, 71%, 45%); width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">D</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const stopIcon = (index: number) => L.divIcon({
  className: 'custom-marker',
  html: `<div style="background: hsl(220, 80%, 50%); width: 28px; height: 28px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">${index}</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

export const RouteMap: React.FC<RouteMapProps> = ({
  stops,
  optimizedRoute,
  onMapClick,
  selectedDepotId
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const routeLineRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = L.map(containerRef.current).setView([20.5937, 78.9629], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapRef.current);

    mapRef.current.on('click', (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers when stops change
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add markers for each stop
    stops.forEach((stop, index) => {
      const isDepot = stop.id === selectedDepotId;
      const marker = L.marker([stop.lat, stop.lng], {
        icon: isDepot ? depotIcon : stopIcon(index + 1)
      }).addTo(mapRef.current!);

      marker.bindPopup(`
        <div style="min-width: 150px;">
          <strong>${stop.name}</strong><br/>
          <small>${stop.address}</small><br/>
          <small>Service: ${stop.serviceTime} min</small>
          ${stop.timeWindowStart ? `<br/><small>Window: ${stop.timeWindowStart} - ${stop.timeWindowEnd}</small>` : ''}
          ${isDepot ? '<br/><span style="color: green; font-weight: bold;">DEPOT</span>' : ''}
        </div>
      `);

      markersRef.current.push(marker);
    });

    // Fit bounds if there are stops
    if (stops.length > 0) {
      const bounds = L.latLngBounds(stops.map(s => [s.lat, s.lng]));
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [stops, selectedDepotId]);

  // Draw route when optimized
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing route
    if (routeLineRef.current) {
      routeLineRef.current.remove();
      routeLineRef.current = null;
    }

    if (optimizedRoute && optimizedRoute.geometry.length > 0) {
      routeLineRef.current = L.polyline(optimizedRoute.geometry, {
        color: 'hsl(220, 80%, 50%)',
        weight: 4,
        opacity: 0.8
      }).addTo(mapRef.current);

      // Update markers with route order
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      optimizedRoute.orderedStops.forEach((stop, index) => {
        const isDepot = stop.id === selectedDepotId;
        const isLast = index === optimizedRoute.orderedStops.length - 1;
        
        // Skip the last stop if it's the same as first (return to depot)
        if (isLast && stop.id === optimizedRoute.orderedStops[0].id) return;

        const marker = L.marker([stop.lat, stop.lng], {
          icon: isDepot ? depotIcon : stopIcon(index)
        }).addTo(mapRef.current!);

        const eta = optimizedRoute.perStopETA.find(e => e.stopId === stop.id);
        
        marker.bindPopup(`
          <div style="min-width: 150px;">
            <strong>#${index} - ${stop.name}</strong><br/>
            <small>${stop.address}</small><br/>
            ${eta ? `<small>ETA: ${eta.eta} | Depart: ${eta.departure}</small>` : ''}
            ${isDepot ? '<br/><span style="color: green; font-weight: bold;">DEPOT</span>' : ''}
          </div>
        `);

        markersRef.current.push(marker);
      });
    }
  }, [optimizedRoute, selectedDepotId]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full rounded-lg"
      style={{ minHeight: '400px' }}
    />
  );
};
