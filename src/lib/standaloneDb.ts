import { 
  UserProfile, 
  CycleProfile, 
  PeriodLog, 
  DailyLog, 
  PartnerLink,
  PartnerConnection,
  PartnerConnectionCode,
  PartnerCode,
  SharingPermissionsMap, 
  PermissionKey,
  AppNotification
} from '../types/database';
import { calculateCycleState } from './cycleCalculator';
import { 
  generateSixDigitCode, 
  hashPartnerCode, 
  normalizePartnerCode 
} from './codeUtils';

// Local storage keys aligned with normalized PostgreSQL tables
const USERS_KEY = 'hercycle_standalone_users';
const SESSIONS_KEY = 'hercycle_standalone_sessions';
const CYCLE_PROFILES_KEY = 'hercycle_standalone_cycle_profiles';
const PERIOD_LOGS_KEY = 'hercycle_standalone_period_logs';
const DAILY_LOGS_KEY = 'hercycle_standalone_daily_logs';
const PARTNER_CODES_KEY = 'hercycle_standalone_partner_connection_codes';
const PARTNER_CONNECTIONS_KEY = 'hercycle_standalone_partner_connections';
const SHARING_PERMS_KEY = 'hercycle_standalone_sharing_permissions';
const NOTIFICATIONS_KEY = 'hercycle_standalone_notifications';
const CODE_ATTEMPTS_KEY = 'hercycle_standalone_code_attempts';
const DEMO_SEEDED_KEY = 'hercycle_demo_v2_seeded';

function load<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function save<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.error('Storage error:', err);
  }
}

export interface StandaloneUserRecord extends UserProfile {
  password_hash: string;
}

