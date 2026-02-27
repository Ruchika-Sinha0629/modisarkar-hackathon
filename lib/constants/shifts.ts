export const SHIFT_NAMES = ['morning', 'evening', 'night'] as const;
export type ShiftName = typeof SHIFT_NAMES[number];

export const SHIFTS: Record<ShiftName, { start: string; end: string; startHour: number; endHour: number }> = {
  morning: { start: '06:00', end: '14:00', startHour: 6,  endHour: 14 },
  evening: { start: '14:00', end: '22:00', startHour: 14, endHour: 22 },
  night:   { start: '22:00', end: '06:00', startHour: 22, endHour: 6  },
};

export const SHIFT_DURATION_HOURS = 8;

// Minimum rest hours before next shift eligibility
export const REST_HOURS: Record<'lowerRanks' | 'inspectors', number> = {
  lowerRanks: 8,   // Constable → SI
  inspectors: 12,  // Inspector and above (field-deployed)
};

// Shift order for cycling — used by scheduler
export const SHIFT_SEQUENCE: ShiftName[] = ['morning', 'evening', 'night'];

// For a given shift, what is the earliest next shift start (in hours from current shift start)?
// morning(6) + 8hr shift + 8hr rest = next available at 22:00 → can do night
// night(22)  + 8hr shift + 8hr rest = next available at 14:00 → can do evening next day
export const SHIFT_END_HOUR: Record<ShiftName, number> = {
  morning: 14,
  evening: 22,
  night:   6, // next calendar day
};

// Night shift: crosses midnight, so end is +1 day
export const CROSSES_MIDNIGHT: Record<ShiftName, boolean> = {
  morning: false,
  evening: false,
  night:   true,
};

// Fatigue multiplier per shift type (used by fatigueCalculator)
export const SHIFT_FATIGUE_MULTIPLIER: Record<ShiftName, number> = {
  morning: 1.0,
  evening: 1.0,
  night:   1.5,
};