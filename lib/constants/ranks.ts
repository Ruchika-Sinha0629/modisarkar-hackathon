export const RANKS = [
  'DGP', 'ADGP', 'IG',
  'DIG', 'SP',
  'DSP', 'ASP', 'Inspector',
  'SI', 'ASI', 'HeadConstable', 'Constable'
] as const;

export type Rank = typeof RANKS[number];

export const COMMAND_LEVEL = ['DGP', 'ADGP', 'IG'] as const;
export const STRATEGIC_LEVEL = ['DIG', 'SP'] as const;
export const ZONE_MANAGER_LEVEL = ['DSP', 'ASP', 'Inspector'] as const;
export const SECTOR_DUTY_LEVEL = ['SI', 'ASI', 'HeadConstable', 'Constable'] as const;

export type CommandLevel = 'Command' | 'Strategic' | 'ZoneManager' | 'SectorDuty';

export const RANK_TO_LEVEL: Record<Rank, CommandLevel> = {
  DGP: 'Command',
  ADGP: 'Command',
  IG: 'Command',
  DIG: 'Strategic',
  SP: 'Strategic',
  DSP: 'ZoneManager',
  ASP: 'ZoneManager',
  Inspector: 'ZoneManager',
  SI: 'SectorDuty',
  ASI: 'SectorDuty',
  HeadConstable: 'SectorDuty',
  Constable: 'SectorDuty',
};

// Command level ranks are never field-deployed
export const FIELD_DEPLOYABLE_RANKS: Rank[] = [
  'DIG', 'SP',
  'DSP', 'ASP', 'Inspector',
  'SI', 'ASI', 'HeadConstable', 'Constable'
];

// Minimum required per zone per shift
export const MIN_ZONE_COMPOSITION = {
  Inspector: 1,   // Zone commander
  SI: 1,          // Supervisor
  ASI: 1,         // Supervisor
} as const;