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
import { supabase, isSupabaseConfigured } from './supabase';
import { standaloneDb } from './standaloneDb';

export const db = {
  // 1. Profiles
  async getProfile(userId: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured || !supabase) {
      return standaloneDb.getProfile(userId);
    }
    const client = supabase;
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data as UserProfile | null;
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    if (!isSupabaseConfigured || !supabase) {
      return standaloneDb.updateProfile(userId, updates);
    }
    const client = supabase;
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
    if (!isSupabaseConfigured || !supabase) {
      return standaloneDb.upsertActiveSession(userId, sessionId, device);
    }
    const client = supabase;
    const { error } = await client
      .from('active_sessions')
      .upsert({
        user_id: userId,
        session_id: sessionId,
        device: device || (typeof navigator !== 'undefined' ? navigator.userAgent : 'device'),
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
  },

  async getActiveSession(userId: string): Promise<string | null> {
    if (!isSupabaseConfigured || !supabase) {
      return standaloneDb.getActiveSession(userId);
    }
    const client = supabase;
    const { data, error } = await client
      .from('active_sessions')
      .select('session_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data?.session_id || null;
  },

  // 3. Cycle Profile
  async getCycleProfile(userId: string): Promise<CycleProfile | null> {
    if (!isSupabaseConfigured || !supabase) {
      return standaloneDb.getCycleProfile(userId);
    }
    const client = supabase;
    const { data, error } = await client
      .from('cycle_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data as CycleProfile | null;
  },

  async updateCycleProfile(userId: string, updates: Partial<CycleProfile>): Promise<CycleProfile> {
    if (!isSupabaseConfigured || !supabase) {
      return standaloneDb.updateCycleProfile(userId, updates);
    }
    const client = supabase;
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
    if (!isSupabaseConfigured || !supabase) {
      return standaloneDb.getPeriodLogs(userId);
    }
    const client = supabase;
    const { data, error } = await client
      .from('period_logs')
      .select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: false });

    if (error) throw error;
    return data as PeriodLog[];
  },

  async savePeriodLog(log: Omit<PeriodLog, 'id' | 'created_at'> & { id?: string }): Promise<PeriodLog> {
    if (!isSupabaseConfigured || !supabase) {
      return standaloneDb.savePeriodLog(log);
    }
    const client = supabase;
    const { data, error } = await client
      .from('period_logs')
      .upsert({
        ...log,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    const { data: latestPeriod } = await client
      .from('period_logs')
      .select('start_date')
      .eq('user_id', log.user_id)
      .order('start_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestPeriod) {
      await this.updateCycleProfile(log.user_id, {
        last_period_start: latestPeriod.start_date,
      });
    }

    return data as PeriodLog;
  },

  async deletePeriodLog(id: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      return standaloneDb.deletePeriodLog(id);
    }
    const client = supabase;
    const { error } = await client
      .from('period_logs')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // 5. Daily Health Logs
  async getDailyLogs(userId: string, limit = 90): Promise<DailyLog[]> {
    if (!isSupabaseConfigured || !supabase) {
      return standaloneDb.getDailyLogs(userId, limit);
    }
    const client = supabase;
    const { data, error } = await client
      .from('daily_logs')
      .select('*')
      .eq('user_id', userId)
      .order('log_date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as DailyLog[];
  },

  async saveDailyLog(log: Omit<DailyLog, 'id' | 'created_at'> & { id?: string }): Promise<DailyLog> {
    if (!isSupabaseConfigured || !supabase) {
      return standaloneDb.saveDailyLog(log);
    }
    const client = supabase;
    const { data, error } = await client
      .from('daily_logs')
      .upsert(
        {
          ...log,
          created_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,log_date' }
      )
      .select()
      .single();

    if (error) throw error;
    return data as DailyLog;
  },

  // 6. Partner Codes (HER-XXXXXX, 24h expiration, instant expiration on redemption)
  async getActivePartnerCode(womanId: string): Promise<PartnerCode | null> {
    if (!isSupabaseConfigured || !supabase) {
      return standaloneDb.getActivePartnerCode(womanId);
    }
    const client = supabase;
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

  async generatePartnerCode(womanId?: string): Promise<string> {
    if (!isSupabaseConfigured || !supabase) {
      if (!womanId) throw new Error('Woman ID is required');
      return standaloneDb.generatePartnerCode(womanId);
    }
    const client = supabase;
    const { data, error } = await client.rpc('generate_partner_code');
    if (error) throw error;
    return data as string;
  },

  async redeemPartnerCode(code: string, partnerId?: string): Promise<{ success: boolean; link_id: string; status: string }> {
    if (!isSupabaseConfigured || !supabase) {
      if (!partnerId) throw new Error('Partner ID is required');
      return standaloneDb.redeemPartnerCode(partnerId, code);
    }
    const client = supabase;
    const { data, error } = await client.rpc('redeem_partner_code', {
      code_input: code.trim().toUpperCase(),
    });
    if (error) throw error;
    return data;
  },

  // 7. Partner Links
  async getPartnerLink(userId: string, role: 'woman' | 'partner'): Promise<PartnerLink | null> {
    if (!isSupabaseConfigured || !supabase) {
      return standaloneDb.getPartnerLink(userId, role);
    }
    const client = supabase;
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
        partner_email: p?.email,
      };
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
      };
    }
  },

  async approvePartnerLink(linkId: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      return standaloneDb.approvePartnerLink(linkId);
    }
    const client = supabase;
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
    if (!isSupabaseConfigured || !supabase) {
      return standaloneDb.declinePartnerLink(linkId);
    }
    const client = supabase;
    const { error } = await client
      .from('partner_links')
      .delete()
      .eq('id', linkId);

    if (error) throw error;
  },

  async togglePausePartnerLink(linkId: string, isPaused: boolean): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      return standaloneDb.togglePausePartnerLink(linkId, isPaused);
    }
    const client = supabase;
    const { error } = await client
      .from('partner_links')
      .update({ is_paused: isPaused })
      .eq('id', linkId);

    if (error) throw error;
  },

  async deletePartnerLink(linkId: string): Promise<void> {
    await this.declinePartnerLink(linkId);
  },

  // 8. Sharing Permissions
  async getSharingPermissions(linkId: string): Promise<SharingPermissionsMap> {
    if (!isSupabaseConfigured || !supabase) {
      return standaloneDb.getSharingPermissions(linkId);
    }
    const client = supabase;
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
      notes: false,
      weight: false,
    };
  },

  async updateSharingPermission(linkId: string, permission: PermissionKey, enabled: boolean): Promise<void> {
    if (permission === 'notes' || permission === 'weight') return;
    if (!isSupabaseConfigured || !supabase) {
      return standaloneDb.updateSharingPermission(linkId, permission, enabled);
    }
    const client = supabase;
    const { error } = await client
      .from('sharing_permissions')
      .upsert(
        {
          link_id: linkId,
          permission_name: permission,
          enabled,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'link_id,permission_name' }
      );

    if (error) throw error;
  },

  async applySharingPreset(linkId: string, preset: 'basic' | 'standard' | 'custom'): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      return standaloneDb.applySharingPreset(linkId, preset);
    }
    const perms: Record<PermissionKey, boolean> = {
      cycle_phase: true,
      cycle_day: true,
      period_status: true,
      estimated_next_period: true,
      mood: preset === 'standard',
      energy: preset === 'standard',
      symptoms: false,
      flow: false,
      sleep: false,
      notes: false,
      weight: false,
    };

    const updates = Object.entries(perms).map(([key, val]) => ({
      link_id: linkId,
      permission_name: key,
      enabled: val,
      updated_at: new Date().toISOString(),
    }));

    const client = supabase;
    const { error } = await client
      .from('sharing_permissions')
      .upsert(updates, { onConflict: 'link_id,permission_name' });

    if (error) throw error;
  },

  // 9. Masked Partner View
  async getPartnerView(partnerId: string): Promise<any> {
    if (!isSupabaseConfigured || !supabase) {
      return standaloneDb.getPartnerView(partnerId);
    }
    const client = supabase;
    const { data, error } = await client
      .from('partner_view')
      .select('*')
      .eq('partner_id', partnerId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      ...data,
      notes: null,
      weight_kg: null,
    };
  },

  async getPartnerViewData(partnerId: string): Promise<any> {
    return this.getPartnerView(partnerId);
  },

  // Compatibility Aliases for components
  async addPeriodLog(log: Omit<PeriodLog, 'id' | 'created_at'>): Promise<PeriodLog> {
    return this.savePeriodLog(log);
  },

  async updatePeriodLog(id: string, updates: Partial<PeriodLog>): Promise<void> {
    const client = isSupabaseConfigured && supabase ? supabase : null;
    if (client) {
      const { error } = await client.from('period_logs').update(updates).eq('id', id);
      if (error) throw error;
    } else {
      const logs = await standaloneDb.getPeriodLogs(updates.user_id || '');
      const existing = logs.find(l => l.id === id);
      if (existing) {
        await standaloneDb.savePeriodLog({ ...existing, ...updates });
      }
    }
  },

  async togglePausePartner(linkId: string, isPaused: boolean): Promise<void> {
    return this.togglePausePartnerLink(linkId, isPaused);
  },

  async disconnectPartner(linkId: string): Promise<void> {
    return this.deletePartnerLink(linkId);
  },

  async applyPreset(linkId: string, permsOrPreset: 'basic' | 'standard' | 'custom' | SharingPermissionsMap): Promise<void> {
    if (typeof permsOrPreset === 'string') {
      return this.applySharingPreset(linkId, permsOrPreset);
    }
    if (!isSupabaseConfigured || !supabase) {
      for (const [key, val] of Object.entries(permsOrPreset)) {
        await standaloneDb.updateSharingPermission(linkId, key as PermissionKey, Boolean(val));
      }
      return;
    }
    const updates = Object.entries(permsOrPreset).map(([key, val]) => ({
      link_id: linkId,
      permission_name: key,
      enabled: Boolean(val),
      updated_at: new Date().toISOString(),
    }));
    const client = supabase;
    const { error } = await client.from('sharing_permissions').upsert(updates, { onConflict: 'link_id,permission_name' });
    if (error) throw error;
  },

  // 10. Data Export (JSON & CSV)
  async exportAllDataJson(userId: string): Promise<string> {
    const profile = await this.getProfile(userId);
    const cycle = await this.getCycleProfile(userId);
    const periods = await this.getPeriodLogs(userId);
    const dailies = await this.getDailyLogs(userId);
    return JSON.stringify({ profile, cycle, periods, dailies, exported_at: new Date().toISOString() }, null, 2);
  },

  async exportDataCsv(userId: string): Promise<string> {
    const dailies = await this.getDailyLogs(userId);
    const header = 'date,mood,energy,flow,sleep_hours,water_glasses,symptoms\n';
    const rows = dailies.map(d => 
      `${d.log_date},${d.mood || ''},${d.energy || ''},${d.flow || ''},${d.sleep_hours || ''},${d.water_glasses || ''},"${(d.symptoms || []).join(';')}"`
    ).join('\n');
    return header + rows;
  },

  // 11. Cascading Account Deletion
  async deleteUserAccount(userId?: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      if (!userId) return;
      return standaloneDb.deleteUserAccount(userId);
    }
    const client = supabase;
    const { error } = await client.rpc('delete_user_account');
    if (error) throw error;
  },
};
