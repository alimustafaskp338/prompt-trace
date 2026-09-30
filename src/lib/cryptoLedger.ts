import { sha256 } from './sha256';
import { AIDataPassport, IngestPassportPayload, ChainVerificationResult } from '../types';

export const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

/**
 * Computes the canonical SHA-256 hash for a Data Passport according to the PromptTrace specification:
 * hash = SHA-256(prev_hash + ":" + timestamp + ":" + system_prompt + ":" + user_prompt + ":" + response + ":" + org_id)
 */
export function computePassportHash(
  prevHash: string,
  timestamp: string,
  systemPrompt: string,
  userPrompt: string,
  response: string,
  orgId: string
): string {
  const preimage = `${prevHash}:${timestamp}:${systemPrompt}:${userPrompt}:${response}:${orgId}`;
  return sha256(preimage);
}

/**
 * Verifies the cryptographic integrity of a single passport against its stored hash.
 */
export function verifyPassportIntegrity(passport: AIDataPassport): {
  isValid: boolean;
  computedHash: string;
  storedHash: string;
  preimage: string;
  tamperDetected: boolean;
} {
  const preimage = `${passport.prevHash}:${passport.timestamp}:${passport.systemPrompt.text}:${passport.userInput.text}:${passport.llmOutput.text}:${passport.orgId}`;
  const computedHash = sha256(preimage);
  const isValid = computedHash === passport.hash;

  return {
    isValid,
    computedHash,
    storedHash: passport.hash,
    preimage,
    tamperDetected: !isValid
  };
}

/**
 * Validates the unbroken cryptographic chain from genesis to head block.
 */
export function verifyEntireChain(chain: AIDataPassport[]): ChainVerificationResult {
  const brokenBlocks: Array<{ blockIndex: number; passportId: string; reason: string }> = [];

  if (chain.length === 0) {
    return {
      valid: true,
      totalBlocks: 0,
      headHash: GENESIS_HASH,
      genesisHash: GENESIS_HASH,
      brokenBlocks: [],
      merkleRoot: sha256('empty_ledger'),
      verifiedAt: new Date().toISOString()
    };
  }

  // Chain is ordered newest first in feed, but for chain validation we sort by blockIndex ascending
  const sorted = [...chain].sort((a, b) => a.blockIndex - b.blockIndex);

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];

    // Check 1: Genesis or previous hash link
    if (i === 0) {
      if (current.prevHash !== GENESIS_HASH) {
        brokenBlocks.push({
          blockIndex: current.blockIndex,
          passportId: current.id,
          reason: `Genesis block must point to ${GENESIS_HASH}, but found ${current.prevHash}`
        });
      }
    } else {
      const prev = sorted[i - 1];
      if (current.prevHash !== prev.hash) {
        brokenBlocks.push({
          blockIndex: current.blockIndex,
          passportId: current.id,
          reason: `Chain broken: Block #${current.blockIndex} prevHash (${current.prevHash.substring(0, 10)}...) does not match Block #${prev.blockIndex} hash (${prev.hash.substring(0, 10)}...)`
        });
      }
    }

    // Check 2: Content integrity hash verification
    const { isValid, computedHash } = verifyPassportIntegrity(current);
    if (!isValid) {
      brokenBlocks.push({
        blockIndex: current.blockIndex,
        passportId: current.id,
        reason: `Cryptographic tamper detected: Stored hash ${current.hash.substring(0, 10)}... does not match computed SHA-256 ${computedHash.substring(0, 10)}...`
      });
    }
  }

  // Calculate Merkle-style ledger root
  const combinedHashes = sorted.map((b) => b.hash).join(':');
  const merkleRoot = sha256(combinedHashes);

  return {
    valid: brokenBlocks.length === 0,
    totalBlocks: sorted.length,
    headHash: sorted[sorted.length - 1].hash,
    genesisHash: sorted[0].hash,
    brokenBlocks,
    merkleRoot,
    verifiedAt: new Date().toISOString()
  };
}

/**
 * Creates a sealed AIDataPassport from an ingestion payload and links to the latest block.
 */
