import { PeriodLog, DailyLog, CycleProfile } from '../types/database';
import { CycleCalculationResult, CyclePhase, CycleStats } from '../types/cycle';

export function formatDateYMD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateYMD(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function diffDays(d1: Date, d2: Date): number {
  const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
  return Math.floor((utc1 - utc2) / (1000 * 60 * 60 * 24));
}

export function calculateCycleState(
  cycleProfile: CycleProfile,
  periodLogs: PeriodLog[],
  targetDateStr?: string
): CycleCalculationResult {
  const targetDate = targetDateStr ? parseDateYMD(targetDateStr) : new Date();
  const cycleLength = cycleProfile.average_cycle_length || 28;
  const periodLength = cycleProfile.average_period_length || 5;

  // Find the most recent period start before or on targetDate
  const sortedPeriods = [...periodLogs].sort(
    (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  );

  const hasLoggedCycle = Boolean(sortedPeriods.length > 0 || cycleProfile.last_period_start);

  const lastPeriod = sortedPeriods.find(p => parseDateYMD(p.start_date) <= targetDate) || {
    start_date: cycleProfile.last_period_start || formatDateYMD(targetDate),
    flow: 'medium' as const,
  };

  const lastPeriodStart = parseDateYMD(lastPeriod.start_date);
  const rawDayDiff = diffDays(targetDate, lastPeriodStart);

  // Cycle day is 1-indexed if logged, else 0
  const currentCycleDay = hasLoggedCycle ? ((rawDayDiff % cycleLength) + 1) : 0;

  // Ovulation typically occurs around ~14 days before the next period (Day 14 in a 28-day cycle)
  const ovulationDay = Math.max(12, cycleLength - 14);
  const ovulationStartDay = ovulationDay;
  const ovulationEndDay = ovulationDay + 2;

  // Phase calculation matching physiological standard & prompt:
  // Days 1-5: Menstrual
  // Days 6-13: Follicular
  // Days 14-16: Ovulation
  // Days 17-28: Luteal
  let currentPhase: CyclePhase = 'follicular';
  let phaseDisplayName = 'Follicular Phase';

  if (currentCycleDay <= periodLength) {
    currentPhase = 'menstrual';
    phaseDisplayName = 'Menstrual Phase';
  } else if (currentCycleDay < ovulationStartDay) {
    currentPhase = 'follicular';
    phaseDisplayName = 'Follicular Phase';
  } else if (currentCycleDay >= ovulationStartDay && currentCycleDay <= ovulationEndDay) {
    currentPhase = 'ovulation';
    phaseDisplayName = 'Ovulation Window';
  } else {
    currentPhase = 'luteal';
    phaseDisplayName = 'Luteal Phase';
  }

  // Next period estimation
  const cyclesElapsed = Math.floor(rawDayDiff / cycleLength);
  const daysUntilNextPeriod = Math.max(0, cycleLength - currentCycleDay);
  const nextPeriodStartDate = addDays(targetDate, daysUntilNextPeriod);
  const nextPeriodEndDate = addDays(nextPeriodStartDate, periodLength - 1);

  // Current active period check
  const isCurrentlyOnPeriod = hasLoggedCycle && currentCycleDay > 0 && currentCycleDay <= periodLength;
  const currentFlow = isCurrentlyOnPeriod ? (lastPeriod.flow || 'medium') : 'none';

  // Fertile window dates
  const currentCycleStartDate = addDays(lastPeriodStart, cyclesElapsed * cycleLength);
  const fertileStartDate = addDays(currentCycleStartDate, ovulationStartDay - 1);
  const fertileEndDate = addDays(currentCycleStartDate, ovulationEndDay - 1);
  const ovulationDate = addDays(currentCycleStartDate, ovulationDay - 1);

  const progressPercent = Math.min(100, Math.round((currentCycleDay / cycleLength) * 100));

  return {
    currentCycleDay,
    totalCycleLength: cycleLength,
    periodLength,
    currentPhase,
    phaseDisplayName,
    daysUntilNextPeriod,
    estimatedNextPeriodStart: formatDateYMD(nextPeriodStartDate),
    estimatedNextPeriodEnd: formatDateYMD(nextPeriodEndDate),
    isCurrentlyOnPeriod,
    currentFlow,
    fertileWindowStart: formatDateYMD(fertileStartDate),
    fertileWindowEnd: formatDateYMD(fertileEndDate),
    estimatedOvulationDate: formatDateYMD(ovulationDate),
    progressPercent,
    phaseProgressPercent: progressPercent,
    hasLoggedCycle,
  };
}

export function computeCycleStatistics(
  cycleProfile: CycleProfile,
  periodLogs: PeriodLog[],
  dailyLogs: DailyLog[]
): CycleStats {
  const sorted = [...periodLogs].sort(
    (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
  );

  const history: CycleStats['history'] = [];
  const cycleLengths: number[] = [];
  const periodLengths: number[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    const startDate = current.start_date;
    const endDate = current.end_date || formatDateYMD(addDays(parseDateYMD(startDate), (cycleProfile.average_period_length || 5) - 1));
    const pLength = Math.max(1, diffDays(parseDateYMD(endDate), parseDateYMD(startDate)) + 1);
    periodLengths.push(pLength);

    if (i < sorted.length - 1) {
      const nextStart = sorted[i + 1].start_date;
      const cLength = diffDays(parseDateYMD(nextStart), parseDateYMD(startDate));
      if (cLength >= 20 && cLength <= 50) {
        cycleLengths.push(cLength);
        history.push({
          cycleNumber: i + 1,
          startDate,
          endDate: nextStart,
          cycleLength: cLength,
          periodLength: pLength,
        });
      }
    } else {
      history.push({
        cycleNumber: i + 1,
        startDate,
        endDate,
        cycleLength: cycleProfile.average_cycle_length || 28,
        periodLength: pLength,
      });
    }
  }

  const avgCycle = cycleLengths.length > 0 
    ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
    : (cycleProfile.average_cycle_length || 28);

  const shortestCycle = cycleLengths.length > 0 ? Math.min(...cycleLengths) : avgCycle - 2;
  const longestCycle = cycleLengths.length > 0 ? Math.max(...cycleLengths) : avgCycle + 3;

  const avgPeriod = periodLengths.length > 0
    ? Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length)
    : (cycleProfile.average_period_length || 5);

  const cycleDiff = longestCycle - shortestCycle;
  let regularity: CycleStats['cycleRegularity'] = 'Very Regular';
  if (cycleDiff <= 3) regularity = 'Very Regular';
  else if (cycleDiff <= 6) regularity = 'Slightly Variable';
  else regularity = 'Irregular';

  // Symptom counts
  const symptomCountMap: Record<string, number> = {};
  dailyLogs.forEach(dl => {
    dl.symptoms?.forEach(s => {
      symptomCountMap[s] = (symptomCountMap[s] || 0) + 1;
    });
  });

  const totalLogsWithSymptoms = Object.values(symptomCountMap).reduce((a, b) => a + b, 0) || 1;
  const symptomFrequency = Object.entries(symptomCountMap)
    .map(([id, count]) => ({
      id,
      name: id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      count,
      percentage: Math.min(100, Math.round((count / Math.max(1, dailyLogs.length)) * 100)),
    }))
    .sort((a, b) => b.count - a.count);

  // Mood counts
  const moodDistribution = {
    great: 0,
    good: 0,
    okay: 0,
    low: 0,
    difficult: 0,
  };
  dailyLogs.forEach(dl => {
    if (dl.mood && moodDistribution[dl.mood] !== undefined) {
      moodDistribution[dl.mood]++;
    }
  });

  // Energy counts
  const energyDistribution = {
    low: 0,
    medium: 0,
    high: 0,
  };
  dailyLogs.forEach(dl => {
    if (dl.energy && energyDistribution[dl.energy] !== undefined) {
      energyDistribution[dl.energy]++;
    }
  });

  return {
    averageCycleLength: avgCycle,
    shortestCycleLength: shortestCycle,
    longestCycleLength: longestCycle,
    averagePeriodLength: avgPeriod,
    totalCyclesLogged: sorted.length,
    cycleRegularity: regularity,
    history,
    symptomFrequency,
    moodDistribution,
    energyDistribution,
  };
}
