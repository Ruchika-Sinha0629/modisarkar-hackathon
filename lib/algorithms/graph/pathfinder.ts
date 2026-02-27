import type { Zone } from '../../types/zone';
import type { AdjacencyMap, AdjacencyEntry } from './adjacencyBuilder';
import type { ZoneSnapshot } from '../../types/zone';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface RankedNeighbour {
  zone:               Zone;
  distanceKm:         number;
  travelTimeMinutes:  number;
  surplus:            number;   // How many officers can be siphoned
  isViable:           boolean;  // Has surplus > 0 and is low-density
}

export interface PathResult {
  sourceZoneId:   string;
  targetZoneId:   string;
  distanceKm:     number;
  travelMinutes:  number;
  hops:           string[];  // Zone _ids along the path
}

// ─── Nearest Viable Neighbours ────────────────────────────────────────────────
// Returns neighbours of a zone sorted by distance, enriched with surplus info
// Used by deficitResolver Step A to prioritise which zones to siphon from

export function getRankedNeighbours(
  affectedZone:   Zone,
  allZones:       Zone[],
  adjacencyMap:   AdjacencyMap,
  snapshots:      ZoneSnapshot[],
  safeThresholds: Map<string, number>, // zoneId → safeThreshold
): RankedNeighbour[] {
  const neighbours = adjacencyMap[affectedZone._id] ?? [];
  const zoneById   = new Map(allZones.map(z => [z._id, z]));

  const ranked: RankedNeighbour[] = [];

  for (const entry of neighbours) {
    const zone     = zoneById.get(entry.zoneId);
    const snapshot = snapshots.find(s => s.zone._id === entry.zoneId);
    if (!zone || !snapshot) continue;

    const threshold = safeThresholds.get(entry.zoneId) ?? 0;
    const surplus   = Math.max(0, snapshot.currentDeployment - threshold);

    // Only viable if it has surplus AND is not itself a high-threat zone
    const isViable  = surplus > 0 && (zone.heatmapColor === 'green' || zone.heatmapColor === 'yellow');

    ranked.push({
      zone,
      distanceKm:        entry.distanceKm,
      travelTimeMinutes: entry.travelTimeMinutes,
      surplus,
      isViable,
    });
  }

  // Sort: viable first, then by surplus descending, then by distance ascending
  return ranked.sort((a, b) => {
    if (a.isViable !== b.isViable) return a.isViable ? -1 : 1;
    if (b.surplus  !== a.surplus)  return b.surplus - a.surplus;
    return a.distanceKm - b.distanceKm;
  });
}

// ─── Dijkstra Shortest Path ───────────────────────────────────────────────────
// Finds shortest path between two zones by travel time
// Used when direct adjacency fails — find a relay zone to move troops through

export function findShortestPath(
  sourceZoneId: string,
  targetZoneId: string,
  adjacencyMap: AdjacencyMap,
): PathResult | null {
  if (sourceZoneId === targetZoneId) {
    return {
      sourceZoneId,
      targetZoneId,
      distanceKm:    0,
      travelMinutes: 0,
      hops:          [sourceZoneId],
    };
  }

  // ── Dijkstra setup ────────────────────────────────────────────────────────
  const dist:   Map<string, number>         = new Map();
  const prev:   Map<string, string | null>  = new Map();
  const visited: Set<string>                = new Set();

  for (const zoneId of Object.keys(adjacencyMap)) {
    dist.set(zoneId, Infinity);
    prev.set(zoneId, null);
  }
  dist.set(sourceZoneId, 0);

  // Simple priority queue via array (sufficient for typical Z ≤ 40)
  const queue: string[] = [sourceZoneId];

  while (queue.length > 0) {
    // Pick unvisited node with smallest distance
    queue.sort((a, b) => (dist.get(a) ?? Infinity) - (dist.get(b) ?? Infinity));
    const current = queue.shift()!;

    if (visited.has(current)) continue;
    visited.add(current);

    if (current === targetZoneId) break;

    const neighbours: AdjacencyEntry[] = adjacencyMap[current] ?? [];

    for (const neighbour of neighbours) {
      if (visited.has(neighbour.zoneId)) continue;

      const newDist = (dist.get(current) ?? Infinity) + neighbour.travelTimeMinutes;

      if (newDist < (dist.get(neighbour.zoneId) ?? Infinity)) {
        dist.set(neighbour.zoneId, newDist);
        prev.set(neighbour.zoneId, current);
        queue.push(neighbour.zoneId);
      }
    }
  }

  // Target unreachable
  if ((dist.get(targetZoneId) ?? Infinity) === Infinity) return null;

  // ── Reconstruct path ──────────────────────────────────────────────────────
  const hops: string[] = [];
  let   current: string | null = targetZoneId;

  while (current !== null) {
    hops.unshift(current);
    current = prev.get(current) ?? null;
  }

  // Calculate total distance in km by summing hop distances
  let totalKm = 0;
  for (let i = 0; i < hops.length - 1; i++) {
    const leg = (adjacencyMap[hops[i]] ?? []).find(e => e.zoneId === hops[i + 1]);
    if (leg) totalKm += leg.distanceKm;
  }

  return {
    sourceZoneId,
    targetZoneId,
    distanceKm:    parseFloat(totalKm.toFixed(3)),
    travelMinutes: parseFloat((dist.get(targetZoneId) ?? 0).toFixed(1)),
    hops,
  };
}

// ─── Find all reachable zones within a travel time budget ────────────────────
// Used to scope Step A search radius dynamically based on how urgent the incident is

export function getZonesWithinTravelTime(
  sourceZoneId:    string,
  maxMinutes:      number,
  adjacencyMap:    AdjacencyMap,
): { zoneId: string; travelMinutes: number }[] {
  const dist:    Map<string, number> = new Map();
  const visited: Set<string>         = new Set();

  for (const zoneId of Object.keys(adjacencyMap)) {
    dist.set(zoneId, Infinity);
  }
  dist.set(sourceZoneId, 0);

  const queue: string[] = [sourceZoneId];

  while (queue.length > 0) {
    queue.sort((a, b) => (dist.get(a) ?? Infinity) - (dist.get(b) ?? Infinity));
    const current = queue.shift()!;

    if (visited.has(current)) continue;
    visited.add(current);

    const neighbours: AdjacencyEntry[] = adjacencyMap[current] ?? [];

    for (const neighbour of neighbours) {
      if (visited.has(neighbour.zoneId)) continue;

      const newDist = (dist.get(current) ?? Infinity) + neighbour.travelTimeMinutes;
      if (newDist > maxMinutes) continue; // Prune — beyond budget

      if (newDist < (dist.get(neighbour.zoneId) ?? Infinity)) {
        dist.set(neighbour.zoneId, newDist);
        queue.push(neighbour.zoneId);
      }
    }
  }

  return Array.from(dist.entries())
    .filter(([zoneId, minutes]) => zoneId !== sourceZoneId && minutes <= maxMinutes)
    .map(([zoneId, travelMinutes]) => ({
      zoneId,
      travelMinutes: parseFloat(travelMinutes.toFixed(1)),
    }))
    .sort((a, b) => a.travelMinutes - b.travelMinutes);
}