export function sealPassport(
  payload: IngestPassportPayload,
  latestBlock: AIDataPassport | null,
  options?: {
    latencyMs?: number;
    tokens?: { prompt: number; completion: number; total: number };
    costUsd?: number;
  }
): AIDataPassport {
  const timestamp = new Date().toISOString();
  const blockIndex = latestBlock ? latestBlock.blockIndex + 1 : 0;
  const prevHash = latestBlock ? latestBlock.hash : GENESIS_HASH;
  const orgId = payload.orgId || 'org_enterprise_default';

  // Compute canonical SHA-256
  const hash = computePassportHash(
    prevHash,
    timestamp,
    payload.systemPrompt.text,
    payload.userInput.text,
    payload.llmOutput.text,
    orgId
  );

  const passportId = `pt_pass_${hash.substring(0, 8)}_${blockIndex}`;

  const promptTokens = options?.tokens?.prompt || Math.max(12, Math.floor((payload.systemPrompt.text.length + payload.userInput.text.length) / 3.8));
  const completionTokens = options?.tokens?.completion || Math.max(20, Math.floor(payload.llmOutput.text.length / 3.8));
  const totalTokens = promptTokens + completionTokens;

  const costUsd = options?.costUsd || Number(((promptTokens * 0.000003) + (completionTokens * 0.000015)).toFixed(6));
  const latencyMs = options?.latencyMs || Math.floor(Math.random() * 80) + 120;

  // EU AI Act compliance classification
  const riskCategory = payload.euRiskCategory || (
    payload.systemPrompt.text.toLowerCase().includes('medical') || payload.systemPrompt.text.toLowerCase().includes('credit')
      ? 'high_risk'
      : 'limited_risk'
  );

  const ragChunks = (payload.ragContext || []).map((rag, idx) => ({
    chunkId: `chk_${hash.substring(0, 6)}_${idx + 1}`,
    sourceUri: rag.sourceUri,
    title: rag.title,
    score: rag.score,
    textSnippet: rag.textSnippet,
    ingestedAt: timestamp,
    vectorCollection: rag.vectorCollection || 'pinecone/production-v2',
    tokens: Math.floor(rag.textSnippet.length / 4)
  }));

  const passport: AIDataPassport = {
    id: passportId,
    blockIndex,
    orgId,
    timestamp,
    prevHash,
    hash,
    signature: `pt_sig_sha256:${hash}`,
    appName: payload.appName,
    environment: payload.environment || 'production',
    model: payload.model,
    provider: payload.provider || (payload.model.includes('gpt') ? 'OpenAI' : payload.model.includes('claude') ? 'Anthropic' : 'Google'),
    modelParams: payload.modelParams || {
      temperature: 0.2,
      maxTokens: 1024,
      topP: 0.95
    },
    status: payload.userInput.piiDetected ? 'flagged_pii' : 'verified',
    latencyMs,
    tokens: {
      prompt: promptTokens,
      completion: completionTokens,
      total: totalTokens
    },
    costUsd,
    systemPrompt: {
      version: payload.systemPrompt.version,
      hash: `sys_${sha256(payload.systemPrompt.text).substring(0, 10)}`,
      templateName: payload.systemPrompt.templateName || `${payload.appName}_sys_prompt`,
      text: payload.systemPrompt.text,
      variables: payload.systemPrompt.variables || { env: 'production', version: payload.systemPrompt.version }
    },
    userInput: {
      text: payload.userInput.text,
      tokenCount: Math.floor(payload.userInput.text.length / 3.8),
      piiDetected: !!payload.userInput.piiDetected,
      clientIpMasked: payload.userInput.clientIpMasked || '198.51.100.***'
    },
    ragContext: ragChunks,
    llmOutput: {
      text: payload.llmOutput.text,
      tokenCount: completionTokens,
      finishReason: payload.llmOutput.finishReason || 'stop',
      safetyChecks: {
        toxicityScore: payload.llmOutput.toxicityScore ?? 0.0,
        promptLeakageRisk: 'none',
        hallucinationConfidence: 0.01,
        groundednessScore: payload.llmOutput.groundednessScore ?? 0.98
      }
    },
    compliance: {
      soc2Compliant: true,
      hipaaEligible: true,
      gdprRightToBeForgottenSupported: true,
      tamperProofSeal: `PROMPTTRACE-PROOF-BLK#${blockIndex}-${hash.substring(0, 12).toUpperCase()}`,
      verifiedAt: timestamp,
      euAiActArticle12: true, // Complete audit record logging & technical documentation
      euAiActArticle13: true, // Transparent operational disclosures & human traceability
      euRiskCategory: riskCategory,
      humanOversightReady: true
    },
    metadata: {
      framework: 'PromptTrace-SDK-v2',
      sdkVersion: '@prompttrace/node@2.1.0',
      correlationId: `corr_${hash.substring(0, 12)}`,
      userSessionId: `sess_${hash.substring(12, 20)}`
    }
  };

  return passport;
}
