import React, { useState } from 'react';
import { 
  Shield, 
  Terminal, 
  ArrowRight, 
  Zap, 
  CheckCircle2, 
  DollarSign, 
  Layers, 
  Lock, 
  User as UserIcon, 
  LogOut, 
  LogIn, 
  Sparkles, 
  ShieldAlert, 
  CreditCard,
  Smartphone
} from 'lucide-react';
import { ActivePage, PricingTier } from '../types';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  onSimulateTrace: () => void;
  passportCount: number;
  onOpenAuthModal: () => void;
  onOpenCheckoutModal: (tier?: PricingTier) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  setActivePage,
  onSimulateTrace,
  passportCount,
  onOpenAuthModal,
  onOpenCheckoutModal
}) => {
  const { user, isAuthenticated, isAdmin, logout, isVaultOpen } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/90 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-6 lg:gap-8">
          <button
            id="nav-logo-btn"
            onClick={() => setActivePage('landing')}
            className="flex items-center gap-2.5 text-left group transition"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-white shadow-sm ring-1 ring-zinc-950/10 group-hover:scale-105 transition-transform dark:bg-zinc-100 dark:text-zinc-950">
              <Shield className="h-5 w-5 text-emerald-400 dark:text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-zinc-900 tracking-tight text-lg dark:text-white">
                  Prompt<span className="text-emerald-600 dark:text-emerald-400">Trace</span>
                </span>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-950/60 dark:text-emerald-300">
                  E2EE Secure
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 hidden sm:block">AI Data Passports & Lineage</p>
            </div>
          </button>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <button
              id="nav-link-landing"
              onClick={() => setActivePage('landing')}
              className={`px-3 py-1.5 rounded-md transition ${
                activePage === 'landing'
                  ? 'text-zinc-900 bg-zinc-100 font-semibold dark:text-white dark:bg-zinc-800'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-900'
              }`}
            >
              Product
            </button>
            <button
              id="nav-link-pricing"
              onClick={() => setActivePage('pricing')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition ${
                activePage === 'pricing'
                  ? 'text-zinc-900 bg-zinc-100 font-semibold dark:text-white dark:bg-zinc-800'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-900'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              <span>Pricing</span>
              <span className="ml-1 rounded bg-zinc-100 px-1.5 py-0.2 text-[10px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                $499/mo
              </span>
            </button>
            <button
              id="nav-link-dashboard"
              onClick={() => setActivePage('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
                activePage === 'dashboard'
                  ? 'text-emerald-700 bg-emerald-50 font-semibold dark:text-emerald-400 dark:bg-emerald-950/40'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-900'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Developer Dashboard</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </button>

            {/* Admin Panel Link */}
            {isAdmin && (
              <button
                id="nav-link-admin"
                onClick={() => setActivePage('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
                  activePage === 'admin'
                    ? 'text-indigo-700 bg-indigo-50 font-semibold dark:text-indigo-400 dark:bg-indigo-950/40'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-900'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
                <span>Admin Panel</span>
                <span className="rounded bg-indigo-100 px-1.5 py-0.2 text-[10px] font-bold text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                  JazzCash
                </span>
              </button>
            )}
          </nav>
        </div>

        {/* Right Actions & Auth Status */}
        <div className="flex items-center gap-2.5">
          {/* JazzCash Buy Tier Quick Button */}
          <button
            onClick={() => onOpenCheckoutModal('scale')}
            title="Purchase Scale Tier ($499/mo) via Card or JazzCash"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50/70 px-2.5 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 transition dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
          >
            <Smartphone className="h-3.5 w-3.5 text-red-600" />
            <span>Pay with JazzCash</span>
          </button>

          {/* Quick Simulate */}
          <button
            id="nav-quick-simulate-btn"
            onClick={onSimulateTrace}
            title="Simulate a real-time LLM query into the passport ledger"
            className="hidden lg:inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 shadow-xs hover:bg-zinc-50 active:scale-95 transition dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500/20" />
            <span>+ Simulate</span>
          </button>

          {/* User Auth Section */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white p-1.5 pr-3 shadow-xs hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 text-left transition"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-white font-bold text-xs dark:bg-emerald-600">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-xs">
                  <div className="font-bold text-zinc-900 dark:text-white leading-tight flex items-center gap-1">
                    <span>{user.name.split(' ')[0]}</span>
                    {user.role === 'admin' && (
                      <span className="rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 text-[9px] px-1 font-bold">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono leading-tight">
                    {user.tierName.split(' ')[0]} Tier
                  </div>
                </div>
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-zinc-200 bg-white p-3 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 text-xs space-y-2.5 z-50">
                  <div className="border-b border-zinc-100 pb-2 dark:border-zinc-800">
                    <div className="font-bold text-zinc-900 dark:text-white">{user.name}</div>
                    <div className="text-[11px] text-zinc-500 truncate">{user.email}</div>
                    <div className="text-[10px] text-zinc-400 font-medium mt-0.5">{user.organization}</div>
                  </div>

                  <div className="rounded-lg bg-zinc-50 p-2 dark:bg-zinc-800/60 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-500">Active Tier:</span>
                      <span className="font-bold text-emerald-600">{user.tierName}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-500">E2EE Vault:</span>
                      <span className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                        <Lock className="h-3 w-3 text-emerald-600" /> Active
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 pt-1">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onOpenCheckoutModal('scale');
                      }}
                      className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800 font-semibold"
                    >
                      <CreditCard className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Upgrade / Purchase Tier</span>
                    </button>

                    {isAdmin ? (
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          setActivePage('admin');
                        }}
                        className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-indigo-700 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-950/40 font-semibold"
                      >
                        <ShieldAlert className="h-3.5 w-3.5" />
                        <span>Admin Console & JazzCash</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          setActivePage('dashboard');
                        }}
                        className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                      >
                        <Terminal className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Developer Console</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-medium"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-zinc-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 transition"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
