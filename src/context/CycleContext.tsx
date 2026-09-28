import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  CycleProfile, 
  PeriodLog, 
  DailyLog, 
  PartnerConnection, 
  SharingPermissionsMap, 
  PermissionKey,
  FlowLevel
} from '../types/database';
import { CycleCalculationResult, CycleStats } from '../types/cycle';
import { calculateCycleState, computeCycleStatistics, formatDateYMD } from '../lib/cycleCalculator';
import { db } from '../lib/db';
import { DEMO_CYCLE_PROFILE, DEMO_SHARING_PERMISSIONS } from '../lib/seedData';
import { SHARING_PRESETS } from '../lib/constants';
import { useAuth } from './AuthContext';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error' | 'warning';
}

interface CycleContextType {
  cycleProfile: CycleProfile;
  periodLogs: PeriodLog[];
  dailyLogs: DailyLog[];
  cycleState: CycleCalculationResult;
  stats: CycleStats;
  partnerConnection: PartnerConnection | null;
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
  approvePartner: (connId: string) => Promise<void>;
  declinePartner: (connId: string) => Promise<void>;
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
  const [selectedDate, setSelectedDate] = useState<string>(formatDateYMD(new Date()));
  const [cycleProfile, setCycleProfile] = useState<CycleProfile>(DEMO_CYCLE_PROFILE);
  const [periodLogs, setPeriodLogs] = useState<PeriodLog[]>([]);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [partnerConnection, setPartnerConnection] = useState<PartnerConnection | null>(null);
  const [sharingPermissions, setSharingPermissions] = useState<SharingPermissionsMap>({ ...DEMO_SHARING_PERMISSIONS });
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
    if (!user) return;
    try {
      if (user.role === 'woman') {
        const [profile, periods, dailies, conn] = await Promise.all([
          db.getCycleProfile(user.id),
          db.getPeriodLogs(user.id),
          db.getDailyLogs(user.id),
          db.getPartnerConnection(user.id, 'woman'),
        ]);

        setCycleProfile(profile);
        setPeriodLogs(periods);
        setDailyLogs(dailies);
        setPartnerConnection(conn);

        if (conn) {
          const perms = await db.getSharingPermissions(conn.id);
          setSharingPermissions(perms);
        }
      }
    } catch (e) {
      console.error('Error refreshing cycle data:', e);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      refresh();
    }
  }, [user, refresh]);

  // Calculations
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
    const code = await db.generateConnectionCode(user.id);
    await refresh();
    addToast(`New connection code generated: ${code}`, 'info');
    return code;
  };

  const approvePartner = async (connId: string) => {
    try {
      await db.approveConnection(connId);
      await refresh();
      addToast('Partner connection approved! 🎉', 'success');
    } catch (e: any) {
      addToast(e?.message || 'Failed to approve partner', 'error');
    }
  };

  const declinePartner = async (connId: string) => {
    try {
      await db.declineConnection(connId);
      await refresh();
      addToast('Connection request declined', 'info');
    } catch (e: any) {
      addToast(e?.message || 'Failed to decline partner', 'error');
    }
  };

  const togglePauseSharing = async (pause: boolean) => {
    if (!partnerConnection) return;
    try {
      await db.togglePauseSharing(partnerConnection.id, pause);
      await refresh();
      addToast(pause ? 'Partner sharing paused ⏸️' : 'Partner sharing resumed ▶️', 'info');
    } catch (e: any) {
      addToast(e?.message || 'Failed to toggle sharing', 'error');
    }
  };

  const disconnectPartner = async () => {
    if (!partnerConnection) return;
    try {
      await db.removePartner(partnerConnection.id);
      await refresh();
      addToast('Partner disconnected', 'info');
    } catch (e: any) {
      addToast(e?.message || 'Failed to disconnect partner', 'error');
    }
  };

  const updateSharingPermission = async (key: PermissionKey, enabled: boolean) => {
    if (!partnerConnection) return;
    try {
      const updated = await db.updateSharingPermission(partnerConnection.id, key, enabled);
      setSharingPermissions(updated);
      addToast('Sharing settings updated', 'success');
    } catch (e: any) {
      addToast(e?.message || 'Failed to update setting', 'error');
    }
  };

  const applyPreset = async (presetId: 'basic' | 'standard' | 'custom') => {
    if (!partnerConnection) return;
    const preset = SHARING_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    try {
      const updated = await db.applyPreset(partnerConnection.id, preset.permissions);
      setSharingPermissions(updated);
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
        partnerConnection,
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
