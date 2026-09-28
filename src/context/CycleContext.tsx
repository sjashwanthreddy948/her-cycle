import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  CycleProfile, 
  PeriodLog, 
  DailyLog, 
  PartnerLink,
  PartnerCode,
  SharingPermissionsMap, 
  PermissionKey
} from '../types/database';
import { CycleCalculationResult, CycleStats } from '../types/cycle';
import { calculateCycleState, computeCycleStatistics, formatDateYMD } from '../lib/cycleCalculator';
import { db } from '../lib/db';
import { SHARING_PRESETS } from '../lib/constants';
import { useAuth } from './AuthContext';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error' | 'warning';
}

const DEFAULT_CYCLE_PROFILE: CycleProfile = {
  user_id: '',
  average_cycle_length: 28,
  average_period_length: 5,
  last_period_start: null,
  goals: [],
};

const DEFAULT_PERMISSIONS: SharingPermissionsMap = {
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

interface CycleContextType {
  cycleProfile: CycleProfile;
  periodLogs: PeriodLog[];
  dailyLogs: DailyLog[];
  cycleState: CycleCalculationResult;
  stats: CycleStats;
  partnerLink: PartnerLink | null;
  partnerConnection: PartnerLink | null;
  partnerCode: PartnerCode | null;
  sharingPermissions: SharingPermissionsMap;
  todayLog: DailyLog | null;
  selectedDate: string;
  toasts: ToastItem[];
  isLoading: boolean;
  setSelectedDate: (date: string) => void;
  addToast: (message: string, type?: 'success' | 'info' | 'error' | 'warning') => void;
  removeToast: (id: string) => void;
  saveTodayCheckIn: (data: Partial<DailyLog>) => Promise<void>;
  saveLogForDate: (dateStr: string, data: Partial<DailyLog>) => Promise<void>;
  addPeriodLog: (log: Omit<PeriodLog, 'id' | 'user_id'>) => Promise<void>;
  updatePeriodLog: (id: string, updates: Partial<PeriodLog>) => Promise<void>;
  deletePeriodLog: (id: string) => Promise<void>;
  generatePartnerCode: () => Promise<string>;
  redeemPartnerCode: (code: string) => Promise<{ success: boolean; link_id: string; status: string }>;
  approvePartner: (linkId: string) => Promise<void>;
  declinePartner: (linkId: string) => Promise<void>;
  togglePauseSharing: (pause: boolean) => Promise<void>;
  disconnectPartner: () => Promise<void>;
  updateSharingPermission: (key: PermissionKey, enabled: boolean) => Promise<void>;
  applyPreset: (presetId: 'basic' | 'standard' | 'custom') => Promise<void>;
  updateCycleProfile: (updates: Partial<CycleProfile>) => Promise<void>;
  refresh: () => Promise<void>;
}

const CycleContext = createContext<CycleContextType | undefined>(undefined);

export const CycleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(() => formatDateYMD(new Date()));
  const [cycleProfile, setCycleProfile] = useState<CycleProfile>(DEFAULT_CYCLE_PROFILE);
  const [periodLogs, setPeriodLogs] = useState<PeriodLog[]>([]);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [partnerLink, setPartnerLink] = useState<PartnerLink | null>(null);
  const [partnerCode, setPartnerCode] = useState<PartnerCode | null>(null);
  const [sharingPermissions, setSharingPermissions] = useState<SharingPermissionsMap>(DEFAULT_PERMISSIONS);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const addToast = useCallback((message: string, type: 'success' | 'info' | 'error' | 'warning' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const refresh = useCallback(async () => {
    if (!user) {
      setCycleProfile(DEFAULT_CYCLE_PROFILE);
      setPeriodLogs([]);
      setDailyLogs([]);
      setPartnerLink(null);
      setPartnerCode(null);
      setIsLoading(false);
      return;
    }

    try {
      if (user.role === 'woman') {
        const [profile, periods, dailies, link, code] = await Promise.all([
          db.getCycleProfile(user.id),
          db.getPeriodLogs(user.id),
          db.getDailyLogs(user.id),
          db.getPartnerLink(user.id, 'woman'),
          db.getActivePartnerCode(user.id),
        ]);

        setCycleProfile(profile || { ...DEFAULT_CYCLE_PROFILE, user_id: user.id });
        setPeriodLogs(periods);
        setDailyLogs(dailies);
        setPartnerLink(link);
        setPartnerCode(code);

        if (link) {
          const perms = await db.getSharingPermissions(link.id);
          setSharingPermissions(perms);
        }
      } else if (user.role === 'partner') {
        const link = await db.getPartnerLink(user.id, 'partner');
        setPartnerLink(link);
      }
    } catch (e: any) {
      console.error('Error refreshing cycle data:', e);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Derived Calculations
  const cycleState = calculateCycleState(cycleProfile, periodLogs, selectedDate);
  const stats = computeCycleStatistics(cycleProfile, periodLogs, dailyLogs);

  const todayStr = formatDateYMD(new Date());
  const todayLog = dailyLogs.find(d => d.log_date === todayStr) || null;

  const saveTodayCheckIn = async (data: Partial<DailyLog>) => {
    if (!user) return;
    try {
      await db.saveDailyLog({
        user_id: user.id,
        log_date: todayStr,
        ...data,
      });
      await refresh();
      addToast("Today's check-in saved! 💖", 'success');
    } catch (e: any) {
      addToast(e?.message || 'Could not save check-in', 'error');
    }
  };

  const saveLogForDate = async (dateStr: string, data: Partial<DailyLog>) => {
    if (!user) return;
    try {
      await db.saveDailyLog({
        user_id: user.id,
        log_date: dateStr,
        ...data,
      });
      await refresh();
      addToast(`Log for ${dateStr} updated successfully`, 'success');
    } catch (e: any) {
      addToast(e?.message || 'Could not save log', 'error');
    }
  };

  const addPeriodLog = async (log: Omit<PeriodLog, 'id' | 'user_id'>) => {
    if (!user) return;
    try {
      await db.addPeriodLog({
        user_id: user.id,
        ...log,
      });
      await refresh();
      addToast('Period recorded successfully 🩸', 'success');
    } catch (e: any) {
      addToast(e?.message || 'Failed to record period', 'error');
    }
  };

  const updatePeriodLog = async (id: string, updates: Partial<PeriodLog>) => {
    try {
      await db.updatePeriodLog(id, updates);
      await refresh();
      addToast('Period log updated', 'success');
    } catch (e: any) {
      addToast(e?.message || 'Failed to update period', 'error');
    }
  };

  const deletePeriodLog = async (id: string) => {
    try {
      await db.deletePeriodLog(id);
      await refresh();
      addToast('Period entry removed', 'info');
    } catch (e: any) {
      addToast(e?.message || 'Failed to delete period', 'error');
    }
  };

  const generatePartnerCode = async (): Promise<string> => {
    if (!user) throw new Error('Not authenticated');
    try {
      const code = await db.generatePartnerCode();
      await refresh();
      addToast(`Generated new partner code: ${code}`, 'info');
      return code;
    } catch (e: any) {
      addToast(e?.message || 'Failed to generate partner code', 'error');
      throw e;
    }
  };

  const redeemPartnerCode = async (code: string) => {
    const res = await db.redeemPartnerCode(code);
    await refresh();
    return res;
  };

  const approvePartner = async (linkId: string) => {
    try {
      await db.approvePartnerLink(linkId);
      await refresh();
      addToast('Partner connection approved! 🎉', 'success');
    } catch (e: any) {
      addToast(e?.message || 'Failed to approve partner', 'error');
    }
  };

  const declinePartner = async (linkId: string) => {
    try {
      await db.declinePartnerLink(linkId);
      await refresh();
      addToast('Connection request removed', 'info');
    } catch (e: any) {
      addToast(e?.message || 'Failed to decline partner', 'error');
    }
  };

  const togglePauseSharing = async (pause: boolean) => {
    if (!partnerLink) return;
    try {
      await db.togglePausePartner(partnerLink.id, pause);
      await refresh();
      addToast(pause ? 'Partner sharing paused ⏸️' : 'Partner sharing resumed ▶️', 'info');
    } catch (e: any) {
      addToast(e?.message || 'Failed to toggle sharing', 'error');
    }
  };

  const disconnectPartner = async () => {
    if (!partnerLink) return;
    try {
      await db.disconnectPartner(partnerLink.id);
      await refresh();
      addToast('Partner disconnected', 'info');
    } catch (e: any) {
      addToast(e?.message || 'Failed to disconnect partner', 'error');
    }
  };

  const updateSharingPermission = async (key: PermissionKey, enabled: boolean) => {
    if (!partnerLink) return;
    try {
      await db.updateSharingPermission(partnerLink.id, key, enabled);
      setSharingPermissions(prev => ({ ...prev, [key]: enabled }));
      addToast('Sharing settings updated', 'success');
    } catch (e: any) {
      addToast(e?.message || 'Failed to update setting', 'error');
    }
  };

  const applyPreset = async (presetId: 'basic' | 'standard' | 'custom') => {
    if (!partnerLink) return;
    const preset = SHARING_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    try {
      await db.applyPreset(partnerLink.id, preset.permissions);
      setSharingPermissions(preset.permissions);
      addToast(`Applied ${preset.name} preset!`, 'success');
    } catch (e: any) {
      addToast(e?.message || 'Failed to apply preset', 'error');
    }
  };

  const updateCycleProfile = async (updates: Partial<CycleProfile>) => {
    if (!user) return;
    try {
      const updated = await db.updateCycleProfile(user.id, updates);
      setCycleProfile(updated);
      await refresh();
      addToast('Cycle settings saved', 'success');
    } catch (e: any) {
      addToast(e?.message || 'Failed to save cycle settings', 'error');
    }
  };

  return (
    <CycleContext.Provider
      value={{
        cycleProfile,
        periodLogs,
        dailyLogs,
        cycleState,
        stats,
        partnerLink,
        partnerConnection: partnerLink,
        partnerCode,
        sharingPermissions,
        todayLog,
        selectedDate,
        toasts,
        isLoading,
        setSelectedDate,
        addToast,
        removeToast,
        saveTodayCheckIn,
        saveLogForDate,
        addPeriodLog,
        updatePeriodLog,
        deletePeriodLog,
        generatePartnerCode,
        redeemPartnerCode,
        approvePartner,
        declinePartner,
        togglePauseSharing,
        disconnectPartner,
        updateSharingPermission,
        applyPreset,
        updateCycleProfile,
        refresh,
      }}
    >
      {children}
    </CycleContext.Provider>
  );
};

export const useCycle = () => {
  const context = useContext(CycleContext);
  if (!context) {
    throw new Error('useCycle must be used within a CycleProvider');
  }
  return context;
};
