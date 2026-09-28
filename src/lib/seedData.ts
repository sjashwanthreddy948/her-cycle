import { UserProfile, CycleProfile, PeriodLog, DailyLog, PartnerConnection, SharingPermissionsMap, PartnerNotificationPref } from '../types/database';
import { formatDateYMD, addDays } from './cycleCalculator';

export const DEMO_WOMAN_USER: UserProfile = {
  id: 'usr-woman-sarah-101',
  email: 'demo.woman@hercycle.app',
  full_name: 'Sarah Miller',
  role: 'woman',
  date_of_birth: '1996-05-14',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  created_at: new Date(Date.now() - 150 * 24 * 3600 * 1000).toISOString(),
  updated_at: new Date().toISOString(),
};

export const DEMO_PARTNER_USER: UserProfile = {
  id: 'usr-partner-alex-202',
  email: 'demo.partner@hercycle.app',
  full_name: 'Alex Miller',
  role: 'partner',
  date_of_birth: '1994-08-22',
  avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  created_at: new Date(Date.now() - 150 * 24 * 3600 * 1000).toISOString(),
  updated_at: new Date().toISOString(),
};

// Anchor: Today is Day 12 of the cycle!
// Last period started exactly 11 days ago
const today = new Date();
const currentPeriodStart = addDays(today, -11);

export const DEMO_CYCLE_PROFILE: CycleProfile = {
  user_id: DEMO_WOMAN_USER.id,
  average_cycle_length: 28,
  average_period_length: 5,
  last_period_start: formatDateYMD(currentPeriodStart),
  goals: ['cycle_tracking', 'understanding_symptoms', 'wellness_tracking'],
  created_at: new Date(Date.now() - 150 * 24 * 3600 * 1000).toISOString(),
  updated_at: new Date().toISOString(),
};

// 5 historical cycles
export function generateDemoPeriodLogs(): PeriodLog[] {
  const p5Start = currentPeriodStart; // current cycle
  const p4Start = addDays(p5Start, -28);
  const p3Start = addDays(p4Start, -29);
  const p2Start = addDays(p3Start, -27);
  const p1Start = addDays(p2Start, -28);

  return [
    {
      id: 'period-1',
      user_id: DEMO_WOMAN_USER.id,
      start_date: formatDateYMD(p1Start),
      end_date: formatDateYMD(addDays(p1Start, 4)),
      flow: 'medium',
      notes: 'Normal start, mild cramps on day 1.',
    },
    {
      id: 'period-2',
      user_id: DEMO_WOMAN_USER.id,
      start_date: formatDateYMD(p2Start),
      end_date: formatDateYMD(addDays(p2Start, 4)),
      flow: 'heavy',
      notes: 'Slightly heavier flow on day 2. Drank lots of raspberry leaf tea.',
    },
    {
      id: 'period-3',
      user_id: DEMO_WOMAN_USER.id,
      start_date: formatDateYMD(p3Start),
      end_date: formatDateYMD(addDays(p3Start, 5)),
      flow: 'medium',
      notes: 'Felt calm and prepared with heating pad.',
    },
    {
      id: 'period-4',
      user_id: DEMO_WOMAN_USER.id,
      start_date: formatDateYMD(p4Start),
      end_date: formatDateYMD(addDays(p4Start, 4)),
      flow: 'medium',
      notes: 'Cycle was right on time.',
    },
    {
      id: 'period-5',
      user_id: DEMO_WOMAN_USER.id,
      start_date: formatDateYMD(p5Start),
      end_date: formatDateYMD(addDays(p5Start, 4)),
      flow: 'medium',
      notes: 'Current cycle period. Felt good by day 4.',
    },
  ];
}

