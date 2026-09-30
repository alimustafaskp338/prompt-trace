import React from 'react';
import { AIDataPassport } from '../types';
import { ShieldCheck, AlertTriangle, ShieldAlert, Cpu, Database, Clock, Copy, Check, Hash, FileCode2, ExternalLink } from 'lucide-react';

interface PassportCardProps {
  passport: AIDataPassport;
  onInspect: (passport: AIDataPassport) => void;
  onViewJson: (passport: AIDataPassport) => void;
}

export const PassportCard: React.FC<PassportCardProps> = ({
  passport,
  onInspect,
  onViewJson
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(passport.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = () => {
    switch (passport.status) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-950/60 dark:text-emerald-300">
            <ShieldCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
            Verified Seal
          </span>
        );
      case 'flagged_pii':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800 ring-1 ring-amber-600/20 dark:bg-amber-950/60 dark:text-amber-300">
            <AlertTriangle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
            PII Redacted
          </span>
        );
      case 'flagged_hallucination':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 ring-1 ring-rose-600/20 dark:bg-rose-950/60 dark:text-rose-300">
            <AlertTriangle className="h-3 w-3 text-rose-600 dark:text-rose-400" />
            Hallucination Alert
          </span>
        );
      case 'guardrail_blocked':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800 ring-1 ring-red-600/20 dark:bg-red-950/70 dark:text-red-300">
            <ShieldAlert className="h-3 w-3 text-red-600 dark:text-red-400" />
            Shield Blocked
          </span>
        );
    }
  };

  const getProviderColor = () => {
    switch (passport.provider) {
      case 'OpenAI':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
      case 'Anthropic':
        return 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
      case 'Google':
        return 'text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
      case 'Meta':
        return 'text-purple-700 bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800';
      default:
        return 'text-zinc-700 bg-zinc-50 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700';
    }
  };

  // Format relative or ISO timestamp
  const dateFormatted = new Date(passport.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <div
      id={`passport-card-${passport.id}`}
      onClick={() => onInspect(passport)}
      className="group relative rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:border-zinc-300 hover:shadow-md cursor-pointer dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
    >
      {/* Top row: ID, Status, Timestamp */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800/80">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold text-zinc-900 group-hover:text-emerald-600 transition-colors dark:text-zinc-100 dark:group-hover:text-emerald-400">
            {passport.id}
          </span>
          <button
            onClick={handleCopyId}
            title="Copy Passport ID"
            className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
          </button>
          <span className="text-zinc-300 dark:text-zinc-700">|</span>
          <span className="rounded px-1.5 py-0.5 text-[11px] font-medium bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 font-mono">
            {passport.appName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {getStatusBadge()}
          <span className="flex items-center gap-1 font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
            <Clock className="h-3 w-3" />
            {dateFormatted}
          </span>
        </div>
      </div>

      {/* Middle row: User Prompt + System Prompt snippet */}
      <div className="my-3 space-y-2">
        <div>
          <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
            User Input
            {passport.userInput.piiDetected && (
              <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 rounded dark:bg-amber-950/50">
                PII Masked
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-zinc-800 line-clamp-2 dark:text-zinc-200">
            "{passport.userInput.text}"
          </p>
        </div>

        {/* System prompt preview badge */}
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="font-mono text-[11px] text-zinc-600 bg-zinc-50 border border-zinc-200 px-1.5 py-0.5 rounded dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300">
            sys: {passport.systemPrompt.version}
          </span>
          <span className="truncate max-w-[280px] sm:max-w-md italic text-zinc-500 text-[12px]">
            {passport.systemPrompt.text}
          </span>
        </div>
      </div>

      {/* Bottom row: Provenance / Model / Tokens / RAG count / Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 pt-3 text-xs text-zinc-600 dark:border-zinc-800/80 dark:text-zinc-400">
        <div className="flex flex-wrap items-center gap-2">
          {/* Model badge */}
          <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 font-mono text-[11px] font-medium ${getProviderColor()}`}>
            <Cpu className="h-3 w-3" />
            {passport.model}
          </span>

          {/* RAG Sources badge */}
          {passport.ragContext.length > 0 ? (
            <span className="inline-flex items-center gap-1 rounded bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              <Database className="h-3 w-3 text-indigo-500" />
              <span>{passport.ragContext.length} RAG Chunks</span>
              <span className="text-zinc-400 font-mono">
                ({Math.round(passport.ragContext[0].score * 100)}% match)
              </span>
            </span>
          ) : (
            <span className="text-[11px] text-zinc-400 italic">No RAG context</span>
          )}

          {/* Latency & Tokens */}
          <span className="font-mono text-[11px] text-zinc-500">
            {passport.latencyMs}ms • {passport.tokens.total.toLocaleString()} tokens
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onViewJson(passport)}
            title="View Raw JSON Audit Log"
            className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-[11px] font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            <FileCode2 className="h-3 w-3 text-zinc-500" />
            <span>JSON</span>
          </button>
          <button
            onClick={() => onInspect(passport)}
            className="inline-flex items-center gap-1 rounded-md bg-zinc-900 px-2.5 py-1 text-[11px] font-medium text-white shadow-xs hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            <span>Inspect</span>
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Signature hash preview */}
      <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono text-zinc-400 bg-zinc-50 px-2 py-1 rounded dark:bg-zinc-950/60 dark:text-zinc-500">
        <div className="flex items-center gap-1 truncate max-w-[80%]">
          <Hash className="h-2.5 w-2.5 text-emerald-500 shrink-0" />
          <span className="truncate">{passport.signature}</span>
        </div>
        <span className="text-emerald-600 font-semibold dark:text-emerald-400 shrink-0">
          SHA-256 SEALED
        </span>
      </div>
    </div>
  );
};
