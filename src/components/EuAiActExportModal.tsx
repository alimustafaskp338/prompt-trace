import React, { useState, useMemo } from 'react';
import { AIDataPassport } from '../types';
import { 
  generateEuAiActCsv, 
  generateEuAiActJson, 
  triggerFileDownload, 
  EuAiActExportOptions 
} from '../lib/euAiActExporter';
import { 
  X, 
  Download, 
  FileText, 
  FileCode, 
  ShieldCheck, 
  Check, 
  Copy, 
  Lock, 
  Eye, 
  CheckCircle2,
  Building2,
  Cpu,
  Layers
} from 'lucide-react';

interface EuAiActExportModalProps {
  passports: AIDataPassport[];
  isOpen: boolean;
  onClose: () => void;
}

export const EuAiActExportModal: React.FC<EuAiActExportModalProps> = ({
  passports,
  isOpen,
  onClose
}) => {
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [riskFilter, setRiskFilter] = useState<'all' | 'high_risk' | 'limited_risk'>('all');
  const [orgName, setOrgName] = useState('PromptTrace Enterprise Client');
  const [systemName, setSystemName] = useState('Production LLM Pipeline & RAG Service');
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Generate artifacts based on current options
  const exportData = useMemo(() => {
    const options: EuAiActExportOptions = {
      riskFilter,
      organizationName: orgName,
      systemName
    };

    if (format === 'csv') {
      const { csvContent, merkleRoot, batchSignature, recordCount } = generateEuAiActCsv(passports, options);
      return {
        content: csvContent,
        merkleRoot,
        batchSignature,
        recordCount,
        mimeType: 'text/csv;charset=utf-8;',
        extension: 'csv'
      };
    } else {
      const jsonBinder = generateEuAiActJson(passports, options);
      const content = JSON.stringify(jsonBinder, null, 2);
      return {
        content,
        merkleRoot: jsonBinder.cryptographicProofOfOrigin.merkleRoot,
        batchSignature: jsonBinder.cryptographicProofOfOrigin.batchAuditSeal,
        recordCount: jsonBinder.auditedSummaryMetrics.totalRecordsLogged,
        mimeType: 'application/json;charset=utf-8;',
        extension: 'json'
      };
    }
  }, [passports, format, riskFilter, orgName, systemName]);

  if (!isOpen) return null;

  const handleDownload = () => {
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `EU_AI_Act_Audit_${riskFilter}_${dateStr}.${exportData.extension}`;
    triggerFileDownload(exportData.content, filename, exportData.mimeType);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(exportData.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50/80 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  Export EU AI Act Compliance Documentation
                </h3>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Signed SHA-256
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                Regulation (EU) 2024/1689 Article 12 (Continuous Record-Keeping) & Article 13 (Transparency)
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

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
          {/* Format Selection Buttons */}
          <div>
            <label className="font-bold text-zinc-800 dark:text-zinc-200 block mb-2">
              1. Choose Cryptographically Signed Format:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition ${
                  format === 'csv'
                    ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20 dark:bg-emerald-950/20'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900'
                }`}
              >
                <FileText className={`h-5 w-5 shrink-0 mt-0.5 ${format === 'csv' ? 'text-emerald-600' : 'text-zinc-400'}`} />
                <div>
                  <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <span>Signed CSV Spreadsheet</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-mono">.csv</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Auditor-ready CSV with cryptographic verification header comments, RFC 4180 escaping, and Article 12 column mapping.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('json')}
                className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition ${
                  format === 'json'
                    ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20 dark:bg-emerald-950/20'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900'
                }`}
              >
                <FileCode className={`h-5 w-5 shrink-0 mt-0.5 ${format === 'json' ? 'text-emerald-600' : 'text-zinc-400'}`} />
                <div>
                  <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <span>EU AI Act JSON Binder</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-mono">.json</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Complete Annex IV Technical Documentation bundle with Merkle root, declaration of conformity, and full DAG lineages.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Filtering & Customization Options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                EU Risk Classification Scope
              </label>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value as any)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              >
                <option value="all">All Passports ({passports.length})</option>
                <option value="high_risk">High-Risk Annex III Only</option>
                <option value="limited_risk">Limited-Risk Article 13 Only</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Organization / Deployer Name
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </div>

            <div>
              <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                AI System Identifier
              </label>
              <input
                type="text"
                value={systemName}
                onChange={(e) => setSystemName(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </div>
          </div>

          {/* Cryptographic Proof Verification Card */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-800/80 dark:bg-emerald-950/20 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-300">
              <span className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" />
                <span>Cryptographic Batch Signature Active</span>
              </span>
              <span className="text-[11px] bg-white dark:bg-zinc-900 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-700 font-mono">
                {exportData.recordCount} Records Certified
              </span>
            </div>

            <div className="text-[11px] font-mono space-y-1 bg-white/70 dark:bg-zinc-900/60 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Ledger Merkle Root:</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate max-w-sm">
                  {exportData.merkleRoot}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Batch SHA-256 Seal:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 truncate max-w-sm">
                  {exportData.batchSignature}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
              Guaranteed tamper-evident: Regulators can verify the SHA-256 batch seal and individual block hashes without accessing proprietary model weights.
            </p>
          </div>

          {/* Toggle Preview Button */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="inline-flex items-center gap-1.5 font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>{showPreview ? 'Hide File Preview' : 'Preview Formatted File'}</span>
            </button>

            <span className="text-[11px] text-zinc-400">
              Output size: ~{(exportData.content.length / 1024).toFixed(1)} KB
            </span>
          </div>

          {/* Live Preview Box */}
          {showPreview && (
            <div className="rounded-xl border border-zinc-200 bg-zinc-950 p-3 dark:border-zinc-800">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 text-[11px] text-zinc-400">
                <span>File Preview ({exportData.extension.toUpperCase()})</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-zinc-300 hover:text-white"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copied ? 'Copied!' : 'Copy Preview'}</span>
                </button>
              </div>
              <pre className="max-h-56 overflow-y-auto text-[10px] font-mono text-zinc-300 leading-tight">
                {exportData.content}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950/60">
          <div className="flex items-center gap-2 text-zinc-500 text-[11px]">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Ready for Article 12 & 13 Compliance Audits</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-500 active:scale-95 transition"
            >
              <Download className="h-4 w-4" />
              <span>Download Signed {format.toUpperCase()}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
