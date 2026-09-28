export type UserRole = 'woman' | 'partner';
export type FlowLevel = 'none' | 'light' | 'medium' | 'heavy' | 'spotting';
export type MoodLevel = 'great' | 'good' | 'okay' | 'low' | 'difficult';
export type EnergyLevel = 'low' | 'medium' | 'high';
export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
export type PartnerLinkStatus = 'pending' | 'approved' | 'paused';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  age?: number;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ActiveSession {
  user_id: string;
  session_id: string;
  device?: string;
  updated_at: string;
}

export interface CycleProfile {
  user_id: string;
  average_cycle_length: number;
  average_period_length: number;
  last_period_start: string | null;
  goals: string[];
  created_at?: string;
  updated_at?: string;
}

export interface PeriodLog {
  id: string;
  user_id: string;
  start_date: string; // YYYY-MM-DD
  end_date?: string | null; // YYYY-MM-DD
  flow: FlowLevel;
  notes?: string | null;
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
  weight?: number | null;
  notes?: string | null;
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

export interface PartnerCode {
  code: string;
  woman_id: string;
  expires_at: string;
  used: boolean;
  created_at: string;
}

export interface PartnerLink {
  id: string;
  woman_id: string;
  partner_id?: string | null;
  status: PartnerLinkStatus;
  is_paused: boolean;
  created_at: string;
  approved_at?: string | null;
  woman_name?: string;
  woman_avatar_url?: string;
  partner_name?: string;
  partner_avatar_url?: string;
  partner_email?: string;
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
  link_id: string;
  permission_name: PermissionKey;
  enabled: boolean;
  updated_at: string;
}
