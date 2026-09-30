import { AIDataPassport } from '../types';
import { GENESIS_HASH, computePassportHash, sealPassport } from '../lib/cryptoLedger';

export function createInitialChain(): AIDataPassport[] {
  const orgId = 'org_enterprise_prompttrace_sec';
  const passports: AIDataPassport[] = [];

  // Helper to add block linking to previous block
  const addBlock = (data: {
    timestamp: string;
    appName: string;
    environment: 'production' | 'staging' | 'evaluation';
    model: string;
    provider: 'OpenAI' | 'Anthropic' | 'Google' | 'Meta';
    status: 'verified' | 'flagged_pii' | 'flagged_hallucination' | 'guardrail_blocked';
    latencyMs: number;
    tokens: { prompt: number; completion: number; total: number };
    costUsd: number;
    sysVersion: string;
    sysTemplate: string;
    sysText: string;
    userPrompt: string;
    piiDetected: boolean;
    ragChunks: Array<{
      chunkId: string;
      sourceUri: string;
      title: string;
      score: number;
      textSnippet: string;
      vectorCollection: string;
      tokens: number;
    }>;
    response: string;
    safety: {
      toxicityScore: number;
      groundednessScore: number;
      hallucinationConfidence: number;
    };
    euRiskCategory: 'high_risk' | 'limited_risk' | 'minimal_risk';
  }) => {
    const blockIndex = passports.length;
    const prevHash = blockIndex === 0 ? GENESIS_HASH : passports[passports.length - 1].hash;

    const hash = computePassportHash(
      prevHash,
      data.timestamp,
      data.sysText,
      data.userPrompt,
      data.response,
      orgId
    );

    const passport: AIDataPassport = {
      id: `pt_pass_${hash.substring(0, 8)}_${blockIndex}`,
      blockIndex,
      orgId,
      timestamp: data.timestamp,
      prevHash,
      hash,
      signature: `pt_sig_sha256:${hash}`,
      appName: data.appName,
      environment: data.environment,
      model: data.model,
      provider: data.provider,
      modelParams: {
        temperature: 0.15,
        maxTokens: 1024,
        topP: 0.95
      },
      status: data.status,
      latencyMs: data.latencyMs,
      tokens: data.tokens,
      costUsd: data.costUsd,
      systemPrompt: {
        version: data.sysVersion,
        hash: `sys_${hash.substring(0, 10)}`,
        templateName: data.sysTemplate,
        text: data.sysText,
        variables: {
          regulatory_mode: data.euRiskCategory.toUpperCase(),
          version: data.sysVersion
        },
        lastModifiedBy: 'compliance-eng@prompttrace.internal'
      },
      userInput: {
        text: data.userPrompt,
        tokenCount: Math.floor(data.userPrompt.length / 3.8),
        piiDetected: data.piiDetected,
        clientIpMasked: '198.51.100.***'
      },
      ragContext: data.ragChunks.map(c => ({
        ...c,
        ingestedAt: data.timestamp
      })),
      llmOutput: {
        text: data.response,
        tokenCount: data.tokens.completion,
        finishReason: 'stop',
        safetyChecks: {
          toxicityScore: data.safety.toxicityScore,
          promptLeakageRisk: 'none',
          hallucinationConfidence: data.safety.hallucinationConfidence,
          groundednessScore: data.safety.groundednessScore
        }
      },
      compliance: {
        soc2Compliant: true,
        hipaaEligible: true,
        gdprRightToBeForgottenSupported: true,
        tamperProofSeal: `PROMPTTRACE-PROOF-BLK#${blockIndex}-${hash.substring(0, 12).toUpperCase()}`,
        verifiedAt: data.timestamp,
        euAiActArticle12: true,
        euAiActArticle13: true,
        euRiskCategory: data.euRiskCategory,
        humanOversightReady: true
      },
      metadata: {
        framework: 'PromptTrace-SDK-v2',
        sdkVersion: '@prompttrace/node@2.1.0',
        correlationId: `req_corr_${hash.substring(0, 10)}`,
        userSessionId: `sess_${hash.substring(10, 18)}`
      }
    };

    passports.push(passport);
  };

  // Block 0: Genesis block - EU AI Act Annex III High-Risk Credit Evaluation
  addBlock({
    timestamp: '2026-09-22T08:50:00.000Z',
    appName: 'credit-underwrite-audit',
    environment: 'production',
    model: 'gpt-4o-2024-08-06',
    provider: 'OpenAI',
    status: 'verified',
    latencyMs: 384,
    tokens: { prompt: 1540, completion: 185, total: 1725 },
    costUsd: 0.0078,
    sysVersion: 'v4.1.0-eu-ai-annex3',
    sysTemplate: 'eu_ai_credit_underwriting_strict',
    sysText: 'You are an EU AI Act Article 12/13 compliant underwriter. Every factor influencing credit tier recommendation must be derived exclusively from retrieved corporate filings and audited bank records. No discriminatory proxy variables are permitted.',
    userPrompt: 'Compute debt-service coverage ratio (DSCR) for Helios Renewable B.V. and assign credit grade based on 2024 EBITDA disclosures.',
    piiDetected: false,
    ragChunks: [
      {
        chunkId: 'chk_sec_helios_2024_p18',
        sourceUri: 's3://eu-audit-vault/helios/annual_report_2024.pdf#page=18',
        title: 'Helios Renewable B.V. - Consolidated Statement of Cash Flows',
        score: 0.958,
        textSnippet: 'Operating cash flows reached €48.2M with annual debt principal and interest obligations of €14.6M. Cash DSCR calculated at 3.30x.',
        vectorCollection: 'pinecone/eu-credit-v2',
        tokens: 180
      }
    ],
    response: 'Helios Renewable B.V. reports operating cash flows of €48.2M against annual debt service of €14.6M, resulting in an audited DSCR of 3.30x. Under Basel III & EU AI Act Annex III underwriting matrices, this satisfies Grade A- Investment Rating with positive debt headroom.',
    safety: { toxicityScore: 0.0, groundednessScore: 0.99, hallucinationConfidence: 0.01 },
    euRiskCategory: 'high_risk'
  });

  // Block 1: Clinical Triage RAG Assistant (HIPAA Eligible & EU AI Act Medical Device Annex III)
  addBlock({
    timestamp: '2026-09-22T08:52:10.000Z',
    appName: 'clinical-triage-copilot',
    environment: 'production',
    model: 'claude-3-5-sonnet',
    provider: 'Anthropic',
    status: 'verified',
    latencyMs: 442,
    tokens: { prompt: 2100, completion: 240, total: 2340 },
    costUsd: 0.0099,
    sysVersion: 'v2.8.1-hipaa-clinical',
    sysTemplate: 'clinical_protocol_rag',
    sysText: 'You are a clinical decision support assistant operating under HIPAA and EU AI Act Article 14 human oversight requirements. Always cite medical protocol chapters and mandate physician sign-off.',
    userPrompt: 'Assess contraindications for concurrent administration of Apixaban with Clarithromycin in a 68-year-old post-CABG patient.',
    piiDetected: false,
    ragChunks: [
      {
        chunkId: 'chk_med_rx_interaction_p402',
        sourceUri: 's3://clinical-guidelines/pharmacology/doac_interactions_2024.pdf',
        title: 'FDA & EMA Joint Advisory: Strong P-gp / CYP3A4 Inhibitors with Factor Xa Antagonists',
        score: 0.974,
        textSnippet: 'Clarithromycin is a potent inhibitor of both CYP3A4 and P-glycoprotein. Co-administration with Apixaban increases apixaban AUC by approximately 50-60%, elevating bleeding risk. Alternative macrolide (azithromycin) recommended.',
        vectorCollection: 'qdrant/clinical-pharmacology',
        tokens: 240
      }
    ],
    response: 'CONTRAINDICATION ALERT: Clarithromycin strongly inhibits CYP3A4 and P-gp, increasing Apixaban systemic exposure (AUC) by ~60% and significantly raising hemorrhagic risk. Recommendation: Withhold Clarithromycin and consult attending physician for Azithromycin substitution.',
    safety: { toxicityScore: 0.0, groundednessScore: 0.995, hallucinationConfidence: 0.005 },
    euRiskCategory: 'high_risk'
  });

  // Block 2: Financial 10-K Analysis (FinTech Fiduciary SEC Mode)
  addBlock({
    timestamp: '2026-09-22T08:55:30.000Z',
    appName: 'fin-advisor-rag-agent',
    environment: 'production',
    model: 'gpt-4o-2024-08-06',
    provider: 'OpenAI',
    status: 'verified',
    latencyMs: 312,
    tokens: { prompt: 1840, completion: 215, total: 2055 },
    costUsd: 0.0094,
    sysVersion: 'v3.8.4-strict-fiduciary',
    sysTemplate: 'sec_filing_rag_assistant',
    sysText: 'You are an institutional financial analyst AI. You strictly base your portfolio evaluations on the provided SEC 10-K snippets. Never guess financial figures or give ungrounded speculative projections. If the citation does not corroborate the metric, state clearly that it is omitted from the Q3 disclosures.',
    userPrompt: "What was Acme Corp's EBITDA margin shift in Q3 2024 compared to previous fiscal year, and what attributed to the operating cash flow variance?",
    piiDetected: false,
    ragChunks: [
      {
        chunkId: 'chk_sec_acme_q3_p42_c1',
        sourceUri: 's3://compliance-vault-us/sec_filings/acme_corp_2024_10k.pdf#page=42',
        title: 'Acme Corp Q3 2024 Form 10-K - Management Discussion & Analysis',
        score: 0.942,
        textSnippet: 'Operating cash flow for the nine months ended Sept 30, 2024 increased 14.2% YoY to $412M. EBITDA margin expanded 180 bps to 24.6%, primarily driven by supply chain renegotiations and automated fulfillment centers, offset slightly by cloud infrastructure spend.',
        vectorCollection: 'pinecone/production-finance-v4',
        tokens: 380
      }
    ],
    response: "Acme Corp's Q3 2024 EBITDA margin expanded by 180 bps YoY to reach 24.6%. The 14.2% YoY increase in nine-month operating cash flow ($412M) was driven by supplier contract renegotiations and automated distribution nodes, partially offset by cloud migration expenses.",
    safety: { toxicityScore: 0.0, groundednessScore: 0.98, hallucinationConfidence: 0.015 },
    euRiskCategory: 'high_risk'
  });

  // Block 3: HR Candidate Evaluation (PII Masking & Article 10 Bias Guardrails)
  addBlock({
    timestamp: '2026-09-22T08:58:45.000Z',
    appName: 'talent-intake-processor',
    environment: 'production',
    model: 'gemini-1.5-pro',
    provider: 'Google',
    status: 'flagged_pii',
    latencyMs: 512,
    tokens: { prompt: 1950, completion: 180, total: 2130 },
    costUsd: 0.0062,
    sysVersion: 'v1.4.0-gdpr-redact',
    sysTemplate: 'talent_blind_screening',
    sysText: 'Screen incoming candidate resumes against technical rubrics. PromptTrace PII scrubber operates in zero-knowledge mode: all candidate names, physical addresses, and birth years are redacted prior to evaluation.',
    userPrompt: 'Evaluate candidate credentials for Senior Distributed Systems Engineer role. SSN [REDACTED_SSN] and address [REDACTED_ADDR] stripped.',
    piiDetected: true,
    ragChunks: [
      {
        chunkId: 'chk_job_spec_dist_sys_l6',
        sourceUri: 'internal://hr/job_specs/staff_infra_engineer.md',
        title: 'Staff Infrastructure Role Requirements - Rubric 2025',
        score: 0.912,
        textSnippet: 'Required: 5+ years Go/Rust, Raft/Paxos consensus primitives, high-throughput distributed message queues (Kafka, Pulsar), and Kubernetes operator development.',
        vectorCollection: 'qdrant/hr-rubrics',
        tokens: 140
      }
    ],
    response: 'Candidate Profile satisfies 100% of core criteria: 6 years production experience maintaining Raft consensus clusters in Go, author of 2 open-source Kubernetes controllers, and proven track record operating Kafka clusters exceeding 2M events/sec. Recommend for Technical Screen.',
    safety: { toxicityScore: 0.0, groundednessScore: 0.97, hallucinationConfidence: 0.02 },
    euRiskCategory: 'high_risk'
  });

  // Block 4: Customer Support Copilot (Limited Risk with Article 13 Transparency AI Disclosure)
  addBlock({
    timestamp: '2026-09-22T09:02:15.000Z',
    appName: 'ecommerce-support-copilot',
    environment: 'production',
    model: 'llama-3.3-70b-instruct',
    provider: 'Meta',
    status: 'verified',
    latencyMs: 245,
    tokens: { prompt: 820, completion: 120, total: 940 },
    costUsd: 0.0018,
    sysVersion: 'v5.2.0-art13-transparency',
    sysTemplate: 'support_shopper_assist',
    sysText: 'You are an automated conversational agent for Apex Retail. EU AI Act Article 13 transparency requirement: Explicitly inform customers that they are communicating with an automated AI system and provide human escalation if requested.',
    userPrompt: 'What is your return policy for open-box enterprise server hardware?',
    piiDetected: false,
    ragChunks: [
      {
        chunkId: 'chk_support_returns_p3',
        sourceUri: 'https://apexretail.internal/kb/enterprise-returns-policy.html',
        title: 'Apex Enterprise Hardware Return & RMA Policy 2025',
        score: 0.961,
        textSnippet: 'Enterprise server hardware may be returned within 45 days of delivery. Open-box units subject to zero restocking fees if returned with original chassis rails and serial tag intact.',
        vectorCollection: 'pinecone/customer-kb',
        tokens: 110
      }
    ],
    response: '[Transparency Disclosure: This response was generated by an AI assistant]. You have 45 days from delivery to return enterprise server hardware. Open-box units carry $0 restocking fees provided original chassis rails and serial tags are intact. Would you like me to connect you to an RMA specialist?',
    safety: { toxicityScore: 0.0, groundednessScore: 0.99, hallucinationConfidence: 0.01 },
    euRiskCategory: 'limited_risk'
  });

  return passports;
}

