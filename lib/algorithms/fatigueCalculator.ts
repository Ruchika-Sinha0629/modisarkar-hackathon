import {
  FATIGUE_WEIGHTS,
  FATIGUE_THRESHOLDS,
  FATIGUE_HEAVY_ZONE_LIMIT,
} from '../constants/thresholds';
import { SHIFT_FATIGUE_MULTIPLIER } from '../constants/shifts';
import { RANK_TO_LEVEL } from '../constants/ranks';
import type { Personnel, FatigueInput, FatigueResult, FatigueHistoryEntry } from '../types/personnel';
import type { ShiftName } from '../constants/shifts';
import type { HeatmapColor } from '../constants/thresholds';

// ─── Single officer fatigue update ──────────────────────────────────────────

export function calculateFatigue(input: FatigueInput): FatigueResult {
  const { officer, shift, isEmergencyDeployment } = input;

  let points: number;
  let reason: FatigueHistoryEntry['reason'];

  if (isEmergencyDeployment) {
    points = FATIGUE_WEIGHTS.emergencyDeployment;
    reason = 'emergencyDeployment';
  } else if (shift === 'night') {
    points = FATIGUE_WEIGHTS.nightShift * SHIFT_FATIGUE_MULTIPLIER.night;
    reason = 'nightShift';
  } else {
    points = FATIGUE_WEIGHTS.standardShift * SHIFT_FATIGUE_MULTIPLIER[shift];
    reason = 'standardShift';
  }

  const newScore = officer.fatigueScore + points;

  return {
    officerId:     officer._id,
    previousScore: officer.fatigueScore,
    pointsAdded:   points,
    newScore:      parseFloat(newScore.toFixed(2)),
    reason,
    isFatigued:    newScore >= FATIGUE_HEAVY_ZONE_LIMIT,
  };
}

// ─── Fatigue band label ───────────────────────────────────────────────────────

export function getFatigueBand(score: number): {
  band: keyof typeof FATIGUE_THRESHOLDS;
  label: string;
} {
  if (score >= FATIGUE_THRESHOLDS.critical.min) return { band: 'critical', label: FATIGUE_THRESHOLDS.critical.label };
  if (score >= FATIGUE_THRESHOLDS.high.min)     return { band: 'high',     label: FATIGUE_THRESHOLDS.high.label };
  if (score >= FATIGUE_THRESHOLDS.moderate.min) return { band: 'moderate', label: FATIGUE_THRESHOLDS.moderate.label };
  return                                                { band: 'low',      label: FATIGUE_THRESHOLDS.low.label };
}

// ─── Can this officer be assigned to a zone of given threat level? ────────────

export function isEligibleForZone(officer: Personnel, zoneColor: HeatmapColor): boolean {
  // Exhausted officers cannot be assigned anywhere
  const { band } = getFatigueBand(officer.fatigueScore);
  if (band === 'critical') return false;

  // Tired officers cannot go to high/critical threat zones
  if (band === 'high' && (zoneColor === 'red' || zoneColor === 'orange')) return false;

  return true;
}

// ─── Check rest period compliance ────────────────────────────────────────────

export function hasCompletedRest(officer: Personnel, nextShiftStart: Date): boolean {
  if (!officer.lastShiftEnd) return true; // No prior shift — always available

  const level = RANK_TO_LEVEL[officer.rank];
  const requiredRestMs =
    (level === 'ZoneManager' ? 12 : 8) * 60 * 60 * 1000; // 12hr inspectors, 8hr others

  return nextShiftStart.getTime() - officer.lastShiftEnd.getTime() >= requiredRestMs;
}

// ─── Bulk fatigue update — called by scheduler after generating a day ─────────

export interface BulkFatigueUpdate {
  officerId: string;
  previousScore: number;
  newScore: number;
  pointsAdded: number;
  isFatigued: boolean;
}

export function bulkUpdateFatigue(
  officers: Personnel[],
  shift: ShiftName,
  emergencyIds: Set<string> = new Set()
): BulkFatigueUpdate[] {
  return officers.map(officer => {
    const result = calculateFatigue({
      officer,
      shift,
      isEmergencyDeployment: emergencyIds.has(officer._id),
    });
    return {
      officerId:     result.officerId,
      previousScore: result.previousScore,
      newScore:      result.newScore,
      pointsAdded:   result.pointsAdded,
      isFatigued:    result.isFatigued,
    };
  });
}

// ─── Decay fatigue over time — call once per day for off-duty officers ────────
// Officers recover 1.0 point per full rest day (not deployed)

export const FATIGUE_DAILY_DECAY = 1.0;

export function decayFatigue(officer: Personnel, daysRested: number): number {
  const decayed = officer.fatigueScore - FATIGUE_DAILY_DECAY * daysRested;
  return parseFloat(Math.max(0, decayed).toFixed(2));
}

// ─── Sort officers by eligibility for assignment ──────────────────────────────
// Returns officers sorted: lowest fatigue first, ineligible officers last

export function sortByEligibility(
  officers: Personnel[],
  zoneColor: HeatmapColor,
  nextShiftStart: Date
): Personnel[] {
  const eligible   = officers.filter(o => isEligibleForZone(o, zoneColor) && hasCompletedRest(o, nextShiftStart));
  const ineligible = officers.filter(o => !isEligibleForZone(o, zoneColor) || !hasCompletedRest(o, nextShiftStart));

  eligible.sort((a, b) => a.fatigueScore - b.fatigueScore);

  return [...eligible, ...ineligible];
}

// ─── Fatigue summary for a roster day ────────────────────────────────────────

export interface DailyFatigueSummary {
  officerId: string;
  score: number;
  shiftsWorked: number;
  nightShiftsWorked: number;
  band: keyof typeof FATIGUE_THRESHOLDS;
}

export function buildDailyFatigueSummary(
  officers: Personnel[],
  deployedIds: Set<string>,
  nightShiftIds: Set<string>
): Record<string, DailyFatigueSummary> {
  const summary: Record<string, DailyFatigueSummary> = {};

  for (const officer of officers) {
    const wasDeployed   = deployedIds.has(officer._id);
    const wasNightShift = nightShiftIds.has(officer._id);
    const { band }      = getFatigueBand(officer.fatigueScore);

    summary[officer._id] = {
      officerId:        officer._id,
      score:            officer.fatigueScore,
      shiftsWorked:     wasDeployed ? 1 : 0,
      nightShiftsWorked: wasNightShift ? 1 : 0,
      band,
    };
  }

  return summary;
}