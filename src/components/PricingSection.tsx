import React, { useState } from 'react';
import { Check, Zap, Shield, HelpCircle, ArrowRight, Sparkles, Building2, Lock, Smartphone, CreditCard } from 'lucide-react';
import { PricingTier } from '../types';

interface PricingSectionProps {
  onSelectTier: (tierName: string, tierKey?: PricingTier) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onSelectTier }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  return (
    <section id="pricing" className="py-20 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-600/20 dark:bg-emerald-950/60 dark:text-emerald-300 mb-4">
            <Shield className="h-3.5 w-3.5" />
            <span>Transparent Developer & Enterprise Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight dark:text-white">
            Audit logs that pay for themselves during your next SOC-2 review
          </h2>
          <p className="mt-4 text-base text-zinc-600 dark:text-zinc-400">
            Start with our generous developer tier or scale to millions of tamper-proof AI Data Passports with our flagship Team plan.
          </p>

          {/* Payment Methods Notice */}
          <div className="mt-4 inline-flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs text-zinc-700 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
              <CreditCard className="h-3.5 w-3.5" /> Credit/Debit Card
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <span className="flex items-center gap-1 text-red-600 font-bold">
              <Smartphone className="h-3.5 w-3.5" /> JazzCash Direct: +923105905246
            </span>
          </div>

          {/* Billing cycle toggle */}
          <div className="mt-8 flex items-center justify-center">
            <div className="relative flex rounded-full bg-zinc-200/70 p-1 dark:bg-zinc-800">
              <button
                id="pricing-toggle-monthly"
                onClick={() => setBillingCycle('monthly')}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-900 dark:text-white'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                Monthly Billing
              </button>
              <button
                id="pricing-toggle-annual"
                onClick={() => setBillingCycle('annual')}
                className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  billingCycle === 'annual'
                    ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-900 dark:text-white'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                <span>Annual Billing</span>
                <span className="rounded-full bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-bold">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {/* TIER 1: Starter */}
          <div className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Developer Starter</h3>
                <span className="text-xs font-medium text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded dark:bg-zinc-800 dark:text-zinc-400">
                  MVP & Early Pilots
                </span>
              </div>
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                Essential cryptographic passport logging for single-model LLM applications.
              </p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-zinc-900 dark:text-white">
                  ${billingCycle === 'monthly' ? '99' : '79'}
                </span>
                <span className="text-xs text-zinc-500">/ month</span>
              </div>
              {billingCycle === 'annual' && (
                <p className="text-[11px] text-emerald-600 font-medium mt-1">Billed annually ($948/yr)</p>
              )}

              <div className="my-6 border-t border-zinc-100 dark:border-zinc-800" />

              <ul className="space-y-3 text-xs text-zinc-700 dark:text-zinc-300">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span><strong>100,000 AI Data Passports</strong> / month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>30-Day tamper-proof audit retention</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Basic RAG vector source tracking (10 chunks)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Automated PII redactor (US-SSN & Names)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Node.js & Python SDK access</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Community Discord support</span>
                </li>
              </ul>
            </div>

            <button
              id="tier-btn-starter"
              onClick={() => onSelectTier('Developer Starter ($99/mo)', 'starter')}
              className="mt-8 w-full rounded-xl border border-zinc-300 bg-white py-2.5 text-xs font-semibold text-zinc-800 shadow-xs hover:bg-zinc-50 active:scale-98 transition dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              Start Trial or Buy ($99/mo)
            </button>
          </div>

          {/* TIER 2: Scale / Team ($499/mo) - THE HIGHLIGHTED / FEATURED TIER */}
          <div className="relative flex flex-col justify-between rounded-2xl border-2 border-emerald-500 bg-white p-8 shadow-xl ring-4 ring-emerald-500/10 dark:bg-zinc-900 dark:border-emerald-500 dark:ring-emerald-500/20">
            {/* Top pill badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-emerald-600 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white shadow-sm flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Scale & Team Tier • Most Popular</span>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Scale / Team</h3>
                  <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    For B2B AI Agents, RAG Pipelines & SOC-2
                  </p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <Zap className="h-5 w-5 fill-current" />
                </div>
              </div>
              <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                Complete auditability and compliance provenance for high-throughput production LLM workloads.
              </p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-black text-zinc-900 tracking-tight dark:text-white">
                  ${billingCycle === 'monthly' ? '499' : '399'}
                </span>
                <span className="text-xs text-zinc-500">/ month</span>
              </div>
              {billingCycle === 'annual' ? (
                <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                  Billed annually ($4,788/yr — Save $1,200/yr)
                </p>
              ) : (
                <p className="text-[11px] text-zinc-500 font-medium mt-1">
                  Flexible month-to-month billing. Cancel anytime.
                </p>
              )}

              <div className="my-6 border-t border-zinc-100 dark:border-zinc-800" />

              <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-900 mb-3 dark:text-zinc-200">
                Included in Scale ($499/mo):
              </div>

              <ul className="space-y-3 text-xs text-zinc-700 dark:text-zinc-300">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>2,500,000 AI Data Passports</strong> included / month ($0.0002 / extra)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Full RAG Provenance:</strong> Up to 100 vector chunks per call with cosine telemetry</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>System Prompt Version Control:</strong> Automated Git sync & prompt drift diffs</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>1-Year Tamper-Proof Retention:</strong> Immutable WORM storage ledger</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>SOC-2 Type II & HIPAA Export Pack:</strong> One-click auditor evidence binder</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Real-time Incident Alerts:</strong> Slack & PagerDuty integration for guardrail trips</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Shared Slack Channel:</strong> Direct engineering access with 99.9% uptime SLA</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>10 Developer Team Seats</strong> with RBAC</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 space-y-2">
              <button
                id="tier-btn-scale-499"
                onClick={() => onSelectTier('Scale / Team ($499/mo)', 'scale')}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-500 active:scale-98 transition dark:bg-emerald-500 dark:hover:bg-emerald-400"
              >
                <span>Deploy $499/mo Scale Tier (Card / JazzCash)</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <p className="text-center text-[10px] text-zinc-400">
                Direct JazzCash to +923105905246 or Card • Instant API key
              </p>
            </div>
          </div>

          {/* TIER 3: Enterprise */}
          <div className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Enterprise & VPC</h3>
                <span className="text-xs font-medium text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded dark:bg-zinc-800 dark:text-zinc-400">
                  Regulated Industries
                </span>
              </div>
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                Dedicated isolation, on-prem KMS cryptographic keys, and customized BAA contracts.
              </p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-zinc-900 dark:text-white">
                  ${billingCycle === 'monthly' ? '1,499' : '1,249'}
                </span>
                <span className="text-xs text-zinc-500">/ mo starting</span>
              </div>
              <p className="text-[11px] text-zinc-500 font-medium mt-1">Or custom volume contract</p>

              <div className="my-6 border-t border-zinc-100 dark:border-zinc-800" />

              <ul className="space-y-3 text-xs text-zinc-700 dark:text-zinc-300">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span><strong>15,000,000+ AI Data Passports</strong> / month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span><strong>7-Year Regulatory Retention</strong> (SEC / FINRA / HIPAA)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span><strong>Self-Hosted KMS Hashing:</strong> Bring your own AWS KMS / GCP Cloud KMS keys</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Signed HIPAA Business Associate Agreement (BAA)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Dedicated VPC peering or Air-Gapped deployment</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>99.99% Guaranteed SLA & 24/7 Phone escalation</span>
                </li>
              </ul>
            </div>

            <button
              id="tier-btn-enterprise"
              onClick={() => onSelectTier('Enterprise VPC ($1,499/mo)', 'enterprise')}
              className="mt-8 w-full rounded-xl border border-zinc-300 bg-white py-2.5 text-xs font-semibold text-zinc-800 shadow-xs hover:bg-zinc-50 active:scale-98 transition dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              Deploy Enterprise ($1,499/mo)
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 border-t border-zinc-200 pt-16 dark:border-zinc-800">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Frequently Asked Compliance & Engineering Questions
            </h3>
            <p className="mt-2 text-xs text-zinc-500">
              Clear answers for engineering leads, security architects, and compliance officers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Zap className="h-4 w-4 text-emerald-600" />
                Does PromptTrace add latency to our LLM responses?
              </h4>
              <p className="mt-2 text-xs text-zinc-600 leading-relaxed dark:text-zinc-400">
                Zero added latency on the critical path. The PromptTrace SDK dispatches telemetry asynchronously in non-blocking worker threads after streaming completes, computing the SHA-256 HMAC digest in less than 0.8ms.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Lock className="h-4 w-4 text-emerald-600" />
                What makes an 'AI Data Passport' tamper-proof?
              </h4>
              <p className="mt-2 text-xs text-zinc-600 leading-relaxed dark:text-zinc-400">
                Every passport contains canonical JSON hashes of the input prompt, system version hash, vector chunk hashes, and generation response, signed with an HMAC key into a cryptographic write-ahead ledger. If any character is modified retroactively, the checksum verification immediately fails.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-600" />
                What if an incoming prompt contains sensitive PII or HIPAA data?
              </h4>
              <p className="mt-2 text-xs text-zinc-600 leading-relaxed dark:text-zinc-400">
                PromptTrace includes automated client-side and server-side PII scrubbers. Raw credit cards, SSNs, and names can be zero-knowledge masked before ledger ingestion while preserving cryptographic token length proofs for compliance.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Building2 className="h-4 w-4 text-emerald-600" />
                What happens if our team exceeds 2.5M passports on the $499 tier?
              </h4>
              <p className="mt-2 text-xs text-zinc-600 leading-relaxed dark:text-zinc-400">
                We never hard-throttle production traffic. Extra passports are simply billed at $0.0002 each ($20 per additional 100,000 passports), with automated threshold alert notifications in your Slack channel.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