export const INITIAL_PASSPORTS: AIDataPassport[] = createInitialChain().reverse();

export function generateRandomPassport(existingChain: AIDataPassport[] = INITIAL_PASSPORTS): AIDataPassport {
  // Sort ascending to get true latest block
  const sorted = [...existingChain].sort((a, b) => a.blockIndex - b.blockIndex);
  const latestBlock = sorted.length > 0 ? sorted[sorted.length - 1] : null;

  const sampleApps = [
    { name: 'fin-advisor-rag-agent', model: 'gpt-4o-2024-08-06', provider: 'OpenAI' as const, risk: 'high_risk' as const },
    { name: 'clinical-triage-copilot', model: 'claude-3-5-sonnet', provider: 'Anthropic' as const, risk: 'high_risk' as const },
    { name: 'compliance-auditor-bot', model: 'gemini-1.5-pro', provider: 'Google' as const, risk: 'high_risk' as const },
    { name: 'shopper-support-agent', model: 'llama-3.3-70b-instruct', provider: 'Meta' as const, risk: 'limited_risk' as const }
  ];

  const app = sampleApps[Math.floor(Math.random() * sampleApps.length)];
  const prompts = [
    'Assess liquidity coverage ratio (LCR) given 30-day stressed cash outflow scenario.',
    'Verify contraindications between Warfarin and Ibuprofen in geriatric surgical intake.',
    'Audit system prompt drift against SOC2 Type II change management policies.',
    'Explain Article 13 transparency obligations for high-throughput customer chatbot.'
  ];

  const chosenPrompt = prompts[Math.floor(Math.random() * prompts.length)];

  return sealPassport(
    {
      appName: app.name,
      model: app.model,
      provider: app.provider,
      systemPrompt: {
        version: 'v4.2.1-fiduciary-audit',
        text: 'You are an enterprise AI operating under PromptTrace cryptographic hash logging. Ground all statements strictly in retrieved context.'
      },
      userInput: {
        text: chosenPrompt
      },
      ragContext: [
        {
          sourceUri: 's3://vault/regulatory/guidelines_2025.pdf',
          title: 'Regulatory & Compliance Framework 2025',
          score: 0.952,
          textSnippet: 'All high-risk autonomous agents must maintain unbroken hash chains linking input prompts, vector context chunks, and generated completions.'
        }
      ],
      llmOutput: {
        text: 'Analysis confirmed with unbroken SHA-256 hash chaining: Input and retrieved context verified against WORM ledger.',
        toxicityScore: 0.0,
        groundednessScore: 0.99
      },
      euRiskCategory: app.risk
    },
    latestBlock
  );
}
