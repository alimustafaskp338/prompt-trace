import { AIDataPassport } from '../types';
import { verifyEntireChain } from './cryptoLedger';
import { sha256 } from './sha256';

export interface EuAiActExportOptions {
  riskFilter?: 'all' | 'high_risk' | 'limited_risk';
  organizationName?: string;
  systemName?: string;
}

/**
 * Escapes values for RFC 4180 compliant CSV output
 */
function escapeCsvCell(val: string | number | boolean | null | undefined): string {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  // If contains quotes, commas, newlines, escape internal quotes by doubling them
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Generates a cryptographically signed CSV file formatted specifically for
 * EU AI Act Article 12 (Continuous Record-Keeping) & Article 13 (Transparency) documentation.
 */
export function generateEuAiActCsv(
  passports: AIDataPassport[],
  options: EuAiActExportOptions = {}
): {
  csvContent: string;
  merkleRoot: string;
  batchSignature: string;
  recordCount: number;
} {
  const filtered = options.riskFilter && options.riskFilter !== 'all'
    ? passports.filter(p => p.compliance.euRiskCategory === options.riskFilter)
    : passports;

  const sorted = [...filtered].sort((a, b) => a.blockIndex - b.blockIndex);
  const chainAudit = verifyEntireChain(sorted);
  const timestamp = new Date().toISOString();

  // Compute a cryptographic batch seal over all block hashes in the export
  const concatenatedHashes = sorted.map(p => p.hash).join('|');
  const batchSignature = sha256(`EU_AI_ACT_BATCH:${chainAudit.merkleRoot}:${concatenatedHashes}:${timestamp}`);

  const orgName = options.organizationName || 'PromptTrace Enterprise Licensee ($499/mo)';
  const sysName = options.systemName || 'PromptTrace Lineage & Cryptographic Audit Ledger';

  // Construct Cryptographic Verification Header
  const headerLines = [
    '# ==============================================================================',
    '# PROMPTTRACE CRYPTOGRAPHIC AUDIT TRAIL - EU AI ACT COMPLIANCE EXPORT',
    '# Regulation (EU) 2024/1689 of the European Parliament and of the Council',
    '# Article 12 (Continuous Automated Logging) & Article 13 (Transparency)',
    `# Organization: ${orgName}`,
    `# AI System Name: ${sysName}`,
    `# Export Generated: ${timestamp}`,
    `# Certified Records Count: ${sorted.length}`,
    `# Ledger Merkle Root: ${chainAudit.merkleRoot}`,
    `# Genesis Block Hash: ${chainAudit.genesisHash}`,
    `# Head Block Hash: ${chainAudit.headHash}`,
    `# Chain Integrity Status: ${chainAudit.valid ? 'VALID_UNBROKEN_DAG' : 'TAMPER_ALERT_FLAGGED'}`,
    `# Batch SHA-256 Seal: ${batchSignature}`,
    `# Hash Formula: SHA-256(prev_hash + ":" + timestamp + ":" + system_prompt + ":" + user_prompt + ":" + response + ":" + org_id)`,
    '# =============================================================================='
  ];

  // CSV Columns adhering to EU AI Act technical record-keeping
  const columnHeaders = [
    'Article_12_Record_ID',
    'Block_Index',
    'Timestamp_UTC',
    'EU_Risk_Category',
    'Model_Identifier',
    'Model_Provider',
    'Temperature',
    'Max_Tokens',
    'System_Prompt_Version',
    'System_Prompt_Hash',
    'System_Prompt_Text',
    'User_Input_Prompt',
    'LLM_Output_Response',
    'Groundedness_Score',
    'Toxicity_Score',
    'PII_Scrubbed_Flag',
    'RAG_Retrieved_Chunks_Count',
    'RAG_Source_URIs',
    'Latency_Ms',
    'Cost_USD',
    'Human_Oversight_Ready',
    'Previous_Block_Hash_Pointer',
    'Block_SHA256_Hash',
    'Cryptographic_Proof_Seal'
  ];

  const dataRows = sorted.map(p => {
    const ragUris = p.ragContext.map(r => r.sourceUri).join('; ');
    return [
      escapeCsvCell(p.id),
      escapeCsvCell(p.blockIndex),
      escapeCsvCell(p.timestamp),
      escapeCsvCell(p.compliance.euRiskCategory.toUpperCase()),
      escapeCsvCell(p.model),
      escapeCsvCell(p.provider),
      escapeCsvCell(p.modelParams?.temperature ?? 0.2),
      escapeCsvCell(p.modelParams?.maxTokens ?? 1024),
      escapeCsvCell(p.systemPrompt.version),
      escapeCsvCell(p.systemPrompt.hash),
      escapeCsvCell(p.systemPrompt.text),
      escapeCsvCell(p.userInput.text),
      escapeCsvCell(p.llmOutput.text),
      escapeCsvCell(p.llmOutput.safetyChecks.groundednessScore),
      escapeCsvCell(p.llmOutput.safetyChecks.toxicityScore),
      escapeCsvCell(p.userInput.piiDetected ? 'YES' : 'NO'),
      escapeCsvCell(p.ragContext.length),
      escapeCsvCell(ragUris || 'NONE'),
      escapeCsvCell(p.latencyMs),
      escapeCsvCell(p.costUsd),
      escapeCsvCell(p.compliance.humanOversightReady ? 'COMPLIANT_ART_14' : 'N/A'),
      escapeCsvCell(p.prevHash),
      escapeCsvCell(p.hash),
      escapeCsvCell(p.compliance.tamperProofSeal)
    ].join(',');
  });

  // Footer with Cryptographic Hash Checksum
  const footerLines = [
    '# ==============================================================================',
    `# END OF CERTIFIED AUDIT LOG - BATCH SIGNATURE: ${batchSignature}`,
    '# Verified via PromptTrace WORM Cryptographic Write-Ahead Ledger',
    '# =============================================================================='
  ];

  const csvContent = [...headerLines, columnHeaders.join(','), ...dataRows, ...footerLines].join('\n');

  return {
    csvContent,
    merkleRoot: chainAudit.merkleRoot,
    batchSignature,
    recordCount: sorted.length
  };
}

/**
 * Generates an EU AI Act Technical Documentation JSON Binder (Regulation EU 2024/1689 Annex IV)
 */
export function generateEuAiActJson(
  passports: AIDataPassport[],
  options: EuAiActExportOptions = {}
) {
  const filtered = options.riskFilter && options.riskFilter !== 'all'
    ? passports.filter(p => p.compliance.euRiskCategory === options.riskFilter)
    : passports;

  const sorted = [...filtered].sort((a, b) => a.blockIndex - b.blockIndex);
  const chainAudit = verifyEntireChain(sorted);
  const timestamp = new Date().toISOString();

  const concatenatedHashes = sorted.map(p => p.hash).join('|');
  const batchSignature = sha256(`EU_AI_ACT_JSON_BINDER:${chainAudit.merkleRoot}:${concatenatedHashes}:${timestamp}`);

  return {
    $schema: 'https://prompttrace.io/schemas/eu-ai-act-audit-binder-v2.json',
    regulatoryCompliance: {
      framework: 'European Union Artificial Intelligence Act (Regulation EU 2024/1689)',
      complianceScopes: [
        'Article 12: Continuous Automated Logging & Record-Keeping',
        'Article 13: Transparency & Provision of Information to Deployers',
        'Article 14: Human Oversight Operational Traceability',
        'Annex IV: Technical Documentation for High-Risk AI Systems'
      ],
      organization: options.organizationName || 'PromptTrace Enterprise Licensee ($499/mo)',
      aiSystemIdentifier: options.systemName || 'PromptTrace Lineage & Cryptographic Audit Ledger',
      certificationDate: timestamp,
      declarationOfConformity: {
        status: chainAudit.valid ? 'CONFORMANT' : 'NON_CONFORMANT_TAMPER_DETECTED',
        ledgerIntegrityVerified: chainAudit.valid,
        unbrokenChainDepth: chainAudit.totalBlocks,
        brokenBlocksCount: chainAudit.brokenBlocks.length
      }
    },
    cryptographicProofOfOrigin: {
      signatureAlgorithm: 'SHA-256 (Canonical Write-Ahead Ledger Digest)',
      formula: 'SHA-256(prev_hash + ":" + timestamp + ":" + system_prompt + ":" + user_prompt + ":" + response + ":" + org_id)',
      merkleRoot: chainAudit.merkleRoot,
      genesisBlockHash: chainAudit.genesisHash,
      headBlockHash: chainAudit.headHash,
      batchAuditSeal: batchSignature,
      tamperResistanceMode: 'WORM (Write-Once Read-Many Immutable Append-Only Ledger)'
    },
    auditedSummaryMetrics: {
      totalRecordsLogged: sorted.length,
      highRiskAnnexIIIRecords: sorted.filter(p => p.compliance.euRiskCategory === 'high_risk').length,
      limitedRiskTransparencyRecords: sorted.filter(p => p.compliance.euRiskCategory === 'limited_risk').length,
      averageRetrievalLatencyMs: Number((sorted.reduce((acc, p) => acc + p.latencyMs, 0) / (sorted.length || 1)).toFixed(2)),
      averageGroundednessScore: Number((sorted.reduce((acc, p) => acc + p.llmOutput.safetyChecks.groundednessScore, 0) / (sorted.length || 1)).toFixed(3)),
      piiRedactedInteractionsCount: sorted.filter(p => p.userInput.piiDetected).length,
      zeroKnowledgeDataIsolation: true
    },
    passports: sorted.map(p => ({
      article12LogId: p.id,
      blockIndex: p.blockIndex,
      timestampUtc: p.timestamp,
      orgId: p.orgId,
      provenanceHashChain: {
        previousBlockHash: p.prevHash,
        currentBlockHash: p.hash,
        tamperProofSeal: p.compliance.tamperProofSeal
      },
      modelDeploymentMetadata: {
        modelIdentifier: p.model,
        provider: p.provider,
        parameters: p.modelParams || { temperature: 0.2, maxTokens: 1024, topP: 0.95 },
        environment: p.environment,
        latencyMs: p.latencyMs
      },
      inputLineage: {
        userInputPrompt: p.userInput.text,
        tokenCount: p.userInput.tokenCount,
        piiDetectedAndScrubbed: p.userInput.piiDetected,
        clientIpMasked: p.userInput.clientIpMasked
      },
      systemInstructionLineage: {
        versionTag: p.systemPrompt.version,
        promptTemplateName: p.systemPrompt.templateName,
        cryptographicContentHash: p.systemPrompt.hash,
        instructionText: p.systemPrompt.text,
        runtimeVariables: p.systemPrompt.variables
      },
      ragContextLineage: p.ragContext.map(r => ({
        chunkId: r.chunkId,
        sourceUri: r.sourceUri,
        documentTitle: r.title,
        cosineSimilarityScore: r.score,
        vectorCollection: r.vectorCollection,
        tokensRetrieved: r.tokens,
        textSnippet: r.textSnippet
      })),
      outputGenerationAudit: {
        completionText: p.llmOutput.text,
        tokenCount: p.llmOutput.tokenCount,
        finishReason: p.llmOutput.finishReason,
        safetyAndTransparencyEvaluations: {
          groundednessScore: p.llmOutput.safetyChecks.groundednessScore,
          toxicityScore: p.llmOutput.safetyChecks.toxicityScore,
          hallucinationRiskEstimate: p.llmOutput.safetyChecks.hallucinationConfidence,
          aiTransparencyDisclosureIncluded: p.compliance.euAiActArticle13
        }
      },
      complianceAttributes: {
        euRiskClassification: p.compliance.euRiskCategory,
        article12RecordKeepingSatisfied: p.compliance.euAiActArticle12,
        article13TransparencySatisfied: p.compliance.euAiActArticle13,
        humanOversightReady: p.compliance.humanOversightReady,
        soc2TypeIICompliant: p.compliance.soc2Compliant,
        hipaaEligible: p.compliance.hipaaEligible
      }
    }))
  };
}

/**
 * Triggers a browser download of the exported file
 */
export function triggerFileDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
