import { 
  UserProfile, 
  CycleProfile, 
  PeriodLog, 
  DailyLog, 
  PartnerLink,
  PartnerConnection,
  PartnerCode,
  SharingPermissionsMap, 
  PermissionKey,
  AppNotification
} from '../types/database';
import { supabase, isSupabaseConfigured } from './supabase';
import { standaloneDb } from './standaloneDb';
import { normalizePartnerCode } from './codeUtils';

function isMissingSchemaError(err: any): boolean {
  if (!err) return false;
  const msg = (err.message || '').toLowerCase();
  const code = (err.code || '').toLowerCase();
  return (
    code === 'pgrst205' ||
    code === '42p01' ||
    code === '42883' ||
    msg.includes('schema cache') ||
    msg.includes('could not find the table') ||
    msg.includes('relation') ||
    msg.includes('does not exist') ||
    msg.includes('function')
  );
}

export const db = {
  // 1. Profiles
  async getProfile(userId: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured || !supabase) {
      return standaloneDb.getProfile(userId);
    }
    try {
      const client = supabase;
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        if (isMissingSchemaError(error)) return standaloneDb.getProfile(userId);
        throw error;
      }
      return data as UserProfile | null;
    } catch (e) {
      if (isMissingSchemaError(e)) return standaloneDb.getProfile(userId);
      throw e;
    }
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    if (!isSupabaseConfigured || !supabase) {
      return standaloneDb.updateProfile(userId, updates);
    }
    try {
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

      if (error) {
        if (isMissingSchemaError(error)) return standaloneDb.updateProfile(userId, updates);
        throw error;
      }
      return data as UserProfile;
    } catch (e) {
      if (isMissingSchemaError(e)) return standaloneDb.updateProfile(userId, updates);
      throw e;
    }
  },

  // 2. Active Session Enforcement
  async upsertActiveSession(userId: string, sessionId: string, device?: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      return standaloneDb.upsertActiveSession(userId, sessionId, device);
    }
    try {
      const client = supabase;
      const { error } = await client
        .from('active_sessions')
        .upsert({
          user_id: userId,
          session_id: sessionId,
          device: device || (typeof navigator !== 'undefined' ? navigator.userAgent : 'device'),
          updated_at: new Date().toISOString(),
        });

      if (error) {
        if (isMissingSchemaError(error)) return standaloneDb.upsertActiveSession(userId, sessionId, device);
        throw error;
      }
    } catch (e) {
      if (isMissingSchemaError(e)) return standaloneDb.upsertActiveSession(userId, sessionId, device);
      throw e;
    }
  },

  async getActiveSession(userId: string): Promise<string | null> {
    if (!isSupabaseConfigured || !supabase) {
      return standaloneDb.getActiveSession(userId);
    }
    try {
      const client = supabase;
      const { data, error } = await client
        .from('active_sessions')
        .select('session_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        if (isMissingSchemaError(error)) return standaloneDb.getActiveSession(userId);
        throw error;
      }
      return data?.session_id || null;
    } catch (e) {
      if (isMissingSchemaError(e)) return standaloneDb.getActiveSession(userId);
      throw e;
    }
  },

  // 3. Cycle Profile
  async getCycleProfile(userId: string): Promise<CycleProfile | null> {
    if (!isSupabaseConfigured || !supabase) {
      return standaloneDb.getCycleProfile(userId);
    }
    try {
      const client = supabase;
      const { data, error } = await client
        .from('cycle_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        if (isMissingSchemaError(error)) return standaloneDb.getCycleProfile(userId);
        throw error;
      }
      return data as CycleProfile | null;
    } catch (e) {
      if (isMissingSchemaError(e)) return standaloneDb.getCycleProfile(userId);
      throw e;
    }
  },

  async updateCycleProfile(userId: string, updates: Partial<CycleProfile>): Promise<CycleProfile> {
    if (!isSupabaseConfigured || !supabase) {
      return standaloneDb.updateCycleProfile(userId, updates);
    }
    try {
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

      if (error) {
        if (isMissingSchemaError(error)) return standaloneDb.updateCycleProfile(userId, updates);
        throw error;
      }
      return data as CycleProfile;
    } catch (e) {
      if (isMissingSchemaError(e)) return standaloneDb.updateCycleProfile(userId, updates);
      throw e;
    }
  },

  // 4. Period Logs
  async getPeriodLogs(userId: string): Promise<PeriodLog[]> {
    if (!isSupabaseConfigured || !supabase) {
      return standaloneDb.getPeriodLogs(userId);
    }
    try {
      const client = supabase;
      const { data, error } = await client
        .from('period_logs')
        .select('*')
        .eq('user_id', userId)
        .order('start_date', { ascending: false });

      if (error) {
        if (isMissingSchemaError(error)) return standaloneDb.getPeriodLogs(userId);
        throw error;
      }
      return data as PeriodLog[];
    } catch (e) {
      if (isMissingSchemaError(e)) return standaloneDb.getPeriodLogs(userId);
      throw e;
    }
  },

  async savePeriodLog(log: Omit<PeriodLog, 'id' | 'created_at'> & { id?: string }): Promise<PeriodLog> {
    if (!isSupabaseConfigured || !supabase) {
      return standaloneDb.savePeriodLog(log);
    }
    try {
      const client = supabase;
      const { data, error } = await client
        .from('period_logs')
        .upsert({
          ...log,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        if (isMissingSchemaError(error)) return standaloneDb.savePeriodLog(log);
        throw error;
      }

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
    } catch (e) {
      if (isMissingSchemaError(e)) return standaloneDb.savePeriodLog(log);
      throw e;
    }
  },

  async deletePeriodLog(id: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      return standaloneDb.deletePeriodLog(id);
    }
    try {
      const client = supabase;
      const { error } = await client
        .from('period_logs')
        .delete()
        .eq('id', id);

      if (error) {
        if (isMissingSchemaError(error)) return standaloneDb.deletePeriodLog(id);
        throw error;
      }
    } catch (e) {
      if (isMissingSchemaError(e)) return standaloneDb.deletePeriodLog(id);
      throw e;
    }
  },

  // 5. Daily Health Logs
  async getDailyLogs(userId: string, limit = 90): Promise<DailyLog[]> {
    if (!isSupabaseConfigured || !supabase) {
      return standaloneDb.getDailyLogs(userId, limit);
    }
    try {
      const client = supabase;
      const { data, error } = await client
        .from('daily_logs')
        .select('*')
        .eq('user_id', userId)
        .order('log_date', { ascending: false })
        .limit(limit);

      if (error) {
        if (isMissingSchemaError(error)) return standaloneDb.getDailyLogs(userId, limit);
        throw error;
      }
      return data as DailyLog[];
    } catch (e) {
      if (isMissingSchemaError(e)) return standaloneDb.getDailyLogs(userId, limit);
      throw e;
    }
  },

  async saveDailyLog(log: Omit<DailyLog, 'id' | 'created_at'> & { id?: string }): Promise<DailyLog> {
    if (!isSupabaseConfigured || !supabase) {
      return standaloneDb.saveDailyLog(log);
    }
    try {
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

      if (error) {
        if (isMissingSchemaError(error)) return standaloneDb.saveDailyLog(log);
        throw error;
      }
      return data as DailyLog;
    } catch (e) {
      if (isMissingSchemaError(e)) return standaloneDb.saveDailyLog(log);
      throw e;
    }
  },

  // 6. Partner Codes (HER-XXXXXX, 24h expiration, instant expiration on redemption)
  async getActivePartnerCode(womanId: string): Promise<PartnerCode | null> {
    if (!isSupabaseConfigured || !supabase) {
      return standaloneDb.getActivePartnerCode(womanId);
    }
    try {
      const client = supabase;
      const { data, error } = await client
        .from('partner_codes')
        .select('*')
        .eq('woman_id', womanId)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (error) {
        if (isMissingSchemaError(error)) return standaloneDb.getActivePartnerCode(womanId);
        throw error;
      }
      return data as PartnerCode | null;
    } catch (e) {
      if (isMissingSchemaError(e)) return standaloneDb.getActivePartnerCode(womanId);
      throw e;
    }
  },

  async generatePartnerCode(womanId?: string): Promise<string> {
    if (!isSupabaseConfigured || !supabase) {
      if (!womanId) throw new Error('Woman ID is required');
      return standaloneDb.generatePartnerCode(womanId);
    }
    try {
      const client = supabase;
      const { data, error } = await client.rpc('generate_partner_code');
      if (error) {
        if (isMissingSchemaError(error) && womanId) return standaloneDb.generatePartnerCode(womanId);
        throw error;
      }
      return data as string;
    } catch (e) {
      if (isMissingSchemaError(e) && womanId) return standaloneDb.generatePartnerCode(womanId);
      throw e;
    }
  },

  async redeemPartnerCode(code: string, partnerId?: string): Promise<{ success: boolean; link_id: string; status: string }> {
    const clean = normalizePartnerCode(code);
    if (!isSupabaseConfigured || !supabase) {
      if (!partnerId) throw new Error('Partner ID is required');
      return standaloneDb.redeemPartnerCode(partnerId, clean);
    }
    try {
      const client = supabase;
      const { data, error } = await client.rpc('redeem_partner_code', {
        code_input: clean,
      });
      if (error) {
        if (isMissingSchemaError(error) && partnerId) {
          return standaloneDb.redeemPartnerCode(partnerId, clean);
        }
        throw error;
      }
      return data;
    } catch (err: any) {
      if (partnerId && isMissingSchemaError(err)) {
        return standaloneDb.redeemPartnerCode(partnerId, clean);
      }
      throw err;
    }
  },

  async redeemAndCreatePartner(
    code: string,
    fullName?: string,
    email?: string,
    password?: string
  ): Promise<{ profile: UserProfile; linkId: string }> {
    return standaloneDb.redeemAndCreatePartner(code, fullName, email, password);
  },

  // 7. Partner Links
  async getPartnerLink(userId: string, role: 'woman' | 'partner'): Promise<PartnerLink | null> {
    if (!isSupabaseConfigured || !supabase) {
      return standaloneDb.getPartnerLink(userId, role);
    }
    try {
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

        if (error) {
          if (isMissingSchemaError(error)) return standaloneDb.getPartnerLink(userId, role);
          throw error;
        }
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

        if (error) {
          if (isMissingSchemaError(error)) return standaloneDb.getPartnerLink(userId, role);
          throw error;
        }
        if (!data) return null;

        const w = data.woman as any;
        return {
          ...data,
          woman_name: w?.full_name,
        };
      }
    } catch (e) {
      if (isMissingSchemaError(e)) return standaloneDb.getPartnerLink(userId, role);
      throw e;
    }
  },

  async approvePartnerLink(linkId: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      return standaloneDb.approvePartnerLink(linkId);
    }
    try {
      const client = supabase;
      const { error } = await client
        .from('partner_links')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
        })
        .eq('id', linkId);

      if (error) {
        if (isMissingSchemaError(error)) return standaloneDb.approvePartnerLink(linkId);
        throw error;
      }
    } catch (e) {
      if (isMissingSchemaError(e)) return standaloneDb.approvePartnerLink(linkId);
      throw e;
    }
  },

  async declinePartnerLink(linkId: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      return standaloneDb.declinePartnerLink(linkId);
    }
    try {
      const client = supabase;
      const { error } = await client
        .from('partner_links')
        .delete()
        .eq('id', linkId);

      if (error) {
        if (isMissingSchemaError(error)) return standaloneDb.declinePartnerLink(linkId);
        throw error;
      }
    } catch (e) {
      if (isMissingSchemaError(e)) return standaloneDb.declinePartnerLink(linkId);
      throw e;
    }
  },

  async togglePausePartnerLink(linkId: string, isPaused: boolean): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      return standaloneDb.togglePausePartnerLink(linkId, isPaused);
    }
    try {
      const client = supabase;
      const { error } = await client
        .from('partner_links')
        .update({ is_paused: isPaused })
        .eq('id', linkId);

      if (error) {
        if (isMissingSchemaError(error)) return standaloneDb.togglePausePartnerLink(linkId, isPaused);
        throw error;
      }
    } catch (e) {
      if (isMissingSchemaError(e)) return standaloneDb.togglePausePartnerLink(linkId, isPaused);
      throw e;
    }
  },

  async deletePartnerLink(linkId: string): Promise<void> {
    await this.declinePartnerLink(linkId);
  },

  // 8. Sharing Permissions
  async getSharingPermissions(linkId: string): Promise<SharingPermissionsMap> {
    if (!isSupabaseConfigured || !supabase) {
      return standaloneDb.getSharingPermissions(linkId);
    }
    try {
      const client = supabase;
      const { data, error } = await client
        .from('sharing_permissions')
        .select('permission_name, enabled')
        .eq('link_id', linkId);

      if (error) {
        if (isMissingSchemaError(error)) return standaloneDb.getSharingPermissions(linkId);
        throw error;
      }

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
    } catch (e) {
      if (isMissingSchemaError(e)) return standaloneDb.getSharingPermissions(linkId);
      throw e;
    }
  },

  async updateSharingPermission(linkId: string, permission: PermissionKey, enabled: boolean): Promise<void> {
    if (permission === 'notes' || permission === 'weight') return;
    if (!isSupabaseConfigured || !supabase) {
      return standaloneDb.updateSharingPermission(linkId, permission, enabled);
    }
    try {
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

      if (error) {
        if (isMissingSchemaError(error)) return standaloneDb.updateSharingPermission(linkId, permission, enabled);
        throw error;
      }
    } catch (e) {
      if (isMissingSchemaError(e)) return standaloneDb.updateSharingPermission(linkId, permission, enabled);
      throw e;
    }
  },

  async applySharingPreset(linkId: string, preset: 'basic' | 'standard' | 'custom'): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      return standaloneDb.applySharingPreset(linkId, preset);
    }
    try {
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

      if (error) {
        if (isMissingSchemaError(error)) return standaloneDb.applySharingPreset(linkId, preset);
        throw error;
      }
    } catch (e) {
      if (isMissingSchemaError(e)) return standaloneDb.applySharingPreset(linkId, preset);
      throw e;
    }
  },

  // 9. Masked Partner View
  async getPartnerView(partnerId: string): Promise<any> {
    if (!isSupabaseConfigured || !supabase) {
      return standaloneDb.getPartnerView(partnerId);
    }
    try {
      const client = supabase;
      const { data, error } = await client
        .from('partner_view')
        .select('*')
        .eq('partner_id', partnerId)
        .maybeSingle();

      if (error) {
        if (isMissingSchemaError(error)) {
          return standaloneDb.getPartnerView(partnerId);
        }
        throw error;
      }
      if (!data) return standaloneDb.getPartnerView(partnerId);

      return {
        ...data,
        isConnected: data.status === 'approved',
        isPaused: Boolean(data.is_paused),
        notes: null,
        weight_kg: null,
      };
    } catch (err: any) {
      if (isMissingSchemaError(err)) {
        return standaloneDb.getPartnerView(partnerId);
      }
      throw err;
    }
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
      try {
        const { error } = await client.from('period_logs').update(updates).eq('id', id);
        if (error && !isMissingSchemaError(error)) throw error;
        if (!error) return;
      } catch (e) {
        if (!isMissingSchemaError(e)) throw e;
      }
    }
    const logs = await standaloneDb.getPeriodLogs(updates.user_id || '');
    const existing = logs.find(l => l.id === id);
    if (existing) {
      await standaloneDb.savePeriodLog({ ...existing, ...updates });
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
    try {
      const updates = Object.entries(permsOrPreset).map(([key, val]) => ({
        link_id: linkId,
        permission_name: key,
        enabled: Boolean(val),
        updated_at: new Date().toISOString(),
      }));
      const client = supabase;
      const { error } = await client.from('sharing_permissions').upsert(updates, { onConflict: 'link_id,permission_name' });
      if (error && isMissingSchemaError(error)) {
        for (const [key, val] of Object.entries(permsOrPreset)) {
          await standaloneDb.updateSharingPermission(linkId, key as PermissionKey, Boolean(val));
        }
        return;
      }
      if (error) throw error;
    } catch (e) {
      if (isMissingSchemaError(e)) {
        for (const [key, val] of Object.entries(permsOrPreset)) {
          await standaloneDb.updateSharingPermission(linkId, key as PermissionKey, Boolean(val));
        }
        return;
      }
      throw e;
    }
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
    try {
      const client = supabase;
      const { error } = await client.rpc('delete_user_account');
      if (error) {
        if (isMissingSchemaError(error) && userId) return standaloneDb.deleteUserAccount(userId);
        throw error;
      }
    } catch (e) {
      if (isMissingSchemaError(e) && userId) return standaloneDb.deleteUserAccount(userId);
      throw e;
    }
  },

  // 12. Pending Partner Requests
  async getPendingPartnerRequests(womanUserId: string): Promise<PartnerConnection[]> {
    if (!isSupabaseConfigured || !supabase) {
      return standaloneDb.getPendingPartnerRequests(womanUserId);
    }
    try {
      const client = supabase;
      const { data, error } = await client
        .from('partner_links')
        .select(`
          *,
          partner:profiles!partner_links_partner_id_fkey(full_name, avatar_url, email)
        `)
        .eq('woman_id', womanUserId)
        .eq('status', 'pending');

      if (error) {
        if (isMissingSchemaError(error)) return standaloneDb.getPendingPartnerRequests(womanUserId);
        throw error;
      }
      return (data || []).map((row: any) => ({
        ...row,
        woman_user_id: row.woman_id,
        partner_user_id: row.partner_id,
        partner_name: row.partner?.full_name,
        partner_avatar_url: row.partner?.avatar_url,
        partner_email: row.partner?.email,
      }));
    } catch (e) {
      if (isMissingSchemaError(e)) return standaloneDb.getPendingPartnerRequests(womanUserId);
      throw e;
    }
  },

  async approvePartnerConnection(connectionId: string, womanUserId: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      return standaloneDb.approvePartnerConnection(connectionId, womanUserId);
    }
    try {
      await this.approvePartnerLink(connectionId);
    } catch (e) {
      if (isMissingSchemaError(e)) return standaloneDb.approvePartnerConnection(connectionId, womanUserId);
      throw e;
    }
  },

  async declinePartnerConnection(connectionId: string, womanUserId: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      return standaloneDb.declinePartnerConnection(connectionId, womanUserId);
    }
    try {
      await this.declinePartnerLink(connectionId);
    } catch (e) {
      if (isMissingSchemaError(e)) return standaloneDb.declinePartnerConnection(connectionId, womanUserId);
      throw e;
    }
  },

  // 13. Notifications
  async getNotifications(userId: string): Promise<AppNotification[]> {
    if (!isSupabaseConfigured || !supabase) {
      return standaloneDb.getNotifications(userId);
    }
    try {
      const client = supabase;
      const { data, error } = await client
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        if (isMissingSchemaError(error)) return standaloneDb.getNotifications(userId);
        throw error;
      }
      return (data || []) as AppNotification[];
    } catch (e) {
      if (isMissingSchemaError(e)) return standaloneDb.getNotifications(userId);
      throw e;
    }
  },

  async markNotificationRead(id: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      return standaloneDb.markNotificationRead(id);
    }
    try {
      const client = supabase;
      const { error } = await client.from('notifications').update({ read: true }).eq('id', id);
      if (error && !isMissingSchemaError(error)) throw error;
    } catch (e) {
      if (isMissingSchemaError(e)) return standaloneDb.markNotificationRead(id);
      throw e;
    }
  },

  // 14. Password Management
  async updatePassword(userId: string, currentPass: string, newPass: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.updateUser({ password: newPass });
      if (error) {
        if (isMissingSchemaError(error)) {
          return standaloneDb.updatePassword(userId, currentPass, newPass);
        }
        throw error;
      }
      return;
    }
    return standaloneDb.updatePassword(userId, currentPass, newPass);
  },
};
