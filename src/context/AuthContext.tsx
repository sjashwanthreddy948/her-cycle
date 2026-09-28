import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, UserRole } from '../types/database';
import { db } from '../lib/db';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { standaloneDb, StandaloneUserRecord } from '../lib/standaloneDb';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isConfigured: boolean;
  sessionError: string | null;
  login: (email: string, pass: string) => Promise<UserProfile>;
  register: (params: {
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
    age?: number;
    cycleLength?: number;
    periodLength?: number;
    lastPeriodStart?: string;
    goals?: string[];
  }) => Promise<UserProfile>;
  logout: (reason?: string) => Promise<void>;
  updateCurrentUserProfile: (updates: Partial<UserProfile>) => Promise<UserProfile>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_SESSION_KEY = 'hercycle_session_token';
const STANDALONE_USER_KEY = 'hercycle_standalone_current_user_id';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Helper to establish and record single active session
  const registerNewSession = useCallback(async (userId: string) => {
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(LOCAL_SESSION_KEY, sessionId);
    await db.upsertActiveSession(userId, sessionId);
    return sessionId;
  }, []);

  // Check single active session against server or local storage
  const verifyActiveSession = useCallback(async (currentUserId: string) => {
    try {
      const currentLocalSession = localStorage.getItem(LOCAL_SESSION_KEY);
      if (!currentLocalSession) return;

      const serverSessionId = await db.getActiveSession(currentUserId);
      if (serverSessionId && serverSessionId !== currentLocalSession) {
        // Another device logged in! Sign out immediately
        console.warn('Single-session violation: account opened on another device.');
        localStorage.removeItem(LOCAL_SESSION_KEY);
        localStorage.removeItem(STANDALONE_USER_KEY);
        if (isSupabaseConfigured && supabase) {
          await supabase.auth.signOut();
        }
        setUser(null);
        setSessionError('You were signed out because your account was opened on another device.');
      }
    } catch (err) {
      console.debug('Session check error:', err);
    }
  }, []);

  // Initialize Auth Session
  useEffect(() => {
    async function initSession() {
      try {
        if (isSupabaseConfigured && supabase) {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) throw error;

          if (session?.user) {
            const profile = await db.getProfile(session.user.id);
            if (profile) {
              setUser(profile);
              const localSession = localStorage.getItem(LOCAL_SESSION_KEY);
              if (!localSession) {
                await registerNewSession(session.user.id);
              } else {
                await verifyActiveSession(session.user.id);
              }
            }
          }
        } else {
          // Standalone browser mode
          const currentUserId = localStorage.getItem(STANDALONE_USER_KEY);
          if (currentUserId) {
            const profile = await standaloneDb.getProfile(currentUserId);
            if (profile) {
              setUser(profile);
              const localSession = localStorage.getItem(LOCAL_SESSION_KEY);
              if (!localSession) {
                await registerNewSession(currentUserId);
              } else {
                await verifyActiveSession(currentUserId);
              }
            }
          }
        }
      } catch (e) {
        console.error('Auth initialization error:', e);
      } finally {
        setIsLoading(false);
      }
    }

    initSession();

    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await db.getProfile(session.user.id);
          setUser(profile);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem(LOCAL_SESSION_KEY);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [registerNewSession, verifyActiveSession]);

  // Single-active-session listener: checks every 60s and on tab focus
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      verifyActiveSession(user.id);
    }, 60000);

    const handleFocus = () => {
      verifyActiveSession(user.id);
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [user, verifyActiveSession]);

  const login = async (email: string, pass: string): Promise<UserProfile> => {
    setIsLoading(true);
    setSessionError(null);
    try {
      const cleanEmail = email.trim().toLowerCase();

      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: pass,
        });

        if (error) {
          if (error.message.toLowerCase().includes('invalid login credentials')) {
            throw new Error('Invalid email or password. Please verify your credentials.');
          }
          throw new Error(error.message);
        }

        if (!data.user) {
          throw new Error('No user returned from login');
        }

        const profile = await db.getProfile(data.user.id);
        if (!profile) {
          throw new Error('Profile not found. Please contact support.');
        }

        await registerNewSession(data.user.id);
        setUser(profile);
        return profile;
      } else {
        // Standalone Mode Login
        const found = standaloneDb.findUserByEmail(cleanEmail);
        if (!found || found.password_hash !== pass) {
          throw new Error('Invalid email or password. Please verify your credentials.');
        }
        localStorage.setItem(STANDALONE_USER_KEY, found.id);
        await registerNewSession(found.id);
        const { password_hash: _password_hash, ...profile } = found;
        setUser(profile);
        return profile;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (params: {
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
    age?: number;
    cycleLength?: number;
    periodLength?: number;
    lastPeriodStart?: string;
    goals?: string[];
  }): Promise<UserProfile> => {
    if (!params.password || params.password.length < 10) {
      throw new Error('Password must be at least 10 characters for account security.');
    }

    setIsLoading(true);
    setSessionError(null);
    try {
      const cleanEmail = params.email.trim().toLowerCase();

      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: params.password,
          options: {
            data: {
              full_name: params.fullName.trim(),
              role: params.role,
            },
          },
        });

        if (error) {
          if (
            error.message.toLowerCase().includes('already registered') ||
            error.message.toLowerCase().includes('already exists') ||
            error.status === 422
          ) {
            throw new Error('An account with this email already exists. Please log in.');
          }
          throw new Error(error.message);
        }

        if (!data.user) {
          throw new Error('Registration failed. Please try again.');
        }

        const userId = data.user.id;

        const newProfile: UserProfile = {
          id: userId,
          email: cleanEmail,
          full_name: params.fullName.trim(),
          role: params.role,
          age: params.age,
          avatar_url: undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { error: profileError } = await supabase
          .from('profiles')
          .upsert(newProfile);

        if (profileError) {
          if (profileError.code === '23505' || profileError.message.includes('unique')) {
            throw new Error('An account with this email already exists. Please log in.');
          }
          throw profileError;
        }

        if (params.role === 'woman') {
          await db.updateCycleProfile(userId, {
            average_cycle_length: params.cycleLength || 28,
            average_period_length: params.periodLength || 5,
            last_period_start: params.lastPeriodStart || null,
          });

          if (params.lastPeriodStart) {
            await db.savePeriodLog({
              user_id: userId,
              start_date: params.lastPeriodStart,
              flow: 'medium',
              notes: 'Registered initial period',
            });
          }
        }

        await registerNewSession(userId);
        setUser(newProfile);
        return newProfile;
      } else {
        // Standalone Mode Registration
        const existing = standaloneDb.findUserByEmail(cleanEmail);
        if (existing) {
          throw new Error('An account with this email already exists. Please log in.');
        }

        const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const record: StandaloneUserRecord = {
          id: userId,
          email: cleanEmail,
          full_name: params.fullName.trim(),
          role: params.role,
          age: params.age,
          avatar_url: undefined,
          password_hash: params.password,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        standaloneDb.saveUser(record);

        if (params.role === 'woman') {
          await standaloneDb.updateCycleProfile(userId, {
            average_cycle_length: params.cycleLength || 28,
            average_period_length: params.periodLength || 5,
            last_period_start: params.lastPeriodStart || null,
          });

          if (params.lastPeriodStart) {
            await standaloneDb.savePeriodLog({
              user_id: userId,
              start_date: params.lastPeriodStart,
              flow: 'medium',
              notes: 'Registered initial period',
            });
          }
        }

        localStorage.setItem(STANDALONE_USER_KEY, userId);
        await registerNewSession(userId);
        const { password_hash: _password_hash, ...profile } = record;
        setUser(profile);
        return profile;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (reason?: string) => {
    localStorage.removeItem(LOCAL_SESSION_KEY);
    localStorage.removeItem(STANDALONE_USER_KEY);
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    if (reason) setSessionError(reason);
  };

  const updateCurrentUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('Not logged in');
    const updated = await db.updateProfile(user.id, updates);
    setUser(updated);
    return updated;
  };

  const deleteAccount = async () => {
    if (!user) return;
    await db.deleteUserAccount(user.id);
    await logout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isConfigured: true,
        sessionError,
        login,
        register,
        logout,
        updateCurrentUserProfile,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
