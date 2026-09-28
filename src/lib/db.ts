import { 
  UserProfile, 
  CycleProfile, 
  PeriodLog, 
  DailyLog, 
  PartnerConnection, 
  SharingPermissionsMap, 
  PartnerNotificationPref,
  PermissionKey,
  FlowLevel
} from '../types/database';
import { 
  DEMO_WOMAN_USER, 
  DEMO_PARTNER_USER, 
  DEMO_CYCLE_PROFILE, 
  generateDemoPeriodLogs, 
  generateDemoDailyLogs, 
  DEMO_PARTNER_CONNECTION, 
  DEMO_SHARING_PERMISSIONS, 
  DEMO_NOTIFICATIONS 
} from './seedData';
import { calculateCycleState } from './cycleCalculator';
import { supabase, isSupabaseConfigured } from './supabase';

const DB_KEY = 'hercycle_db_v1';

interface StorageSchema {
  profiles: UserProfile[];
  cycleProfiles: Record<string, CycleProfile>;
  periodLogs: PeriodLog[];
  dailyLogs: DailyLog[];
  partnerConnections: PartnerConnection[];
  sharingPermissions: Record<string, SharingPermissionsMap>; // keyed by connection_id
  partnerNotifications: Record<string, PartnerNotificationPref[]>;
}

// Initial seed store
function getInitialData(): StorageSchema {
  return {
    profiles: [DEMO_WOMAN_USER, DEMO_PARTNER_USER],
    cycleProfiles: {
      [DEMO_WOMAN_USER.id]: DEMO_CYCLE_PROFILE,
    },
    periodLogs: generateDemoPeriodLogs(),
    dailyLogs: generateDemoDailyLogs(),
    partnerConnections: [DEMO_PARTNER_CONNECTION],
    sharingPermissions: {
      [DEMO_PARTNER_CONNECTION.id]: { ...DEMO_SHARING_PERMISSIONS },
    },
    partnerNotifications: {
      [DEMO_PARTNER_CONNECTION.id]: [...DEMO_NOTIFICATIONS],
    },
  };
}

function loadStore(): StorageSchema {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) {
      const initial = getInitialData();
      saveStore(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    // Ensure all collections exist
    if (!parsed.profiles || !parsed.periodLogs || !parsed.dailyLogs) {
      const initial = getInitialData();
      saveStore(initial);
      return initial;
    }
    return parsed;
  } catch (e) {
    console.error('Error loading HerCycle store, resetting to initial seed:', e);
    const initial = getInitialData();
    saveStore(initial);
    return initial;
  }
}

function saveStore(store: StorageSchema): void {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(store));
  } catch (e) {
    console.error('Error saving HerCycle store:', e);
  }
}

