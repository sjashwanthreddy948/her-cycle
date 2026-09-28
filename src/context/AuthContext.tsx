import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types/database';
import { db } from '../lib/db';
import { DEMO_WOMAN_USER, DEMO_PARTNER_USER } from '../lib/seedData';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<UserProfile>;
  register: (params: {
    email: string;
    fullName: string;
    role: UserRole;
    dateOfBirth?: string;
    cycleLength?: number;
    periodLength?: number;
    lastPeriodStart?: string;
    goals?: string[];
  }) => Promise<UserProfile>;
  logout: () => void;
  loginAsDemoWoman: () => Promise<UserProfile>;
  loginAsDemoPartner: () => Promise<UserProfile>;
  updateCurrentUserProfile: (updates: Partial<UserProfile>) => Promise<UserProfile>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hercycle_current_user_id';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function initAuth() {
      try {
        const storedUserId = localStorage.getItem(AUTH_STORAGE_KEY);
        if (storedUserId) {
          const profile = await db.getProfile(storedUserId);
          if (profile) {
            setUser(profile);
            setIsLoading(false);
            return;
          }
        }
        // Default to demo woman so user immediately sees the rich dashboard on first open!
        setUser(DEMO_WOMAN_USER);
        localStorage.setItem(AUTH_STORAGE_KEY, DEMO_WOMAN_USER.id);
      } catch (err) {
        console.error('Auth initialization error:', err);
        setUser(DEMO_WOMAN_USER);
      } finally {
        setIsLoading(false);
      }
    }
    initAuth();
  }, []);

  const login = async (email: string, pass: string): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      
      // Match demo accounts
      if (cleanEmail === 'demo.woman@hercycle.app') {
        if (pass !== 'Demo@12345') throw new Error('Incorrect password. For demo, use: Demo@12345');
        const p = await db.getProfile(DEMO_WOMAN_USER.id) || DEMO_WOMAN_USER;
        setUser(p);
        localStorage.setItem(AUTH_STORAGE_KEY, p.id);
        return p;
      }

      if (cleanEmail === 'demo.partner@hercycle.app') {
        if (pass !== 'Demo@12345') throw new Error('Incorrect password. For demo, use: Demo@12345');
        const p = await db.getProfile(DEMO_PARTNER_USER.id) || DEMO_PARTNER_USER;
        setUser(p);
        localStorage.setItem(AUTH_STORAGE_KEY, p.id);
        return p;
      }

      // Check registered accounts
      let profile = await db.getProfile(cleanEmail);
      if (!profile) {
        throw new Error('No account found with this email. Please click "Create Account" below.');
      }
      setUser(profile);
      localStorage.setItem(AUTH_STORAGE_KEY, profile.id);
      return profile;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (params: {
    email: string;
    fullName: string;
    role: UserRole;
    dateOfBirth?: string;
    cycleLength?: number;
    periodLength?: number;
    lastPeriodStart?: string;
    goals?: string[];
  }): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const newUserId = `usr-${Date.now()}`;
      const newProfile: UserProfile = {
        id: newUserId,
        email: params.email.trim().toLowerCase(),
        full_name: params.fullName.trim(),
        role: params.role,
        date_of_birth: params.dateOfBirth,
        avatar_url: params.role === 'woman'
          ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const created = await db.createProfile(newProfile);

      if (params.role === 'woman') {
        await db.updateCycleProfile(newUserId, {
          average_cycle_length: params.cycleLength || 28,
          average_period_length: params.periodLength || 5,
          last_period_start: params.lastPeriodStart || new Date().toISOString().split('T')[0],
          goals: params.goals || ['cycle_tracking'],
        });

        // Add initial period log if lastPeriodStart provided
        if (params.lastPeriodStart) {
          await db.addPeriodLog({
            user_id: newUserId,
            start_date: params.lastPeriodStart,
            flow: 'medium',
            notes: 'Registered initial cycle start',
          });
        }
      }

      setUser(created);
      localStorage.setItem(AUTH_STORAGE_KEY, created.id);
      return created;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
  };

  const loginAsDemoWoman = async () => {
    setIsLoading(true);
    try {
      const p = await db.getProfile(DEMO_WOMAN_USER.id) || DEMO_WOMAN_USER;
      setUser(p);
      localStorage.setItem(AUTH_STORAGE_KEY, p.id);
      return p;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemoPartner = async () => {
    setIsLoading(true);
    try {
      const p = await db.getProfile(DEMO_PARTNER_USER.id) || DEMO_PARTNER_USER;
      setUser(p);
      localStorage.setItem(AUTH_STORAGE_KEY, p.id);
      return p;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCurrentUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');
    const updated = await db.updateProfile(user.id, updates);
    setUser(updated);
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        loginAsDemoWoman,
        loginAsDemoPartner,
        updateCurrentUserProfile,
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
