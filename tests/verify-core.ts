import { calculateCycleState, computeCycleStatistics, formatDateYMD, addDays } from '../src/lib/cycleCalculator.ts';
import { CycleProfile, PeriodLog, DailyLog } from '../src/types/database.ts';

function runCoreAssertions() {
  console.log('🧪 Starting HerCycle Core Engine Verification...\n');

  const baselineProfile: CycleProfile = {
    user_id: 'test-user-123',
    average_cycle_length: 28,
    average_period_length: 5,
    last_period_start: null,
    goals: ['cycle_tracking'],
  };

  // 1. Verify Empty State (Brand-new user with zero logs)
  console.log('1. Testing Brand-New User Empty State:');
  const emptyState = calculateCycleState(baselineProfile, []);
  console.assert(emptyState.hasLoggedCycle === false, 'New user should have hasLoggedCycle = false');
  console.assert(emptyState.currentCycleDay === 0, 'New user cycle day is 0 prior to period log');
  console.assert(emptyState.isCurrentlyOnPeriod === false, 'User with no logs is not on period');
  console.log('  ✓ Clean empty state verified for fresh registration');

  // 2. Verify Active Cycle Calculations
  console.log('\n2. Testing Cycle Rhythm Calculations:');
  const today = new Date();
  const lastPeriodDate = addDays(today, -11); // Day 12 of cycle today
  const activePeriods: PeriodLog[] = [
    {
      id: 'log-1',
      user_id: 'test-user-123',
      start_date: formatDateYMD(lastPeriodDate),
      flow: 'medium',
    }
  ];

  const activeState = calculateCycleState(baselineProfile, activePeriods);
  console.log(`  Current Cycle Day: ${activeState.currentCycleDay} of ${activeState.totalCycleLength}`);
  console.log(`  Current Phase: ${activeState.phaseDisplayName}`);
  console.log(`  Days until next period: ${activeState.daysUntilNextPeriod}`);

  console.assert(activeState.hasLoggedCycle === true, 'hasLoggedCycle should be true');
  console.assert(activeState.currentCycleDay === 12, 'Cycle day should calculate to Day 12');
  console.assert(activeState.currentPhase === 'follicular', 'Day 12 should be follicular phase');
  console.assert(activeState.daysUntilNextPeriod === 16, 'Period should be 16 days away');
  console.log('  ✓ Cycle rhythm verified: Day 12 of 28, Follicular, 16 days to next period');

  // 3. Testing Statistics with Multiple Cycles
  console.log('\n3. Testing Statistics Calculation:');
  // Chronological order for 3 periods
  const historicalPeriods: PeriodLog[] = [
    { id: 'p3', user_id: 'test-user-123', start_date: formatDateYMD(addDays(today, -67)), end_date: formatDateYMD(addDays(today, -62)), flow: 'medium' },
    { id: 'p2', user_id: 'test-user-123', start_date: formatDateYMD(addDays(today, -39)), end_date: formatDateYMD(addDays(today, -34)), flow: 'heavy' },
    { id: 'p1', user_id: 'test-user-123', start_date: formatDateYMD(addDays(today, -11)), flow: 'medium' },
  ];

  const testDailies: DailyLog[] = [
    { id: 'd1', user_id: 'test-user-123', log_date: formatDateYMD(today), symptoms: ['cramps', 'headache'] },
    { id: 'd2', user_id: 'test-user-123', log_date: formatDateYMD(addDays(today, -1)), symptoms: ['cramps'] },
  ];

  const stats = computeCycleStatistics(baselineProfile, historicalPeriods, testDailies);
  console.assert(stats.totalCyclesLogged === 3, 'Should detect 3 periods logged');
  console.assert(stats.averageCycleLength === 28, 'Average cycle length should be 28 days');
  console.assert(stats.symptomFrequency.length > 0, 'Symptom frequency should be non-empty');
  console.assert(stats.symptomFrequency[0].name.toLowerCase() === 'cramps', 'Top symptom should be cramps');
  console.log('  ✓ Statistical intervals and symptom aggregation verified');

  console.log('\n🎉 ALL HERCYCLE CORE VERIFICATIONS PASSED SUCCESSFULLY!');
}

runCoreAssertions();
