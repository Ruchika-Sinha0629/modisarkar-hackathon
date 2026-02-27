import type { HeatmapColor } from '../constants/thresholds';

export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface GeoPolygon {
  type: 'Polygon';
  coordinates: [number, number][][]; // GeoJSON format
}

export interface DistanceEntry {
  zoneId: string;
  distanceKm: number;
  travelTimeMinutes: number;
}

// Raw input from admin when creating/editing a zone
export interface ZoneInput {
  name: string;
  code: string;
  sizeScore: number;   // S: 1–10
  densityScore: number; // D: 1–10
  geometry?: GeoPolygon;
  centroid?: GeoPoint;
}

// Fully computed zone (stored in DB + used by algorithms)
export interface Zone {
  _id: string;
  name: string;
  code: string;

  // Admin inputs
  sizeScore: number;        // S
  densityScore: number;     // D (current, can spike mid-shift)
  baseDensity: number;      // Original D before any incident

  // Calculated by proportionalDistributor
  zScore: number;           // Normalised zone score
  allocation: number;       // Troops allocated (from active force)
  safeThreshold: number;    // Minimum troops before alert (80% of allocation)
  currentDeployment: number; // Actual troops on ground right now

  // Geospatial (Option A)
  geometry: GeoPolygon;
  centroid: GeoPoint;

  // Adjacency (derived from spatial query or manual override)
  adjacency: string[];          // Array of adjacent zone _ids
  distanceMatrix: DistanceEntry[];

  // Visualisation
  heatmapColor: HeatmapColor;

  // Metadata
  isActive: boolean;
  version: number; // Optimistic locking
  createdAt: Date;
  updatedAt: Date;
}

// What the proportionalDistributor returns per zone
export interface ZoneAllocation {
  zoneId: string;
  zScore: number;
  allocation: number;       // Integer troops assigned
  safeThreshold: number;
  heatmapColor: HeatmapColor;
}

// Deficit calculated during incident resolution
export interface ZoneDeficit {
  zoneId: string;
  currentDeployment: number;
  requiredDeployment: number;
  delta: number; // positive = need more troops, negative = surplus
}

// Snapshot passed to deficitResolver
export interface ZoneSnapshot {
  zone: Zone;
  currentDeployment: number;
  safeThreshold: number;
}