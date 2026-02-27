import { MAX_ADJACENCY_DISTANCE_KM } from '../../constants/thresholds';
import type { Zone } from '../../types/zone';

// ─── Haversine Distance ───────────────────────────────────────────────────────
// Calculates great-circle distance between two [lng, lat] points in kilometres

function haversineDistance(
  [lng1, lat1]: [number, number],
  [lng2, lat2]: [number, number]
): number {
  const R    = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // km
}

// Average walking/driving speed assumptions for travel time estimation
const TRAVEL_SPEED = {
  micro: 5,   // km/h on foot inside a compound
  macro: 40,  // km/h by vehicle across city
} as const;

export type ScaleMode = keyof typeof TRAVEL_SPEED;

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AdjacencyEntry {
  zoneId:             string;
  distanceKm:         number;
  travelTimeMinutes:  number;
}

export interface AdjacencyMap {
  // zoneId → sorted list of neighbours (nearest first)
  [zoneId: string]: AdjacencyEntry[];
}

// ─── Core Builder ─────────────────────────────────────────────────────────────

export function buildAdjacencyMap(
  zones:     Zone[],
  mode:      ScaleMode = 'macro',
): AdjacencyMap {
  const maxDistance = MAX_ADJACENCY_DISTANCE_KM[mode];
  const speed       = TRAVEL_SPEED[mode];
  const map:        AdjacencyMap = {};

  // Initialise empty adjacency for every zone
  for (const zone of zones) {
    map[zone._id] = [];
  }

  // Compare every pair once (n² / 2)
  for (let i = 0; i < zones.length; i++) {
    for (let j = i + 1; j < zones.length; j++) {
      const zoneA = zones[i];
      const zoneB = zones[j];

      if (!zoneA.centroid || !zoneB.centroid) continue;

      const distanceKm = haversineDistance(
        zoneA.centroid.coordinates,
        zoneB.centroid.coordinates,
      );

      if (distanceKm > maxDistance) continue;

      const travelTimeMinutes = parseFloat(
        ((distanceKm / speed) * 60).toFixed(1)
      );

      // Bidirectional — both zones are neighbours of each other
      map[zoneA._id].push({ zoneId: zoneB._id, distanceKm: parseFloat(distanceKm.toFixed(3)), travelTimeMinutes });
      map[zoneB._id].push({ zoneId: zoneA._id, distanceKm: parseFloat(distanceKm.toFixed(3)), travelTimeMinutes });
    }
  }

  // Sort each adjacency list nearest-first
  for (const zoneId of Object.keys(map)) {
    map[zoneId].sort((a, b) => a.distanceKm - b.distanceKm);
  }

  return map;
}

// ─── Apply adjacency map back onto Zone objects ───────────────────────────────
// Call this after buildAdjacencyMap to hydrate zone.adjacency + zone.distanceMatrix

export function applyAdjacencyToZones(
  zones:        Zone[],
  adjacencyMap: AdjacencyMap,
): Zone[] {
  return zones.map(zone => ({
    ...zone,
    adjacency:      (adjacencyMap[zone._id] ?? []).map(e => e.zoneId),
    distanceMatrix: (adjacencyMap[zone._id] ?? []).map(e => ({
      zoneId:            e.zoneId,
      distanceKm:        e.distanceKm,
      travelTimeMinutes: e.travelTimeMinutes,
    })),
  }));
}

// ─── Validate adjacency — useful for dashboard warnings ──────────────────────
// Returns zones with zero neighbours (isolated zones are a risk)

export function findIsolatedZones(
  zones:        Zone[],
  adjacencyMap: AdjacencyMap,
): Zone[] {
  return zones.filter(zone => (adjacencyMap[zone._id] ?? []).length === 0);
}

// ─── Convenience: build + apply in one call ───────────────────────────────────

export function buildAndApplyAdjacency(
  zones: Zone[],
  mode:  ScaleMode = 'macro',
): {
  zones:        Zone[];
  adjacencyMap: AdjacencyMap;
  isolated:     Zone[];
} {
  const adjacencyMap = buildAdjacencyMap(zones, mode);
  const hydratedZones = applyAdjacencyToZones(zones, adjacencyMap);
  const isolated      = findIsolatedZones(hydratedZones, adjacencyMap);

  return { zones: hydratedZones, adjacencyMap, isolated };
}