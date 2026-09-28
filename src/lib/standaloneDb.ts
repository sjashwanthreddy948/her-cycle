import { 
  UserProfile, 
  CycleProfile, 
  PeriodLog, 
  DailyLog, 
  PartnerLink,
  PartnerCode,
  SharingPermissionsMap, 
  PermissionKey
} from '../types/database';
import { calculateCycleState } from './cycleCalculator';
import { normalizePartnerCode } from './codeUtils';

// Local storage keys
const USERS_KEY = 'hercycle_standalone_users';
const SESSIONS_KEY = 'hercycle_standalone_sessions';
const CYCLE_PROFILES_KEY = 'hercycle_standalone_cycle_profiles';
const PERIOD_LOGS_KEY = 'hercycle_standalone_period_logs';
const DAILY_LOGS_KEY = 'hercycle_standalone_daily_logs';
const PARTNER_CODES_KEY = 'hercycle_standalone_partner_codes';
const PARTNER_LINKS_KEY = 'hercycle_standalone_partner_links';
const SHARING_PERMS_KEY = 'hercycle_standalone_sharing_permissions';
const CODE_ATTEMPTS_KEY = 'hercycle_standalone_code_attempts';

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

export const standaloneDb = {
  // 1. Profiles & Users
  getUsers(): StandaloneUserRecord[] {
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
    const { password_hash, ...profile } = u;
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
    const { password_hash, ...profile } = updated;
    return profile;
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
    const profiles = load<Record<string, CycleProfile>>(CYCLE_PROFILES_KEY, {});
    return profiles[userId] || null;
  },

  async updateCycleProfile(userId: string, updates: Partial<CycleProfile>): Promise<CycleProfile> {
    const profiles = load<Record<string, CycleProfile>>(CYCLE_PROFILES_KEY, {});
    const existing = profiles[userId] || {
      user_id: userId,
      average_cycle_length: 28,
      average_period_length: 5,
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
    const logs = load<PeriodLog[]>(PERIOD_LOGS_KEY, []);
    return logs
      .filter(l => l.user_id === userId)
      .sort((a, b) => b.start_date.localeCompare(a.start_date));
  },

  async savePeriodLog(log: Omit<PeriodLog, 'id' | 'created_at'> & { id?: string }): Promise<PeriodLog> {
    const logs = load<PeriodLog[]>(PERIOD_LOGS_KEY, []);
    const id = log.id || `period_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fullLog: PeriodLog = {
      ...log,
      id,
      created_at: new Date().toISOString(),
    };
    const idx = logs.findIndex(l => l.id === id);
    if (idx >= 0) {
      logs[idx] = fullLog;
    } else {
      logs.unshift(fullLog);
    }
    save(PERIOD_LOGS_KEY, logs);

    // Auto-update cycle profile last_period_start if latest
    const userPeriods = logs.filter(l => l.user_id === log.user_id).sort((a, b) => b.start_date.localeCompare(a.start_date));
    if (userPeriods.length > 0) {
      await this.updateCycleProfile(log.user_id, {
        last_period_start: userPeriods[0].start_date,
      });
    }

    return fullLog;
  },

  async deletePeriodLog(id: string): Promise<void> {
    const logs = load<PeriodLog[]>(PERIOD_LOGS_KEY, []);
    const filtered = logs.filter(l => l.id !== id);
    save(PERIOD_LOGS_KEY, filtered);
  },

  // 5. Daily Logs
  async getDailyLogs(userId: string, limit = 90): Promise<DailyLog[]> {
    const logs = load<DailyLog[]>(DAILY_LOGS_KEY, []);
    return logs
      .filter(l => l.user_id === userId)
      .sort((a, b) => b.log_date.localeCompare(a.log_date))
      .slice(0, limit);
  },

  async saveDailyLog(log: Omit<DailyLog, 'id' | 'created_at'> & { id?: string }): Promise<DailyLog> {
    const logs = load<DailyLog[]>(DAILY_LOGS_KEY, []);
    const idx = logs.findIndex(l => l.user_id === log.user_id && l.log_date === log.log_date);
    const id = log.id || (idx >= 0 ? logs[idx].id : `daily_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);
    const fullLog: DailyLog = {
      ...log,
      id,
      created_at: new Date().toISOString(),
    };
    if (idx >= 0) {
      logs[idx] = fullLog;
    } else {
      logs.unshift(fullLog);
    }
    save(DAILY_LOGS_KEY, logs);
    return fullLog;
  },

  // 6. Partner Codes (Format HER-XXXXXX, Single-Use, Instant Expiration)
  async getActivePartnerCode(womanId: string): Promise<PartnerCode | null> {
    const codes = load<PartnerCode[]>(PARTNER_CODES_KEY, []);
    const now = Date.now();
    return codes.find(c => 
      c.woman_id === womanId && 
      !c.used && 
      new Date(c.expires_at).getTime() > now
    ) || null;
  },

  async generatePartnerCode(womanId: string): Promise<string> {
    // Check if woman already has active approved partner
    const links = load<PartnerLink[]>(PARTNER_LINKS_KEY, []);
    if (links.some(l => l.woman_id === womanId && l.status === 'approved')) {
      throw new Error('You already have an active partner linked. Please disconnect before generating a new invite code.');
    }

    // Invalidate and expire any previous unused codes for this woman
    const codes = load<PartnerCode[]>(PARTNER_CODES_KEY, []);
    for (const c of codes) {
      if (c.woman_id === womanId && !c.used) {
        c.used = true;
        c.expires_at = new Date().toISOString();
      }
    }

    // Generate random 6-character code
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'HER-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const newCodeRecord: PartnerCode = {
      code,
      woman_id: womanId,
      expires_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      used: false,
      created_at: new Date().toISOString(),
    };
    codes.push(newCodeRecord);
    save(PARTNER_CODES_KEY, codes);
    return code;
  },

  async redeemPartnerCode(partnerId: string, inputCode: string): Promise<{ success: boolean; link_id: string; status: string }> {
    const clean = normalizePartnerCode(inputCode);
    const codes = load<PartnerCode[]>(PARTNER_CODES_KEY, []);
    const record = codes.find(c => normalizePartnerCode(c.code) === clean);

    // Rate limiting
    const attempts = load<{ partner_id: string; time: number }[]>(CODE_ATTEMPTS_KEY, []);
    const now = Date.now();
    const recent = attempts.filter(a => a.partner_id === partnerId && (now - a.time) < 15 * 60 * 1000);
    if (recent.length >= 10) {
      throw new Error('Too many failed code attempts. Please wait 15 minutes before trying again.');
    }

    if (!record) {
      attempts.push({ partner_id: partnerId, time: now });
      save(CODE_ATTEMPTS_KEY, attempts);
      throw new Error('Invalid connection code. Please verify the 6-character code from your partner’s app (e.g. HER-ABC234).');
    }

    // Strict single-use & expiration check
    if (record.used || new Date(record.expires_at).getTime() <= now) {
      attempts.push({ partner_id: partnerId, time: now });
      save(CODE_ATTEMPTS_KEY, attempts);
      throw new Error('This connection code has expired or has already been used. Please ask your partner to tap "Regenerate Code".');
    }

    if (record.woman_id === partnerId) {
      throw new Error('You cannot link to your own account. Please share this code with your partner.');
    }

    // Atomically mark used AND immediately expire upon entry
    record.used = true;
    record.expires_at = new Date().toISOString();
    save(PARTNER_CODES_KEY, codes);

    // Remove any stale or previous links for this partner or woman
    let links = load<PartnerLink[]>(PARTNER_LINKS_KEY, []);
    links = links.filter(l => !(l.partner_id === partnerId || l.woman_id === record.woman_id));

    const linkId = `link_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newLink: PartnerLink = {
      id: linkId,
      woman_id: record.woman_id,
      partner_id: partnerId,
      status: 'approved',
      is_paused: false,
      created_at: new Date().toISOString(),
      approved_at: new Date().toISOString(),
    };
    links.push(newLink);
    save(PARTNER_LINKS_KEY, links);

    // Initialize default sharing permissions
    const perms = load<Record<string, Record<PermissionKey, boolean>>>(SHARING_PERMS_KEY, {});
    perms[linkId] = {
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
    save(SHARING_PERMS_KEY, perms);

    return {
      success: true,
      link_id: linkId,
      status: 'approved',
    };
  },

  async redeemAndCreatePartner(
    inputCode: string,
    fullName?: string,
    email?: string,
    password?: string
  ): Promise<{ profile: UserProfile; linkId: string }> {
    const clean = normalizePartnerCode(inputCode);
    const codes = load<PartnerCode[]>(PARTNER_CODES_KEY, []);
    const record = codes.find(c => normalizePartnerCode(c.code) === clean);

    if (!record) {
      throw new Error('Invalid connection code. Please check that the code matches what your partner generated (e.g. HER-ABC234).');
    }

    const now = Date.now();
    if (record.used || new Date(record.expires_at).getTime() <= now) {
      throw new Error('This connection code has expired or has already been used. Please ask your partner to tap "Regenerate Code".');
    }

    // Check or create partner account
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
        password_hash: password || 'PartnerPass123!',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      users.push(partnerUser);
      save(USERS_KEY, users);
    } else {
      if (fullName && fullName.trim()) {
        partnerUser.full_name = fullName.trim();
        save(USERS_KEY, users);
      }
    }

    if (record.woman_id === partnerUser.id) {
      throw new Error('You cannot link to your own account.');
    }

    // Atomically mark used & expire
    record.used = true;
    record.expires_at = new Date().toISOString();
    save(PARTNER_CODES_KEY, codes);

    // Clean up previous links and connect
    let links = load<PartnerLink[]>(PARTNER_LINKS_KEY, []);
    links = links.filter(l => !(l.partner_id === partnerUser!.id || l.woman_id === record.woman_id));

    const linkId = `link_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newLink: PartnerLink = {
      id: linkId,
      woman_id: record.woman_id,
      partner_id: partnerUser.id,
      status: 'approved',
      is_paused: false,
      created_at: new Date().toISOString(),
      approved_at: new Date().toISOString(),
    };
    links.push(newLink);
    save(PARTNER_LINKS_KEY, links);

    // Default permissions
    const perms = load<Record<string, Record<PermissionKey, boolean>>>(SHARING_PERMS_KEY, {});
    perms[linkId] = {
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
    save(SHARING_PERMS_KEY, perms);

    const { password_hash: _pass, ...profile } = partnerUser;
    return { profile, linkId };
  },

  // 7. Partner Links
  async getPartnerLink(userId: string, role: 'woman' | 'partner'): Promise<PartnerLink | null> {
    const links = load<PartnerLink[]>(PARTNER_LINKS_KEY, []);
    const link = role === 'woman'
      ? links.find(l => l.woman_id === userId)
      : links.find(l => l.partner_id === userId);

    if (!link) return null;

    const partnerUser = link.partner_id ? this.findUserById(link.partner_id) : null;
    const womanUser = this.findUserById(link.woman_id);

    return {
      ...link,
      partner_name: partnerUser?.full_name,
      partner_email: partnerUser?.email,
      woman_name: womanUser?.full_name,
    };
  },

  async approvePartnerLink(linkId: string): Promise<void> {
    const links = load<PartnerLink[]>(PARTNER_LINKS_KEY, []);
    const link = links.find(l => l.id === linkId);
    if (!link) throw new Error('Partner link not found');
    link.status = 'approved';
    link.approved_at = new Date().toISOString();
    save(PARTNER_LINKS_KEY, links);
  },

  async declinePartnerLink(linkId: string): Promise<void> {
    const links = load<PartnerLink[]>(PARTNER_LINKS_KEY, []);
    const filtered = links.filter(l => l.id !== linkId);
    save(PARTNER_LINKS_KEY, filtered);
  },

  async togglePausePartnerLink(linkId: string, isPaused: boolean): Promise<void> {
    const links = load<PartnerLink[]>(PARTNER_LINKS_KEY, []);
    const link = links.find(l => l.id === linkId);
    if (!link) throw new Error('Partner link not found');
    link.is_paused = isPaused;
    save(PARTNER_LINKS_KEY, links);
  },

  async deletePartnerLink(linkId: string): Promise<void> {
    await this.declinePartnerLink(linkId);
  },

  // 8. Sharing Permissions
  async getSharingPermissions(linkId: string): Promise<SharingPermissionsMap> {
    const perms = load<Record<string, Record<PermissionKey, boolean>>>(SHARING_PERMS_KEY, {});
    return perms[linkId] || {
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
  },

  async updateSharingPermission(linkId: string, permission: PermissionKey, enabled: boolean): Promise<void> {
    // Explicit security rule: notes and weight can never be enabled
    if (permission === 'notes' || permission === 'weight') return;
    const perms = load<Record<string, Record<PermissionKey, boolean>>>(SHARING_PERMS_KEY, {});
    if (!perms[linkId]) {
      perms[linkId] = await this.getSharingPermissions(linkId);
    }
    perms[linkId][permission] = enabled;
    save(SHARING_PERMS_KEY, perms);
  },

  async applySharingPreset(linkId: string, preset: 'basic' | 'standard' | 'custom'): Promise<void> {
    const perms = load<Record<string, Record<PermissionKey, boolean>>>(SHARING_PERMS_KEY, {});
    if (preset === 'basic') {
      perms[linkId] = {
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
      perms[linkId] = {
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
    }
    save(SHARING_PERMS_KEY, perms);
  },

  // 9. Masked Partner View
  async getPartnerView(partnerId: string): Promise<any> {
    const link = await this.getPartnerLink(partnerId, 'partner');
    if (!link) {
      return null;
    }

    const woman = this.findUserById(link.woman_id);
    const womanName = woman?.full_name || 'Her';
    const permissions = await this.getSharingPermissions(link.id);

    // If paused, return paused structure
    if (link.is_paused) {
      return {
        isConnected: true,
        isPaused: true,
        status: link.status,
        womanName,
        woman_name: womanName,
        permissions,
      };
    }

    // If pending, allow display of waiting status
    if (link.status === 'pending') {
      return {
        isConnected: false,
        isPending: true,
        status: 'pending',
        womanName,
        woman_name: womanName,
        permissions,
      };
    }

    const cycleProfile = await this.getCycleProfile(link.woman_id);
    const periods = await this.getPeriodLogs(link.woman_id);
    const dailies = await this.getDailyLogs(link.woman_id, 90);

    const latestDaily = dailies[0] || null;
    const cycleState = calculateCycleState(
      cycleProfile || { average_cycle_length: 28, average_period_length: 5, user_id: link.woman_id, last_period_start: null, goals: [] },
      periods
    );

    const phaseNames: Record<string, string> = {
      menstrual: 'Menstrual Phase',
      follicular: 'Follicular Phase',
      ovulation: 'Ovulation Phase',
      luteal: 'Luteal Phase',
    };

    // Calculate calendarDays for PartnerCalendar
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
      isConnected: link.status === 'approved',
      isPaused: Boolean(link.is_paused),
      status: link.status,
      womanName,
      woman_name: womanName,
      womanAvatarUrl: woman?.avatar_url,
      link_id: link.id,
      partner_id: partnerId,
      woman_id: link.woman_id,
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
      // Flat properties for backward compatibility
      cycle_phase: permissions.cycle_phase ? cycleState.currentPhase : null,
      cycle_day: permissions.cycle_day ? cycleState.currentCycleDay : null,
      days_until_next_period: permissions.estimated_next_period ? cycleState.daysUntilNextPeriod : null,
      estimated_next_period: permissions.estimated_next_period ? cycleState.estimatedNextPeriodStart : null,
      mood: permissions.mood && latestDaily ? latestDaily.mood : null,
      energy: permissions.energy && latestDaily ? latestDaily.energy : null,
      sleep_hours: permissions.sleep && latestDaily ? latestDaily.sleep_hours : null,
      symptoms: permissions.symptoms && latestDaily ? latestDaily.symptoms : null,
      flow: permissions.flow && latestDaily ? latestDaily.flow : null,
      notes: null,
      weight_kg: null,
    };
  },

  // 10. Cascading Account Deletion
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

    const codes = load<PartnerCode[]>(PARTNER_CODES_KEY, []).filter(c => c.woman_id !== userId);
    save(PARTNER_CODES_KEY, codes);

    const links = load<PartnerLink[]>(PARTNER_LINKS_KEY, []).filter(l => l.woman_id !== userId && l.partner_id !== userId);
    save(PARTNER_LINKS_KEY, links);
  },
};
