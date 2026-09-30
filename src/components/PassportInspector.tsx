import React, { useState } from 'react';
import { AIDataPassport } from '../types';
import { 
  X, 
  ShieldCheck, 
  FileCode, 
  Database, 
  Terminal, 
  CheckCircle2, 
  Copy, 
  Check, 
  Download, 
  ArrowRight, 
  Lock, 
  Cpu, 
  AlertTriangle,
  GitBranch,
  Search,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';

import { verifyPassportIntegrity } from '../lib/cryptoLedger';

interface PassportInspectorProps {
  passport: AIDataPassport | null;
  onClose: () => void;
  defaultTab?: 'provenance' | 'system' | 'rag' | 'output' | 'json';
}

export const PassportInspector: React.FC<PassportInspectorProps> = ({
  passport,
  onClose,
  defaultTab = 'provenance'
}) => {
  const [activeTab, setActiveTab] = useState<'provenance' | 'system' | 'rag' | 'output' | 'json'>(defaultTab);
  const [copiedJson, setCopiedJson] = useState(false);
  const [signatureVerified, setSignatureVerified] = useState<boolean | null>(null);
  const [verificationDetails, setVerificationDetails] = useState<{
    computedHash: string;
    preimage: string;
    isValid: boolean;
  } | null>(null);

  if (!passport) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(passport, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleDownloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(passport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${passport.id}.passport.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleVerifySignature = () => {
    setSignatureVerified(null);
    const result = verifyPassportIntegrity(passport);
    setVerificationDetails({
      computedHash: result.computedHash,
      preimage: result.preimage,
      isValid: result.isValid
    });
    setSignatureVerified(result.isValid);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div 
        id="passport-inspector-modal"
        className="relative flex flex-col w-full max-w-5xl max-h-[92vh] rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden"
      >
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between border-b border-zinc-200 bg-zinc-50/80 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950/60 gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
              <ShieldCheck className="h-5 w-5 text-emerald-400 dark:text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                  {passport.id}
                </h2>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  AI Data Passport
                </span>
                <span className="rounded bg-zinc-200/80 px-1.5 py-0.5 text-[11px] font-mono text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  {passport.environment}
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-mono truncate max-w-lg mt-0.5">
                Sig: {passport.signature}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleVerifySignature}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-xs hover:bg-zinc-50 active:scale-95 transition dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              <Lock className="h-3.5 w-3.5 text-emerald-600" />
              <span>{signatureVerified ? 'Verified ✓' : 'Verify Checksum'}</span>
            </button>

            <button
              onClick={handleCopyJson}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-xs hover:bg-zinc-50 active:scale-95 transition dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              {copiedJson ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedJson ? 'Copied' : 'Copy JSON'}</span>
            </button>

            <button
              onClick={handleDownloadJson}
              title="Download audit passport JSON file"
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-xs hover:bg-zinc-50 active:scale-95 transition dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>

            <button
              onClick={onClose}
              id="passport-inspector-close-btn"
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Verification Alert Banner if verified */}
        {signatureVerified !== null && (
          <div className={`border-b px-6 py-3 text-xs flex flex-col gap-1.5 ${
            signatureVerified 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Cryptographic Integrity {signatureVerified ? 'Verified ✓' : 'FAILED - Tamper Alert'}</strong> (Block #{passport.blockIndex})
                </span>
              </div>
              <span className="font-mono text-[11px] bg-white/70 dark:bg-zinc-800 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-700">
                {passport.compliance.tamperProofSeal}
              </span>
            </div>
            {verificationDetails && (
              <div className="text-[11px] font-mono bg-white/50 dark:bg-zinc-900/60 p-2 rounded border border-emerald-200/60 dark:border-emerald-800/60 space-y-0.5">
                <div>Formula: SHA-256(prev_hash + ":" + timestamp + ":" + system_prompt + ":" + user_prompt + ":" + response + ":" + org_id)</div>
                <div className="truncate text-zinc-600 dark:text-zinc-400">prevHash: {passport.prevHash}</div>
                <div className="truncate text-emerald-700 dark:text-emerald-400 font-bold">computedHash: {verificationDetails.computedHash}</div>
              </div>
            )}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-200 bg-white px-6 dark:border-zinc-800 dark:bg-zinc-900 overflow-x-auto text-sm font-medium">
          <button
            onClick={() => setActiveTab('provenance')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 font-medium transition whitespace-nowrap ${
              activeTab === 'provenance'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <GitBranch className="h-4 w-4" />
            Provenance & DAG Flow
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 font-medium transition whitespace-nowrap ${
              activeTab === 'system'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <Terminal className="h-4 w-4" />
            System Prompt ({passport.systemPrompt.version})
          </button>
          <button
            onClick={() => setActiveTab('rag')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 font-medium transition whitespace-nowrap ${
              activeTab === 'rag'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <Database className="h-4 w-4" />
            RAG Vector Sources ({passport.ragContext.length})
          </button>
          <button
            onClick={() => setActiveTab('output')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 font-medium transition whitespace-nowrap ${
              activeTab === 'output'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            LLM Generation & Safety
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 font-medium transition whitespace-nowrap ${
              activeTab === 'json'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <FileCode className="h-4 w-4" />
            Raw JSON Audit Log
          </button>
        </div>

        {/* Modal Body Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-zinc-50/50 dark:bg-zinc-950/40">
          {/* TAB 1: PROVENANCE & FLOW */}
          {activeTab === 'provenance' && (
            <div className="space-y-6">
              {/* Provenance Pipeline Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {/* 1. User Prompt Input */}
                <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                    <span className="font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">1. User Query</span>
                    <span className="font-mono">{passport.userInput.tokenCount} tok</span>
                  </div>
                  <p className="text-xs text-zinc-800 line-clamp-3 font-medium dark:text-zinc-200">
                    "{passport.userInput.text}"
                  </p>
                  {passport.userInput.piiDetected && (
                    <div className="mt-3 rounded bg-amber-50 p-2 text-[11px] text-amber-800 border border-amber-200 dark:bg-amber-950/50 dark:border-amber-900/60 dark:text-amber-300">
                      PII Detected & Redacted
                    </div>
                  )}
                </div>

                {/* 2. RAG Retrieval */}
                <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                    <span className="font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">2. Vector Search</span>
                    <span className="font-mono">{passport.ragContext.length} chunks</span>
                  </div>
                  {passport.ragContext.length > 0 ? (
                    <div className="space-y-1 text-xs">
                      <div className="text-[11px] font-medium text-zinc-800 truncate dark:text-zinc-200">
                        {passport.ragContext[0].title}
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        Top Cosine Match: <strong className="text-emerald-600 dark:text-emerald-400">{Math.round(passport.ragContext[0].score * 100)}%</strong>
                      </div>
                      <div className="text-[10px] font-mono text-zinc-400 truncate">
                        {passport.ragContext[0].vectorCollection}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-400 italic">Zero vector chunks retrieved.</p>
                  )}
                </div>

                {/* 3. System Prompt & Model */}
                <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                    <span className="font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">3. Execution</span>
                    <span className="font-mono">{passport.latencyMs}ms</span>
                  </div>
                  <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                    <Cpu className="h-3.5 w-3.5 text-zinc-500" />
                    {passport.model}
                  </div>
                  <div className="text-[11px] font-mono text-zinc-500 mt-1">
                    Sys ver: {passport.systemPrompt.version}
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-1">
                    Total: {passport.tokens.total.toLocaleString()} tokens (${passport.costUsd})
                  </div>
                </div>

                {/* 4. Immutable Passport Hash */}
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs dark:border-emerald-900/60 dark:bg-emerald-950/20">
                  <div className="flex items-center justify-between text-xs text-emerald-700 mb-2 dark:text-emerald-300">
                    <span className="font-semibold uppercase tracking-wider">4. Passport Seal</span>
                    <Lock className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                  <div className="text-[11px] font-mono text-emerald-900 dark:text-emerald-200 truncate">
                    {passport.signature.substring(0, 24)}...
                  </div>
                  <div className="mt-2 text-[11px] text-emerald-800 font-medium dark:text-emerald-300">
                    SOC-2 Type II Certified
                  </div>
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    Tamper-proof HMAC ledger
                  </div>
                </div>
              </div>

              {/* Full prompt & output side-by-side comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                    Inbound Prompt & Parameters
                  </h3>
                  <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100 dark:bg-zinc-950 dark:border-zinc-800">
                    <div className="text-xs font-semibold text-zinc-900 mb-1 dark:text-zinc-100">User Message:</div>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                      {passport.userInput.text}
                    </p>
                    {passport.userInput.sanitizedText && (
                      <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                        <div className="text-[11px] font-semibold text-amber-600 mb-1">Masked Sanitized Payload:</div>
                        <p className="text-xs font-mono text-zinc-600 dark:text-zinc-400">
                          {passport.userInput.sanitizedText}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      LLM Model Completion
                    </h3>
                    <span className="text-xs text-emerald-600 font-medium dark:text-emerald-400">
                      Groundedness: {Math.round(passport.llmOutput.safetyChecks.groundednessScore * 100)}%
                    </span>
                  </div>
                  <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100 dark:bg-zinc-950 dark:border-zinc-800">
                    <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed">
                      {passport.llmOutput.text}
                    </p>
                    <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                      <span>Finish: <code>{passport.llmOutput.finishReason}</code></span>
                      <span>Output Tokens: <strong>{passport.llmOutput.tokenCount}</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SYSTEM PROMPT & VARIABLES */}
          {activeTab === 'system' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-3 mb-4 dark:border-zinc-800">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      Template: {passport.systemPrompt.templateName}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                      <span className="font-mono bg-zinc-100 px-2 py-0.5 rounded dark:bg-zinc-800 font-semibold text-zinc-700 dark:text-zinc-300">
                        {passport.systemPrompt.version}
                      </span>
                      <span>• Hash: <code>{passport.systemPrompt.hash}</code></span>
                      {passport.systemPrompt.lastModifiedBy && (
                        <span>• Author: {passport.systemPrompt.lastModifiedBy}</span>
                      )}
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1 text-xs font-semibold dark:bg-emerald-950 dark:text-emerald-300">
                    Git Synced & Version Locked
                  </span>
                </div>

                <div className="mb-4">
                  <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                    Injected System Variables
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {Object.entries(passport.systemPrompt.variables).map(([k, v]) => (
                      <div key={k} className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-200 text-xs dark:bg-zinc-950 dark:border-zinc-800">
                        <span className="font-mono text-zinc-500 text-[11px]">{k}</span>
                        <div className="font-mono font-medium text-zinc-800 dark:text-zinc-200 truncate mt-0.5">
                          {v}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                    Full System Prompt Text
                  </div>
                  <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-xl text-xs font-mono whitespace-pre-wrap leading-relaxed border border-zinc-800 overflow-x-auto">
                    {passport.systemPrompt.text}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RAG VECTOR SOURCES */}
          {activeTab === 'rag' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Retrieved Vector Knowledge Chunks ({passport.ragContext.length})
                </h3>
                <span className="text-xs text-zinc-500">
                  Verified vector provenance stored in tamper-proof passport
                </span>
              </div>

              {passport.ragContext.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center bg-white dark:border-zinc-800 dark:bg-zinc-900">
                  <Database className="h-8 w-8 text-zinc-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    No RAG sources were queried for this generation.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {passport.ragContext.map((chunk, idx) => (
                    <div
                      key={chunk.chunkId}
                      className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-2 mb-3 dark:border-zinc-800">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-50 text-[11px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                            {chunk.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="rounded bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            Score: {Math.round(chunk.score * 100)}% Match
                          </span>
                          <span className="font-mono text-zinc-500 text-[11px]">
                            {chunk.tokens} tokens
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-zinc-700 bg-zinc-50 p-3 rounded-lg border border-zinc-100 leading-relaxed font-sans dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-300">
                        "{chunk.textSnippet}"
                      </p>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400 font-mono">
                        <div className="truncate max-w-md">
                          URI: <span className="text-zinc-600 dark:text-zinc-300">{chunk.sourceUri}</span>
                        </div>
                        <div>
                          Collection: <span className="text-indigo-600 dark:text-indigo-400">{chunk.vectorCollection}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: LLM GENERATION & SAFETY */}
          {activeTab === 'output' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                  Model Output Payload
                </h3>
                <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 text-sm text-zinc-800 leading-relaxed dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-200">
                  {passport.llmOutput.text}
                </div>

                <div className="mt-6">
                  <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                    Safety & Compliance Guardrail Audits
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-lg bg-zinc-50 p-3 border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
                      <div className="text-[11px] text-zinc-500">Groundedness Score</div>
                      <div className="text-base font-bold text-emerald-600 mt-1">
                        {Math.round(passport.llmOutput.safetyChecks.groundednessScore * 100)}%
                      </div>
                    </div>

                    <div className="rounded-lg bg-zinc-50 p-3 border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
                      <div className="text-[11px] text-zinc-500">Hallucination Risk</div>
                      <div className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                        {Math.round(passport.llmOutput.safetyChecks.hallucinationConfidence * 100)}%
                      </div>
                    </div>

                    <div className="rounded-lg bg-zinc-50 p-3 border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
                      <div className="text-[11px] text-zinc-500">Prompt Leakage Risk</div>
                      <div className="text-base font-bold text-emerald-600 uppercase mt-1">
                        {passport.llmOutput.safetyChecks.promptLeakageRisk}
                      </div>
                    </div>

                    <div className="rounded-lg bg-zinc-50 p-3 border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
                      <div className="text-[11px] text-zinc-500">Toxicity Index</div>
                      <div className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                        {passport.llmOutput.safetyChecks.toxicityScore}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: RAW JSON AUDIT LOG */}
          {activeTab === 'json' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs text-zinc-500">
                  Immutable JSON audit log payload. Serialized canonically and signed via SHA-256 HMAC.
                </div>
                <button
                  onClick={handleCopyJson}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                >
                  {copiedJson ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedJson ? 'Copied' : 'Copy Full Payload'}</span>
                </button>
              </div>

              <div className="relative rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-xs font-mono text-zinc-200 overflow-x-auto shadow-inner">
                <pre className="whitespace-pre leading-relaxed">
                  {JSON.stringify(passport, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex flex-wrap items-center justify-between border-t border-zinc-200 bg-white px-6 py-3 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <span>Correlation ID: <code className="font-mono text-zinc-800 dark:text-zinc-200">{passport.metadata.correlationId}</code></span>
            <span>SDK: <code className="font-mono text-zinc-800 dark:text-zinc-200">{passport.metadata.sdkVersion}</code></span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-zinc-900 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
