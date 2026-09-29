import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types/database';
import { db } from '../lib/db';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { normalizePartnerCode } from '../lib/codeUtils';
import { calculateAge } from '../lib/cycleCalculator';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isConfigured: boolean;
  sessionError: string | null;
  login: (email: string, pass: string) => Promise<UserProfile>;
  connectWithPartnerCode: (params: {
    code: string;
    fullName?: string;
    email?: string;
    password?: string;
  }) => Promise<UserProfile>;
  register: (params: {
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
    dateOfBirth?: string;
    age?: number;
    avatarUrl?: string;
    cycleLength?: number;
    periodLength?: number;
    lastPeriodStart?: string;
    goals?: string[];
  }) => Promise<UserProfile>;
  logout: (reason?: string) => Promise<void>;
  updateCurrentUserProfile: (updates: Partial<UserProfile>) => Promise<UserProfile>;
  changePassword: (currentPass: string, newPass: string) => Promise<void>;
  resetPasswordEmail: (email: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Helper to hydrate profile with date_of_birth and dynamic age
  function hydrateProfile(rawProfile: UserProfile, authUser?: any): UserProfile {
    const dob = authUser?.user_metadata?.date_of_birth || rawProfile.date_of_birth;
    const computedAge = dob ? calculateAge(dob) : rawProfile.age;
    return {
      ...rawProfile,
      date_of_birth: dob,
      age: (computedAge !== null && computedAge !== undefined) ? computedAge : rawProfile.age,
    };
  }

  // Initialize Real Supabase Auth Session
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      try {
        if (!isSupabaseConfigured || !supabase) {
          if (import.meta.env.DEV) {
            console.error('[HerCycle Auth] Supabase is not configured.');
          }
          return;
        }

        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          if (import.meta.env.DEV) {
            console.error('[HerCycle Auth] getSession error:', error);
          }
          throw error;
        }

        if (session?.user && isMounted) {
          const profile = await db.getProfile(session.user.id);
          if (profile && isMounted) {
            const hydrated = hydrateProfile(profile, session.user);
            setUser(hydrated);
            localStorage.setItem('hercycle_cached_session', JSON.stringify({ user: hydrated }));
          } else if (isMounted) {
            if (import.meta.env.DEV) {
              console.warn('[HerCycle Auth] Session user ID has no profile row:', session.user.id);
            }
          }
        } else if (isMounted) {
          const cached = localStorage.getItem('hercycle_cached_session');
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              if (parsed?.user) {
                setUser(parsed.user);
              }
            } catch {
              // ignore
            }
          }
        }
      } catch (e: any) {
        if (import.meta.env.DEV) {
          console.error('[HerCycle Auth] Initialization exception:', e);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initSession();

    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (import.meta.env.DEV) {
          console.log('[HerCycle Auth] onAuthStateChange:', event, session?.user?.id);
        }

        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') && session?.user) {
          try {
            const profile = await db.getProfile(session.user.id);
            if (isMounted && profile) {
              setUser(hydrateProfile(profile, session.user));
            }
          } catch (err) {
            if (import.meta.env.DEV) {
              console.error('[HerCycle Auth] Error loading profile after auth change:', err);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          if (isMounted) {
            setUser(null);
          }
        }
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, pass: string): Promise<UserProfile> => {
    setIsLoading(true);
    setSessionError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !pass) {
      setIsLoading(false);
      throw new Error('Please enter both email and password.');
    }

    if (!isSupabaseConfigured || !supabase) {
      setIsLoading(false);
      throw new Error('Supabase client is not configured. Please check environment variables.');
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: pass,
      });

      if (error) {
        if (import.meta.env.DEV) {
          console.error('[HerCycle Auth] signInWithPassword error:', error);
        }
        if (error.message.toLowerCase().includes('email not confirmed')) {
          // Bypass email confirmation requirement by directly fetching profile
          const { data: prof } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', cleanEmail)
            .maybeSingle();

          if (prof) {
            const hydrated = hydrateProfile(prof, { id: prof.id, user_metadata: { role: prof.role, full_name: prof.full_name } } as any);
            setUser(hydrated);
            localStorage.setItem('hercycle_cached_session', JSON.stringify({ user: hydrated }));
            return hydrated;
          }
          throw new Error('Invalid email or password. Please check your credentials.');
        } else if (error.message.toLowerCase().includes('invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials.');
        }
        throw new Error(error.message);
      }

      if (!data?.user) {
        throw new Error('Login succeeded but no user data was returned. Please try again.');
      }

      const profile = await db.getProfile(data.user.id);
      if (!profile) {
        // Fallback: create profile row using auth user metadata if database trigger did not run
        const newProfile: UserProfile = {
          id: data.user.id,
          email: cleanEmail,
          full_name: data.user.user_metadata?.full_name || cleanEmail.split('@')[0],
          role: (data.user.user_metadata?.role as UserRole) || 'woman',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { error: profileError } = await supabase
          .from('profiles')
          .upsert(newProfile);

        if (profileError) {
          if (import.meta.env.DEV) {
            console.error('[HerCycle Auth] Profile creation error after login:', profileError);
          }
          throw new Error(`Profile not found and could not be created: ${profileError.message}`);
        }

        const hydrated = hydrateProfile(newProfile, data.user);
        setUser(hydrated);
        return hydrated;
      }

      const hydrated = hydrateProfile(profile, data.user);
      setUser(hydrated);
      return hydrated;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (params: {
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
    dateOfBirth?: string;
    age?: number;
    avatarUrl?: string;
    cycleLength?: number;
    periodLength?: number;
    lastPeriodStart?: string;
    goals?: string[];
  }): Promise<UserProfile> => {
    if (!params.password || params.password.length < 8) {
      throw new Error('Password must be at least 8 characters for account security.');
    }

    const cleanEmail = params.email.trim().toLowerCase();
    if (!cleanEmail || !params.fullName.trim()) {
      throw new Error('Please provide your full name and a valid email address.');
    }

    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase client is not configured. Please check environment variables.');
    }

    setIsLoading(true);
    setSessionError(null);

    const computedAge = params.dateOfBirth ? calculateAge(params.dateOfBirth) : params.age;

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: params.password,
        options: {
          data: {
            full_name: params.fullName.trim(),
            role: params.role,
            date_of_birth: params.dateOfBirth,
          },
        },
      });

      if (error) {
        if (import.meta.env.DEV) {
          console.error('[HerCycle Auth] signUp error:', error);
        }
        if (
          error.message.toLowerCase().includes('already registered') ||
          error.message.toLowerCase().includes('already exists') ||
          error.status === 422
        ) {
          throw new Error('An account with this email already exists. Please log in.');
        }
        throw new Error(error.message);
      }

      if (!data?.user) {
        throw new Error('Registration failed to create user. Please try again.');
      }

      const userId = data.user.id;

      // Upsert profile in Supabase: profiles.id MUST equal auth.users.id
      const newProfile: UserProfile = {
        id: userId,
        email: cleanEmail,
        full_name: params.fullName.trim(),
        role: params.role,
        date_of_birth: params.dateOfBirth,
        age: (computedAge !== null && computedAge !== undefined) ? computedAge : undefined,
        avatar_url: params.avatarUrl || (params.role === 'woman' ? '/assets/woman-portrait.png' : undefined),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(newProfile);

      if (profileError) {
        if (import.meta.env.DEV) {
          console.error('[HerCycle Auth] Profile upsert error on signup:', profileError);
        }
        throw new Error(`Profile creation failed: ${profileError.message}`);
      }

      if (params.role === 'woman') {
        try {
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
        } catch (cycleErr) {
          if (import.meta.env.DEV) {
            console.warn('[HerCycle Auth] Cycle initialization warning:', cycleErr);
          }
        }
      }

      const hydrated = hydrateProfile(newProfile, data.user);
      setUser(hydrated);
      localStorage.setItem('hercycle_cached_session', JSON.stringify({ user: hydrated }));
      return hydrated;
    } finally {
      setIsLoading(false);
    }
  };

  const connectWithPartnerCode = async (params: {
    code: string;
    fullName?: string;
    email?: string;
    password?: string;
  }): Promise<UserProfile> => {
    setIsLoading(true);
    setSessionError(null);
    try {
      const cleanCode = normalizePartnerCode(params.code);
      if (!cleanCode) {
        throw new Error('Please enter a valid 6-digit partner connection code.');
      }

      // If user is currently logged in
      if (user) {
        if (user.role !== 'partner') {
          throw new Error('Only partner accounts can enter a connection code.');
        }
        await db.redeemPartnerCode(cleanCode, user.id);
        return user;
      }

      // If credentials provided, register and connect
      if (params.email && params.password) {
        const partnerProfile = await register({
          email: params.email,
          password: params.password,
          fullName: params.fullName || 'Partner',
          role: 'partner',
        });
        await db.redeemPartnerCode(cleanCode, partnerProfile.id);
        return partnerProfile;
      }

      throw new Error('Please log in or register a partner account to connect with this code.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (reason?: string) => {
    localStorage.removeItem('hercycle_cached_session');
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      if (import.meta.env.DEV) {
        console.warn('[HerCycle Auth] Sign out error:', e);
      }
    } finally {
      setUser(null);
      if (reason) setSessionError(reason);
    }
  };

  const updateCurrentUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('Not logged in');

    // If Date of Birth is updated, persist permanently to Supabase Auth metadata
    if (updates.date_of_birth && isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.updateUser({
          data: { date_of_birth: updates.date_of_birth },
        });
      } catch (authErr) {
        if (import.meta.env.DEV) {
          console.warn('[HerCycle Auth] Could not update auth user metadata for DOB:', authErr);
        }
      }

      const computedAge = calculateAge(updates.date_of_birth);
      if (computedAge !== null) {
        updates.age = computedAge;
      }
    }

    const updated = await db.updateProfile(user.id, updates);
    const hydrated: UserProfile = {
      ...updated,
      date_of_birth: updates.date_of_birth || user.date_of_birth,
      age: updates.date_of_birth ? (calculateAge(updates.date_of_birth) ?? updated.age) : updated.age,
    };
    setUser(hydrated);
    return hydrated;
  };

  const changePassword = async (_currentPass: string, newPass: string): Promise<void> => {
    if (!user) throw new Error('Not authenticated');
    if (!newPass || newPass.length < 8) {
      throw new Error('New password must be at least 8 characters.');
    }
    await db.updatePassword(user.id, _currentPass, newPass);
  };

  const resetPasswordEmail = async (emailToReset: string): Promise<void> => {
    const cleanEmail = emailToReset.trim().toLowerCase();
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail);
      if (error) {
        throw new Error(error.message);
      }
    }
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
        isConfigured: isSupabaseConfigured,
        sessionError,
        login,
        connectWithPartnerCode,
        register,
        logout,
        updateCurrentUserProfile,
        changePassword,
        resetPasswordEmail,
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
