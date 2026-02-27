// Standby pool percentage reserved from total force
export const STANDBY_POOL_PERCENTAGE = 0.15;

// Safe deployment threshold — zone must not drop below this fraction of its allocation
export const SAFE_THRESHOLD_FRACTION = 0.8;

// Default weights for Z-score calculation (admin can override via SystemConfig)
export const DEFAULT_WEIGHTS = {
  w_s: 0.3, // Size weight
  w_d: 0.7, // Density weight — prioritised by default
} as const;

// Heatmap color bands based on Z-score (normalised 0–10)
export const HEATMAP_THRESHOLDS = {
  red:    { min: 7.5, max: 10,  label: 'Critical',  hex: '#EF4444' },
  orange: { min: 5.0, max: 7.5, label: 'High',      hex: '#F97316' },
  yellow: { min: 2.5, max: 5.0, label: 'Moderate',  hex: '#EAB308' },
  green:  { min: 0,   max: 2.5, label: 'Low',       hex: '#22C55E' },
} as const;

export type HeatmapColor = keyof typeof HEATMAP_THRESHOLDS;

// Fatigue scoring weights
export const FATIGUE_WEIGHTS = {
  standardShift:       1.0,
  nightShift:          1.5,
  emergencyDeployment: 2.0,
} as const;

// Fatigue score band — above HIGH, scheduler deprioritises officer for heavy zones
export const FATIGUE_THRESHOLDS = {
  low:      { min: 0,  max: 10, label: 'Fresh'    },
  moderate: { min: 10, max: 20, label: 'Moderate' },
  high:     { min: 20, max: 30, label: 'Tired'    },
  critical: { min: 30, max: Infinity, label: 'Exhausted' },
} as const;

// Above this fatigue score, officer should NOT be assigned to a red/orange zone
export const FATIGUE_HEAVY_ZONE_LIMIT = 20;

// Adjacent pooling: max percentage we can siphon from a neighbour zone
export const MAX_SIPHON_FRACTION = 0.2; // take at most 20% of neighbour's current deployment

// Geospatial: max centroid-to-centroid distance (km) to consider zones adjacent
export const MAX_ADJACENCY_DISTANCE_KM = {
  micro: 0.5,  // Within a shrine/compound — 500m
  macro: 15,   // City-wide — 15km
} as const;

// Scheduler: max consecutive night shifts before forced rotation
export const MAX_CONSECUTIVE_NIGHT_SHIFTS = 3;

// Mass absence simulation threshold
export const MASS_ABSENCE_FRACTION = 0.10; // 10% of zone force goes on leave