export type UserRole = 'woman' | 'partner';
export type FlowLevel = 'none' | 'light' | 'medium' | 'heavy' | 'spotting';
export type MoodLevel = 'great' | 'good' | 'okay' | 'low' | 'difficult';
export type EnergyLevel = 'low' | 'medium' | 'high';
export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
export type ConnectionStatus = 'pending' | 'active' | 'paused' | 'rejected' | 'disconnected';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  date_of_birth?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CycleProfile {
  user_id: string;
  average_cycle_length: number;
  average_period_length: number;
  last_period_start: string;
  goals: string[];
  created_at?: string;
  updated_at?: string;
}

export interface PeriodLog {
  id: string;
  user_id: string;
  start_date: string; // YYYY-MM-DD
  end_date?: string;   // YYYY-MM-DD
  flow: FlowLevel;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DailyLog {
  id: string;
  user_id: string;
  log_date: string; // YYYY-MM-DD
  flow?: FlowLevel;
  mood?: MoodLevel;
  energy?: EnergyLevel;
  sleep_hours?: number;
  water_glasses?: number;
  weight?: number;
  notes?: string;
  symptoms?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface SymptomDefinition {
  id: string;
  name: string;
  icon: string;
  category: 'physical' | 'emotional' | 'digestive' | 'sleep';
  description?: string;
}

export interface PartnerConnection {
  id: string;
  woman_user_id: string;
  partner_user_id?: string;
  status: ConnectionStatus;
  connection_code: string;
  is_paused: boolean;
  created_at: string;
  approved_at?: string;
  partner_email?: string;
  partner_name?: string;
  woman_name?: string;
}

export type PermissionKey = 
  | 'cycle_phase'
  | 'cycle_day'
  | 'period_status'
  | 'estimated_next_period'
  | 'mood'
  | 'energy'
  | 'symptoms'
  | 'flow'
  | 'sleep'
  | 'notes'
  | 'weight';

export type SharingPermissionsMap = Record<PermissionKey, boolean>;

export interface SharingPermissionRecord {
  id: string;
  connection_id: string;
  permission_name: PermissionKey;
  enabled: boolean;
  updated_at: string;
}

export interface PartnerNotificationPref {
  id: string;
  connection_id: string;
  type: 'period_approaching' | 'period_started' | 'mood_update' | 'ovulation_window';
  enabled: boolean;
  discreet_wording: boolean;
}
