/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ActivePage, AIDataPassport, PaymentRecord, PricingTier } from './types';
import { INITIAL_PASSPORTS, generateRandomPassport } from './data/mockPassports';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { PricingSection } from './components/PricingSection';
import { AdminPanel } from './components/AdminPanel';
import { PassportInspector } from './components/PassportInspector';
import { AuthModal } from './components/AuthModal';
import { CheckoutModal } from './components/CheckoutModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Zap, ShieldCheck, Lock, Smartphone, CheckCircle2 } from 'lucide-react';

function AppContent() {
  const { user, isAdmin, updateUserTier } = useAuth();
  const [activePage, setActivePage] = useState<ActivePage>('landing');
  const [passports, setPassports] = useState<AIDataPassport[]>(INITIAL_PASSPORTS);
  const [inspectedPassport, setInspectedPassport] = useState<AIDataPassport | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedCheckoutTier, setSelectedCheckoutTier] = useState<PricingTier>('scale');
  const [selectedCheckoutTierName, setSelectedCheckoutTierName] = useState('Scale / Team ($499/mo)');

  // Payments Ledger
  const [payments, setPayments] = useState<PaymentRecord[]>([
    {
      id: 'pay_jc_9941a',
      userId: 'usr_fin_004',
      userEmail: 'tariq.finance@lahoretech.pk',
      userName: 'Tariq Mehmood',
      organization: 'Lahore Algorithmic Trading',
      tier: 'scale',
      tierName: 'Scale / Team ($499/mo)',
      amountUsd: 499,
      amountPkr: 139720,
      paymentMethod: 'jazzcash',
      jazzcashRecipient: '+923105905246',
      jazzcashSenderNumber: '03105905246',
      transactionReference: 'JC-TID-88392014',
      status: 'pending_approval',
      timestamp: '2026-09-28T14:25:00.000Z',
      billingCycle: 'monthly',
      notes: 'JazzCash transfer submitted to +923105905246'
    },
    {
      id: 'pay_crd_8812c',
      userId: 'usr_dev_002',
      userEmail: 'sarah.dev@apexhealth.ai',
      userName: 'Sarah Chen',
      organization: 'Apex Health AI',
      tier: 'scale',
      tierName: 'Scale / Team ($499/mo)',
      amountUsd: 499,
      amountPkr: 139720,
      paymentMethod: 'credit_card',
      jazzcashRecipient: '+923105905246',
      transactionReference: 'AUTH-CRD-948102',
      cardLast4: '4242',
      cardBrand: 'Visa',
      status: 'completed',
      timestamp: '2026-09-20T10:00:00.000Z',
      billingCycle: 'monthly',
      approvedAt: '2026-09-20T10:00:05.000Z',
      approvedBy: 'Stripe Gateway'
    }
  ]);

  // Try fetching payments from backend on mount
  useEffect(() => {
    fetch('/api/v1/payments')
      .then(r => r.json())
      .then(data => {
        if (data.payments && data.payments.length > 0) {
          setPayments(data.payments);
        }
      })
      .catch(() => {
        // Fallback to local state
      });
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Trigger simulated real-time LLM trace
  const handleSimulateTrace = () => {
    const newPassport = generateRandomPassport(passports);
    setPassports((prev) => [newPassport, ...prev]);
    showToast(`New AI Data Passport Sealed: ${newPassport.id} (${newPassport.model})`);
  };

  const handleAddCustomPassport = (passport: AIDataPassport) => {
    setPassports((prev) => [passport, ...prev]);
    showToast(`Custom Passport Logged: ${passport.id}`);
  };

  // Checkout Open Handler
  const handleOpenCheckout = (tier: PricingTier = 'scale') => {
    const tierNames: Record<PricingTier, string> = {
      starter: 'Developer Starter ($99/mo)',
      scale: 'Scale / Team ($499/mo)',
      enterprise: 'Enterprise VPC ($1,499/mo)'
    };
    setSelectedCheckoutTier(tier);
    setSelectedCheckoutTierName(tierNames[tier]);
    setShowCheckoutModal(true);
  };

  // Payment Completion Handler
  const handlePaymentComplete = (record: PaymentRecord) => {
    setPayments(prev => [record, ...prev]);

    // Send to backend
    fetch('/api/v1/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    }).catch(() => {});

    if (record.status === 'completed') {
      updateUserTier(record.tier, record.tierName);
      showToast(`Tier Activated: ${record.tierName}!`);
    } else {
      showToast(`JazzCash transfer logged. Transaction TID: ${record.transactionReference}`);
    }
  };

  // Admin Payment Approval
  const handleApprovePayment = (paymentId: string) => {
    setPayments(prev => prev.map(p => {
      if (p.id === paymentId) {
        return {
          ...p,
          status: 'completed',
          approvedAt: new Date().toISOString(),
          approvedBy: 'Administrator (Ali Mustafa)'
        };
      }
      return p;
    }));

    fetch(`/api/v1/payments/${paymentId}/approve`, { method: 'POST' }).catch(() => {});
    showToast(`Payment ${paymentId} Approved & Subscriber Tier Activated.`);
  };

  // Admin Payment Rejection
  const handleRejectPayment = (paymentId: string) => {
    setPayments(prev => prev.map(p => {
      if (p.id === paymentId) {
        return { ...p, status: 'rejected' };
      }
      return p;
    }));

    fetch(`/api/v1/payments/${paymentId}/reject`, { method: 'POST' }).catch(() => {});
    showToast(`Payment ${paymentId} flagged as rejected.`);
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-emerald-100 selection:text-emerald-900 dark:bg-zinc-950 dark:text-zinc-100">
      {/* Top Navbar */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        onSimulateTrace={handleSimulateTrace}
        passportCount={passports.length}
        onOpenAuthModal={() => {
          setAuthModalTab('login');
          setShowAuthModal(true);
        }}
        onOpenCheckoutModal={handleOpenCheckout}
      />

      {/* Main Pages */}
      <main>
        {activePage === 'landing' && (
          <LandingPage
            onGoToDashboard={() => setActivePage('dashboard')}
            onInspectPassport={(p) => setInspectedPassport(p)}
            samplePassport={passports[0]}
          />
        )}

        {activePage === 'pricing' && (
          <div className="pt-8">
            <PricingSection
              onSelectTier={(tierName, tierKey) => {
                handleOpenCheckout(tierKey || 'scale');
              }}
            />
          </div>
        )}

        {activePage === 'dashboard' && (
          <Dashboard
            passports={passports}
            onSimulateTrace={handleSimulateTrace}
            onAddCustomPassport={handleAddCustomPassport}
          />
        )}

        {activePage === 'admin' && (
          isAdmin ? (
            <AdminPanel
              payments={payments}
              onApprovePayment={handleApprovePayment}
              onRejectPayment={handleRejectPayment}
            />
          ) : (
            <div className="min-h-[70vh] flex items-center justify-center p-6">
              <div className="max-w-md w-full rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 mb-4">
                  <Lock className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                  Administrator Privileges Required
                </h3>
                <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                  The Admin Console & JazzCash Verification Queue is restricted to verified administrators. Switch to the pre-configured Super Admin account (Ali Mustafa) to access.
                </p>
                <div className="mt-6 space-y-2">
                  <button
                    onClick={() => {
                      setAuthModalTab('login');
                      setShowAuthModal(true);
                    }}
                    className="w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-500 transition"
                  >
                    Switch to Admin Account
                  </button>
                  <button
                    onClick={() => setActivePage('dashboard')}
                    className="w-full rounded-xl border border-zinc-300 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                  >
                    Return to Developer Dashboard
                  </button>
                </div>
              </div>
            </div>
          )
        )}
      </main>

      {/* Global Inspector Modal */}
      {inspectedPassport && (
        <PassportInspector
          passport={inspectedPassport}
          onClose={() => setInspectedPassport(null)}
        />
      )}

      {/* Auth Modal (Login / Register) */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultTab={authModalTab}
        defaultTier={selectedCheckoutTier}
      />

      {/* Checkout Modal (Card & JazzCash to +923105905246) */}
      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        tier={selectedCheckoutTier}
        tierName={selectedCheckoutTierName}
        onPaymentComplete={handlePaymentComplete}
        userEmail={user?.email}
        userName={user?.name}
        userOrg={user?.organization}
      />

      {/* Real-time Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-xs font-medium text-white shadow-2xl animate-bounce-subtle dark:border-zinc-700">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
            <Zap className="h-3.5 w-3.5 fill-current" />
          </div>
          <span className="font-mono text-[12px]">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-zinc-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
