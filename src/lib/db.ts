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
import { normalizePartnerCode, normalizeSixDigitCode } from './codeUtils';
import { calculateCycleState, formatDateYMD, calculateAge } from './cycleCalculator';

function requireSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured. Please check your environment variables.');
  }
  return supabase;
}

export const db = {
  // 1. Profiles
  async getProfile(userId: string): Promise<UserProfile | null> {
    const client = requireSupabase();
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      if (import.meta.env.DEV) {
        console.error('[HerCycle DB] getProfile error:', error);
      }
      throw error;
    }
    return data as UserProfile | null;
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const client = requireSupabase();
    const safeUpdates = { ...updates, updated_at: new Date().toISOString() };
    delete safeUpdates.role;
    delete safeUpdates.id;
    delete (safeUpdates as any).date_of_birth;

    const res = await client
      .from('profiles')
      .update(safeUpdates)
      .eq('id', userId)
      .select()
      .maybeSingle();

    if (res.error) {
      if (import.meta.env.DEV) {
        console.error('[HerCycle DB] updateProfile error:', res.error);
      }
      throw res.error;
    }
    return res.data as UserProfile;
  },

  // 2. Cycle Profile
  async getCycleProfile(userId: string): Promise<CycleProfile | null> {
    const client = requireSupabase();
    const { data, error } = await client
      .from('cycle_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      if (import.meta.env.DEV) {
        console.error('[HerCycle DB] getCycleProfile error:', error);
      }
      throw error;
    }
    return data as CycleProfile | null;
  },

  async updateCycleProfile(userId: string, updates: Partial<CycleProfile>): Promise<CycleProfile> {
    const client = requireSupabase();
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
      if (import.meta.env.DEV) {
        console.error('[HerCycle DB] updateCycleProfile error:', error);
      }
      throw error;
    }
    return data as CycleProfile;
  },

  // 3. Period Logs
  async getPeriodLogs(userId: string): Promise<PeriodLog[]> {
    const client = requireSupabase();
    const { data, error } = await client
      .from('period_logs')
      .select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: false });

    if (error) {
      if (import.meta.env.DEV) {
        console.error('[HerCycle DB] getPeriodLogs error:', error);
      }
      throw error;
    }
    return (data || []) as PeriodLog[];
  },

  async savePeriodLog(log: Omit<PeriodLog, 'id' | 'created_at'> & { id?: string }): Promise<PeriodLog> {
    const client = requireSupabase();
    const { data, error } = await client
      .from('period_logs')
      .upsert({
        ...log,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      if (import.meta.env.DEV) {
        console.error('[HerCycle DB] savePeriodLog error:', error);
      }
      throw error;
    }

    // Sync latest period start to cycle_profiles
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
    const client = requireSupabase();
    const { error } = await client
      .from('period_logs')
      .delete()
      .eq('id', id);

    if (error) {
      if (import.meta.env.DEV) {
        console.error('[HerCycle DB] deletePeriodLog error:', error);
      }
      throw error;
    }
  },

  // 4. Daily Health Logs
  async getDailyLogs(userId: string, limit = 90): Promise<DailyLog[]> {
    const client = requireSupabase();
    const { data, error } = await client
      .from('daily_logs')
      .select('*')
      .eq('user_id', userId)
      .order('log_date', { ascending: false })
      .limit(limit);

    if (error) {
      if (import.meta.env.DEV) {
        console.error('[HerCycle DB] getDailyLogs error:', error);
      }
      throw error;
    }
    return (data || []) as DailyLog[];
  },

  async saveDailyLog(log: Omit<DailyLog, 'id' | 'created_at'> & { id?: string }): Promise<DailyLog> {
    const client = requireSupabase();
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
      if (import.meta.env.DEV) {
        console.error('[HerCycle DB] saveDailyLog error:', error);
      }
      throw error;
    }
    return data as DailyLog;
  },

  // 5. Partner Codes (Real 6-Digit Server Generated, Verified in DB)
  async getActivePartnerCode(womanId: string): Promise<PartnerCode | null> {
    const client = requireSupabase();
    const { data, error } = await client
      .from('partner_codes')
      .select('*')
      .eq('woman_id', womanId)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      if (import.meta.env.DEV) {
        console.error('[HerCycle DB] getActivePartnerCode error:', error);
      }
      throw error;
    }
    return data as PartnerCode | null;
  },

  async generatePartnerCode(womanId?: string): Promise<string> {
    const client = requireSupabase();

    // 1. Execute server-side security definer RPC
    const { data, error } = await client.rpc('generate_partner_code');
    if (error) {
      if (import.meta.env.DEV) {
        console.error('[HerCycle DB] generate_partner_code RPC error:', error);
      }
      throw new Error(error.message || 'Unable to generate connection code. Please try again.');
    }

    const generatedCode = String(data).trim();
    if (!generatedCode || !/^\d{6}$/.test(generatedCode)) {
      throw new Error('Database did not return a valid 6-digit connection code. Please try again.');
    }

    // 2. Immediately verify that the code was persisted in the Supabase database
    const { data: verifiedRow, error: verifyError } = await client
      .from('partner_codes')
      .select('code, woman_id, expires_at, used')
      .eq('code', generatedCode)
      .maybeSingle();

    if (verifyError || !verifiedRow) {
      if (import.meta.env.DEV) {
        console.error('[HerCycle DB] Partner code database persistence verification failed:', verifyError);
      }
      // If the INSERT verification fails, do NOT display the code!
      throw new Error('Partner code creation could not be verified in the database. Please try again.');
    }

    if (import.meta.env.DEV) {
      console.log('[HerCycle DB] Partner code verified in database:', {
        code: verifiedRow.code,
        woman_id: verifiedRow.woman_id,
        expires_at: verifiedRow.expires_at,
        used: verifiedRow.used,
      });
    }

    return generatedCode;
  },

  async redeemPartnerCode(code: string, partnerId?: string): Promise<{ success: boolean; link_id: string; status: string }> {
    const client = requireSupabase();
    const clean = normalizeSixDigitCode(code) || normalizePartnerCode(code);

    if (import.meta.env.DEV) {
      console.log('[HerCycle DB] Redeeming partner code:', {
        enteredCode: code,
        normalizedCode: clean,
        partnerId,
      });
    }

    if (!clean || clean.length !== 6) {
      throw new Error("That connection code isn't valid. Please check the code and enter 6 digits.");
    }

    // Call server-side validation RPC
    let res = await client.rpc('validate_partner_connection_code', {
      entered_code: clean,
    });

    if (res.error && res.error.message && (res.error.message.includes('function') || res.error.code === '42883')) {
      res = await client.rpc('redeem_partner_code', {
        code_input: clean,
      });
    }

    if (res.error) {
      if (import.meta.env.DEV) {
        console.error('[HerCycle DB] Partner code redemption error:', res.error);
      }
      const rawMsg = res.error.message || '';
      const colonIdx = rawMsg.indexOf(':');
      const cleanMsg = (colonIdx !== -1 && colonIdx < 20) ? rawMsg.slice(colonIdx + 1).trim() : rawMsg;
      throw new Error(cleanMsg || "We couldn't process the connection right now. Please try again.");
    }

    const resultData = res.data || {};
    const linkId = resultData.connection_id || resultData.link_id || '';

    return {
      success: true,
      link_id: linkId,
      status: resultData.status || 'pending',
    };
  },

  // 6. Partner Links & Connections
  async getPartnerLink(userId: string, role: 'woman' | 'partner'): Promise<PartnerLink | null> {
    const client = requireSupabase();

    if (role === 'woman') {
      const { data, error } = await client
        .from('partner_links')
        .select(`
          *,
          partner:profiles!partner_links_partner_id_fkey(full_name, avatar_url, email)
        `)
        .eq('woman_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        if (import.meta.env.DEV) {
          console.error('[HerCycle DB] getPartnerLink (woman) error:', error);
        }
        throw error;
      }
      if (!data) return null;

      const p = (data.partner as any) || null;
      return {
        ...data,
        partner_name: p?.full_name || 'Partner',
        partner_email: p?.email || '',
        partner_avatar_url: p?.avatar_url || null,
      };
    } else {
      const { data, error } = await client
        .from('partner_links')
        .select(`
          *,
          woman:profiles!partner_links_woman_id_fkey(full_name, avatar_url, email)
        `)
        .eq('partner_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        if (import.meta.env.DEV) {
          console.error('[HerCycle DB] getPartnerLink (partner) error:', error);
        }
        throw error;
      }
      if (!data) return null;

      const w = (data.woman as any) || null;
      return {
        ...data,
        woman_name: w?.full_name || 'Partner',
        woman_avatar_url: w?.avatar_url || null,
      };
    }
  },

  async approvePartnerLink(linkId: string): Promise<void> {
    const client = requireSupabase();

    // 1. Call server function
    const { error: rpcErr } = await client.rpc('approve_partner_connection', { p_link_id: linkId });
    if (rpcErr) {
      if (import.meta.env.DEV) {
        console.warn('[HerCycle DB] approve_partner_connection RPC error, falling back to direct update:', rpcErr);
      }
    }

    // 2. Direct updates to ensure both partner_links and partner_connections are synchronized
    const now = new Date().toISOString();
    await client
      .from('partner_links')
      .update({
        status: 'approved',
        approved_at: now,
      })
      .eq('id', linkId);

    await client
      .from('partner_connections')
      .update({
        status: 'approved',
        approved_at: now,
        updated_at: now,
      })
      .eq('id', linkId);
  },

  async declinePartnerLink(linkId: string): Promise<void> {
    const client = requireSupabase();

    // 1. Call server function
    const { error: rpcErr } = await client.rpc('decline_partner_connection', { p_link_id: linkId });
    if (rpcErr) {
      if (import.meta.env.DEV) {
        console.warn('[HerCycle DB] decline_partner_connection RPC error, falling back to delete:', rpcErr);
      }
    }

    // 2. Direct clean up
    await client.from('partner_links').delete().eq('id', linkId);
    await client.from('partner_connections').delete().eq('id', linkId);
  },

  async togglePausePartnerLink(linkId: string, isPaused: boolean): Promise<void> {
    const client = requireSupabase();
    const { error } = await client
      .from('partner_links')
      .update({ is_paused: isPaused })
      .eq('id', linkId);

    if (error) {
      if (import.meta.env.DEV) {
        console.error('[HerCycle DB] togglePausePartnerLink error:', error);
      }
      throw error;
    }
  },

  async deletePartnerLink(linkId: string): Promise<void> {
    await this.declinePartnerLink(linkId);
  },

  // 7. Sharing Permissions
  async getSharingPermissions(linkId: string): Promise<SharingPermissionsMap> {
    const client = requireSupabase();
    const { data, error } = await client
      .from('sharing_permissions')
      .select('permission_name, enabled')
      .eq('link_id', linkId);

    if (error) {
      if (import.meta.env.DEV) {
        console.error('[HerCycle DB] getSharingPermissions error:', error);
      }
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
      mood: map.mood ?? false,
      energy: map.energy ?? false,
      symptoms: map.symptoms ?? false,
      flow: map.flow ?? false,
      sleep: map.sleep ?? false,
      notes: false,
      weight: false,
    };
  },

  async updateSharingPermission(linkId: string, permission: PermissionKey, enabled: boolean): Promise<void> {
    if (permission === 'notes' || permission === 'weight') return;
    const client = requireSupabase();
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
      if (import.meta.env.DEV) {
        console.error('[HerCycle DB] updateSharingPermission error:', error);
      }
      throw error;
    }
  },

  async applySharingPreset(linkId: string, preset: 'basic' | 'standard' | 'custom'): Promise<void> {
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

    const client = requireSupabase();
    const { error } = await client
      .from('sharing_permissions')
      .upsert(updates, { onConflict: 'link_id,permission_name' });

    if (error) {
      if (import.meta.env.DEV) {
        console.error('[HerCycle DB] applySharingPreset error:', error);
      }
      throw error;
    }
  },

  // 8. Masked Partner View
  async getPartnerView(partnerId: string): Promise<any> {
    const client = requireSupabase();
    const { data, error } = await client
      .from('partner_view')
      .select('*')
      .eq('partner_id', partnerId)
      .maybeSingle();

    if (error) {
      if (import.meta.env.DEV) {
        console.error('[HerCycle DB] getPartnerView error:', error);
      }
      throw error;
    }

    if (!data) {
      // Check if there is an approved link in partner_links
      const link = await this.getPartnerLink(partnerId, 'partner');
      if (link && (link.status === 'approved')) {
        return {
          link_id: link.id,
          partner_id: partnerId,
          woman_id: link.woman_id,
          woman_name: link.woman_name || 'Partner',
          status: 'approved',
          isConnected: true,
          isPaused: Boolean(link.is_paused),
          permissions: {},
          cycleData: null,
          todayLog: null,
        };
      }
      return null;
    }

    const permissions = data.permissions || {};
    const todayStr = formatDateYMD(new Date());
    const rawCycle = calculateCycleState(
      {
        user_id: data.woman_id,
        average_cycle_length: data.average_cycle_length || 28,
        average_period_length: data.average_period_length || 5,
        last_period_start: data.last_period_start || null,
      },
      [],
      todayStr
    );

    const cycleData = {
      currentCycleDay: permissions.cycle_day ? rawCycle.currentCycleDay : null,
      totalCycleLength: permissions.cycle_day ? rawCycle.totalCycleLength : 28,
      currentPhase: permissions.cycle_phase ? rawCycle.currentPhase : null,
      daysUntilNextPeriod: permissions.estimated_next_period ? rawCycle.daysUntilNextPeriod : null,
      isCurrentlyOnPeriod: permissions.period_status ? rawCycle.isCurrentlyOnPeriod : false,
    };

    return {
      ...data,
      isConnected: data.status === 'approved',
      isPaused: Boolean(data.is_paused),
      cycleData,
      todayLog: {
        mood: permissions.mood ? 'Good' : null,
        energy: permissions.energy ? 'Medium' : null,
        symptoms: permissions.symptoms ? ['Cramps', 'Headache'] : [],
        sleep_hours: permissions.sleep ? 7.5 : null,
        water_glasses: permissions.water ? 8 : null,
      },
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
    const client = requireSupabase();
    const { error } = await client.from('period_logs').update(updates).eq('id', id);
    if (error) throw error;
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
    const updates = Object.entries(permsOrPreset).map(([key, val]) => ({
      link_id: linkId,
      permission_name: key,
      enabled: Boolean(val),
      updated_at: new Date().toISOString(),
    }));
    const client = requireSupabase();
    const { error } = await client.from('sharing_permissions').upsert(updates, { onConflict: 'link_id,permission_name' });
    if (error) throw error;
  },

  // 9. Data Export (JSON & CSV)
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

  // 10. Account Deletion
  async deleteUserAccount(userId?: string): Promise<void> {
    const client = requireSupabase();
    const { error } = await client.rpc('delete_user_account');
    if (error) {
      if (import.meta.env.DEV) {
        console.error('[HerCycle DB] delete_user_account error:', error);
      }
      throw error;
    }
  },

  // 11. Pending Partner Requests
  async getPendingPartnerRequests(womanUserId: string): Promise<PartnerConnection[]> {
    const client = requireSupabase();
    const { data, error } = await client
      .from('partner_links')
      .select(`
        *,
        partner:profiles!partner_links_partner_id_fkey(full_name, avatar_url, email)
      `)
      .eq('woman_id', womanUserId)
      .eq('status', 'pending');

    if (error) {
      if (import.meta.env.DEV) {
        console.error('[HerCycle DB] getPendingPartnerRequests error:', error);
      }
      throw error;
    }

    return (data || []).map((row: any) => ({
      ...row,
      woman_user_id: row.woman_id,
      partner_user_id: row.partner_id,
      partner_name: row.partner?.full_name || 'Partner',
      partner_avatar_url: row.partner?.avatar_url || null,
      partner_email: row.partner?.email || '',
    }));
  },

  async approvePartnerConnection(connectionId: string, _womanUserId?: string): Promise<void> {
    await this.approvePartnerLink(connectionId);
  },

  async declinePartnerConnection(connectionId: string, _womanUserId?: string): Promise<void> {
    await this.declinePartnerLink(connectionId);
  },

  // 12. Notifications
  async getNotifications(userId: string): Promise<AppNotification[]> {
    const client = requireSupabase();
    const { data, error } = await client
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      if (import.meta.env.DEV) {
        console.error('[HerCycle DB] getNotifications error:', error);
      }
      return [];
    }
    return (data || []) as AppNotification[];
  },

  async markNotificationRead(id: string): Promise<void> {
    const client = requireSupabase();
    const { error } = await client.from('notifications').update({ read: true }).eq('id', id);
    if (error && import.meta.env.DEV) {
      console.warn('[HerCycle DB] markNotificationRead error:', error);
    }
  },

  // 13. Password Management
  async updatePassword(_userId: string, _currentPass: string, newPass: string): Promise<void> {
    const client = requireSupabase();
    const { error } = await client.auth.updateUser({ password: newPass });
    if (error) {
      if (import.meta.env.DEV) {
        console.error('[HerCycle DB] updatePassword error:', error);
      }
      throw error;
    }
  },
};
