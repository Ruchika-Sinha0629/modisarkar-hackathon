import type { Zone } from '../../types/zone';
import type { AdjacencyMap } from './adjacencyBuilder';
import type { ZoneAllocation } from '../../types/zone';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CentralityScore {
  zoneId:             string;
  zoneName:           string;
  degreeCentrality:   number;   // How many direct neighbours
  betweenness:        number;   // How often zone appears on shortest paths
  coverageScore:      number;   // Combined strategic importance (0–1)
  isStrategicHub:     boolean;  // Top 20% by coverage score
}

export interface NetworkHealth {
  totalZones:         number;
  totalEdges:         number;
  averageDegree:      number;
  isolatedZones:      string[];  // Zone _ids with zero neighbours
  strategicHubs:      string[];  // Zone _ids flagged as hubs
  networkDensity:     number;    // Actual edges / possible edges (0–1)
  isFragmented:       boolean;   // True if any zone is unreachable from hub
}

// ─── Degree Centrality ────────────────────────────────────────────────────────
// Simply: how many direct neighbours does each zone have?
// Normalised by (totalZones - 1)

function computeDegreeCentrality(
  zones:        Zone[],
  adjacencyMap: AdjacencyMap,
): Map<string, number> {
  const scores = new Map<string, number>();
  const n       = zones.length;
  if (n <= 1) return scores;

  for (const zone of zones) {
    const degree     = (adjacencyMap[zone._id] ?? []).length;
    const normalised = degree / (n - 1);
    scores.set(zone._id, parseFloat(normalised.toFixed(4)));
  }

  return scores;
}

// ─── Betweenness Centrality (Brandes approximation) ──────────────────────────
// Measures how often a zone sits on the shortest path between other zone pairs
// High betweenness = strategic chokepoint — losing it fragments the network

function computeBetweenness(
  zones:        Zone[],
  adjacencyMap: AdjacencyMap,
): Map<string, number> {
  const scores  = new Map<string, number>();
  const zoneIds = zones.map(z => z._id);

  for (const id of zoneIds) scores.set(id, 0);

  // For each source zone, run BFS to find shortest paths
  for (const source of zoneIds) {
    const stack:    string[]              = [];
    const pred:     Map<string, string[]> = new Map();
    const sigma:    Map<string, number>   = new Map();
    const dist:     Map<string, number>   = new Map();

    for (const id of zoneIds) {
      pred.set(id, []);
      sigma.set(id, 0);
      dist.set(id, -1);
    }

    sigma.set(source, 1);
    dist.set(source, 0);

    const queue: string[] = [source];

    // ── BFS ───────────────────────────────────────────────────────────────
    while (queue.length > 0) {
      const v = queue.shift()!;
      stack.push(v);

      for (const { zoneId: w } of adjacencyMap[v] ?? []) {
        // First visit
        if ((dist.get(w) ?? -1) < 0) {
          queue.push(w);
          dist.set(w, (dist.get(v) ?? 0) + 1);
        }
        // Shortest path to w via v
        if ((dist.get(w) ?? 0) === (dist.get(v) ?? 0) + 1) {
          sigma.set(w, (sigma.get(w) ?? 0) + (sigma.get(v) ?? 0));
          pred.get(w)!.push(v);
        }
      }
    }

    // ── Back-propagation ──────────────────────────────────────────────────
    const delta = new Map<string, number>();
    for (const id of zoneIds) delta.set(id, 0);

    while (stack.length > 0) {
      const w = stack.pop()!;
      for (const v of pred.get(w) ?? []) {
        const contribution =
          ((sigma.get(v) ?? 0) / (sigma.get(w) ?? 1)) *
          (1 + (delta.get(w) ?? 0));
        delta.set(v, (delta.get(v) ?? 0) + contribution);
      }
      if (w !== source) {
        scores.set(w, (scores.get(w) ?? 0) + (delta.get(w) ?? 0));
      }
    }
  }

  // Normalise by (n-1)(n-2) for directed interpretation
  const n = zoneIds.length;
  const normaliser = n > 2 ? (n - 1) * (n - 2) : 1;

  for (const [id, score] of scores) {
    scores.set(id, parseFloat((score / normaliser).toFixed(4)));
  }

  return scores;
}

