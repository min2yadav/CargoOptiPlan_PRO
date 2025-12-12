import { Stop, OptimizedRoute, RouteLeg, RouteStep } from '@/types/route';

// Calculate distance between two points using Haversine formula
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Build distance matrix
function buildDistanceMatrix(stops: Stop[]): number[][] {
  const n = stops.length;
  const matrix: number[][] = [];
  
  for (let i = 0; i < n; i++) {
    matrix[i] = [];
    for (let j = 0; j < n; j++) {
      if (i === j) {
        matrix[i][j] = 0;
      } else {
        matrix[i][j] = haversineDistance(
          stops[i].lat, stops[i].lng,
          stops[j].lat, stops[j].lng
        );
      }
    }
  }
  
  return matrix;
}

// Nearest neighbor heuristic for initial solution
function nearestNeighbor(distanceMatrix: number[][], depotIndex: number): number[] {
  const n = distanceMatrix.length;
  const visited = new Set<number>([depotIndex]);
  const route = [depotIndex];
  let current = depotIndex;
  
  while (visited.size < n) {
    let nearestDist = Infinity;
    let nearestIdx = -1;
    
    for (let i = 0; i < n; i++) {
      if (!visited.has(i) && distanceMatrix[current][i] < nearestDist) {
        nearestDist = distanceMatrix[current][i];
        nearestIdx = i;
      }
    }
    
    if (nearestIdx !== -1) {
      route.push(nearestIdx);
      visited.add(nearestIdx);
      current = nearestIdx;
    }
  }
  
  route.push(depotIndex); // Return to depot
  return route;
}

// Calculate total route distance
function calculateRouteDistance(route: number[], distanceMatrix: number[][]): number {
  let total = 0;
  for (let i = 0; i < route.length - 1; i++) {
    total += distanceMatrix[route[i]][route[i + 1]];
  }
  return total;
}

// 2-opt improvement
function twoOpt(route: number[], distanceMatrix: number[][]): number[] {
  const n = route.length;
  let improved = true;
  let bestRoute = [...route];
  let bestDistance = calculateRouteDistance(bestRoute, distanceMatrix);
  
  while (improved) {
    improved = false;
    
    for (let i = 1; i < n - 2; i++) {
      for (let j = i + 1; j < n - 1; j++) {
        // Create new route by reversing segment between i and j
        const newRoute = [
          ...bestRoute.slice(0, i),
          ...bestRoute.slice(i, j + 1).reverse(),
          ...bestRoute.slice(j + 1)
        ];
        
        const newDistance = calculateRouteDistance(newRoute, distanceMatrix);
        
        if (newDistance < bestDistance) {
          bestRoute = newRoute;
          bestDistance = newDistance;
          improved = true;
        }
      }
    }
  }
  
  return bestRoute;
}

// Parse time string (HH:mm) to minutes since midnight
function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// Format minutes since midnight to HH:mm
function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60) % 24;
  const mins = Math.floor(minutes % 60);
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Calculate ETAs and check time window violations
function calculateETAs(
  orderedStops: Stop[],
  legs: RouteLeg[],
  departureTime: string
): { perStopETA: { stopId: string; eta: string; departure: string }[]; violations: { stopId: string; reason: string }[] } {
  const perStopETA: { stopId: string; eta: string; departure: string }[] = [];
  const violations: { stopId: string; reason: string }[] = [];
  
  let currentTime = parseTime(departureTime);
  
  for (let i = 0; i < orderedStops.length; i++) {
    const stop = orderedStops[i];
    
    if (i === 0) {
      // Depot - departure only
      perStopETA.push({
        stopId: stop.id,
        eta: formatTime(currentTime),
        departure: formatTime(currentTime)
      });
    } else {
      // Add travel time from previous stop
      const leg = legs[i - 1];
      currentTime += leg.duration / 60; // Convert seconds to minutes
      
      const eta = formatTime(currentTime);
      
      // Check time window
      if (stop.timeWindowStart && stop.timeWindowEnd) {
        const windowStart = parseTime(stop.timeWindowStart);
        const windowEnd = parseTime(stop.timeWindowEnd);
        
        if (currentTime < windowStart) {
          // Arrived early, wait until window opens
          currentTime = windowStart;
        } else if (currentTime > windowEnd) {
          violations.push({
            stopId: stop.id,
            reason: `Arrival at ${eta} is after time window ends at ${stop.timeWindowEnd}`
          });
        }
      }
      
      const departure = formatTime(currentTime + stop.serviceTime);
      
      perStopETA.push({
        stopId: stop.id,
        eta,
        departure
      });
      
      currentTime += stop.serviceTime;
    }
  }
  
  return { perStopETA, violations };
}

