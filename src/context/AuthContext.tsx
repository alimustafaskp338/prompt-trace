import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, PricingTier } from '../types';
import { initializeE2EEVault, lockVault, isVaultUnlocked, getActiveFingerprint } from '../lib/e2ee';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    name: string;
    email: string;
    password?: string;
    organization: string;
    tier?: PricingTier;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUserTier: (tier: PricingTier, tierName: string) => void;
  isVaultOpen: boolean;
  vaultFingerprint: string;
  unlockVault: (passphrase: string) => Promise<string>;
  lockUserVault: () => void;
}

const DEFAULT_USERS: Record<string, User> = {
  'admin@prompttrace.io': {
    id: 'usr_admin_001',
    email: 'admin@prompttrace.io',
    name: 'Ali Mustafa',
    organization: 'PromptTrace Engineering & Compliance',
    role: 'admin',
    tier: 'enterprise',
    tierName: 'Enterprise VPC ($1,499/mo)',
    apiKey: 'pt_live_admin_sec256_root9918a',
    createdAt: '2026-01-15T00:00:00.000Z',
    e2eeEnabled: true,
    e2eeKeyFingerprint: 'A4F8-7C12',
    status: 'active'
  },
  'sarah.dev@apexhealth.ai': {
    id: 'usr_dev_002',
    email: 'sarah.dev@apexhealth.ai',
    name: 'Sarah Chen (Lead AI Engineer)',
    organization: 'Apex Health AI',
    role: 'developer',
    tier: 'scale',
    tierName: 'Scale / Team ($499/mo)',
    apiKey: 'pt_live_scale_499_829fa1103c',
    createdAt: '2026-03-10T12:00:00.000Z',
    e2eeEnabled: true,
    e2eeKeyFingerprint: 'B391-EF44',
    status: 'active'
  },
  'david@finadvisory.co': {
    id: 'usr_client_003',
    email: 'david@finadvisory.co',
    name: 'David Vance (Fiduciary Officer)',
    organization: 'Vance Fiduciary Partners',
    role: 'client',
    tier: 'starter',
    tierName: 'Developer Starter ($99/mo)',
    apiKey: 'pt_live_starter_0918ac51e',
    createdAt: '2026-06-20T08:30:00.000Z',
    e2eeEnabled: false,
    status: 'active'
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load saved session
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('prompttrace_session_user');
      if (saved) return JSON.parse(saved);
      // Default to logged in as developer for seamless initial evaluation
      return DEFAULT_USERS['sarah.dev@apexhealth.ai'];
    } catch {
      return DEFAULT_USERS['sarah.dev@apexhealth.ai'];
    }
  });

  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [vaultFingerprint, setVaultFingerprint] = useState('');

  // Persist session
  useEffect(() => {
    if (user) {
      localStorage.setItem('prompttrace_session_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('prompttrace_session_user');
    }
  }, [user]);

  // Auto-initialize E2EE vault with default test passphrase for instant zero-hassle UX
  useEffect(() => {
    if (user && user.e2eeEnabled) {
      initializeE2EEVault(`vault_${user.id}_passphrase`).then(({ fingerprint }) => {
        setIsVaultOpen(true);
        setVaultFingerprint(fingerprint);
      });
    }
  }, [user?.id]);

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    const normalized = email.trim().toLowerCase();
    const existing = DEFAULT_USERS[normalized];

    if (existing) {
      setUser(existing);
      if (existing.e2eeEnabled) {
        const { fingerprint } = await initializeE2EEVault(`vault_${existing.id}_passphrase`);
        setIsVaultOpen(true);
        setVaultFingerprint(fingerprint);
      }
      return { success: true };
    }

    // Dynamic user registration on the fly if not in pre-seeded list
    const newUser: User = {
      id: `usr_${Math.random().toString(36).substring(2, 9)}`,
      email: normalized,
      name: normalized.split('@')[0].replace('.', ' '),
      organization: `${normalized.split('@')[1]?.split('.')[0]?.toUpperCase() || 'Tech'} Corp`,
      role: 'developer',
      tier: 'scale',
      tierName: 'Scale / Team ($499/mo)',
      apiKey: `pt_live_${Math.random().toString(36).substring(2, 14)}`,
      createdAt: new Date().toISOString(),
      e2eeEnabled: true,
      status: 'active'
    };

    setUser(newUser);
    const { fingerprint } = await initializeE2EEVault(`vault_${newUser.id}_passphrase`);
    setIsVaultOpen(true);
    setVaultFingerprint(fingerprint);

    return { success: true };
  };

  const register = async (data: {
    name: string;
    email: string;
    organization: string;
    tier?: PricingTier;
  }): Promise<{ success: boolean; error?: string }> => {
    const tier = data.tier || 'scale';
    const tierMap: Record<PricingTier, string> = {
      starter: 'Developer Starter ($99/mo)',
      scale: 'Scale / Team ($499/mo)',
      enterprise: 'Enterprise VPC ($1,499/mo)'
    };

    const newUser: User = {
      id: `usr_${Math.random().toString(36).substring(2, 9)}`,
      email: data.email.trim().toLowerCase(),
      name: data.name,
      organization: data.organization,
      role: 'developer',
      tier,
      tierName: tierMap[tier],
      apiKey: `pt_live_${Math.random().toString(36).substring(2, 16)}`,
      createdAt: new Date().toISOString(),
      e2eeEnabled: true,
      status: 'active'
    };

    setUser(newUser);
    const { fingerprint } = await initializeE2EEVault(`vault_${newUser.id}_passphrase`);
    setIsVaultOpen(true);
    setVaultFingerprint(fingerprint);

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    lockVault();
    setIsVaultOpen(false);
    setVaultFingerprint('');
    localStorage.removeItem('prompttrace_session_user');
  };

  const updateUserTier = (tier: PricingTier, tierName: string) => {
    if (!user) return;
    const updated = {
      ...user,
      tier,
      tierName
    };
    setUser(updated);
  };

  const unlockVault = async (passphrase: string): Promise<string> => {
    const { fingerprint } = await initializeE2EEVault(passphrase);
    setIsVaultOpen(true);
    setVaultFingerprint(fingerprint);
    return fingerprint;
  };

  const lockUserVault = () => {
    lockVault();
    setIsVaultOpen(false);
    setVaultFingerprint('');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateUserTier,
        isVaultOpen,
        vaultFingerprint,
        unlockVault,
        lockUserVault
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
