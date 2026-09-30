import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PricingTier } from '../types';
import { 
  X, 
  LogIn, 
  UserPlus, 
  ShieldCheck, 
  Lock, 
  Mail, 
  Building, 
  User as UserIcon, 
  Key, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
  defaultTier?: PricingTier;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'login',
  defaultTier = 'scale'
}) => {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>(defaultTab);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regOrg, setRegOrg] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regTier, setRegTier] = useState<PricingTier>(defaultTier);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login(loginEmail, loginPassword);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Invalid credentials');
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await register({
        name: regName,
        email: regEmail,
        organization: regOrg,
        tier: regTier
      });
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Registration failed');
      }
    } catch (err: any) {
      setError(err?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = (email: string) => {
    login(email);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50/80 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950/60">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-emerald-500">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                {tab === 'login' ? 'Sign In to PromptTrace' : 'Register Enterprise Account'}
              </h3>
              <p className="text-[11px] text-zinc-500">
                End-to-End Encrypted Developer & Compliance Portal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-zinc-200 bg-zinc-50 px-6 dark:border-zinc-800 dark:bg-zinc-900 text-xs font-semibold">
          <button
            onClick={() => { setTab('login'); setError(null); }}
            className={`py-2.5 px-3 border-b-2 transition flex items-center gap-1.5 ${
              tab === 'login'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
            }`}
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Sign In</span>
          </button>
          <button
            onClick={() => { setTab('register'); setError(null); }}
            className={`py-2.5 px-3 border-b-2 transition flex items-center gap-1.5 ${
              tab === 'register'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
            }`}
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Create Account</span>
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300">
              {error}
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="h-4 w-4 absolute left-3 top-2.5 text-zinc-400" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="sarah.dev@apexhealth.ai"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="h-4 w-4 absolute left-3 top-2.5 text-zinc-400" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-zinc-900 py-2.5 font-bold text-white shadow-xs hover:bg-zinc-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 transition"
              >
                {loading ? 'Authenticating...' : 'Sign In with E2EE Vault'}
              </button>

              {/* Quick Demo Switchers */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-2 text-center">
                  Quick Demo Login Switcher:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('admin@prompttrace.io')}
                    className="p-2 rounded-lg border border-indigo-200 bg-indigo-50/70 text-indigo-900 text-left hover:bg-indigo-100 transition dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300"
                  >
                    <div className="font-bold text-[11px] flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-indigo-600" />
                      Super Admin
                    </div>
                    <div className="text-[10px] text-zinc-500 truncate">Ali Mustafa (Admin Panel)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('sarah.dev@apexhealth.ai')}
                    className="p-2 rounded-lg border border-emerald-200 bg-emerald-50/70 text-emerald-900 text-left hover:bg-emerald-100 transition dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                  >
                    <div className="font-bold text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      Developer Client
                    </div>
                    <div className="text-[10px] text-zinc-500 truncate">Sarah Chen ($499 Scale)</div>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="h-4 w-4 absolute left-3 top-2.5 text-zinc-400" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Ali Khan"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="h-4 w-4 absolute left-3 top-2.5 text-zinc-400" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="ali@company.com"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Company / Organization Name
                </label>
                <div className="relative">
                  <Building className="h-4 w-4 absolute left-3 top-2.5 text-zinc-400" />
                  <input
                    type="text"
                    required
                    value={regOrg}
                    onChange={(e) => setRegOrg(e.target.value)}
                    placeholder="Apex Fintech Labs"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Select Subscription Tier
                </label>
                <select
                  value={regTier}
                  onChange={(e) => setRegTier(e.target.value as PricingTier)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                >
                  <option value="scale">Scale / Team ($499/mo) - Recommended</option>
                  <option value="starter">Developer Starter ($99/mo)</option>
                  <option value="enterprise">Enterprise VPC ($1,499/mo)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-emerald-600 py-2.5 font-bold text-white shadow-xs hover:bg-emerald-500 transition"
              >
                {loading ? 'Registering...' : 'Complete Registration & Generate API Key'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
