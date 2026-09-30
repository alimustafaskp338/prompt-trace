import React, { useState } from 'react';
import { 
  Shield, 
  Terminal, 
  Database, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  FileCode2, 
  Copy, 
  Check, 
  Sparkles, 
  Cpu, 
  GitCommit, 
  Layers, 
  ChevronRight,
  ShieldAlert,
  Fingerprint,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { PricingSection } from './PricingSection';
import { AIDataPassport, ActivePage } from '../types';

interface LandingPageProps {
  onGoToDashboard: () => void;
  onInspectPassport: (passport: AIDataPassport) => void;
  samplePassport: AIDataPassport;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGoToDashboard,
  onInspectPassport,
  samplePassport
}) => {
  const [copiedSdk, setCopiedSdk] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState<'node' | 'python' | 'langchain'>('node');
  const [previewTab, setPreviewTab] = useState<'card' | 'json'>('card');
  const [copiedPreviewJson, setCopiedPreviewJson] = useState(false);

  const sdkCode = {
    node: `import { PromptTrace } from '@prompttrace/sdk';
import OpenAI from 'openai';

const openai = new OpenAI();
const pt = new PromptTrace({ apiKey: process.env.PROMPTTRACE_API_KEY });

// 1-line wrapper automatically signs inputs, system prompts & RAG chunks
const response = await pt.trace({
  appName: 'finance-rag-agent',
  model: 'gpt-4o-2024-08-06',
  systemPrompt: { version: 'v3.8.4-strict', text: 'You are an institutional financial analyst...' },
  ragSources: [
    { title: 'Acme Q3 10-K', uri: 's3://vault/acme_10k.pdf', score: 0.94, textSnippet: '...' }
  ],
  call: () => openai.chat.completions.create({ /* ... standard OpenAI params */ })
});

// Returns response with cryptographic Passport Signature
console.log('AI Data Passport:', response.passport.id);`,

    python: `from prompttrace import PromptTrace
from openai import OpenAI

openai_client = OpenAI()
pt = PromptTrace(api_key="pt_live_948f2c01...")

# Automatically hashes inputs, system versions, and vector chunk arrays
passport, response = pt.trace(
    app_name="clinical-patient-ehr",
    model="claude-3-5-sonnet",
    system_prompt={"version": "v4.1.0-hipaa", "text": "Summarize patient encounter..."},
    rag_sources=[{"title": "Neurology Note", "uri": "hipaa://ehr/enc_88", "score": 0.915}],
    execute=lambda: openai_client.chat.completions.create(...)
)

print(f"Tamper-proof Seal: {passport.signature}")`,

    langchain: `import { PromptTraceCallbackHandler } from '@prompttrace/langchain';
import { ChatOpenAI } from '@langchain/openai';

const tracer = new PromptTraceCallbackHandler({
  appName: 'legal-contract-copilot',
  autoRedactPII: true,
  logRagVectors: true
});

const model = new ChatOpenAI({
  modelName: 'gpt-4o',
  callbacks: [tracer]
});

// LangChain RAG pipeline automatically emits AI Data Passports`
  };

  const handleCopySdk = () => {
    navigator.clipboard.writeText(sdkCode[activeCodeTab]);
    setCopiedSdk(true);
    setTimeout(() => setCopiedSdk(false), 2000);
  };

  const handleCopyPreviewJson = () => {
    navigator.clipboard.writeText(JSON.stringify(samplePassport, null, 2));
    setCopiedPreviewJson(true);
    setTimeout(() => setCopiedPreviewJson(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-16 md:pb-28 bg-white dark:bg-zinc-950">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] dark:[mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill Announcement */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3.5 py-1 text-xs font-semibold text-emerald-800 backdrop-blur-xs dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 mb-6">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>PromptTrace 2.4 Released</span>
              <span className="text-emerald-300 dark:text-emerald-700">|</span>
              <span className="font-normal text-emerald-700 dark:text-emerald-400">Cryptographic Passports for RAG</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl dark:text-white leading-[1.15]">
              Cryptographic Audit Proof for Every <span className="text-emerald-600 dark:text-emerald-400">LLM Generation</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
              PromptTrace generates immutable <strong>AI Data Passports</strong> that seal user inputs, system prompt versions, and retrieved RAG vector context with SHA-256 HMAC signatures. Pass SOC-2 audits, eradicate hallucinations, and verify provenance in under 1ms.
            </p>

            {/* Primary Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
              <button
                id="hero-cta-dashboard"
                onClick={onGoToDashboard}
                className="flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-zinc-800 active:scale-98 transition dark:bg-emerald-600 dark:hover:bg-emerald-500"
              >
                <Terminal className="h-4 w-4" />
                <span>Open Developer Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <a
                href="#pricing"
                id="hero-cta-pricing"
                className="flex items-center gap-1.5 rounded-xl border border-zinc-300 bg-white px-5 py-3.5 text-sm font-semibold text-zinc-800 shadow-xs hover:bg-zinc-50 active:scale-98 transition dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                <span>View Pricing</span>
                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs text-emerald-800 font-bold dark:bg-emerald-950 dark:text-emerald-300">
                  $499/mo Tier
                </span>
              </a>
            </div>

            {/* Quick Install Pill */}
            <div className="mt-6 inline-flex items-center gap-2 rounded-lg bg-zinc-100 px-3.5 py-1.5 text-xs font-mono text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
              <span className="text-emerald-600 font-bold">$</span>
              <span>npm install @prompttrace/sdk</span>
            </div>

            {/* Badges */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Zero Ingestion Latency (&lt;0.8ms)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>SOC-2 Type II & HIPAA Eligible</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>WORM Immutable Audit Ledger</span>
              </div>
            </div>
          </div>

          {/* INTERACTIVE PASSPORT PREVIEW SHOWCASE */}
          <div className="mt-14 max-w-5xl mx-auto rounded-2xl border border-zinc-200 bg-zinc-900 shadow-2xl overflow-hidden dark:border-zinc-800">
            {/* Preview Window Header */}
            <div className="flex flex-wrap items-center justify-between border-b border-zinc-800 bg-zinc-950 px-5 py-3 text-xs text-zinc-400 gap-2">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-rose-500/80"></div>
                  <div className="h-3 w-3 rounded-full bg-amber-500/80"></div>
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80"></div>
                </div>
                <span className="font-mono text-zinc-300 ml-2 font-medium">
                  prompttrace://passport/{samplePassport.id}
                </span>
                <span className="rounded bg-emerald-950 px-2 py-0.5 text-[11px] font-mono text-emerald-400 border border-emerald-800/60">
                  SHA-256 SEALED
                </span>
              </div>

              {/* Card vs JSON Toggle */}
              <div className="flex items-center gap-1 bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                <button
                  id="preview-tab-card"
                  onClick={() => setPreviewTab('card')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                    previewTab === 'card'
                      ? 'bg-zinc-800 text-white shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Passport Card View
                </button>
                <button
                  id="preview-tab-json"
                  onClick={() => setPreviewTab('json')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition ${
                    previewTab === 'json'
                      ? 'bg-zinc-800 text-white shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <FileCode2 className="h-3.5 w-3.5" />
                  <span>Raw JSON Audit Log</span>
                </button>
              </div>
            </div>

            {/* Preview Body */}
            <div className="p-6">
              {previewTab === 'card' ? (
                <div className="space-y-4">
                  {/* Top metadata row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80 text-xs">
                    <div>
                      <span className="text-zinc-500 block">Application</span>
                      <span className="font-mono font-bold text-zinc-200">{samplePassport.appName}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Model Engine</span>
                      <span className="font-mono font-bold text-emerald-400">{samplePassport.model}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Execution Latency</span>
                      <span className="font-mono text-zinc-200">{samplePassport.latencyMs}ms</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Audit Status</span>
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Verified Immutable
                      </span>
                    </div>
                  </div>

                  {/* 3 Pillars inside the passport: Input, System, RAG */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* User Input box */}
                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                      <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                        <span className="font-semibold uppercase tracking-wider text-indigo-400">1. Inbound User Input</span>
                        <span className="font-mono">{samplePassport.userInput.tokenCount} tokens</span>
                      </div>
                      <p className="text-xs text-zinc-300 font-mono line-clamp-4 leading-relaxed">
                        "{samplePassport.userInput.text}"
                      </p>
                    </div>

                    {/* System Prompt Version */}
                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                      <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                        <span className="font-semibold uppercase tracking-wider text-amber-400">2. System Instruction</span>
                        <span className="font-mono bg-zinc-800 px-1.5 py-0.5 rounded text-amber-300 text-[10px]">
                          {samplePassport.systemPrompt.version}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 font-mono line-clamp-4 leading-relaxed italic">
                        "{samplePassport.systemPrompt.text}"
                      </p>
                    </div>

                    {/* RAG Vector Context */}
                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                      <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                        <span className="font-semibold uppercase tracking-wider text-cyan-400">3. RAG Grounding</span>
                        <span className="font-mono text-emerald-400 text-xs font-bold">
                          {Math.round(samplePassport.ragContext[0]?.score * 100)}% Cosine
                        </span>
                      </div>
                      <div className="text-xs text-zinc-300 font-medium truncate mb-1">
                        {samplePassport.ragContext[0]?.title}
                      </div>
                      <p className="text-[11px] text-zinc-400 font-mono line-clamp-3">
                        "{samplePassport.ragContext[0]?.textSnippet}"
                      </p>
                    </div>
                  </div>

                  {/* Bottom bar with action */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-800/80 text-xs">
                    <div className="font-mono text-[11px] text-zinc-500 truncate max-w-md">
                      SHA-256: {samplePassport.signature}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onInspectPassport(samplePassport)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-500 transition"
                      >
                        <span>Inspect Full Audit Trail</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400 font-mono">
                      Canonical JSON representation of passport payload
                    </span>
                    <button
                      onClick={handleCopyPreviewJson}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                    >
                      {copiedPreviewJson ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedPreviewJson ? 'Copied' : 'Copy JSON'}</span>
                    </button>
                  </div>
                  <pre className="max-h-72 overflow-y-auto rounded-xl bg-zinc-950 p-4 text-xs font-mono text-zinc-200 border border-zinc-800/90 whitespace-pre">
                    {JSON.stringify(samplePassport, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4 CORE VALUE PILLARS SECTION */}
      <section className="py-20 bg-zinc-50 dark:bg-zinc-950/50 border-t border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">
              The Architecture of Compliance
            </h2>
            <h3 className="text-3xl font-extrabold text-zinc-900 tracking-tight sm:text-4xl dark:text-white">
              Why Traditional APM Is Insufficient for LLMs
            </h3>
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
              Generic metrics don't capture hallucination liability, ungrounded vector chunks, or prompt injection exploits. PromptTrace seals the full lineage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1: RAG Vector Provenance */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs hover:shadow-md transition dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400 mb-4">
                <Database className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                RAG Vector Provenance
              </h4>
              <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Log every retrieved chunk ID, cosine similarity score, and document URI. When an LLM produces an error, instantly pinpoint which document snippet caused it.
              </p>
            </div>

            {/* Pillar 2: System Prompt Version Drift */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs hover:shadow-md transition dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400 mb-4">
                <GitCommit className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                System Prompt Drift Diff
              </h4>
              <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                System prompts mutate across deployments. PromptTrace locks each prompt version to Git commits and logs variable injections into every passport.
              </p>
            </div>

            {/* Pillar 3: Cryptographic Integrity */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs hover:shadow-md transition dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 mb-4">
                <Fingerprint className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                SHA-256 HMAC Sealing
              </h4>
              <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Every audit record is sealed with an HMAC signature. Passports cannot be edited or fabricated after the fact, meeting strict FINRA and SOC-2 criteria.
              </p>
            </div>

            {/* Pillar 4: Automated PII & Shield */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs hover:shadow-md transition dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400 mb-4">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                Guardrail & PII Shield
              </h4>
              <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Zero-knowledge redact sensitive identifiers like social security numbers, patient records, and API tokens while recording audit evidence of the redaction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CODE INTEGRATION SECTION */}
      <section className="py-20 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left text */}
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 uppercase tracking-widest">
                <Terminal className="h-4 w-4" />
                Developer Experience
              </div>
              <h3 className="text-3xl font-extrabold text-zinc-900 tracking-tight dark:text-white">
                Three lines of code. Zero pipeline overhead.
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Whether you use raw OpenAI/Anthropic APIs, LangChain, or LlamaIndex, our lightweight client intercepts completion streams asynchronously. Your users notice zero added latency.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 dark:bg-emerald-950 dark:text-emerald-300">
                    1
                  </div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">
                    <strong>Async Dispatch:</strong> Logs are posted out-of-band via keep-alive HTTP/2 connections.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 dark:bg-emerald-950 dark:text-emerald-300">
                    2
                  </div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">
                    <strong>Plug-and-Play:</strong> Drop-in handlers for LangChain, LlamaIndex, LiteLLM, and vLLM.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 dark:bg-emerald-950 dark:text-emerald-300">
                    3
                  </div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">
                    <strong>Automatic Redaction:</strong> PII mask filters execute locally before telemetry leaves your VPC.
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={onGoToDashboard}
                  className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-zinc-800 transition dark:bg-emerald-600 dark:hover:bg-emerald-500"
                >
                  <span>Launch Live Developer Feed</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Right code box */}
            <div className="lg:col-span-7 rounded-2xl border border-zinc-800 bg-zinc-950 shadow-xl overflow-hidden">
              <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3 bg-zinc-950">
                {/* Language tabs */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveCodeTab('node')}
                    className={`px-3 py-1 rounded text-xs font-medium font-mono transition ${
                      activeCodeTab === 'node'
                        ? 'bg-zinc-800 text-emerald-400 border border-zinc-700'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Node.js / TS
                  </button>
                  <button
                    onClick={() => setActiveCodeTab('python')}
                    className={`px-3 py-1 rounded text-xs font-medium font-mono transition ${
                      activeCodeTab === 'python'
                        ? 'bg-zinc-800 text-emerald-400 border border-zinc-700'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Python SDK
                  </button>
                  <button
                    onClick={() => setActiveCodeTab('langchain')}
                    className={`px-3 py-1 rounded text-xs font-medium font-mono transition ${
                      activeCodeTab === 'langchain'
                        ? 'bg-zinc-800 text-emerald-400 border border-zinc-700'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    LangChain
                  </button>
                </div>

                <button
                  onClick={handleCopySdk}
                  className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition"
                >
                  {copiedSdk ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedSdk ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="p-4 text-xs font-mono text-zinc-200 overflow-x-auto leading-relaxed">
                <pre className="whitespace-pre">{sdkCode[activeCodeTab]}</pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION - Highlights $499/mo Tier */}
      <PricingSection onSelectTier={() => onGoToDashboard()} />

      {/* TRUSTED BY / SOCIAL PROOF */}
      <section className="py-14 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Trusted by AI Engineering & Compliance Teams at Scale
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-60 grayscale hover:grayscale-0 transition-all">
            <div className="font-bold text-base tracking-tighter text-zinc-800 dark:text-zinc-200">
              NEXUS<span className="text-emerald-600">AI</span>
            </div>
            <div className="font-bold text-base tracking-tighter text-zinc-800 dark:text-zinc-200">
              VALENCE<span className="text-indigo-600">.HEALTH</span>
            </div>
            <div className="font-bold text-base tracking-tighter text-zinc-800 dark:text-zinc-200">
              SYNAPSE<span className="text-cyan-600">LEGAL</span>
            </div>
            <div className="font-bold text-base tracking-tighter text-zinc-800 dark:text-zinc-200">
              FIDUCIARY<span className="text-emerald-600">IQ</span>
            </div>
            <div className="font-bold text-base tracking-tighter text-zinc-800 dark:text-zinc-200">
              COBALT<span className="text-zinc-500">CORP</span>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-200 bg-zinc-50 py-12 dark:border-zinc-800 dark:bg-zinc-950 text-xs text-zinc-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-600" />
            <span className="font-bold text-zinc-900 dark:text-white">PromptTrace B2B Micro-SaaS</span>
            <span>• Immutable AI Data Passports</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#pricing" className="hover:text-zinc-900 dark:hover:text-white">Pricing ($499/mo)</a>
            <button onClick={onGoToDashboard} className="hover:text-zinc-900 dark:hover:text-white">Developer Console</button>
            <span>SOC-2 Type II Certified</span>
            <span>Status: 99.99% Operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
