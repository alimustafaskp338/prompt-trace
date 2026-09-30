export type ModelProvider = 'OpenAI' | 'Anthropic' | 'Google' | 'Meta';

export type PassportStatus = 
  | 'verified'
  | 'flagged_pii'
  | 'flagged_hallucination'
  | 'guardrail_blocked';

export type Environment = 'production' | 'staging' | 'evaluation';

export interface RAGSourceChunk {
  chunkId: string;
  sourceUri: string;
  title: string;
  score: number; // e.g. 0.94 cosine similarity
  textSnippet: string;
  ingestedAt: string;
  vectorCollection: string;
  tokens: number;
  isEncrypted?: boolean;
}

export interface SystemPromptMeta {
  version: string;
  hash: string;
  templateName: string;
  text: string;
  variables: Record<string, string>;
  lastModifiedBy?: string;
  isEncrypted?: boolean;
}

export interface UserInputMeta {
  text: string;
  tokenCount: number;
  piiDetected: boolean;
  sanitizedText?: string;
  detectedEntities?: string[];
  clientIpMasked?: string;
  isEncrypted?: boolean;
}

export interface LLMOutputMeta {
  text: string;
  tokenCount: number;
  finishReason: 'stop' | 'length' | 'content_filter';
  safetyChecks: {
    toxicityScore: number;
    promptLeakageRisk: 'none' | 'low' | 'medium' | 'high';
    hallucinationConfidence: number;
    groundednessScore: number;
  };
  isEncrypted?: boolean;
}

export interface ComplianceStamp {
  soc2Compliant: boolean;
  hipaaEligible: boolean;
  gdprRightToBeForgottenSupported: boolean;
  tamperProofSeal: string;
  verifiedAt: string;
  euAiActArticle12: boolean; // Continuous logging & record-keeping
  euAiActArticle13: boolean; // AI disclosure & transparency
  euRiskCategory: 'high_risk' | 'limited_risk' | 'minimal_risk';
  humanOversightReady: boolean;
}

export interface AIDataPassport {
  id: string;
  blockIndex: number;
  orgId: string;
  timestamp: string;
  prevHash: string;
  hash: string;
  signature: string;
  appName: string;
  environment: Environment;
  model: string;
  provider: ModelProvider;
  modelParams?: {
    temperature: number;
    maxTokens: number;
    topP?: number;
  };
  status: PassportStatus;
  latencyMs: number;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  costUsd: number;
  systemPrompt: SystemPromptMeta;
  userInput: UserInputMeta;
  ragContext: RAGSourceChunk[];
  llmOutput: LLMOutputMeta;
  compliance: ComplianceStamp;
  metadata: {
    framework: string;
    sdkVersion: string;
    correlationId: string;
    userSessionId: string;
  };
  e2eeEncrypted?: boolean;
}

export interface IngestPassportPayload {
  orgId?: string;
  appName: string;
  environment?: Environment;
  model: string;
  provider?: ModelProvider;
  modelParams?: {
    temperature: number;
    maxTokens: number;
    topP?: number;
  };
  systemPrompt: {
    version: string;
    text: string;
    templateName?: string;
    variables?: Record<string, string>;
  };
  userInput: {
    text: string;
    piiDetected?: boolean;
    clientIpMasked?: string;
  };
  ragContext?: Array<{
    sourceUri: string;
    title: string;
    score: number;
    textSnippet: string;
    vectorCollection?: string;
  }>;
  llmOutput: {
    text: string;
    finishReason?: 'stop' | 'length' | 'content_filter';
    toxicityScore?: number;
    groundednessScore?: number;
  };
  euRiskCategory?: 'high_risk' | 'limited_risk' | 'minimal_risk';
  e2eeEncrypted?: boolean;
}

export interface ChainVerificationResult {
  valid: boolean;
  totalBlocks: number;
  headHash: string;
  genesisHash: string;
  brokenBlocks: Array<{
    blockIndex: number;
    passportId: string;
    reason: string;
  }>;
  merkleRoot: string;
  verifiedAt: string;
}

// User & Role Management
export type UserRole = 'admin' | 'developer' | 'client';
export type PricingTier = 'starter' | 'scale' | 'enterprise';

export interface User {
  id: string;
  email: string;
  name: string;
  organization: string;
  role: UserRole;
  tier: PricingTier;
  tierName: string;
  apiKey: string;
  createdAt: string;
  e2eeEnabled: boolean;
  e2eeKeyFingerprint?: string;
  status: 'active' | 'suspended';
}

export type PaymentMethodType = 'credit_card' | 'jazzcash';

export interface PaymentRecord {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  organization: string;
  tier: PricingTier;
  tierName: string;
  amountUsd: number;
  amountPkr: number;
  paymentMethod: PaymentMethodType;
  jazzcashRecipient: string; // "+923105905246"
  jazzcashSenderNumber?: string;
  transactionReference: string; // TID or Card Auth Code
  cardLast4?: string;
  cardBrand?: string;
  status: 'completed' | 'pending_approval' | 'rejected';
  timestamp: string;
  approvedAt?: string;
  approvedBy?: string;
  billingCycle: 'monthly' | 'annual';
  notes?: string;
}

export type ActivePage = 'landing' | 'pricing' | 'docs' | 'dashboard' | 'admin';
