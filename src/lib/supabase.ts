import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  ''
).trim();

const supabaseAnonKey = (
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  ''
).trim();

// A valid Supabase key is either a JWT starting with 'eyJ' or a new publishable key starting with 'sb_publishable_'
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== '' && 
  supabaseAnonKey !== '' &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseAnonKey.includes('YOUR_SUPABASE_ANON_KEY') &&
  !supabaseAnonKey.includes('your-anon-key') &&
  (
    (supabaseAnonKey.startsWith('eyJ') && supabaseAnonKey.split('.').length === 3) ||
    supabaseAnonKey.startsWith('sb_publishable_')
  )
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;
