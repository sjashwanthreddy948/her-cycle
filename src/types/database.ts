export type UserRole = 'woman' | 'partner';
export type FlowLevel = 'none' | 'light' | 'medium' | 'heavy' | 'spotting';
export type MoodLevel = 'great' | 'good' | 'okay' | 'low' | 'difficult';
export type EnergyLevel = 'low' | 'medium' | 'high';
export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
export type PartnerConnectionStatus = 'pending' | 'approved' | 'declined' | 'paused';
export type PartnerLinkStatus = PartnerConnectionStatus;

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
  id?: string;
  user_id: string;
  average_cycle_length: number;
  average_period_length: number;
  last_period_start: string | null;
  goals?: string[];
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
  icon?: string;
  category?: 'physical' | 'emotional' | 'digestive' | 'sleep';
  description?: string;
}

export interface DailySymptomRecord {
  id: string;
  daily_log_id: string;
  symptom_id: string;
  severity?: 'mild' | 'moderate' | 'severe';
}

export interface PartnerConnectionCode {
  id: string;
  woman_user_id: string;
  code_hash: string;
  code_display?: string; // Stored securely for display to woman only
  expires_at: string;
  used_at?: string | null;
  created_at: string;
}

// Backwards-compatible alias
export type PartnerCode = {
  code: string;
  woman_id: string;
  expires_at: string;
  used: boolean;
  created_at: string;
};

export interface PartnerConnection {
  id: string;
  woman_user_id: string;
  partner_user_id: string;
  status: PartnerConnectionStatus;
  approved_at?: string | null;
  created_at: string;
  updated_at: string;
  // Hydrated helper properties
  woman_name?: string;
  woman_avatar_url?: string;
  woman_email?: string;
  partner_name?: string;
  partner_avatar_url?: string;
  partner_email?: string;
  is_paused?: boolean;
}

// Backwards-compatible alias for existing components
export interface PartnerLink extends PartnerConnection {
  woman_id: string;
  partner_id?: string | null;
  is_paused: boolean;
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
  permission_key: PermissionKey;
  enabled: boolean;
  updated_at: string;
}

export type NotificationType = 
  | 'period_reminder' 
  | 'log_reminder' 
  | 'partner_request' 
  | 'partner_approved' 
  | 'partner_declined' 
  | 'sharing_changed' 
  | 'security';

export interface AppNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}