// Default sharing permissions (safe by default: notes & weight are OFF)
export const DEFAULT_SHARING_PERMISSIONS: SharingPermissionsMap = {
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

export const standaloneDb = {
  initDemoData(): void {
    // Production clean mode: no demo data is seeded
    return;
  },
  _unusedDemoSeed(): void {

    const womanId = 'usr_demo_woman_01';
    const partnerId = 'usr_demo_partner_02';

    // 1. Seed Demo Woman
    const demoWoman: StandaloneUserRecord = {
      id: womanId,
      email: 'demo.woman@hercycle.app',
      full_name: 'Sarah Miller',
      role: 'woman',
      age: 26,
      avatar_url: '/assets/woman-portrait.png',
      password_hash: 'Demo@12345',
      created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 2. Seed Demo Partner
    const demoPartner: StandaloneUserRecord = {
      id: partnerId,
      email: 'demo.partner@hercycle.app',
      full_name: 'Alex Rivera',
      role: 'partner',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      password_hash: 'Demo@12345',
      created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    };

    const users = load<StandaloneUserRecord[]>(USERS_KEY, []);
    if (!users.some(u => u.email === demoWoman.email)) users.push(demoWoman);
    if (!users.some(u => u.email === demoPartner.email)) users.push(demoPartner);
    save(USERS_KEY, users);

    // 3. Seed Cycle Profile for Sarah (28 day cycle, 5 day period, Day 12 of cycle today)
    const now = new Date();
    const lastPeriodDate = new Date(now);
    lastPeriodDate.setDate(now.getDate() - 11); // Day 12 today!
    const lastPeriodStr = lastPeriodDate.toISOString().split('T')[0];

    const cycleProfiles = load<Record<string, CycleProfile>>(CYCLE_PROFILES_KEY, {});
    cycleProfiles[womanId] = {
      user_id: womanId,
      average_cycle_length: 28,
      average_period_length: 5,
      last_period_start: lastPeriodStr,
      goals: ['Cycle tracking', 'Understanding my symptoms', 'Wellness tracking'],
      created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    };
    save(CYCLE_PROFILES_KEY, cycleProfiles);

    // 4. Seed Period Logs (Past 3 cycles)
    const periods: PeriodLog[] = load<PeriodLog[]>(PERIOD_LOGS_KEY, []);
    const p1Date = new Date(lastPeriodDate);
    const p1End = new Date(p1Date);
    p1End.setDate(p1Date.getDate() + 4);

    const p2Date = new Date(p1Date);
    p2Date.setDate(p1Date.getDate() - 28);
    const p2End = new Date(p2Date);
    p2End.setDate(p2Date.getDate() + 4);

    const p3Date = new Date(p2Date);
    p3Date.setDate(p2Date.getDate() - 28);
    const p3End = new Date(p3Date);
    p3End.setDate(p3Date.getDate() + 5);

    periods.push(
      {
        id: 'p_log_01',
        user_id: womanId,
        start_date: p1Date.toISOString().split('T')[0],
        end_date: p1End.toISOString().split('T')[0],
        flow: 'medium',
        notes: 'Mild cramping first day, regular flow',
        created_at: p1Date.toISOString(),
      },
      {
        id: 'p_log_02',
        user_id: womanId,
        start_date: p2Date.toISOString().split('T')[0],
        end_date: p2End.toISOString().split('T')[0],
        flow: 'medium',
        notes: 'Good energy post cycle',
        created_at: p2Date.toISOString(),
      },
      {
        id: 'p_log_03',
        user_id: womanId,
        start_date: p3Date.toISOString().split('T')[0],
        end_date: p3End.toISOString().split('T')[0],
        flow: 'heavy',
        notes: 'Warm herbal tea helped with lower back tension',
        created_at: p3Date.toISOString(),
      }
    );
    save(PERIOD_LOGS_KEY, periods);

    // 5. Seed Daily Logs (Today and past few days)
    const dailies: DailyLog[] = load<DailyLog[]>(DAILY_LOGS_KEY, []);
    const todayStr = now.toISOString().split('T')[0];
    dailies.push({
      id: 'd_log_today',
      user_id: womanId,
      log_date: todayStr,
      mood: 'good',
      energy: 'high',
      sleep_hours: 8,
      water_glasses: 6,
      weight: 58.5,
      notes: 'Morning yoga felt refreshing. High focus today.',
      symptoms: ['High Energy', 'Mental Clarity'],
      created_at: now.toISOString(),
    });

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    dailies.push({
      id: 'd_log_yesterday',
      user_id: womanId,
      log_date: yesterday.toISOString().split('T')[0],
      mood: 'great',
      energy: 'high',
      sleep_hours: 7.5,
      water_glasses: 7,
      symptoms: ['Energetic'],
      created_at: yesterday.toISOString(),
    });
    save(DAILY_LOGS_KEY, dailies);

    // 6. Connect Demo Woman and Demo Partner
    const connectionId = 'conn_demo_sarah_alex';
    const connections: PartnerConnection[] = load<PartnerConnection[]>(PARTNER_CONNECTIONS_KEY, []);
    connections.push({
      id: connectionId,
      woman_user_id: womanId,
      partner_user_id: partnerId,
      status: 'approved',
      approved_at: new Date(Date.now() - 14 * 86400000).toISOString(),
      created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    });
    save(PARTNER_CONNECTIONS_KEY, connections);

    // 7. Seed Sharing Permissions
    const perms = load<Record<string, SharingPermissionsMap>>(SHARING_PERMS_KEY, {});
    perms[connectionId] = {
      ...DEFAULT_SHARING_PERMISSIONS,
      cycle_phase: true,
      cycle_day: true,
      period_status: true,
      estimated_next_period: true,
      mood: true,
      energy: true,
      symptoms: false,
      flow: false,
      sleep: true,
      notes: false,
      weight: false,
    };
    save(SHARING_PERMS_KEY, perms);

    localStorage.setItem(DEMO_SEEDED_KEY, 'true');
  },

  // 1. Profiles & Users
  getUsers(): StandaloneUserRecord[] {
    this.initDemoData();
    return load<StandaloneUserRecord[]>(USERS_KEY, []);
  },

  findUserByEmail(email: string): StandaloneUserRecord | null {
    const users = this.getUsers();
    const clean = email.trim().toLowerCase();
    return users.find(u => u.email.toLowerCase() === clean) || null;
  },

  findUserById(id: string): StandaloneUserRecord | null {
    const users = this.getUsers();
    return users.find(u => u.id === id) || null;
  },

  saveUser(user: StandaloneUserRecord): void {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      users[idx] = { ...user, updated_at: new Date().toISOString() };
    } else {
      users.push(user);
    }
    save(USERS_KEY, users);
  },

  async getProfile(userId: string): Promise<UserProfile | null> {
    const u = this.findUserById(userId);
    if (!u) return null;
    const { password_hash: _pass, ...profile } = u;
    return profile;
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const u = this.findUserById(userId);
    if (!u) throw new Error('User not found');
    const safeUpdates = { ...updates };
    delete safeUpdates.role; // immutable role
    delete safeUpdates.id;
    const updated: StandaloneUserRecord = {
      ...u,
      ...safeUpdates,
      updated_at: new Date().toISOString(),
    };
    this.saveUser(updated);
    const { password_hash: _pass, ...profile } = updated;
    return profile;
  },

  async updatePassword(userId: string, currentPass: string, newPass: string): Promise<void> {
    const u = this.findUserById(userId);
    if (!u) throw new Error('User not found');
    if (u.password_hash !== currentPass) {
      throw new Error('Current password is incorrect. Please verify and try again.');
    }
    if (!newPass || newPass.length < 8) {
      throw new Error('New password must be at least 8 characters long.');
    }
    u.password_hash = newPass;
    u.updated_at = new Date().toISOString();
    this.saveUser(u);
  },

  // 2. Active Session Enforcement
  async upsertActiveSession(userId: string, sessionId: string, device?: string): Promise<void> {
    const sessions = load<Record<string, { session_id: string; device?: string; updated_at: string }>>(SESSIONS_KEY, {});
    sessions[userId] = {
      session_id: sessionId,
      device: device || (typeof navigator !== 'undefined' ? navigator.userAgent : 'device'),
      updated_at: new Date().toISOString(),
    };
    save(SESSIONS_KEY, sessions);
  },

  async getActiveSession(userId: string): Promise<string | null> {
    const sessions = load<Record<string, { session_id: string; device?: string; updated_at: string }>>(SESSIONS_KEY, {});
    return sessions[userId]?.session_id || null;
  },

  // 3. Cycle Profile
  async getCycleProfile(userId: string): Promise<CycleProfile | null> {
    this.initDemoData();
    const profiles = load<Record<string, CycleProfile>>(CYCLE_PROFILES_KEY, {});
    return profiles[userId] || null;
  },

  async updateCycleProfile(userId: string, updates: Partial<CycleProfile>): Promise<CycleProfile> {
    const profiles = load<Record<string, CycleProfile>>(CYCLE_PROFILES_KEY, {});
    const existing = profiles[userId] || {
      user_id: userId,
      average_cycle_length: 28,
      average_period_length: 5,
      last_period_start: null,
      goals: ['Cycle tracking'],
    };
    const updated = {
      ...existing,
      ...updates,
      user_id: userId,
      updated_at: new Date().toISOString(),
    };
    profiles[userId] = updated;
    save(CYCLE_PROFILES_KEY, profiles);
    return updated;
  },

  // 4. Period Logs
  async getPeriodLogs(userId: string): Promise<PeriodLog[]> {
    this.initDemoData();
    const logs = load<PeriodLog[]>(PERIOD_LOGS_KEY, []);
    return logs
      .filter(l => l.user_id === userId)
      .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
  },

  async savePeriodLog(log: Omit<PeriodLog, 'id' | 'created_at'> & { id?: string }): Promise<PeriodLog> {
    const logs = load<PeriodLog[]>(PERIOD_LOGS_KEY, []);
    const newLog: PeriodLog = {
      id: log.id || `period_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: log.user_id,
      start_date: log.start_date,
      end_date: log.end_date || null,
      flow: log.flow || 'medium',
      notes: log.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const existingIdx = logs.findIndex(l => l.id === newLog.id);
    if (existingIdx >= 0) {
      logs[existingIdx] = { ...logs[existingIdx], ...newLog };
    } else {
      logs.push(newLog);
    }
    save(PERIOD_LOGS_KEY, logs);

    // Update cycle profile's last_period_start if this is the newest period
    const userPeriods = logs
      .filter(l => l.user_id === log.user_id)
      .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
    if (userPeriods.length > 0) {
      await this.updateCycleProfile(log.user_id, {
        last_period_start: userPeriods[0].start_date,
      });
    }

    return newLog;
  },

  async deletePeriodLog(id: string): Promise<void> {
    const logs = load<PeriodLog[]>(PERIOD_LOGS_KEY, []);
    const filtered = logs.filter(l => l.id !== id);
    save(PERIOD_LOGS_KEY, filtered);
  },

  // 5. Daily Health Logs
  async getDailyLogs(userId: string, limit = 90): Promise<DailyLog[]> {
    this.initDemoData();
    const logs = load<DailyLog[]>(DAILY_LOGS_KEY, []);
    return logs
      .filter(l => l.user_id === userId)
      .sort((a, b) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime())
      .slice(0, limit);
  },

  async saveDailyLog(log: Omit<DailyLog, 'id' | 'created_at'> & { id?: string }): Promise<DailyLog> {
    const logs = load<DailyLog[]>(DAILY_LOGS_KEY, []);
    const existingIdx = logs.findIndex(l => l.user_id === log.user_id && l.log_date === log.log_date);

    const newLog: DailyLog = {
      id: log.id || (existingIdx >= 0 ? logs[existingIdx].id : `daily_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`),
      user_id: log.user_id,
      log_date: log.log_date,
      flow: log.flow || 'none',
      mood: log.mood || 'okay',
      energy: log.energy || 'medium',
      sleep_hours: log.sleep_hours || 7,
      water_glasses: log.water_glasses || 4,
      weight: log.weight || null,
      notes: log.notes || null,
      symptoms: log.symptoms || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      logs[existingIdx] = { ...logs[existingIdx], ...newLog };
    } else {
      logs.push(newLog);
    }
    save(DAILY_LOGS_KEY, logs);
    return newLog;
  },

  // 6. Partner Connection System (6-digit numeric codes with 15-minute expiration)
  async getActivePartnerCode(womanId: string): Promise<PartnerCode | null> {
    const codes = load<PartnerConnectionCode[]>(PARTNER_CODES_KEY, []);
    const now = Date.now();
    const active = codes.find(c => 
      c.woman_user_id === womanId && 
      !c.used_at && 
      new Date(c.expires_at).getTime() > now
    );

    if (!active) return null;
    return {
      code: active.code_display || '739214',
      woman_id: active.woman_user_id,
      expires_at: active.expires_at,
      used: false,
      created_at: active.created_at,
    };
  },

  async generatePartnerCode(womanId: string): Promise<string> {
    const woman = this.findUserById(womanId);
    if (!woman || woman.role !== 'woman') {
      throw new Error('Only woman accounts can generate partner connection codes.');
    }

    // Invalidate any previous unused codes for this woman
    const codes = load<PartnerConnectionCode[]>(PARTNER_CODES_KEY, []);
    for (const c of codes) {
      if (c.woman_user_id === womanId && !c.used_at) {
        c.used_at = new Date().toISOString();
      }
    }

    // Generate random 6-digit numeric code (e.g. 739214)
    const rawCode = generateSixDigitCode();
    const codeHash = await hashPartnerCode(rawCode);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes expiration

    const newRecord: PartnerConnectionCode = {
      id: `code_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      woman_user_id: womanId,
      code_hash: codeHash,
      code_display: rawCode,
      expires_at: expiresAt,
      created_at: new Date().toISOString(),
    };

    codes.push(newRecord);
    save(PARTNER_CODES_KEY, codes);
    return rawCode;
  },

  async redeemPartnerCode(partnerId: string, inputCode: string): Promise<{ success: boolean; link_id: string; status: string }> {
    const partner = this.findUserById(partnerId);
    if (!partner || partner.role !== 'partner') {
      throw new Error('Only authenticated partner accounts can enter a connection code.');
    }

    const cleanInput = normalizePartnerCode(inputCode);
    if (!cleanInput) {
      throw new Error('Please enter the 6-digit code provided by your partner.');
    }

    // Rate limiting: max 5 failed attempts per 15 minutes
    const attempts = load<{ partner_id: string; time: number }[]>(CODE_ATTEMPTS_KEY, []);
    const now = Date.now();
    const recent = attempts.filter(a => a.partner_id === partnerId && (now - a.time) < 15 * 60 * 1000);
    if (recent.length >= 5) {
      throw new Error('Too many failed attempts. Please wait 15 minutes before trying again.');
    }

    const inputHash = await hashPartnerCode(cleanInput);
    const codes = load<PartnerConnectionCode[]>(PARTNER_CODES_KEY, []);

    // Match code by hash OR plain display code
    const record = codes.find(c => 
      c.code_hash === inputHash || 
      (c.code_display && normalizePartnerCode(c.code_display) === cleanInput)
    );

    if (!record) {
      attempts.push({ partner_id: partnerId, time: now });
      save(CODE_ATTEMPTS_KEY, attempts);
      throw new Error("That connection code isn't valid. Please check the code and try again.");
    }

    // Check expiration
    if (new Date(record.expires_at).getTime() <= now) {
      attempts.push({ partner_id: partnerId, time: now });
      save(CODE_ATTEMPTS_KEY, attempts);
      throw new Error("This connection code has expired. Ask your partner to generate a new one.");
    }

    // Check single-use
    if (record.used_at) {
      attempts.push({ partner_id: partnerId, time: now });
      save(CODE_ATTEMPTS_KEY, attempts);
      throw new Error("This connection code has already been used.");
    }

    // Self-linking prevention
    if (record.woman_user_id === partnerId) {
      throw new Error("You can't connect your account to your own account.");
    }

    const connections = load<PartnerConnection[]>(PARTNER_CONNECTIONS_KEY, []);

    // Check conflicting active approved connections
    if (connections.some(c => c.partner_user_id === partnerId && c.status === 'approved')) {
      throw new Error("Your accounts are already connected.");
    }
    if (connections.some(c => c.partner_user_id === partnerId && c.status === 'pending')) {
      throw new Error("A connection request is already waiting for approval.");
    }
    if (connections.some(c => c.woman_user_id === record.woman_user_id && c.status === 'approved')) {
      throw new Error("This woman's account is already connected to a partner.");
    }

    // Mark code as used immediately
    record.used_at = new Date().toISOString();
    save(PARTNER_CODES_KEY, codes);

    // Create pending connection
    const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newConn: PartnerConnection = {
      id: connectionId,
      woman_user_id: record.woman_user_id,
      partner_user_id: partnerId,
      status: 'pending', // PENDING woman approval
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Filter out any stale pending connection for this pair
    const cleanConnections = connections.filter(c => !(c.woman_user_id === record.woman_user_id && c.partner_user_id === partnerId));
    cleanConnections.push(newConn);
    save(PARTNER_CONNECTIONS_KEY, cleanConnections);

    // Send notification to the woman
    await this.createNotification({
      user_id: record.woman_user_id,
      type: 'partner_request',
      title: 'Partner Connection Request',
      body: `${partner.full_name} (${partner.email}) entered your invite code and wants to connect.`,
    });

    return {
      success: true,
      link_id: connectionId,
      status: 'pending',
    };
  },

  async redeemAndCreatePartner(
    inputCode: string,
    fullName?: string,
    email?: string,
    password?: string
  ): Promise<{ profile: UserProfile; linkId: string }> {
    const cleanInput = normalizePartnerCode(inputCode);
    const codes = load<PartnerConnectionCode[]>(PARTNER_CODES_KEY, []);
    const inputHash = await hashPartnerCode(cleanInput);

    const record = codes.find(c => 
      c.code_hash === inputHash || 
      (c.code_display && normalizePartnerCode(c.code_display) === cleanInput)
    );

    if (!record) {
      throw new Error("That connection code isn't valid. Please check the code and try again.");
    }

    const now = Date.now();
    if (new Date(record.expires_at).getTime() <= now) {
      throw new Error('This connection code has expired. Please ask your partner to tap "Generate New Code".');
    }

    if (record.used_at) {
      throw new Error('This code has already been used.');
    }

    // Check or create partner user
    const users = this.getUsers();
    const partnerEmail = (email && email.trim()) 
      ? email.trim().toLowerCase() 
      : `partner_${Date.now().toString(36)}@hercycle.app`;

    let partnerUser = users.find(u => u.email.toLowerCase() === partnerEmail);
    if (!partnerUser) {
      partnerUser = {
        id: `usr_partner_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        email: partnerEmail,
        full_name: fullName?.trim() || 'Partner',
        role: 'partner',
        password_hash: password || 'Demo@12345',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      users.push(partnerUser);
      save(USERS_KEY, users);
    }

    if (record.woman_user_id === partnerUser.id) {
      throw new Error('You cannot connect your account to itself.');
    }

    // Mark code used
    record.used_at = new Date().toISOString();
    save(PARTNER_CODES_KEY, codes);

    // Create approved or pending connection
    const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newConn: PartnerConnection = {
      id: connectionId,
      woman_user_id: record.woman_user_id,
      partner_user_id: partnerUser.id,
      status: 'approved', // Direct code flow approves connection
      approved_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const connections = load<PartnerConnection[]>(PARTNER_CONNECTIONS_KEY, []).filter(c => 
      !(c.woman_user_id === record.woman_user_id && c.partner_user_id === partnerUser!.id)
    );
    connections.push(newConn);
    save(PARTNER_CONNECTIONS_KEY, connections);

    // Initialize default permissions
    const perms = load<Record<string, SharingPermissionsMap>>(SHARING_PERMS_KEY, {});
    perms[connectionId] = { ...DEFAULT_SHARING_PERMISSIONS };
    save(SHARING_PERMS_KEY, perms);

    const { password_hash: _p, ...profile } = partnerUser;
    return { profile, linkId: connectionId };
  },

  // 7. Partner Connections & Approval Flow
  async getPartnerConnection(userId: string, role: 'woman' | 'partner'): Promise<PartnerConnection | null> {
    this.initDemoData();
    const connections = load<PartnerConnection[]>(PARTNER_CONNECTIONS_KEY, []);
    const conn = role === 'woman'
      ? connections.find(c => c.woman_user_id === userId && (c.status === 'approved' || c.status === 'pending'))
      : connections.find(c => c.partner_user_id === userId && (c.status === 'approved' || c.status === 'pending'));

    if (!conn) return null;

    const woman = this.findUserById(conn.woman_user_id);
    const partner = this.findUserById(conn.partner_user_id);

    return {
      ...conn,
      woman_name: woman?.full_name,
      woman_avatar_url: woman?.avatar_url || '/assets/woman-portrait.png',
      woman_email: woman?.email,
      partner_name: partner?.full_name,
      partner_avatar_url: partner?.avatar_url,
      partner_email: partner?.email,
      is_paused: conn.status === 'paused',
    };
  },

  // Backwards compatibility alias for getPartnerLink
  async getPartnerLink(userId: string, role: 'woman' | 'partner'): Promise<PartnerLink | null> {
    const conn = await this.getPartnerConnection(userId, role);
    if (!conn) return null;
    return {
      ...conn,
      woman_id: conn.woman_user_id,
      partner_id: conn.partner_user_id,
      is_paused: conn.status === 'paused',
    };
  },

  async approvePartnerConnection(connectionId: string, womanUserId: string): Promise<void> {
    const connections = load<PartnerConnection[]>(PARTNER_CONNECTIONS_KEY, []);
    const conn = connections.find(c => c.id === connectionId);
    if (!conn) throw new Error('Connection request not found.');
    if (conn.woman_user_id !== womanUserId) throw new Error('Unauthorized to approve this connection.');

    conn.status = 'approved';
    conn.approved_at = new Date().toISOString();
    conn.updated_at = new Date().toISOString();
    save(PARTNER_CONNECTIONS_KEY, connections);

    // Initialize default sharing permissions
    const perms = load<Record<string, SharingPermissionsMap>>(SHARING_PERMS_KEY, {});
    perms[connectionId] = perms[connectionId] || { ...DEFAULT_SHARING_PERMISSIONS };
    save(SHARING_PERMS_KEY, perms);

    // Notify partner
    await this.createNotification({
      user_id: conn.partner_user_id,
      type: 'partner_approved',
      title: 'Connection Approved! 🎉',
      body: 'Your partner has approved your connection request. You can now view her shared cycle sanctuary.',
    });
  },

  async declinePartnerConnection(connectionId: string, womanUserId: string): Promise<void> {
    const connections = load<PartnerConnection[]>(PARTNER_CONNECTIONS_KEY, []);
    const conn = connections.find(c => c.id === connectionId);
    if (!conn) throw new Error('Connection request not found.');
    if (conn.woman_user_id !== womanUserId) throw new Error('Unauthorized to decline this connection.');

    conn.status = 'declined';
    conn.updated_at = new Date().toISOString();
    save(PARTNER_CONNECTIONS_KEY, connections);

    await this.createNotification({
      user_id: conn.partner_user_id,
      type: 'partner_declined',
      title: 'Connection Request Declined',
      body: 'The partner connection request was declined.',
    });
  },

  async togglePausePartner(connectionId: string, isPaused: boolean): Promise<void> {
    const connections = load<PartnerConnection[]>(PARTNER_CONNECTIONS_KEY, []);
    const conn = connections.find(c => c.id === connectionId);
    if (!conn) throw new Error('Connection not found.');
    conn.status = isPaused ? 'paused' : 'approved';
    conn.updated_at = new Date().toISOString();
    save(PARTNER_CONNECTIONS_KEY, connections);
  },

  async disconnectPartner(connectionId: string): Promise<void> {
    const connections = load<PartnerConnection[]>(PARTNER_CONNECTIONS_KEY, []);
    const filtered = connections.filter(c => c.id !== connectionId);
    save(PARTNER_CONNECTIONS_KEY, filtered);
  },

  async getPendingPartnerRequests(womanUserId: string): Promise<PartnerConnection[]> {
    const connections = load<PartnerConnection[]>(PARTNER_CONNECTIONS_KEY, []);
    return connections
      .filter(c => c.woman_user_id === womanUserId && c.status === 'pending')
      .map(c => {
        const partner = this.findUserById(c.partner_user_id);
        return {
          ...c,
          partner_name: partner?.full_name,
          partner_email: partner?.email,
          partner_avatar_url: partner?.avatar_url,
        };
      });
  },

  // Compatibility aliases
  async approvePartnerLink(linkId: string): Promise<void> {
    const connections = load<PartnerConnection[]>(PARTNER_CONNECTIONS_KEY, []);
    const conn = connections.find(c => c.id === linkId);
    if (conn) await this.approvePartnerConnection(linkId, conn.woman_user_id);
  },

  async declinePartnerLink(linkId: string): Promise<void> {
    const connections = load<PartnerConnection[]>(PARTNER_CONNECTIONS_KEY, []);
    const conn = connections.find(c => c.id === linkId);
    if (conn) await this.declinePartnerConnection(linkId, conn.woman_user_id);
  },

  async togglePausePartnerLink(linkId: string, isPaused: boolean): Promise<void> {
    await this.togglePausePartner(linkId, isPaused);
  },

  async deletePartnerLink(linkId: string): Promise<void> {
    await this.disconnectPartner(linkId);
  },

  // 8. Sharing Permissions
  async getSharingPermissions(connectionId: string): Promise<SharingPermissionsMap> {
    const perms = load<Record<string, SharingPermissionsMap>>(SHARING_PERMS_KEY, {});
    return perms[connectionId] || { ...DEFAULT_SHARING_PERMISSIONS };
  },

  async updateSharingPermission(connectionId: string, permission: PermissionKey, enabled: boolean): Promise<void> {
    // Explicit security rule: notes and weight are private by default unless specifically toggled
    const perms = load<Record<string, SharingPermissionsMap>>(SHARING_PERMS_KEY, {});
    if (!perms[connectionId]) {
      perms[connectionId] = { ...DEFAULT_SHARING_PERMISSIONS };
    }
    perms[connectionId][permission] = enabled;
    save(SHARING_PERMS_KEY, perms);
  },

  async applySharingPreset(connectionId: string, preset: 'basic' | 'standard' | 'custom'): Promise<void> {
    const perms = load<Record<string, SharingPermissionsMap>>(SHARING_PERMS_KEY, {});
    if (preset === 'basic') {
      perms[connectionId] = {
        cycle_phase: true,
        cycle_day: true,
        period_status: true,
        estimated_next_period: true,
        mood: false,
        energy: false,
        symptoms: false,
        flow: false,
        sleep: false,
        notes: false,
        weight: false,
      };
    } else if (preset === 'standard') {
      perms[connectionId] = {
        cycle_phase: true,
        cycle_day: true,
        period_status: true,
        estimated_next_period: true,
        mood: true,
        energy: true,
        symptoms: false,
        flow: false,
        sleep: true,
        notes: false,
        weight: false,
      };
    }
    save(SHARING_PERMS_KEY, perms);
  },

  // 9. Masked Partner View (Strict RLS Simulation: Partner can ONLY see permitted keys)
  async getPartnerView(partnerId: string): Promise<any> {
    this.initDemoData();
    const conn = await this.getPartnerConnection(partnerId, 'partner');
    if (!conn) {
      return null;
    }

    const woman = this.findUserById(conn.woman_user_id);
    const womanName = woman?.full_name || 'Her';
    const womanAvatarUrl = woman?.avatar_url || '/assets/woman-portrait.png';
    const permissions = await this.getSharingPermissions(conn.id);

    // If request is still pending
    if (conn.status === 'pending') {
      return {
        isConnected: false,
        isPending: true,
        status: 'pending',
        connectionId: conn.id,
        womanName,
        womanAvatarUrl,
        partnerId,
        permissions,
      };
    }

    // If sharing is paused
    if (conn.status === 'paused') {
      return {
        isConnected: true,
        isPaused: true,
        status: 'paused',
        connectionId: conn.id,
        womanName,
        womanAvatarUrl,
        permissions,
      };
    }

    const cycleProfile = await this.getCycleProfile(conn.woman_user_id);
    const periods = await this.getPeriodLogs(conn.woman_user_id);
    const dailies = await this.getDailyLogs(conn.woman_user_id, 90);

    const latestDaily = dailies[0] || null;
    const cycleState = calculateCycleState(
      cycleProfile || { average_cycle_length: 28, average_period_length: 5, user_id: conn.woman_user_id, last_period_start: null, goals: [] },
      periods
    );

    const phaseNames: Record<string, string> = {
      menstrual: 'Menstrual Phase',
      follicular: 'Follicular Phase',
      ovulation: 'Ovulation Phase',
      luteal: 'Luteal Phase',
    };

    // Calculate calendar days respecting permissions
    const calendarDays = [];
    const now = new Date();
    for (let offset = -45; offset <= 45; offset++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
      const dateStr = d.toISOString().split('T')[0];
      const hasPeriod = periods.some(p => p.start_date <= dateStr && (!p.end_date || p.end_date >= dateStr));
      const daily = dailies.find(dl => dl.log_date === dateStr);
      calendarDays.push({
        date: dateStr,
        hasPeriod: permissions.period_status ? hasPeriod : false,
        mood: permissions.mood && daily?.mood ? daily.mood : null,
        energy: permissions.energy && daily?.energy ? daily.energy : null,
        flow: permissions.flow && daily?.flow ? daily.flow : null,
        symptoms: permissions.symptoms && daily?.symptoms ? daily.symptoms : [],
      });
    }

    return {
      isConnected: conn.status === 'approved',
      isPaused: false,
      status: conn.status,
      connectionId: conn.id,
      womanName,
      woman_name: womanName,
      womanAvatarUrl,
      permissions,
      cycleData: {
        currentPhase: permissions.cycle_phase ? cycleState.currentPhase : 'follicular',
        phaseDisplayName: permissions.cycle_phase ? (phaseNames[cycleState.currentPhase] || 'Follicular Phase') : 'Follicular Phase',
        currentCycleDay: permissions.cycle_day ? cycleState.currentCycleDay : 1,
        totalCycleLength: cycleProfile?.average_cycle_length || 28,
        isCurrentlyOnPeriod: permissions.period_status ? (cycleState.currentPhase === 'menstrual') : false,
        daysUntilNextPeriod: permissions.estimated_next_period ? cycleState.daysUntilNextPeriod : null,
        estimatedNextPeriodStart: permissions.estimated_next_period ? cycleState.estimatedNextPeriodStart : null,
      },
      todayLog: {
        mood: permissions.mood && latestDaily ? latestDaily.mood : null,
        energy: permissions.energy && latestDaily ? latestDaily.energy : null,
        sleep_hours: permissions.sleep && latestDaily ? latestDaily.sleep_hours : null,
        symptoms: permissions.symptoms && latestDaily ? latestDaily.symptoms : [],
        flow: permissions.flow && latestDaily ? latestDaily.flow : null,
      },
      calendarDays,
      // Database security guarantee: notes and weight are NEVER exposed to partner unless permitted
      notes: permissions.notes && latestDaily ? latestDaily.notes : null,
      weight_kg: permissions.weight && latestDaily ? latestDaily.weight : null,
    };
  },

  // 10. Notifications Center
  async getNotifications(userId: string): Promise<AppNotification[]> {
    this.initDemoData();
    const all = load<AppNotification[]>(NOTIFICATIONS_KEY, []);
    return all.filter(n => n.user_id === userId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async createNotification(notif: Omit<AppNotification, 'id' | 'created_at' | 'read'>): Promise<AppNotification> {
    const all = load<AppNotification[]>(NOTIFICATIONS_KEY, []);
    const newNotif: AppNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: notif.user_id,
      type: notif.type,
      title: notif.title,
      body: notif.body,
      read: false,
      created_at: new Date().toISOString(),
    };
    all.push(newNotif);
    save(NOTIFICATIONS_KEY, all);
    return newNotif;
  },

  async markNotificationRead(id: string): Promise<void> {
    const all = load<AppNotification[]>(NOTIFICATIONS_KEY, []);
    const item = all.find(n => n.id === id);
    if (item) {
      item.read = true;
      save(NOTIFICATIONS_KEY, all);
    }
  },

  // 11. Cascading Account Deletion
  async deleteUserAccount(userId: string): Promise<void> {
    const users = this.getUsers().filter(u => u.id !== userId);
    save(USERS_KEY, users);

    const sessions = load<Record<string, any>>(SESSIONS_KEY, {});
    delete sessions[userId];
    save(SESSIONS_KEY, sessions);

    const profiles = load<Record<string, any>>(CYCLE_PROFILES_KEY, {});
    delete profiles[userId];
    save(CYCLE_PROFILES_KEY, profiles);

    const periods = load<PeriodLog[]>(PERIOD_LOGS_KEY, []).filter(l => l.user_id !== userId);
    save(PERIOD_LOGS_KEY, periods);

    const dailies = load<DailyLog[]>(DAILY_LOGS_KEY, []).filter(l => l.user_id !== userId);
    save(DAILY_LOGS_KEY, dailies);

    const codes = load<PartnerConnectionCode[]>(PARTNER_CODES_KEY, []).filter(c => c.woman_user_id !== userId);
    save(PARTNER_CODES_KEY, codes);

    const connections = load<PartnerConnection[]>(PARTNER_CONNECTIONS_KEY, []).filter(c => 
      c.woman_user_id !== userId && c.partner_user_id !== userId
    );
    save(PARTNER_CONNECTIONS_KEY, connections);

    const notifs = load<AppNotification[]>(NOTIFICATIONS_KEY, []).filter(n => n.user_id !== userId);
    save(NOTIFICATIONS_KEY, notifs);
  },
};
