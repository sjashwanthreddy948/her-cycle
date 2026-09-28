import type { FlowLevel, MoodLevel, EnergyLevel, CyclePhase } from './database';
export type { CyclePhase };

export interface CycleCalculationResult {
  currentCycleDay: number;
  totalCycleLength: number;
  periodLength: number;
  currentPhase: CyclePhase;
  phaseDisplayName: string;
  daysUntilNextPeriod: number;
  estimatedNextPeriodStart: string; // YYYY-MM-DD
  estimatedNextPeriodEnd: string;   // YYYY-MM-DD
  isCurrentlyOnPeriod: boolean;
  currentFlow: FlowLevel;
  fertileWindowStart: string;
  fertileWindowEnd: string;
  estimatedOvulationDate: string;
  progressPercent: number;
  phaseProgressPercent: number;
}

export interface PhaseInfo {
  id: CyclePhase;
  name: string;
  tagline: string;
  cyclePosition: string; // e.g., "Days 1 - 5"
  color: string;
  badgeBg: string;
  badgeText: string;
  description: string;
  hormoneSummary: string;
  wellnessSuggestions: {
    nutrition: string;
    exercise: string;
    selfCare: string;
  };
  partnerTips: string[];
}

export interface CycleStats {
  averageCycleLength: number;
  shortestCycleLength: number;
  longestCycleLength: number;
  averagePeriodLength: number;
  totalCyclesLogged: number;
  cycleRegularity: 'Very Regular' | 'Slightly Variable' | 'Irregular' | 'Learning patterns';
  history: {
    cycleNumber: number;
    startDate: string;
    endDate: string;
    cycleLength: number;
    periodLength: number;
  }[];
  symptomFrequency: {
    id: string;
    name: string;
    count: number;
    percentage: number;
  }[];
  moodDistribution: Record<MoodLevel, number>;
  energyDistribution: Record<EnergyLevel, number>;
}
