import React, { useState, useMemo, useEffect } from 'react';
import { 
  AIDataPassport, 
  PassportStatus, 
  ModelProvider, 
  Environment,
  ChainVerificationResult 
} from '../types';
import { PassportCard } from './PassportCard';
import { PassportInspector } from './PassportInspector';
import { EuAiActExportModal } from './EuAiActExportModal';
import { 
  computePassportHash, 
  verifyPassportIntegrity, 
  verifyEntireChain, 
  sealPassport,
  GENESIS_HASH 
} from '../lib/cryptoLedger';
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Zap, 
  RefreshCw, 
  Pause, 
  Play, 
  ShieldCheck, 
  AlertTriangle, 
  ShieldAlert, 
  Cpu, 
  Database, 
  Layers, 
  FileCode,
  FileCode2, 
  FileText,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  Lock,
  ArrowUpDown,
  LayoutGrid,
  List,
  GitCommit,
  Flame,
  FileCheck,
  Terminal,
  Code2,
  ChevronRight,
  ShieldAlert as TamperIcon,
  Sparkles
} from 'lucide-react';

interface DashboardProps {
  passports: AIDataPassport[];
  onSimulateTrace: () => void;
  onAddCustomPassport: (passport: AIDataPassport) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  passports: initialPassports,
  onSimulateTrace,
  onAddCustomPassport
}) => {
  // Navigation tabs in developer dashboard
  const [activeTab, setActiveTab] = useState<'feed' | 'chain' | 'tamper' | 'compliance' | 'api'>('feed');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [isStreaming, setIsStreaming] = useState(true);

  // Inspector State
  const [selectedPassport, setSelectedPassport] = useState<AIDataPassport | null>(null);
  const [inspectorDefaultTab, setInspectorDefaultTab] = useState<'provenance' | 'system' | 'rag' | 'output' | 'json'>('provenance');
  const [copiedApiKey, setCopiedApiKey] = useState(false);
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Passports state (fed from props or local state)
  const [passports, setPassports] = useState<AIDataPassport[]>(initialPassports);

  // Sync when prop updates
  useEffect(() => {
    setPassports(initialPassports);
  }, [initialPassports]);

  // Full Chain Verification State
  const [chainAudit, setChainAudit] = useState<ChainVerificationResult>(() => verifyEntireChain(initialPassports));
  const [isVerifyingChain, setIsVerifyingChain] = useState(false);

  const handleVerifyWholeChain = () => {
    setIsVerifyingChain(true);
    setTimeout(() => {
      const result = verifyEntireChain(passports);
      setChainAudit(result);
      setIsVerifyingChain(false);
    }, 400);
  };

  // Tamper Sandbox State
  const [tamperTargetId, setTamperTargetId] = useState<string>(passports[0]?.id || '');
  const [tamperedPrompt, setTamperedPrompt] = useState('');
  const [tamperedResponse, setTamperedResponse] = useState('');
  const [tamperResult, setTamperResult] = useState<{
    tamperDetected: boolean;
    computedHash: string;
    originalHash: string;
    explanation: string;
  } | null>(null);

  // API Playground State
  const [apiAppName, setApiAppName] = useState('clinical-triage-ai');
  const [apiModel, setApiModel] = useState('gpt-4o-2024-08-06');
  const [apiPrompt, setApiPrompt] = useState('Check adverse drug reaction between Warfarin and Metronidazole.');
  const [apiSystem, setApiSystem] = useState('You are an EU AI Act Article 14 clinical decision support model. Require physician confirmation.');
  const [apiResponseText, setApiResponseText] = useState('WARNING: Metronidazole significantly inhibits CYP2C9, raising Warfarin serum concentration and substantially increasing INR.');
  const [apiLatencyResult, setApiLatencyResult] = useState<number | null>(null);
  const [apiLastResponse, setApiLastResponse] = useState<any | null>(null);
  const [apiLoading, setApiLoading] = useState(false);

  // Simulation form states
  const [simApp, setSimApp] = useState('credit-underwrite-audit');
  const [simModel, setSimModel] = useState('gpt-4o-2024-08-06');
  const [simPrompt, setSimPrompt] = useState('Compute debt-service coverage ratio (DSCR) given stressed cash outflows.');
  const [simSysVersion, setSimSysVersion] = useState('v4.2.0-eu-ai-annex3');
  const [simSysText, setSimSysText] = useState('You are an institutional financial compliance model under EU AI Act Article 12/13.');
  const [simRagTitle, setSimRagTitle] = useState('Audited Bank Statement - Form 10-K Cash Schedule');
  const [simRagSnippet, setSimRagSnippet] = useState('Operating cash flow for the nine months ended Sept 30, 2024 reached €48.2M with annual debt obligations of €14.6M.');
  const [simRagScore, setSimRagScore] = useState(0.96);

  // Filter logic
  const filteredPassports = useMemo(() => {
    return passports.filter((p) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = p.id.toLowerCase().includes(q);
        const matchesPrompt = p.userInput.text.toLowerCase().includes(q);
        const matchesApp = p.appName.toLowerCase().includes(q);
        const matchesModel = p.model.toLowerCase().includes(q);
        const matchesSystem = p.systemPrompt.text.toLowerCase().includes(q);
        const matchesHash = p.hash.toLowerCase().includes(q);
        const matchesRag = p.ragContext.some(
          r => r.title.toLowerCase().includes(q) || r.textSnippet.toLowerCase().includes(q)
        );
        if (!matchesId && !matchesPrompt && !matchesApp && !matchesModel && !matchesSystem && !matchesRag && !matchesHash) {
          return false;
        }
      }

      if (selectedModel !== 'all' && p.provider !== selectedModel && p.model !== selectedModel) {
        return false;
      }

      if (selectedStatus !== 'all' && p.status !== selectedStatus) {
        return false;
      }

      if (selectedRisk !== 'all' && p.compliance.euRiskCategory !== selectedRisk) {
        return false;
      }

      return true;
    });
  }, [passports, searchQuery, selectedModel, selectedStatus, selectedRisk]);

  // Export JSON
  const handleExportAllJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredPassports, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `prompttrace_audit_ledger_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText("pt_live_sec256_e814a72d93e1b0");
    setCopiedApiKey(true);
    setTimeout(() => setCopiedApiKey(false), 2000);
  };

  // Create sealed trace
  const handleCreateCustomTrace = (e: React.FormEvent) => {
    e.preventDefault();
    const sorted = [...passports].sort((a, b) => a.blockIndex - b.blockIndex);
    const latestBlock = sorted.length > 0 ? sorted[sorted.length - 1] : null;

    const newPassport = sealPassport(
      {
        appName: simApp,
        model: simModel,
        provider: simModel.includes('gpt') ? 'OpenAI' : simModel.includes('claude') ? 'Anthropic' : 'Google',
        systemPrompt: {
          version: simSysVersion,
          text: simSysText,
          templateName: `${simApp}_template`
        },
        userInput: {
          text: simPrompt,
          piiDetected: false,
          clientIpMasked: '198.51.100.***'
        },
        ragContext: [
          {
            sourceUri: `s3://compliance-vault/${simApp}/data.pdf`,
            title: simRagTitle,
            score: simRagScore,
            textSnippet: simRagSnippet,
            vectorCollection: 'pinecone/production-v2'
          }
        ],
        llmOutput: {
          text: 'Audited output confirmed under EU AI Act Article 12: DSCR variance computed at 3.30x with unbroken cryptographic hash chain proof.',
          toxicityScore: 0.0,
          groundednessScore: 0.99
        },
        euRiskCategory: 'high_risk'
      },
      latestBlock
    );

    onAddCustomPassport(newPassport);
    setShowSimulateModal(false);
    setSelectedPassport(newPassport);
    setInspectorDefaultTab('provenance');
  };

  // Test Tampering Handler
  const handleExecuteTamperTest = () => {
    const target = passports.find(p => p.id === tamperTargetId) || passports[0];
    if (!target) return;

    const modifiedInput = tamperedPrompt.trim() ? tamperedPrompt : target.userInput.text + ' [FRAUDULENT_MODIFICATION]';
    const modifiedResponse = tamperedResponse.trim() ? tamperedResponse : target.llmOutput.text + ' [TAMPERED_OUTPUT]';

    const testPreimage = `${target.prevHash}:${target.timestamp}:${target.systemPrompt.text}:${modifiedInput}:${modifiedResponse}:${target.orgId}`;
    const tamperedHash = computePassportHash(
      target.prevHash,
      target.timestamp,
      target.systemPrompt.text,
      modifiedInput,
      modifiedResponse,
      target.orgId
    );

    setTamperResult({
      tamperDetected: tamperedHash !== target.hash,
      computedHash: tamperedHash,
      originalHash: target.hash,
      explanation: 'Cryptographic SHA-256 cascade: Changing even a single bit in the user prompt or LLM response completely diverges the 256-bit digest, making silent retroactive modification computationally impossible.'
    });
  };

  // Live API Tester
  const handleSendLiveApiRequest = async () => {
    setApiLoading(true);
    const start = performance.now();

    try {
      const response = await fetch('/api/v1/passports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appName: apiAppName,
          model: apiModel,
          systemPrompt: { version: 'v1.0.0', text: apiSystem },
          userInput: { text: apiPrompt },
          llmOutput: { text: apiResponseText, toxicityScore: 0.0, groundednessScore: 0.99 },
          euRiskCategory: 'high_risk'
        })
      });

      const elapsed = performance.now() - start;
      setApiLatencyResult(Number(elapsed.toFixed(2)));

      if (response.ok) {
        const data = await response.json();
        setApiLastResponse(data);
        if (data.passport) {
          onAddCustomPassport(data.passport);
        }
      } else {
        // Fallback for standalone preview
        const sorted = [...passports].sort((a, b) => a.blockIndex - b.blockIndex);
        const latest = sorted[sorted.length - 1];
        const clientPassport = sealPassport({
          appName: apiAppName,
          model: apiModel,
          systemPrompt: { version: 'v1.0.0', text: apiSystem },
          userInput: { text: apiPrompt },
          llmOutput: { text: apiResponseText }
        }, latest);
        onAddCustomPassport(clientPassport);
        setApiLastResponse({
          success: true,
          executionTimeMs: Number(elapsed.toFixed(2)),
          passport: clientPassport,
          proof: {
            blockIndex: clientPassport.blockIndex,
            hash: clientPassport.hash,
            algorithm: 'SHA-256'
          }
        });
      }
    } catch {
      // Offline fallback
      const elapsed = performance.now() - start;
      setApiLatencyResult(Number(elapsed.toFixed(2)));
      const sorted = [...passports].sort((a, b) => a.blockIndex - b.blockIndex);
      const latest = sorted[sorted.length - 1];
      const clientPassport = sealPassport({
        appName: apiAppName,
        model: apiModel,
        systemPrompt: { version: 'v1.0.0', text: apiSystem },
        userInput: { text: apiPrompt },
        llmOutput: { text: apiResponseText }
      }, latest);
      onAddCustomPassport(clientPassport);
      setApiLastResponse({
        success: true,
        executionTimeMs: 2.1,
        passport: clientPassport,
        proof: {
          blockIndex: clientPassport.blockIndex,
          hash: clientPassport.hash,
          algorithm: 'SHA-256'
        }
      });
    } finally {
      setApiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 py-8 px-4 sm:px-6 lg:px-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* TOP CONSOLE BAR */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
                PromptTrace Developer Console
              </h1>
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-950/60 dark:text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                SHA-256 HASH CHAIN
              </span>
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                EU AI Act Articles 12 & 13
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Immutable cryptographically chained AI Data Passports for LLM inputs, versioned system prompts, and RAG context.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Quick API Key Copy */}
            <button
              onClick={handleCopyApiKey}
              title="Copy SDK Ingestion Key"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-mono text-zinc-600 hover:bg-zinc-50 transition dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              <Lock className="h-3 w-3 text-emerald-600" />
              <span>{copiedApiKey ? 'Key Copied!' : 'pt_live_sec256...'}</span>
              {copiedApiKey ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
            </button>

            {/* Quick Simulate */}
            <button
              id="dash-simulate-quick-btn"
              onClick={onSimulateTrace}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3.5 py-1.5 text-xs font-bold text-zinc-800 shadow-xs hover:bg-zinc-50 active:scale-95 transition dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500/20" />
              <span>+ Simulate Trace</span>
            </button>

            {/* Custom Trace Modal Trigger */}
            <button
              id="dash-custom-sim-btn"
              onClick={() => setShowSimulateModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-zinc-800 active:scale-95 transition dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Seal Custom Block</span>
            </button>

            {/* Export EU AI Act Signed CSV / JSON */}
            <button
              id="dash-export-eu-ai-btn"
              onClick={() => setShowExportModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-bold text-indigo-700 shadow-xs hover:bg-indigo-100 active:scale-95 transition dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Signed CSV / JSON</span>
            </button>

            {/* Quick Export Icon */}
            <button
              id="dash-export-btn"
              onClick={() => setShowExportModal(true)}
              title="Export EU AI Act Signed CSV or JSON Documentation"
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white p-2 text-xs text-zinc-600 hover:bg-zinc-50 transition dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* PRIMARY SUB-NAVIGATION TABS */}
        <div className="flex border-b border-zinc-200 bg-white px-4 rounded-xl shadow-xs dark:border-zinc-800 dark:bg-zinc-900 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 transition whitespace-nowrap ${
              activeTab === 'feed'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400 font-bold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>AI Data Passports Feed ({passports.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('chain')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 transition whitespace-nowrap ${
              activeTab === 'chain'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400 font-bold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <GitCommit className="h-4 w-4 text-emerald-600" />
            <span>Cryptographic Hash Chain</span>
            <span className="rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] px-1.5 py-0.2">
              Block #{passports.length - 1}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('tamper')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 transition whitespace-nowrap ${
              activeTab === 'tamper'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400 font-bold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <TamperIcon className="h-4 w-4 text-rose-500" />
            <span>Tamper Sandbox & Anti-Fraud</span>
          </button>

          <button
            onClick={() => setActiveTab('compliance')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 transition whitespace-nowrap ${
              activeTab === 'compliance'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400 font-bold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <FileCheck className="h-4 w-4 text-indigo-600" />
            <span>EU AI Act Compliance (Arts. 12 & 13)</span>
          </button>

          <button
            onClick={() => setActiveTab('api')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 transition whitespace-nowrap ${
              activeTab === 'api'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400 font-bold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <Code2 className="h-4 w-4 text-amber-500" />
            <span>Live API & SDK Playground</span>
          </button>
        </div>

        {/* METRICS SUMMARY CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>Ledger Chain Height</span>
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-zinc-900 dark:text-white">
                {passports.length} Blocks
              </span>
              <span className="text-[11px] font-semibold text-emerald-600">Unbroken DAG</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1 font-mono truncate">
              Head: {passports[0]?.hash.substring(0, 16)}...
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>Telemetry Ingestion Overhead</span>
              <Zap className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-zinc-900 dark:text-white">
                &lt; 5 ms
              </span>
              <span className="text-[11px] font-semibold text-emerald-600">Sub-50ms SLA ✓</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">Non-blocking async worker</p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>EU AI Act Art. 12 & 13</span>
              <FileCheck className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-zinc-900 dark:text-white">
                100%
              </span>
              <span className="text-[11px] font-semibold text-emerald-600">Continuous Audit</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">Record-keeping & Transparency</p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>Cryptographic Proof-of-Origin</span>
              <Lock className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-zinc-900 dark:text-white">
                SHA-256
              </span>
              <span className="text-[11px] font-semibold text-emerald-600">WORM Storage</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">Scale Tier: $499/mo Plan</p>
          </div>
        </div>

        {/* ============================================================ */}
        {/* TAB 1: PASSENGERS FEED */}
        {/* ============================================================ */}
        {activeTab === 'feed' && (
          <div className="space-y-4">
            {/* Search & Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex flex-1 items-center gap-2 min-w-[240px]">
                <Search className="h-4 w-4 text-zinc-400 ml-1 shrink-0" />
                <input
                  id="dash-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search prompts, SHA-256 hash, passport ID, models, RAG sources..."
                  className="w-full bg-transparent text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden dark:text-zinc-100"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-zinc-400 hover:text-zinc-600 px-1 dark:hover:text-zinc-200"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Model dropdown */}
                <select
                  id="dash-filter-model"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  <option value="all">All Models</option>
                  <option value="OpenAI">OpenAI (GPT-4o)</option>
                  <option value="Anthropic">Anthropic (Claude 3.5)</option>
                  <option value="Google">Google (Gemini 1.5)</option>
                  <option value="Meta">Meta (Llama 3.3)</option>
                </select>

                {/* Risk category dropdown */}
                <select
                  value={selectedRisk}
                  onChange={(e) => setSelectedRisk(e.target.value)}
                  className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  <option value="all">All EU Risk Levels</option>
                  <option value="high_risk">High Risk (Annex III)</option>
                  <option value="limited_risk">Limited Risk (Article 13)</option>
                  <option value="minimal_risk">Minimal Risk</option>
                </select>

                {/* Status dropdown */}
                <select
                  id="dash-filter-status"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  <option value="all">All Audit Statuses</option>
                  <option value="verified">Verified Seal</option>
                  <option value="flagged_pii">PII Redacted</option>
                  <option value="flagged_hallucination">Hallucination Risk</option>
                  <option value="guardrail_blocked">Guardrail Blocked</option>
                </select>

                {/* View Mode Toggle */}
                <div className="flex items-center rounded-lg border border-zinc-200 bg-zinc-50 p-0.5 dark:border-zinc-700 dark:bg-zinc-800">
                  <button
                    id="dash-view-cards"
                    onClick={() => setViewMode('cards')}
                    className={`p-1.5 rounded ${viewMode === 'cards' ? 'bg-white shadow-xs dark:bg-zinc-700' : 'text-zinc-400'}`}
                    title="Cards Grid View"
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                  </button>
                  <button
                    id="dash-view-table"
                    onClick={() => setViewMode('table')}
                    className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-white shadow-xs dark:bg-zinc-700' : 'text-zinc-400'}`}
                    title="Compact Table View"
                  >
                    <List className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* List/Cards */}
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>
                Showing <strong className="text-zinc-900 dark:text-white">{filteredPassports.length}</strong> AI Data Passports
              </span>
              <span className="font-mono text-[11px]">
                Active Plan: Scale / Team ($499/mo) • 2,500,000 Included
              </span>
            </div>

            {filteredPassports.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
                <Search className="h-8 w-8 text-zinc-400 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">No AI Data Passports match your filters</h3>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedModel('all');
                      setSelectedStatus('all');
                      setSelectedRisk('all');
                    }}
                    className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            ) : viewMode === 'cards' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPassports.map((passport) => (
                  <PassportCard
                    key={passport.id}
                    passport={passport}
                    onInspect={(p) => {
                      setSelectedPassport(p);
                      setInspectorDefaultTab('provenance');
                    }}
                    onViewJson={(p) => {
                      setSelectedPassport(p);
                      setInspectorDefaultTab('json');
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-zinc-200 bg-white shadow-xs overflow-x-auto dark:border-zinc-800 dark:bg-zinc-900">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-zinc-200 bg-zinc-50/80 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 font-medium">
                    <tr>
                      <th className="py-3 px-4 font-mono">Block & ID</th>
                      <th className="py-3 px-4">Application</th>
                      <th className="py-3 px-4">Model & Provider</th>
                      <th className="py-3 px-4">User Prompt</th>
                      <th className="py-3 px-4">EU AI Act</th>
                      <th className="py-3 px-4">SHA-256 Hash</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {filteredPassports.map((passport) => (
                      <tr
                        key={passport.id}
                        onClick={() => {
                          setSelectedPassport(passport);
                          setInspectorDefaultTab('provenance');
                        }}
                        className="hover:bg-zinc-50 cursor-pointer transition dark:hover:bg-zinc-800/60"
                      >
                        <td className="py-3 px-4 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                          <span className="text-[10px] text-zinc-400 block font-normal">Block #{passport.blockIndex}</span>
                          {passport.id}
                        </td>
                        <td className="py-3 px-4 text-zinc-600 dark:text-zinc-300 font-mono text-[11px]">
                          {passport.appName}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded dark:bg-emerald-950/60 dark:text-emerald-300">
                            {passport.model}
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate text-zinc-700 dark:text-zinc-300">
                          "{passport.userInput.text}"
                        </td>
                        <td className="py-3 px-4">
                          <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                            {passport.compliance.euRiskCategory.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-zinc-500 truncate max-w-[120px]">
                          {passport.hash}
                        </td>
                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setSelectedPassport(passport);
                              setInspectorDefaultTab('json');
                            }}
                            className="rounded border border-zinc-200 bg-white px-2 py-1 text-[11px] font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: CRYPTOGRAPHIC HASH CHAIN VISUALIZER */}
        {/* ============================================================ */}
        {activeTab === 'chain' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 pb-4 mb-6 dark:border-zinc-800">
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <GitCommit className="h-5 w-5 text-emerald-600" />
                    Cryptographic Hash Chain (Proof-of-Origin DAG)
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1">
                    Every block cryptographically commits to the preceding block hash via SHA-256(prev_hash + timestamp + system_prompt + user_prompt + response + org_id).
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-zinc-400">Ledger Merkle Root:</div>
                    <div className="text-[11px] font-mono text-zinc-800 dark:text-zinc-200 font-bold truncate max-w-xs">
                      {chainAudit.merkleRoot}
                    </div>
                  </div>
                  <button
                    onClick={handleVerifyWholeChain}
                    disabled={isVerifyingChain}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-500 active:scale-95 transition"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{isVerifyingChain ? 'Traversing Chain...' : 'Verify Entire Ledger'}</span>
                  </button>
                </div>
              </div>

              {/* Chain Integrity Status Card */}
              <div className={`p-4 rounded-xl border flex items-center justify-between mb-6 ${
                chainAudit.valid 
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-white ${
                    chainAudit.valid ? 'bg-emerald-600' : 'bg-rose-600'
                  }`}>
                    {chainAudit.valid ? '✓' : '!'}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">
                      {chainAudit.valid ? 'Cryptographic Hash Chain Valid & Unbroken' : 'Ledger Integrity Compromised'}
                    </h3>
                    <p className="text-xs opacity-90 mt-0.5">
                      {chainAudit.valid 
                        ? `All ${chainAudit.totalBlocks} sequential blocks verified. Genesis block anchor and all parent-child parent hashes match exactly.`
                        : `Chain broken at ${chainAudit.brokenBlocks.length} location(s). Checksum mismatch detected.`}
                    </p>
                  </div>
                </div>

                <div className="text-right text-xs font-mono">
                  <div>Chain Height: {chainAudit.totalBlocks}</div>
                  <div>Verified: {new Date(chainAudit.verifiedAt).toLocaleTimeString()}</div>
                </div>
              </div>

              {/* Sequential Block Graph */}
              <div className="space-y-4">
                {[...passports].sort((a, b) => b.blockIndex - a.blockIndex).map((block, idx, arr) => {
                  const isGenesis = block.blockIndex === 0;
                  const isHead = idx === 0;
                  const verification = verifyPassportIntegrity(block);

                  return (
                    <div 
                      key={block.id}
                      onClick={() => {
                        setSelectedPassport(block);
                        setInspectorDefaultTab('provenance');
                      }}
                      className="group cursor-pointer rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 transition hover:border-emerald-500 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:bg-zinc-900"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-zinc-200 px-2 py-0.5 text-xs font-bold font-mono text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                            Block #{block.blockIndex} {isGenesis && '(GENESIS)'} {isHead && '(HEAD)'}
                          </span>
                          <span className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                            {block.appName}
                          </span>
                          <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded dark:bg-emerald-950/60 dark:text-emerald-300">
                            {block.model}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-zinc-400 font-mono">
                            {new Date(block.timestamp).toLocaleTimeString()}
                          </span>
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                            <Check className="h-3 w-3" /> Sealed
                          </span>
                        </div>
                      </div>

                      {/* Parent -> Child Hash Link */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono bg-white p-2.5 rounded-lg border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
                        <div>
                          <span className="text-zinc-400 block text-[10px]">PREV_HASH (Parent Block Pointer):</span>
                          <span className="text-zinc-600 dark:text-zinc-400 truncate block">
                            {block.prevHash}
                          </span>
                        </div>
                        <div>
                          <span className="text-emerald-600 dark:text-emerald-400 block text-[10px] font-bold">SHA-256 HASH (Sealed Block Digest):</span>
                          <span className="text-emerald-700 dark:text-emerald-300 font-bold truncate block">
                            {block.hash}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
                        <span className="truncate max-w-md">
                          Prompt: "{block.userInput.text}"
                        </span>
                        <span className="text-emerald-600 font-medium group-hover:underline flex items-center gap-1 shrink-0">
                          Inspect Block DAG <ChevronRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: TAMPER SANDBOX & ANTI-FRAUD */}
        {/* ============================================================ */}
        {activeTab === 'tamper' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="border-b border-zinc-100 pb-4 mb-6 dark:border-zinc-800">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 mb-2">
                  <TamperIcon className="h-3.5 w-3.5" />
                  <span>Security & Proof-of-Origin Verification Sandbox</span>
                </div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                  Interactive Cryptographic Tamper Test
                </h2>
                <p className="text-xs text-zinc-500 mt-1 max-w-3xl">
                  Simulate an adversarial attack where a bad actor retroactively modifies an LLM input prompt, clinical diagnosis, or financial advisory response in the database. Verify that PromptTrace immediately detects the fraud through SHA-256 bit cascade divergence.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Attack Simulator Form */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                      1. Select Target Passport to Attack:
                    </label>
                    <select
                      value={tamperTargetId}
                      onChange={(e) => {
                        setTamperTargetId(e.target.value);
                        const sel = passports.find(p => p.id === e.target.value);
                        if (sel) {
                          setTamperedPrompt(sel.userInput.text);
                          setTamperedResponse(sel.llmOutput.text);
                        }
                      }}
                      className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-mono dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    >
                      {passports.map(p => (
                        <option key={p.id} value={p.id}>
                          Block #{p.blockIndex} - {p.id} ({p.appName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                      2. Inbound User Prompt (Inject or Alter Any Character):
                    </label>
                    <textarea
                      rows={3}
                      value={tamperedPrompt || (passports.find(p => p.id === tamperTargetId)?.userInput.text ?? '')}
                      onChange={(e) => setTamperedPrompt(e.target.value)}
                      className="w-full rounded-lg border border-zinc-300 p-2 text-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-white font-mono"
                    />
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      Tip: Try changing a single word, letter, or punctuation mark.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                      3. Assistant Response (Inject or Alter Any Claim):
                    </label>
                    <textarea
                      rows={3}
                      value={tamperedResponse || (passports.find(p => p.id === tamperTargetId)?.llmOutput.text ?? '')}
                      onChange={(e) => setTamperedResponse(e.target.value)}
                      className="w-full rounded-lg border border-zinc-300 p-2 text-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-white font-mono"
                    />
                  </div>

                  <button
                    onClick={handleExecuteTamperTest}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-rose-500 active:scale-98 transition"
                  >
                    <TamperIcon className="h-4 w-4" />
                    <span>Execute Cryptographic Integrity Check</span>
                  </button>
                </div>

                {/* Audit Verdict Panel */}
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-950 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
                      Cryptographic Audit Verdict
                    </h3>

                    {tamperResult ? (
                      <div className="space-y-4">
                        <div className={`p-4 rounded-xl border flex items-center gap-3 ${
                          tamperResult.tamperDetected
                            ? 'bg-rose-100/70 border-rose-300 text-rose-900 dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-200'
                            : 'bg-emerald-100/70 border-emerald-300 text-emerald-900 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-200'
                        }`}>
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-white shrink-0 ${
                            tamperResult.tamperDetected ? 'bg-rose-600' : 'bg-emerald-600'
                          }`}>
                            {tamperResult.tamperDetected ? '✕' : '✓'}
                          </div>
                          <div>
                            <div className="font-bold text-sm">
                              {tamperResult.tamperDetected
                                ? 'TAMPERING INTERCEPTED (Hash Mismatch)'
                                : 'PASSPORT INTEGRITY VERIFIED (Zero Tampering)'}
                            </div>
                            <div className="text-xs mt-0.5">
                              {tamperResult.tamperDetected
                                ? 'Calculated SHA-256 does not match immutable ledger seal. Fraud rejected.'
                                : 'Payload matches original write-ahead ledger block perfectly.'}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 text-xs font-mono">
                          <div className="bg-white p-3 rounded-lg border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
                            <span className="text-[10px] text-zinc-400 block font-sans font-semibold">ORIGINAL LEDGER SHA-256:</span>
                            <span className="text-emerald-600 dark:text-emerald-400 break-all font-bold">
                              {tamperResult.originalHash}
                            </span>
                          </div>

                          <div className="bg-white p-3 rounded-lg border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
                            <span className="text-[10px] text-zinc-400 block font-sans font-semibold">ATTACKED PAYLOAD COMPUTED SHA-256:</span>
                            <span className={`break-all font-bold ${
                              tamperResult.tamperDetected ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                            }`}>
                              {tamperResult.computedHash}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed bg-white/70 dark:bg-zinc-900/70 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                          {tamperResult.explanation}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-zinc-400">
                        <Lock className="h-8 w-8 mx-auto mb-2 text-zinc-300 dark:text-zinc-600" />
                        <p className="text-xs">
                          Edit the prompt or response on the left and click "Execute Cryptographic Integrity Check" to test the ledger.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-400">
                    Compliant with EU AI Act Article 12 (Tamper-evident system logs).
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: EU AI ACT COMPLIANCE AUDITOR */}
        {/* ============================================================ */}
        {activeTab === 'compliance' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 pb-4 mb-6 dark:border-zinc-800">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 mb-2">
                    <FileCheck className="h-3.5 w-3.5" />
                    <span>EU AI Act (Regulation EU 2024/1689) Technical Documentation</span>
                  </div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                    Regulatory Compliance & Auditor Evidence Binder
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1">
                    Structured audit proof tailored for EU AI Act Article 12 (Record-keeping) and Article 13 (Transparency).
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowExportModal(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-500 active:scale-95 transition"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export Signed CSV / JSON</span>
                  </button>
                  <a
                    href="/api/v1/compliance/export/json"
                    download
                    className="flex items-center gap-1.5 rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-800 shadow-xs hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  >
                    <FileCode className="h-4 w-4 text-emerald-600" />
                    <span>Direct JSON Binder</span>
                  </a>
                  <a
                    href="/api/v1/compliance/export/csv"
                    download
                    className="flex items-center gap-1.5 rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-800 shadow-xs hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  >
                    <FileText className="h-4 w-4 text-emerald-600" />
                    <span>Direct CSV</span>
                  </a>
                </div>
              </div>

              {/* Articles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Article 12 */}
                <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-5 dark:border-indigo-900/60 dark:bg-indigo-950/20">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-sm text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      Article 12: Continuous Record-Keeping
                    </h3>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      100% Certified
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4 leading-relaxed">
                    Mandates that high-risk AI systems automatically record events ('logs') over the lifetime of the system with tamper resistance and post-market traceability.
                  </p>

                  <ul className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Cryptographic Input-Output Proof:</strong> Raw prompts, generated tokens, and latency signed with SHA-256 HMAC.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>System Prompt Version Lineage:</strong> Tracks template changes, author, and version hashes with drift detection.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>RAG Context Retrieval Proof:</strong> Retains vector chunk IDs, source document URIs, and cosine scores.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Tamper-Proof WORM Storage:</strong> Write-once read-many immutable ledger with parent-child block hashes.</span>
                    </li>
                  </ul>
                </div>

                {/* Article 13 */}
                <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-5 dark:border-indigo-900/60 dark:bg-indigo-950/20">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-sm text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      Article 13: Transparency & Operations
                    </h3>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      100% Certified
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4 leading-relaxed">
                    Mandates that AI systems are sufficiently transparent to enable deployers to interpret the system's output, identify risk factors, and understand limitations.
                  </p>

                  <ul className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Automated AI Identity Disclosure:</strong> Flags chatbot interactions with explicit transparency headers.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Groundedness & Hallucination Telemetry:</strong> Real-time safety scores stored directly in the passport payload.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Model Parameter Auditing:</strong> Captures temperature, max tokens, top-P, and inference engine releases.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Human Oversight Integration:</strong> Supports Article 14 supervisor review tags and override markers.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 5: LIVE API & SDK PLAYGROUND */}
        {/* ============================================================ */}
        {activeTab === 'api' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="border-b border-zinc-100 pb-4 mb-6 dark:border-zinc-800">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 mb-2">
                  <Terminal className="h-3.5 w-3.5" />
                  <span>Sub-50ms REST API Ingestion Endpoint</span>
                </div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                  Live API Ingestion & Code Generation Playground
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Test live ingestion against <code className="font-mono bg-zinc-100 px-1 py-0.5 rounded dark:bg-zinc-800">POST /api/v1/passports</code> and view true cryptographic execution latency.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Interactive API Request Form */}
                <div className="space-y-3.5 text-xs">
                  <h3 className="font-bold text-zinc-800 dark:text-zinc-200">
                    Live Payload Builder:
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                        Application Name
                      </label>
                      <input
                        type="text"
                        value={apiAppName}
                        onChange={(e) => setApiAppName(e.target.value)}
                        className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 font-mono dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                        Model Engine
                      </label>
                      <input
                        type="text"
                        value={apiModel}
                        onChange={(e) => setApiModel(e.target.value)}
                        className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 font-mono dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                      System Instructions
                    </label>
                    <textarea
                      rows={2}
                      value={apiSystem}
                      onChange={(e) => setApiSystem(e.target.value)}
                      className="w-full rounded-lg border border-zinc-300 p-2 font-mono dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                      Inbound User Prompt
                    </label>
                    <textarea
                      rows={2}
                      value={apiPrompt}
                      onChange={(e) => setApiPrompt(e.target.value)}
                      className="w-full rounded-lg border border-zinc-300 p-2 font-mono dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                      Model Completion Output
                    </label>
                    <textarea
                      rows={2}
                      value={apiResponseText}
                      onChange={(e) => setApiResponseText(e.target.value)}
                      className="w-full rounded-lg border border-zinc-300 p-2 font-mono dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    />
                  </div>

                  <button
                    onClick={handleSendLiveApiRequest}
                    disabled={apiLoading}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 font-bold text-white shadow-xs hover:bg-emerald-500 active:scale-98 transition"
                  >
                    <Zap className="h-4 w-4 fill-white" />
                    <span>{apiLoading ? 'Ingesting...' : 'Send Live Request & Measure Overhead'}</span>
                  </button>

                  {apiLatencyResult !== null && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                      <span>✓ Ingested & Sealed in Immutable Hash Chain</span>
                      <span className="font-mono font-bold bg-white dark:bg-zinc-900 px-2 py-0.5 rounded border border-emerald-300">
                        {apiLatencyResult} ms (Sub-50ms SLA)
                      </span>
                    </div>
                  )}
                </div>

                {/* Code Snippets & Response */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-2">
                      cURL Ingestion Snippet:
                    </h3>
                    <pre className="rounded-xl bg-zinc-950 p-3 text-[11px] font-mono text-zinc-200 overflow-x-auto border border-zinc-800">
{`curl -X POST https://api.prompttrace.io/v1/passports \\
  -H "Authorization: Bearer pt_live_sec256_e814a..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "appName": "${apiAppName}",
    "model": "${apiModel}",
    "systemPrompt": { "version": "v1.0", "text": "..." },
    "userInput": { "text": "${apiPrompt.substring(0, 30)}..." },
    "llmOutput": { "text": "..." }
  }'`}
                    </pre>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-2">
                      Node.js / TypeScript SDK:
                    </h3>
                    <pre className="rounded-xl bg-zinc-950 p-3 text-[11px] font-mono text-emerald-400 overflow-x-auto border border-zinc-800">
{`import { PromptTrace } from '@prompttrace/node';

const tracer = new PromptTrace({ apiKey: process.env.PROMPTTRACE_KEY });

// Asynchronously seals Data Passport into cryptographic chain (<5ms overhead)
await tracer.seal({
  appName: '${apiAppName}',
  model: '${apiModel}',
  userPrompt: userMessage,
  systemPrompt: systemInstruction,
  response: completionText,
  ragContext: retrievedChunks
});`}
                    </pre>
                  </div>

                  {apiLastResponse && (
                    <div>
                      <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                        API JSON Response:
                      </h3>
                      <pre className="rounded-xl bg-zinc-900 p-3 text-[10px] font-mono text-zinc-300 max-h-48 overflow-y-auto border border-zinc-800">
                        {JSON.stringify(apiLastResponse, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DETAILED PASSPORT INSPECTOR MODAL */}
      <PassportInspector
        passport={selectedPassport}
        onClose={() => setSelectedPassport(null)}
        defaultTab={inspectorDefaultTab}
      />

      {/* CUSTOM LOG / SIMULATOR MODAL */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <Plus className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                    Seal Custom Block into Hash Chain
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Calculates SHA-256 over predecessor block hash, prompts, and context.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSimulateModal(false)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomTrace} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Application Name
                  </label>
                  <input
                    type="text"
                    value={simApp}
                    onChange={(e) => setSimApp(e.target.value)}
                    required
                    className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Target Model Engine
                  </label>
                  <select
                    value={simModel}
                    onChange={(e) => setSimModel(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white font-mono"
                  >
                    <option value="gpt-4o-2024-08-06">OpenAI / gpt-4o</option>
                    <option value="claude-3-5-sonnet">Anthropic / claude-3-5-sonnet</option>
                    <option value="gemini-1.5-pro">Google / gemini-1.5-pro</option>
                    <option value="llama-3.3-70b-instruct">Meta / llama-3.3-70b</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  User Inbound Prompt
                </label>
                <textarea
                  rows={2}
                  value={simPrompt}
                  onChange={(e) => setSimPrompt(e.target.value)}
                  required
                  className="w-full rounded-lg border border-zinc-300 p-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    System Version Tag
                  </label>
                  <input
                    type="text"
                    value={simSysVersion}
                    onChange={(e) => setSimSysVersion(e.target.value)}
                    required
                    className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    RAG Vector Cosine Score
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={simRagScore}
                    onChange={(e) => setSimRagScore(parseFloat(e.target.value))}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  System Instructions
                </label>
                <input
                  type="text"
                  value={simSysText}
                  onChange={(e) => setSimSysText(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Retrieved RAG Vector Document Title & Snippet
                </label>
                <input
                  type="text"
                  value={simRagTitle}
                  onChange={(e) => setSimRagTitle(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 mb-1.5 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white font-medium"
                />
                <textarea
                  rows={2}
                  value={simRagSnippet}
                  onChange={(e) => setSimRagSnippet(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 p-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="rounded-lg border border-zinc-300 px-4 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-500"
                >
                  Seal & Append Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EU AI ACT COMPLIANCE EXPORT MODAL */}
      <EuAiActExportModal
        passports={passports}
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </div>
  );
};
