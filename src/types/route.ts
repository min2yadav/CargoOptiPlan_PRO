export interface Stop {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  serviceTime: number; // in minutes
  timeWindowStart?: string; // HH:mm format
  timeWindowEnd?: string; // HH:mm format
  isDepot?: boolean;
}

export interface RouteStep {
  instruction: string;
  distance: number; // meters
  duration: number; // seconds
  name: string;
}

export interface RouteLeg {
  fromStop: Stop;
  toStop: Stop;
  distance: number; // meters
  duration: number; // seconds
  steps: RouteStep[];
  geometry: [number, number][];
}

export interface OptimizedRoute {
  orderedStops: Stop[];
  legs: RouteLeg[];
  totalDistance: number; // meters
  totalDuration: number; // seconds
  perStopETA: { stopId: string; eta: string; departure: string }[];
  timeWindowViolations: { stopId: string; reason: string }[];
  geometry: [number, number][];
}

export interface GeocodingResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    road?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}