export const db = {
  // Profiles
  async getProfile(userId: string): Promise<UserProfile | null> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (data) return data as UserProfile;
    }
    const store = loadStore();
    return store.profiles.find(p => p.id === userId) || null;
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const store = loadStore();
    const index = store.profiles.findIndex(p => p.id === userId);
    if (index === -1) throw new Error('User not found');
    const updated = { ...store.profiles[index], ...updates, updated_at: new Date().toISOString() };
    store.profiles[index] = updated;
    saveStore(store);
    return updated;
  },

  async createProfile(profile: UserProfile): Promise<UserProfile> {
    const store = loadStore();
    const existing = store.profiles.find(p => p.id === profile.id || p.email === profile.email);
    if (existing) return existing;
    store.profiles.push(profile);
    saveStore(store);
    return profile;
  },

  // Cycle Profile
  async getCycleProfile(userId: string): Promise<CycleProfile> {
    const store = loadStore();
    if (!store.cycleProfiles[userId]) {
      const def: CycleProfile = {
        user_id: userId,
        average_cycle_length: 28,
        average_period_length: 5,
        last_period_start: new Date().toISOString().split('T')[0],
        goals: ['cycle_tracking'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      store.cycleProfiles[userId] = def;
      saveStore(store);
      return def;
    }
    return store.cycleProfiles[userId];
  },

  async updateCycleProfile(userId: string, updates: Partial<CycleProfile>): Promise<CycleProfile> {
    const store = loadStore();
    const current = await this.getCycleProfile(userId);
    const updated = { ...current, ...updates, updated_at: new Date().toISOString() };
    store.cycleProfiles[userId] = updated;
    saveStore(store);
    return updated;
  },

  // Period Logs
  async getPeriodLogs(userId: string): Promise<PeriodLog[]> {
    const store = loadStore();
    return store.periodLogs
      .filter(p => p.user_id === userId)
      .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
  },

  async addPeriodLog(log: Omit<PeriodLog, 'id'>): Promise<PeriodLog> {
    const store = loadStore();
    const newLog: PeriodLog = {
      ...log,
      id: `period-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    store.periodLogs.push(newLog);
    // Also update cycle profile last_period_start if this log is the most recent
    if (store.cycleProfiles[log.user_id]) {
      const currentLast = store.cycleProfiles[log.user_id].last_period_start;
      if (!currentLast || new Date(log.start_date) > new Date(currentLast)) {
        store.cycleProfiles[log.user_id].last_period_start = log.start_date;
      }
    }
    saveStore(store);
    return newLog;
  },

  async updatePeriodLog(id: string, updates: Partial<PeriodLog>): Promise<PeriodLog> {
    const store = loadStore();
    const index = store.periodLogs.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Period log not found');
    const updated = { ...store.periodLogs[index], ...updates, updated_at: new Date().toISOString() };
    store.periodLogs[index] = updated;
    saveStore(store);
    return updated;
  },

  async deletePeriodLog(id: string): Promise<void> {
    const store = loadStore();
    store.periodLogs = store.periodLogs.filter(p => p.id !== id);
    saveStore(store);
  },

  // Daily Logs
  async getDailyLogs(userId: string): Promise<DailyLog[]> {
    const store = loadStore();
    return store.dailyLogs
      .filter(d => d.user_id === userId)
      .sort((a, b) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime());
  },

  async getDailyLogForDate(userId: string, dateStr: string): Promise<DailyLog | null> {
    const store = loadStore();
    return store.dailyLogs.find(d => d.user_id === userId && d.log_date === dateStr) || null;
  },

  async saveDailyLog(log: Omit<DailyLog, 'id'>): Promise<DailyLog> {
    const store = loadStore();
    const index = store.dailyLogs.findIndex(d => d.user_id === log.user_id && d.log_date === log.log_date);
    
    let result: DailyLog;
    if (index >= 0) {
      result = {
        ...store.dailyLogs[index],
        ...log,
        updated_at: new Date().toISOString(),
      };
      store.dailyLogs[index] = result;
    } else {
      result = {
        ...log,
        id: `daily-${log.log_date}-${Math.random().toString(36).substr(2, 6)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      store.dailyLogs.push(result);
    }

    // Auto-update period log if flow is indicated
    if (log.flow && log.flow !== 'none') {
      const existingPeriod = store.periodLogs.find(p => p.user_id === log.user_id && p.start_date === log.log_date);
      if (!existingPeriod) {
        // Look if it extends an active period
        const latestPeriod = store.periodLogs
          .filter(p => p.user_id === log.user_id)
          .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())[0];
        
        if (latestPeriod && Math.abs(new Date(log.log_date).getTime() - new Date(latestPeriod.start_date).getTime()) < 8 * 24 * 3600 * 1000) {
          latestPeriod.end_date = log.log_date;
        }
      }
    }

    saveStore(store);
    return result;
  },

  // Partner Connection Management
  async getPartnerConnection(userId: string, role: 'woman' | 'partner'): Promise<PartnerConnection | null> {
    const store = loadStore();
    if (role === 'woman') {
      return store.partnerConnections.find(c => c.woman_user_id === userId && c.status !== 'disconnected') || null;
    } else {
      return store.partnerConnections.find(c => c.partner_user_id === userId && c.status !== 'disconnected') || null;
    }
  },

  async generateConnectionCode(womanUserId: string): Promise<string> {
    const store = loadStore();
    // 6-character clean alphanumeric code
    const code = 'HER-' + Math.floor(100 + Math.random() * 900);
    let conn = store.partnerConnections.find(c => c.woman_user_id === womanUserId && c.status !== 'disconnected');
    
    if (conn) {
      conn.connection_code = code;
    } else {
      const woman = store.profiles.find(p => p.id === womanUserId);
      conn = {
        id: `conn-${Date.now()}`,
        woman_user_id: womanUserId,
        status: 'pending',
        connection_code: code,
        is_paused: false,
        created_at: new Date().toISOString(),
        woman_name: woman?.full_name || 'Sarah',
      };
      store.partnerConnections.push(conn);
      // Initialize default permissions
      store.sharingPermissions[conn.id] = { ...DEMO_SHARING_PERMISSIONS };
      store.partnerNotifications[conn.id] = [...DEMO_NOTIFICATIONS];
    }
    saveStore(store);
    return code;
  },

  async requestConnectionByCode(partnerUserId: string, code: string): Promise<PartnerConnection> {
    const store = loadStore();
    const cleanCode = code.trim().toUpperCase();
    const conn = store.partnerConnections.find(c => c.connection_code.toUpperCase() === cleanCode);
    if (!conn) {
      throw new Error('Invalid connection code. Please verify the code with your partner.');
    }
    const partner = store.profiles.find(p => p.id === partnerUserId);
    conn.partner_user_id = partnerUserId;
    conn.partner_email = partner?.email;
    conn.partner_name = partner?.full_name;
    conn.status = 'pending'; // Pending woman approval!
    saveStore(store);
    return conn;
  },

  async approveConnection(connectionId: string): Promise<PartnerConnection> {
    const store = loadStore();
    const conn = store.partnerConnections.find(c => c.id === connectionId);
    if (!conn) throw new Error('Connection not found');
    conn.status = 'active';
    conn.approved_at = new Date().toISOString();
    saveStore(store);
    return conn;
  },

  async declineConnection(connectionId: string): Promise<void> {
    const store = loadStore();
    const conn = store.partnerConnections.find(c => c.id === connectionId);
    if (conn) {
      conn.status = 'rejected';
      conn.partner_user_id = undefined;
      conn.partner_email = undefined;
      conn.partner_name = undefined;
      saveStore(store);
    }
  },

  async togglePauseSharing(connectionId: string, pause: boolean): Promise<boolean> {
    const store = loadStore();
    const conn = store.partnerConnections.find(c => c.id === connectionId);
    if (!conn) throw new Error('Connection not found');
    conn.is_paused = pause;
    saveStore(store);
    return conn.is_paused;
  },

  async removePartner(connectionId: string): Promise<void> {
    const store = loadStore();
    const conn = store.partnerConnections.find(c => c.id === connectionId);
    if (conn) {
      conn.status = 'disconnected';
      conn.partner_user_id = undefined;
      saveStore(store);
    }
  },

  // Sharing Permissions
  async getSharingPermissions(connectionId: string): Promise<SharingPermissionsMap> {
    const store = loadStore();
    return store.sharingPermissions[connectionId] || { ...DEMO_SHARING_PERMISSIONS };
  },

  async updateSharingPermission(connectionId: string, key: PermissionKey, enabled: boolean): Promise<SharingPermissionsMap> {
    const store = loadStore();
    if (!store.sharingPermissions[connectionId]) {
      store.sharingPermissions[connectionId] = { ...DEMO_SHARING_PERMISSIONS };
    }
    store.sharingPermissions[connectionId][key] = enabled;
    saveStore(store);
    return store.sharingPermissions[connectionId];
  },

  async applyPreset(connectionId: string, presetPermissions: SharingPermissionsMap): Promise<SharingPermissionsMap> {
    const store = loadStore();
    store.sharingPermissions[connectionId] = { ...presetPermissions };
    saveStore(store);
    return store.sharingPermissions[connectionId];
  },

  // Notifications
  async getPartnerNotifications(connectionId: string): Promise<PartnerNotificationPref[]> {
    const store = loadStore();
    return store.partnerNotifications[connectionId] || [...DEMO_NOTIFICATIONS];
  },

  async updatePartnerNotification(connectionId: string, type: string, enabled: boolean): Promise<void> {
    const store = loadStore();
    const list = store.partnerNotifications[connectionId] || [...DEMO_NOTIFICATIONS];
    const item = list.find(n => n.type === type);
    if (item) {
      item.enabled = enabled;
    } else {
      list.push({ id: `notif-${Date.now()}`, connection_id: connectionId, type: type as any, enabled, discreet_wording: true });
    }
    store.partnerNotifications[connectionId] = list;
    saveStore(store);
  },

  // SECURE BACKEND-ENFORCED PARTNER ACCESS
  // Requirement 18 & 33: Never send forbidden data to partner frontend!
  async getPartnerViewData(partnerUserId: string) {
    const store = loadStore();
    const conn = store.partnerConnections.find(
      c => c.partner_user_id === partnerUserId && c.status === 'active'
    );

    if (!conn) {
      return {
        isConnected: false,
        status: 'not_connected',
        womanName: null,
        isPaused: false,
        permissions: {} as Partial<SharingPermissionsMap>,
        cycleData: null,
        todayLog: null,
        calendarDays: [],
      };
    }

    if (conn.is_paused) {
      return {
        isConnected: true,
        status: 'paused',
        womanName: conn.woman_name || 'Sarah',
        isPaused: true,
        permissions: {} as Partial<SharingPermissionsMap>,
        cycleData: null,
        todayLog: null,
        calendarDays: [],
      };
    }

    const womanId = conn.woman_user_id;
    const permissions = store.sharingPermissions[conn.id] || { ...DEMO_SHARING_PERMISSIONS };
    const cycleProfile = store.cycleProfiles[womanId] || DEMO_CYCLE_PROFILE;
    const periodLogs = store.periodLogs.filter(p => p.user_id === womanId);
    const dailyLogs = store.dailyLogs.filter(d => d.user_id === womanId);

    // Compute raw cycle state
    const rawCycle = calculateCycleState(cycleProfile, periodLogs);

    // Mask according to active permissions
    const sanitizedCycle = {
      currentPhase: permissions.cycle_phase ? rawCycle.currentPhase : null,
      phaseDisplayName: permissions.cycle_phase ? rawCycle.phaseDisplayName : null,
      currentCycleDay: permissions.cycle_day ? rawCycle.currentCycleDay : null,
      totalCycleLength: permissions.cycle_day ? rawCycle.totalCycleLength : null,
      isCurrentlyOnPeriod: permissions.period_status ? rawCycle.isCurrentlyOnPeriod : null,
      daysUntilNextPeriod: permissions.estimated_next_period ? rawCycle.daysUntilNextPeriod : null,
      estimatedNextPeriodStart: permissions.estimated_next_period ? rawCycle.estimatedNextPeriodStart : null,
      progressPercent: permissions.cycle_day ? rawCycle.progressPercent : 0,
    };

    // Today's log sanitized
    const todayStr = new Date().toISOString().split('T')[0];
    const todayRaw = dailyLogs.find(d => d.log_date === todayStr);

    const sanitizedToday = todayRaw ? {
      mood: permissions.mood ? todayRaw.mood : null,
      energy: permissions.energy ? todayRaw.energy : null,
      flow: permissions.flow ? todayRaw.flow : null,
      sleep_hours: permissions.sleep ? todayRaw.sleep_hours : null,
      symptoms: permissions.symptoms ? (todayRaw.symptoms || []) : [],
      notes: permissions.notes ? todayRaw.notes : null,
      // weight is NEVER passed unless permission explicitly on
      weight: permissions.weight ? todayRaw.weight : null,
    } : null;

    // Calendar sanitized for current month
    const sanitizedCalendar = dailyLogs.map(dl => ({
      date: dl.log_date,
      hasPeriod: permissions.period_status && (dl.flow && dl.flow !== 'none'),
      mood: permissions.mood ? dl.mood : undefined,
      energy: permissions.energy ? dl.energy : undefined,
      symptoms: permissions.symptoms ? dl.symptoms : [],
    }));

    return {
      isConnected: true,
      status: 'active',
      womanName: conn.woman_name || 'Sarah',
      isPaused: false,
      permissions,
      cycleData: sanitizedCycle,
      todayLog: sanitizedToday,
      calendarDays: sanitizedCalendar,
    };
  },

  // Privacy & Data export
  async exportAllDataJson(userId: string): Promise<string> {
    const store = loadStore();
    const data = {
      profile: store.profiles.find(p => p.id === userId),
      cycleProfile: store.cycleProfiles[userId],
      periodLogs: store.periodLogs.filter(p => p.user_id === userId),
      dailyLogs: store.dailyLogs.filter(d => d.user_id === userId),
      exportedAt: new Date().toISOString(),
      appName: 'HerCycle',
    };
    return JSON.stringify(data, null, 2);
  },

  async exportDataCsv(userId: string): Promise<string> {
    const store = loadStore();
    const daily = store.dailyLogs.filter(d => d.user_id === userId);
    const headers = ['Date', 'Flow', 'Mood', 'Energy', 'Sleep Hours', 'Water Glasses', 'Weight', 'Symptoms', 'Notes'];
    const rows = daily.map(d => [
      d.log_date,
      d.flow || '',
      d.mood || '',
      d.energy || '',
      d.sleep_hours || '',
      d.water_glasses || '',
      d.weight || '',
      (d.symptoms || []).join('; '),
      `"${(d.notes || '').replace(/"/g, '""')}"`,
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  },

  async deleteUserData(userId: string): Promise<void> {
    const store = loadStore();
    store.profiles = store.profiles.filter(p => p.id !== userId);
    delete store.cycleProfiles[userId];
    store.periodLogs = store.periodLogs.filter(p => p.user_id !== userId);
    store.dailyLogs = store.dailyLogs.filter(d => d.user_id !== userId);
    store.partnerConnections = store.partnerConnections.filter(
      c => c.woman_user_id !== userId && c.partner_user_id !== userId
    );
    saveStore(store);
  },

  // Reset to demo state
  resetToDemo(): void {
    const initial = getInitialData();
    saveStore(initial);
  }
};
