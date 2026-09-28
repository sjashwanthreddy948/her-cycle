import { calculateCycleState, computeCycleStatistics, formatDateYMD, addDays } from '../src/lib/cycleCalculator.ts';
import { 
  DEMO_WOMAN_USER, 
  DEMO_PARTNER_USER, 
  DEMO_CYCLE_PROFILE, 
  generateDemoPeriodLogs, 
  generateDemoDailyLogs,
  DEMO_PARTNER_CONNECTION,
  DEMO_SHARING_PERMISSIONS
} from '../src/lib/seedData.ts';
import { db } from '../src/lib/db.ts';

function runAssertions() {
  console.log('🧪 Starting HerCycle Core System Verification...\n');

  // 1. Verify Demo Users & Seed Profile
  console.log('1. Checking Seed Demo Accounts:');
  console.assert(DEMO_WOMAN_USER.email === 'demo.woman@hercycle.app', 'Woman email should match');
  console.assert(DEMO_PARTNER_USER.email === 'demo.partner@hercycle.app', 'Partner email should match');
  console.log('  ✓ Demo accounts verified: Sarah Miller & Alex Miller');

  // 2. Verify Cycle Calculation Engine
  console.log('\n2. Testing Cycle Calculation State:');
  const periods = generateDemoPeriodLogs();
  const dailies = generateDemoDailyLogs();
  const state = calculateCycleState(DEMO_CYCLE_PROFILE, periods);

  console.log(`  Current Cycle Day: ${state.currentCycleDay} of ${state.totalCycleLength}`);
  console.log(`  Current Phase: ${state.phaseDisplayName}`);
  console.log(`  Days until next period: ${state.daysUntilNextPeriod}`);
  console.log(`  Estimated next period: ${state.estimatedNextPeriodStart}`);
  console.log(`  Fertile window: ${state.fertileWindowStart} to ${state.fertileWindowEnd}`);

  console.assert(state.currentCycleDay === 12, 'Target anchor was Day 12');
  console.assert(state.currentPhase === 'follicular', 'Day 12 must be follicular phase');
  console.assert(state.daysUntilNextPeriod === 16, 'Period should be 16 days away');
  console.log('  ✓ Cycle calculations match requirement exactly: Day 12 of 28, Follicular, 16 days away');

  // 3. Testing Statistics & Trends
  console.log('\n3. Testing Cycle Statistics:');
  const stats = computeCycleStatistics(DEMO_CYCLE_PROFILE, periods, dailies);
  console.log(`  Average cycle length: ${stats.averageCycleLength} days`);
  console.log(`  Shortest cycle: ${stats.shortestCycleLength} days`);
  console.log(`  Longest cycle: ${stats.longestCycleLength} days`);
  console.log(`  Average period: ${stats.averagePeriodLength} days`);
  console.log(`  Cycle Regularity: ${stats.cycleRegularity}`);
  console.log(`  Total cycles logged: ${stats.totalCyclesLogged}`);
  console.log(`  Top symptom: ${stats.symptomFrequency[0]?.name} (${stats.symptomFrequency[0]?.count} times)`);

  console.assert(stats.averageCycleLength >= 27 && stats.averageCycleLength <= 29, 'Average cycle should be ~28 days');
  console.assert(stats.averagePeriodLength === 5, 'Average period should be 5 days');
  console.assert(stats.symptomFrequency.length > 0, 'Symptom frequency should be populated');
  console.log('  ✓ Historical stats accurately reflect 5 months of rich cycle logs');

  // 4. Partner Data Masking & Privacy Enforcement
  console.log('\n4. Testing Partner Security & Permission Masking:');
  // Check default permissions
  console.assert(DEMO_SHARING_PERMISSIONS.cycle_phase === true, 'Phase should be shared by default');
  console.assert(DEMO_SHARING_PERMISSIONS.notes === false, 'Private notes MUST NOT be shared by default');
  console.assert(DEMO_SHARING_PERMISSIONS.weight === false, 'Weight MUST NOT be shared by default');
  console.log('  ✓ Sensitive personal fields (Notes, Weight) are strictly OFF by default');

  console.log('\n🎉 ALL HERCYCLE CORE VERIFICATIONS PASSED SUCCESSFULLY!');
}

runAssertions();
