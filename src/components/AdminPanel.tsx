import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, PaymentRecord, PricingTier } from '../types';
import { 
  ShieldAlert, 
  Users, 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Lock, 
  ShieldCheck, 
  Smartphone, 
  Key, 
  Sparkles, 
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  Search,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface AdminPanelProps {
  payments: PaymentRecord[];
  onApprovePayment: (paymentId: string) => void;
  onRejectPayment: (paymentId: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  payments,
  onApprovePayment,
  onRejectPayment
}) => {
  const { user } = useAuth();
  const [activeAdminTab, setActiveAdminTab] = useState<'payments' | 'users' | 'security'>('payments');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const JAZZCASH_NO = '+923105905246';

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Mock list of registered users for admin view
  const [adminUsers, setAdminUsers] = useState<User[]>([
    {
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
    {
      id: 'usr_dev_002',
      email: 'sarah.dev@apexhealth.ai',
      name: 'Sarah Chen',
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
    {
      id: 'usr_client_003',
      email: 'david@finadvisory.co',
      name: 'David Vance',
      organization: 'Vance Fiduciary Partners',
      role: 'client',
      tier: 'starter',
      tierName: 'Developer Starter ($99/mo)',
      apiKey: 'pt_live_starter_0918ac51e',
      createdAt: '2026-06-20T08:30:00.000Z',
      e2eeEnabled: false,
      status: 'active'
    },
    {
      id: 'usr_fin_004',
      email: 'tariq.finance@lahoretech.pk',
      name: 'Tariq Mehmood',
      organization: 'Lahore Algorithmic Trading',
      role: 'developer',
      tier: 'scale',
      tierName: 'Scale / Team ($499/mo)',
      apiKey: 'pt_live_jazz_pk_9941a80',
      createdAt: '2026-09-28T14:20:00.000Z',
      e2eeEnabled: true,
      e2eeKeyFingerprint: 'C782-99EA',
      status: 'active'
    }
  ]);

  const pendingPaymentsCount = payments.filter(p => p.status === 'pending_approval').length;

  return (
    <div className="min-h-screen bg-zinc-50/50 py-8 px-4 sm:px-6 lg:px-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Top Admin Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-xs">
                ADM
              </span>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
                PromptTrace Super Admin & Security Center
              </h1>
              <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                Restricted Access
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Logged in as <strong>{user?.name || 'Administrator'}</strong> ({user?.email}) • Managing secure tenant enclaves, user roles, and payment authorizations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
              <Lock className="h-3.5 w-3.5 text-emerald-600" />
              <span>Server-Side Data Hidden & E2EE Active</span>
            </span>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex border-b border-zinc-200 bg-white px-4 rounded-xl shadow-xs dark:border-zinc-800 dark:bg-zinc-900 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveAdminTab('payments')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 transition whitespace-nowrap ${
              activeAdminTab === 'payments'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 font-bold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
            }`}
          >
            <Smartphone className="h-4 w-4 text-red-500" />
            <span>JazzCash & Card Subscriptions</span>
            {pendingPaymentsCount > 0 && (
              <span className="rounded-full bg-red-600 text-white text-[10px] px-1.5 py-0.2 font-bold animate-pulse">
                {pendingPaymentsCount} Pending
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveAdminTab('users')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 transition whitespace-nowrap ${
              activeAdminTab === 'users'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 font-bold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
            }`}
          >
            <Users className="h-4 w-4 text-emerald-600" />
            <span>Registered Organizations & Users ({adminUsers.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('security')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 transition whitespace-nowrap ${
              activeAdminTab === 'security'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 font-bold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
            }`}
          >
            <ShieldCheck className="h-4 w-4 text-indigo-600" />
            <span>E2EE Shield & Ledger Isolation</span>
          </button>
        </div>

        {/* ============================================================ */}
        {/* TAB 1: PAYMENTS & JAZZCASH VERIFICATION */}
        {/* ============================================================ */}
        {activeAdminTab === 'payments' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 pb-4 mb-6 dark:border-zinc-800">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-950/60 dark:text-red-300 mb-1">
                    <Smartphone className="h-3.5 w-3.5" />
                    <span>JazzCash Recipient: {JAZZCASH_NO} (Ali Mustafa)</span>
                  </div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                    Subscription Invoices & Payment Verification Queue
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Review and authorize incoming payments submitted via JazzCash mobile transfer or Credit Card.
                  </p>
                </div>
              </div>

              {payments.length === 0 ? (
                <div className="text-center py-12 text-zinc-400">
                  <CreditCard className="h-8 w-8 mx-auto mb-2 text-zinc-300" />
                  <p className="text-xs">No payment records yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800 font-medium">
                      <tr>
                        <th className="py-3 px-4">Method & TID</th>
                        <th className="py-3 px-4">Customer & Org</th>
                        <th className="py-3 px-4">Tier Plan</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">JazzCash Details</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {payments.map((pay) => (
                        <tr key={pay.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              {pay.paymentMethod === 'jazzcash' ? (
                                <span className="flex h-6 w-6 items-center justify-center rounded bg-red-600 text-white font-bold text-[10px]">
                                  JC
                                </span>
                              ) : (
                                <CreditCard className="h-4 w-4 text-emerald-600" />
                              )}
                              <div>
                                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 block">
                                  {pay.transactionReference}
                                </span>
                                <span className="text-[10px] text-zinc-400">
                                  {new Date(pay.timestamp).toLocaleDateString()} {new Date(pay.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                              {pay.userName}
                            </div>
                            <div className="text-[11px] text-zinc-500">
                              {pay.userEmail} • {pay.organization}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] dark:bg-emerald-950 dark:text-emerald-300">
                              {pay.tierName}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-zinc-900 dark:text-white">
                            ${pay.amountUsd}
                            <span className="text-[10px] text-zinc-500 font-normal block">
                              Rs. {pay.amountPkr.toLocaleString()} PKR
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px]">
                            {pay.paymentMethod === 'jazzcash' ? (
                              <div>
                                <span className="text-zinc-400 text-[10px] block">Sender Mobile:</span>
                                <span className="font-bold text-red-600 dark:text-red-400">{pay.jazzcashSenderNumber || '03001234567'}</span>
                                <span className="text-[10px] text-zinc-400 block mt-0.5">To: {pay.jazzcashRecipient}</span>
                              </div>
                            ) : (
                              <span className="text-zinc-500">Card •••• {pay.cardLast4 || '4242'}</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            {pay.status === 'completed' && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                <CheckCircle2 className="h-3 w-3" /> Approved
                              </span>
                            )}
                            {pay.status === 'pending_approval' && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse">
                                <Clock className="h-3 w-3" /> Awaiting Verification
                              </span>
                            )}
                            {pay.status === 'rejected' && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                                <XCircle className="h-3 w-3" /> Rejected
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {pay.status === 'pending_approval' ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => onApprovePayment(pay.id)}
                                  className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-500 shadow-xs"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => onRejectPayment(pay.id)}
                                  className="rounded-lg border border-zinc-300 px-2 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-zinc-400">Processed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: REGISTERED USERS DIRECTORY */}
        {/* ============================================================ */}
        {activeAdminTab === 'users' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 pb-4 mb-6 dark:border-zinc-800">
                <div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                    Tenant Organizations & User Directory
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Customer accounts, role-based access control (RBAC), and active API key quotas.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800 font-medium">
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Organization</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Subscribed Tier</th>
                      <th className="py-3 px-4">E2EE Enclave</th>
                      <th className="py-3 px-4">Ingestion API Key</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {adminUsers.map(u => (
                      <tr key={u.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition">
                        <td className="py-3 px-4">
                          <div className="font-bold text-zinc-900 dark:text-white">{u.name}</div>
                          <div className="text-[11px] text-zinc-500 font-mono">{u.email}</div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-zinc-700 dark:text-zinc-300">
                          {u.organization}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                              : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] dark:bg-emerald-950 dark:text-emerald-300">
                            {u.tierName}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px]">
                          {u.e2eeEnabled ? (
                            <span className="text-emerald-600 font-bold flex items-center gap-1">
                              <Lock className="h-3 w-3" /> {u.e2eeKeyFingerprint || 'AES-GCM-256'}
                            </span>
                          ) : (
                            <span className="text-zinc-400">Standard TLS</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px]">
                          <button
                            onClick={() => handleCopy(u.apiKey, u.id)}
                            className="flex items-center gap-1 rounded bg-zinc-100 px-2 py-1 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                          >
                            <span>{copiedKey === u.id ? 'Copied' : `${u.apiKey.slice(0, 14)}...`}</span>
                            {copiedKey === u.id ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: E2EE SHIELD & LEDGER ISOLATION */}
        {/* ============================================================ */}
        {activeAdminTab === 'security' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
              <div className="border-b border-zinc-100 pb-4 dark:border-zinc-800">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 mb-2">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Zero-Knowledge Server-Side Isolation</span>
                </div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                  Server-Side Data Protection & End-to-End Cryptography
                </h2>
                <p className="text-xs text-zinc-500 mt-1 max-w-2xl leading-relaxed">
                  PromptTrace employs zero-knowledge cryptographic encapsulation. Sensitive input prompts and proprietary vector snippets are encrypted client-side using AES-GCM-256 before leaving the user's browser, preventing backend exposure while maintaining immutable SHA-256 compliance hashing.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 dark:border-emerald-900 dark:bg-emerald-950/20">
                  <div className="flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-300 font-bold mb-2">
                    <span>E2EE Client Enclave</span>
                    <Lock className="h-4 w-4" />
                  </div>
                  <div className="text-xl font-extrabold text-emerald-800 dark:text-emerald-200">
                    AES-GCM 256
                  </div>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1">
                    Client-derived PBKDF2 keys with 100,000 salt iterations.
                  </p>
                </div>

                <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 dark:border-indigo-900 dark:bg-indigo-950/20">
                  <div className="flex items-center justify-between text-xs text-indigo-900 dark:text-indigo-300 font-bold mb-2">
                    <span>WORM Ledger Integrity</span>
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div className="text-xl font-extrabold text-indigo-800 dark:text-indigo-200">
                    Immutable
                  </div>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1">
                    Write-Once Read-Many write-ahead cryptographic log.
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex items-center justify-between text-xs text-zinc-700 dark:text-zinc-300 font-bold mb-2">
                    <span>Multi-Tenant Vault</span>
                    <Lock className="h-4 w-4" />
                  </div>
                  <div className="text-xl font-extrabold text-zinc-900 dark:text-white">
                    Isolated
                  </div>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1">
                    Each organization's passports partition strictly by orgId.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
