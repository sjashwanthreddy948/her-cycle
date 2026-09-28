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
import { supabase, isSupabaseConfigured } from './supabase';

function checkClient() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase backend is not configured. Please supply VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.');
  }
  return supabase;
}

export const db = {
  // 1. Profiles
  async getProfile(userId: string): Promise<UserProfile | null> {
    const client = checkClient();
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data as UserProfile | null;
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const client = checkClient();
    // role is immutable per security policy, strip if present
    const safeUpdates = { ...updates, updated_at: new Date().toISOString() };
    delete safeUpdates.role;
    delete safeUpdates.id;

    const { data, error } = await client
      .from('profiles')
      .update(safeUpdates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as UserProfile;
  },

  // 2. Active Session Enforcement
  async upsertActiveSession(userId: string, sessionId: string, device?: string): Promise<void> {
    const client = checkClient();
    const { error } = await client
      .from('active_sessions')
      .upsert({
        user_id: userId,
        session_id: sessionId,
        device: device || (typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 80) : 'Browser'),
        updated_at: new Date().toISOString(),
      });
    if (error) console.error('Failed to register active session:', error.message);
  },

  async getActiveSession(userId: string): Promise<string | null> {
    const client = checkClient();
    const { data, error } = await client
      .from('active_sessions')
      .select('session_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) return null;
    return data.session_id;
  },

  // 3. Cycle Profile
  async getCycleProfile(userId: string): Promise<CycleProfile | null> {
    const client = checkClient();
    const { data, error } = await client
      .from('cycle_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data as CycleProfile | null;
  },

  async updateCycleProfile(userId: string, updates: Partial<CycleProfile>): Promise<CycleProfile> {
    const client = checkClient();
    const { data, error } = await client
      .from('cycle_profiles')
      .upsert({
        user_id: userId,
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data as CycleProfile;
  },

  // 4. Period Logs
  async getPeriodLogs(userId: string): Promise<PeriodLog[]> {
    const client = checkClient();
    const { data, error } = await client
      .from('period_logs')
      .select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: false });

    if (error) throw error;
    return (data || []) as PeriodLog[];
  },

  async addPeriodLog(log: Omit<PeriodLog, 'id'>): Promise<PeriodLog> {
    const client = checkClient();
    const { data, error } = await client
      .from('period_logs')
      .insert({
        ...log,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Keep cycle_profiles last_period_start in sync
    await client
      .from('cycle_profiles')
      .update({ last_period_start: log.start_date, updated_at: new Date().toISOString() })
      .eq('user_id', log.user_id);

    return data as PeriodLog;
  },

  async updatePeriodLog(id: string, updates: Partial<PeriodLog>): Promise<PeriodLog> {
    const client = checkClient();
    const { data, error } = await client
      .from('period_logs')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as PeriodLog;
  },

  async deletePeriodLog(id: string): Promise<void> {
    const client = checkClient();
    const { error } = await client.from('period_logs').delete().eq('id', id);
    if (error) throw error;
  },

  // 5. Daily Logs
  async getDailyLogs(userId: string): Promise<DailyLog[]> {
    const client = checkClient();
    const { data, error } = await client
      .from('daily_logs')
      .select('*')
      .eq('user_id', userId)
      .order('log_date', { ascending: false });

    if (error) throw error;
    return (data || []) as DailyLog[];
  },

  async getDailyLogForDate(userId: string, dateStr: string): Promise<DailyLog | null> {
    const client = checkClient();
    const { data, error } = await client
      .from('daily_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('log_date', dateStr)
      .maybeSingle();

    if (error) throw error;
    return data as DailyLog | null;
  },

  async saveDailyLog(log: Omit<DailyLog, 'id'>): Promise<DailyLog> {
    const client = checkClient();
    const { data, error } = await client
      .from('daily_logs')
      .upsert(
        {
          ...log,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,log_date' }
      )
      .select()
      .single();

    if (error) throw error;
    return data as DailyLog;
  },

  // 6. Partner Codes (Server generated, HER-XXXXXX, 24h expiration)
  async getActivePartnerCode(womanId: string): Promise<PartnerCode | null> {
    const client = checkClient();
    const { data, error } = await client
      .from('partner_codes')
      .select('*')
      .eq('woman_id', womanId)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (error) throw error;
    return data as PartnerCode | null;
  },

  async generatePartnerCode(): Promise<string> {
    const client = checkClient();
    // Security Definer function on Postgres
    const { data, error } = await client.rpc('generate_partner_code');
    if (error) throw error;
    return data as string;
  },

  async redeemPartnerCode(code: string): Promise<{ success: boolean; link_id: string; status: string }> {
    const client = checkClient();
    // Security Definer function with rate limit check on Postgres
    const { data, error } = await client.rpc('redeem_partner_code', {
      code_input: code.trim().toUpperCase(),
    });
    if (error) throw error;
    return data;
  },

  // 7. Partner Links
  async getPartnerLink(userId: string, role: 'woman' | 'partner'): Promise<PartnerLink | null> {
    const client = checkClient();
    if (role === 'woman') {
      const { data, error } = await client
        .from('partner_links')
        .select(`
          *,
          partner:profiles!partner_links_partner_id_fkey(full_name, avatar_url, email)
        `)
        .eq('woman_id', userId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      const p = data.partner as any;
      return {
        ...data,
        partner_name: p?.full_name,
        partner_avatar_url: p?.avatar_url,
        partner_email: p?.email,
      } as PartnerLink;
    } else {
      const { data, error } = await client
        .from('partner_links')
        .select(`
          *,
          woman:profiles!partner_links_woman_id_fkey(full_name, avatar_url, email)
        `)
        .eq('partner_id', userId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      const w = data.woman as any;
      return {
        ...data,
        woman_name: w?.full_name,
        woman_avatar_url: w?.avatar_url,
      } as PartnerLink;
    }
  },

  async approvePartnerLink(linkId: string): Promise<void> {
    const client = checkClient();
    const { error } = await client
      .from('partner_links')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
      })
      .eq('id', linkId);

    if (error) throw error;
  },

  async declinePartnerLink(linkId: string): Promise<void> {
    const client = checkClient();
    const { error } = await client.from('partner_links').delete().eq('id', linkId);
    if (error) throw error;
  },

  async togglePausePartner(linkId: string, pause: boolean): Promise<boolean> {
    const client = checkClient();
    const { error } = await client
      .from('partner_links')
      .update({ is_paused: pause })
      .eq('id', linkId);

    if (error) throw error;
    return pause;
  },

  async disconnectPartner(linkId: string): Promise<void> {
    const client = checkClient();
    const { error } = await client.from('partner_links').delete().eq('id', linkId);
    if (error) throw error;
  },

  // 8. Sharing Permissions
  async getSharingPermissions(linkId: string): Promise<SharingPermissionsMap> {
    const client = checkClient();
    const { data, error } = await client
      .from('sharing_permissions')
      .select('permission_name, enabled')
      .eq('link_id', linkId);

    if (error) throw error;

    const map: Partial<SharingPermissionsMap> = {};
    (data || []).forEach(row => {
      map[row.permission_name as PermissionKey] = row.enabled;
    });

    return {
      cycle_phase: map.cycle_phase ?? true,
      cycle_day: map.cycle_day ?? true,
      period_status: map.period_status ?? true,
      estimated_next_period: map.estimated_next_period ?? true,
      mood: map.mood ?? true,
      energy: map.energy ?? true,
      symptoms: map.symptoms ?? false,
      flow: map.flow ?? false,
      sleep: map.sleep ?? false,
      notes: false, // NEVER SHARED
      weight: false, // NEVER SHARED
    };
  },

  async updateSharingPermission(linkId: string, key: PermissionKey, enabled: boolean): Promise<void> {
    const client = checkClient();
    // Safety check: notes and weight must never be enabled
    if (key === 'notes' || key === 'weight') {
      throw new Error('Private notes and weight cannot be shared with partner.');
    }

    const { error } = await client
      .from('sharing_permissions')
      .upsert(
        {
          link_id: linkId,
          permission_name: key,
          enabled,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'link_id,permission_name' }
      );

    if (error) throw error;
  },

  async applyPreset(linkId: string, permissions: SharingPermissionsMap): Promise<void> {
    const client = checkClient();
    const entries = (Object.keys(permissions) as PermissionKey[]).map(key => ({
      link_id: linkId,
      permission_name: key,
      // Enforce zero exposure for notes and weight
      enabled: (key === 'notes' || key === 'weight') ? false : Boolean(permissions[key]),
      updated_at: new Date().toISOString(),
    }));

    const { error } = await client
      .from('sharing_permissions')
      .upsert(entries, { onConflict: 'link_id,permission_name' });

    if (error) throw error;
  },

  // 9. SECURE PARTNER VIEW (Database-Enforced Read-Only View)
  async getPartnerViewData(partnerUserId: string) {
    const client = checkClient();
    
    // Check if partner has any link first
    const link = await this.getPartnerLink(partnerUserId, 'partner');
    if (!link) {
      return {
        isConnected: false,
        status: 'not_connected',
        womanName: null,
        womanAvatarUrl: null,
        isPaused: false,
        permissions: {} as Partial<SharingPermissionsMap>,
        cycleData: null,
        todayLog: null,
        calendarDays: [],
      };
    }

    if (link.status === 'pending') {
      return {
        isConnected: true,
        status: 'pending',
        womanName: link.woman_name || 'Partner',
        womanAvatarUrl: link.woman_avatar_url || null,
        isPaused: false,
        permissions: {} as Partial<SharingPermissionsMap>,
        cycleData: null,
        todayLog: null,
        calendarDays: [],
      };
    }

    if (link.is_paused) {
      return {
        isConnected: true,
        status: 'paused',
        womanName: link.woman_name || 'Partner',
        womanAvatarUrl: link.woman_avatar_url || null,
        isPaused: true,
        permissions: {} as Partial<SharingPermissionsMap>,
        cycleData: null,
        todayLog: null,
        calendarDays: [],
      };
    }

    // Query the database view `partner_view`
    const { data: viewData, error } = await client
      .from('partner_view')
      .select('*')
      .maybeSingle();

    if (error || !viewData) {
      return {
        isConnected: true,
        status: link.status,
        womanName: link.woman_name || 'Partner',
        womanAvatarUrl: link.woman_avatar_url || null,
        isPaused: link.is_paused,
        permissions: {} as Partial<SharingPermissionsMap>,
        cycleData: null,
        todayLog: null,
        calendarDays: [],
      };
    }

    const perms: SharingPermissionsMap = viewData.permissions || {};
    const womanId = viewData.woman_id;

    // Fetch cycle state using cycleCalculator
    const cycleProfile: CycleProfile = {
      user_id: womanId,
      average_cycle_length: viewData.average_cycle_length || 28,
      average_period_length: viewData.average_period_length || 5,
      last_period_start: viewData.last_period_start,
      goals: [],
    };

    // If period status permitted, fetch period logs
    let periods: PeriodLog[] = [];
    if (perms.period_status) {
      const { data: pData } = await client
        .from('period_logs')
        .select('*')
        .eq('user_id', womanId)
        .order('start_date', { ascending: false });
      periods = (pData || []) as PeriodLog[];
    }

    const rawCycle = calculateCycleState(cycleProfile, periods);

    const sanitizedCycle = {
      currentPhase: perms.cycle_phase ? rawCycle.currentPhase : null,
      phaseDisplayName: perms.cycle_phase ? rawCycle.phaseDisplayName : null,
      currentCycleDay: perms.cycle_day ? rawCycle.currentCycleDay : null,
      totalCycleLength: perms.cycle_day ? rawCycle.totalCycleLength : null,
      isCurrentlyOnPeriod: perms.period_status ? rawCycle.isCurrentlyOnPeriod : null,
      daysUntilNextPeriod: perms.estimated_next_period ? rawCycle.daysUntilNextPeriod : null,
      estimatedNextPeriodStart: perms.estimated_next_period ? rawCycle.estimatedNextPeriodStart : null,
      progressPercent: perms.cycle_day ? rawCycle.progressPercent : 0,
    };

    // Today's log
    const todayStr = new Date().toISOString().split('T')[0];
    const { data: tData } = await client
      .from('daily_logs')
      .select('*')
      .eq('user_id', womanId)
      .eq('log_date', todayStr)
      .maybeSingle();

    const sanitizedToday = tData ? {
      mood: perms.mood ? tData.mood : null,
      energy: perms.energy ? tData.energy : null,
      flow: perms.flow ? tData.flow : null,
      sleep_hours: perms.sleep ? tData.sleep_hours : null,
      symptoms: perms.symptoms ? (tData.symptoms || []) : [],
      // notes & weight are NEVER sent
      notes: null,
      weight: null,
    } : null;

    // Monthly calendar days
    const { data: allDailies } = await client
      .from('daily_logs')
      .select('log_date, flow, mood, energy, symptoms')
      .eq('user_id', womanId)
      .order('log_date', { ascending: false })
      .limit(60);

    const sanitizedCalendar = (allDailies || []).map(dl => ({
      date: dl.log_date,
      hasPeriod: perms.period_status && (dl.flow && dl.flow !== 'none'),
      mood: perms.mood ? dl.mood : undefined,
      energy: perms.energy ? dl.energy : undefined,
      symptoms: perms.symptoms ? dl.symptoms : [],
    }));

    return {
      isConnected: true,
      status: 'approved',
      womanName: viewData.woman_name,
      womanAvatarUrl: viewData.woman_avatar_url,
      isPaused: false,
      permissions: perms,
      cycleData: sanitizedCycle,
      todayLog: sanitizedToday,
      calendarDays: sanitizedCalendar,
    };
  },

  // 10. Privacy, Export & Cascading Account Deletion
  async deleteUserAccount(): Promise<void> {
    const client = checkClient();
    const { error } = await client.rpc('delete_user_account');
    if (error) {
      // Fallback: delete profile manually (cascades)
      const { data: userData } = await client.auth.getUser();
      if (userData?.user?.id) {
        await client.from('profiles').delete().eq('id', userData.user.id);
      }
    }
  },

  async exportAllDataJson(userId: string): Promise<string> {
    const client = checkClient();
    const [profile, cycleProfile, periodLogs, dailyLogs] = await Promise.all([
      client.from('profiles').select('*').eq('id', userId).maybeSingle(),
      client.from('cycle_profiles').select('*').eq('user_id', userId).maybeSingle(),
      client.from('period_logs').select('*').eq('user_id', userId),
      client.from('daily_logs').select('*').eq('user_id', userId),
    ]);

    const data = {
      profile: profile.data,
      cycleProfile: cycleProfile.data,
      periodLogs: periodLogs.data || [],
      dailyLogs: dailyLogs.data || [],
      exportedAt: new Date().toISOString(),
      appName: 'HerCycle',
    };
    return JSON.stringify(data, null, 2);
  },

  async exportDataCsv(userId: string): Promise<string> {
    const client = checkClient();
    const { data: daily } = await client
      .from('daily_logs')
      .select('*')
      .eq('user_id', userId)
      .order('log_date', { ascending: false });

    const headers = ['Date', 'Flow', 'Mood', 'Energy', 'Sleep Hours', 'Water Glasses', 'Weight', 'Symptoms', 'Notes'];
    const rows = (daily || []).map(d => [
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
  }
};