// Fetch route from OSRM
async function fetchOSRMRoute(stops: Stop[]): Promise<{ legs: RouteLeg[]; geometry: [number, number][] }> {
  const coordinates = stops.map(s => `${s.lng},${s.lat}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=true`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error('OSRM routing failed');
    }
    
    const route = data.routes[0];
    const legs: RouteLeg[] = [];
    
    for (let i = 0; i < route.legs.length; i++) {
      const leg = route.legs[i];
      const steps: RouteStep[] = leg.steps.map((step: any) => ({
        instruction: step.maneuver.type + (step.maneuver.modifier ? ` ${step.maneuver.modifier}` : ''),
        distance: step.distance,
        duration: step.duration,
        name: step.name || 'Unnamed road'
      }));
      
      legs.push({
        fromStop: stops[i],
        toStop: stops[i + 1],
        distance: leg.distance,
        duration: leg.duration,
        steps,
        geometry: leg.steps.flatMap((step: any) => 
          step.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]] as [number, number])
        )
      });
    }
    
    const geometry: [number, number][] = route.geometry.coordinates.map(
      (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
    );
    
    return { legs, geometry };
  } catch (error) {
    console.error('OSRM routing error:', error);
    // Fallback to straight-line routes
    return createFallbackRoute(stops);
  }
}

// Create fallback route using straight lines
function createFallbackRoute(stops: Stop[]): { legs: RouteLeg[]; geometry: [number, number][] } {
  const legs: RouteLeg[] = [];
  const geometry: [number, number][] = [];
  
  for (let i = 0; i < stops.length - 1; i++) {
    const from = stops[i];
    const to = stops[i + 1];
    const distance = haversineDistance(from.lat, from.lng, to.lat, to.lng);
    const duration = (distance / 1000) * 60 * 1.5; // Assume 40 km/h average speed
    
    legs.push({
      fromStop: from,
      toStop: to,
      distance,
      duration,
      steps: [{
        instruction: `Drive to ${to.name}`,
        distance,
        duration,
        name: 'Direct route'
      }],
      geometry: [[from.lat, from.lng], [to.lat, to.lng]]
    });
    
    geometry.push([from.lat, from.lng]);
  }
  
  if (stops.length > 0) {
    geometry.push([stops[stops.length - 1].lat, stops[stops.length - 1].lng]);
  }
  
  return { legs, geometry };
}

export async function optimizeRoute(
  stops: Stop[],
  depotId: string,
  departureTime: string = '08:00'
): Promise<OptimizedRoute> {
  if (stops.length < 2) {
    throw new Error('At least 2 stops (including depot) are required');
  }
  
  // Find depot index
  const depotIndex = stops.findIndex(s => s.id === depotId);
  if (depotIndex === -1) {
    throw new Error('Depot not found in stops');
  }
  
  // Build distance matrix
  const distanceMatrix = buildDistanceMatrix(stops);
  
  // Get initial solution using nearest neighbor
  let optimizedIndices = nearestNeighbor(distanceMatrix, depotIndex);
  
  // Improve with 2-opt
  optimizedIndices = twoOpt(optimizedIndices, distanceMatrix);
  
  // Create ordered stops list
  const orderedStops = optimizedIndices.map(i => stops[i]);
  
  // Fetch actual routes from OSRM
  const { legs, geometry } = await fetchOSRMRoute(orderedStops);
  
  // Calculate ETAs and violations
  const { perStopETA, violations } = calculateETAs(orderedStops, legs, departureTime);
  
  // Calculate totals
  const totalDistance = legs.reduce((sum, leg) => sum + leg.distance, 0);
  const totalDuration = legs.reduce((sum, leg) => sum + leg.duration, 0);
  
  return {
    orderedStops,
    legs,
    totalDistance,
    totalDuration,
    perStopETA,
    timeWindowViolations: violations,
    geometry
  };
}

export async function geocodeAddress(query: string): Promise<{ lat: number; lng: number; display_name: string }[]> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'CargoOptPlanner/1.0'
    }
  });
  
  const data = await response.json();
  
  return data.map((item: any) => ({
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
    display_name: item.display_name
  }));
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'CargoOptPlanner/1.0'
    }
  });
  
  const data = await response.json();
  return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}