// 60-90 days of rich realistic daily logs with varied moods, energy, and symptoms
export function generateDemoDailyLogs(): DailyLog[] {
  const logs: DailyLog[] = [];
  const symptomsBank = ['cramps', 'headache', 'bloating', 'fatigue', 'breast_tenderness', 'back_pain', 'mood_changes', 'cravings'];
  
  // Create daily logs going back 90 days to today
  for (let i = 90; i >= 0; i--) {
    const logDate = addDays(today, -i);
    const dateStr = formatDateYMD(logDate);
    
    // Determine where in historical cycle this date falls
    const dayMod = (90 - i + 12) % 28 + 1; // approx cycle day
    
    let mood: DailyLog['mood'] = 'good';
    let energy: DailyLog['energy'] = 'medium';
    let flow: DailyLog['flow'] = 'none';
    const daySymptoms: string[] = [];
    let sleepHours = 7.5;
    let waterGlasses = 7;
    let weight = 58.5 + (Math.sin(i / 10) * 0.8);
    let notes: string | undefined = undefined;

    if (dayMod <= 5) {
      // Menstrual days
      flow = dayMod === 1 ? 'medium' : dayMod === 2 ? 'heavy' : dayMod === 3 ? 'medium' : 'light';
      mood = dayMod <= 2 ? 'low' : 'okay';
      energy = 'low';
      sleepHours = 8.5;
      waterGlasses = 8;
      daySymptoms.push('cramps');
      if (dayMod <= 2) daySymptoms.push('fatigue', 'back_pain');
      notes = dayMod === 1 ? 'Resting on the couch with warm tea.' : undefined;
    } else if (dayMod <= 12) {
      // Follicular days
      mood = 'great';
      energy = 'high';
      sleepHours = 7.5;
      waterGlasses = 8;
      if (i % 7 === 0) daySymptoms.push('acne');
      notes = dayMod === 10 ? 'Great workout session and high focus!' : undefined;
    } else if (dayMod <= 16) {
      // Ovulation window
      mood = 'great';
      energy = 'high';
      sleepHours = 7;
      waterGlasses = 9;
      if (dayMod === 14) daySymptoms.push('bloating');
    } else {
      // Luteal phase
      if (dayMod >= 23) {
        mood = 'okay';
        energy = 'low';
        sleepHours = 8;
        daySymptoms.push('bloating', 'cravings');
        if (dayMod >= 26) {
          daySymptoms.push('breast_tenderness', 'mood_changes');
          mood = 'difficult';
        }
      } else {
        mood = 'good';
        energy = 'medium';
        sleepHours = 7.5;
      }
    }

    // Specific note for today (Day 12)
    if (i === 0) {
      mood = 'great';
      energy = 'high';
      waterGlasses = 7;
      sleepHours = 8.0;
      notes = 'Feeling energized today! Ready for a productive week.';
    }

    logs.push({
      id: `daily-log-${dateStr}`,
      user_id: DEMO_WOMAN_USER.id,
      log_date: dateStr,
      flow,
      mood,
      energy,
      sleep_hours: Number(sleepHours.toFixed(1)),
      water_glasses: waterGlasses,
      weight: Number(weight.toFixed(1)),
      symptoms: daySymptoms,
      notes,
      created_at: new Date(logDate).toISOString(),
      updated_at: new Date(logDate).toISOString(),
    });
  }

  return logs;
}

export const DEMO_PARTNER_CONNECTION: PartnerConnection = {
  id: 'conn-sarah-alex-999',
  woman_user_id: DEMO_WOMAN_USER.id,
  partner_user_id: DEMO_PARTNER_USER.id,
  status: 'active',
  connection_code: 'HER-789',
  is_paused: false,
  created_at: new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString(),
  approved_at: new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString(),
  partner_email: DEMO_PARTNER_USER.email,
  partner_name: DEMO_PARTNER_USER.full_name,
  woman_name: DEMO_WOMAN_USER.full_name,
};

export const DEMO_SHARING_PERMISSIONS: SharingPermissionsMap = {
  cycle_phase: true,
  cycle_day: true,
  period_status: true,
  estimated_next_period: true,
  mood: true,
  energy: true,
  symptoms: false,
  flow: false,
  sleep: false,
  notes: false,
  weight: false,
};

export const DEMO_NOTIFICATIONS: PartnerNotificationPref[] = [
  {
    id: 'notif-1',
    connection_id: DEMO_PARTNER_CONNECTION.id,
    type: 'period_approaching',
    enabled: true,
    discreet_wording: true,
  },
  {
    id: 'notif-2',
    connection_id: DEMO_PARTNER_CONNECTION.id,
    type: 'period_started',
    enabled: true,
    discreet_wording: true,
  },
  {
    id: 'notif-3',
    connection_id: DEMO_PARTNER_CONNECTION.id,
    type: 'mood_update',
    enabled: true,
    discreet_wording: true,
  },
  {
    id: 'notif-4',
    connection_id: DEMO_PARTNER_CONNECTION.id,
    type: 'ovulation_window',
    enabled: false,
    discreet_wording: true,
  },
];