// ─── Coverage Score ───────────────────────────────────────────────────────────
// Combines degree + betweenness + zone threat level into one strategic score
// Higher = more important to keep well-staffed

function computeCoverageScore(
  zoneId:       string,
  degree:       number,
  betweenness:  number,
  allocation:   ZoneAllocation | undefined,
): number {
  const threatNorm  = allocation ? (allocation.zScore / 10) : 0;
  // Weighted: betweenness matters most, then degree, then threat
  const score = 0.5 * betweenness + 0.3 * degree + 0.2 * threatNorm;
  return parseFloat(Math.min(score, 1).toFixed(4));
}

// ─── Main: Full Centrality Analysis ──────────────────────────────────────────

export function computeCentrality(
  zones:        Zone[],
  adjacencyMap: AdjacencyMap,
  allocations:  ZoneAllocation[],
): CentralityScore[] {
  if (zones.length === 0) return [];

  const degreeMap      = computeDegreeCentrality(zones, adjacencyMap);
  const betweennessMap = computeBetweenness(zones, adjacencyMap);

  const scores: CentralityScore[] = zones.map(zone => {
    const degree      = degreeMap.get(zone._id)      ?? 0;
    const betweenness = betweennessMap.get(zone._id) ?? 0;
    const allocation  = allocations.find(a => a.zoneId === zone._id);
    const coverage    = computeCoverageScore(zone._id, degree, betweenness, allocation);

    return {
      zoneId:           zone._id,
      zoneName:         zone.name,
      degreeCentrality: degree,
      betweenness,
      coverageScore:    coverage,
      isStrategicHub:   false, // Flagged below after sorting
    };
  });

  // Flag top 20% as strategic hubs
  const sorted    = [...scores].sort((a, b) => b.coverageScore - a.coverageScore);
  const hubCutoff = Math.max(1, Math.ceil(scores.length * 0.2));

  for (let i = 0; i < hubCutoff; i++) {
    const match = scores.find(s => s.zoneId === sorted[i].zoneId);
    if (match) match.isStrategicHub = true;
  }

  return scores.sort((a, b) => b.coverageScore - a.coverageScore);
}

// ─── Network Health Report ────────────────────────────────────────────────────
// Dashboard summary — shows admins if their zone layout has structural problems

export function analyseNetworkHealth(
  zones:          Zone[],
  adjacencyMap:   AdjacencyMap,
  centralityScores: CentralityScore[],
): NetworkHealth {
  const n           = zones.length;
  const maxEdges    = n * (n - 1) / 2;
  let   totalEdges  = 0;

  const isolatedZones:  string[] = [];
  const strategicHubs:  string[] = [];

  for (const zone of zones) {
    const neighbours = (adjacencyMap[zone._id] ?? []).length;
    totalEdges += neighbours;
    if (neighbours === 0) isolatedZones.push(zone._id);
  }

  totalEdges = totalEdges / 2; // Each edge counted twice (bidirectional)

  for (const score of centralityScores) {
    if (score.isStrategicHub) strategicHubs.push(score.zoneId);
  }

  const averageDegree    = n > 0 ? parseFloat(((totalEdges * 2) / n).toFixed(2)) : 0;
  const networkDensity   = maxEdges > 0 ? parseFloat((totalEdges / maxEdges).toFixed(4)) : 0;

  // Fragmented if any zone has no path to any strategic hub
  const isFragmented = isolatedZones.length > 0 && strategicHubs.length > 0;

  return {
    totalZones:     n,
    totalEdges,
    averageDegree,
    isolatedZones,
    strategicHubs,
    networkDensity,
    isFragmented,
  };
}

// ─── Convenience: full analysis in one call ───────────────────────────────────

export function runFullNetworkAnalysis(
  zones:        Zone[],
  adjacencyMap: AdjacencyMap,
  allocations:  ZoneAllocation[],
): {
  centrality:    CentralityScore[];
  networkHealth: NetworkHealth;
} {
  const centrality    = computeCentrality(zones, adjacencyMap, allocations);
  const networkHealth = analyseNetworkHealth(zones, adjacencyMap, centrality);
  return { centrality, networkHealth };
}