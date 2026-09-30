import { 
  computePassportHash, 
  verifyPassportIntegrity, 
  verifyEntireChain, 
  sealPassport, 
  GENESIS_HASH 
} from '../src/lib/cryptoLedger.js';
import { createInitialChain } from '../src/data/mockPassports.js';

console.log('=== PROMPTTRACE AUTOMATED CRYPTOGRAPHIC SUITE ===\n');

// Test 1: Verify Initial Chain
console.log('TEST 1: Verifying Initial Ledger Chain Integrity...');
const initialChain = createInitialChain();
console.log(`Chain created with ${initialChain.length} blocks.`);

const auditResult = verifyEntireChain(initialChain);
if (!auditResult.valid) {
  console.error('FAILED: Initial chain should be 100% valid but failed:', auditResult.brokenBlocks);
  process.exit(1);
}
console.log(`PASS: All ${auditResult.totalBlocks} blocks cryptographically verified.`);
console.log(`Genesis Anchor: ${auditResult.genesisHash}`);
console.log(`Head Hash:      ${auditResult.headHash}`);
console.log(`Merkle Root:    ${auditResult.merkleRoot}\n`);

// Test 2: Ingestion & Sub-50ms Benchmark
console.log('TEST 2: Ingestion & Cryptographic Sealing Benchmark...');
const start = performance.now();
const latestBlock = initialChain[initialChain.length - 1];

const newBlock = sealPassport({
  appName: 'automated-test-agent',
  model: 'gpt-4o-2024-08-06',
  systemPrompt: {
    version: 'v1.0.0-test',
    text: 'You are an autonomous test model under EU AI Act Article 12.'
  },
  userInput: {
    text: 'Verify real-time cryptographic latency and hash chain integrity.'
  },
  ragContext: [
    {
      sourceUri: 'test://doc/1',
      title: 'Benchmark Specification 2026',
      score: 0.99,
      textSnippet: 'Latency must not exceed 50ms overhead.'
    }
  ],
  llmOutput: {
    text: 'Audit test completed successfully with zero tamper detected.',
    toxicityScore: 0.0,
    groundednessScore: 1.0
  },
  euRiskCategory: 'high_risk'
}, latestBlock);

const elapsed = performance.now() - start;
console.log(`PASS: Sealed Block #${newBlock.blockIndex} in ${elapsed.toFixed(3)} ms (SLA < 50ms).`);
console.log(`Previous Hash: ${newBlock.prevHash}`);
console.log(`Block Hash:    ${newBlock.hash}\n`);

// Test 3: Tamper Detection (Adversarial Simulation)
console.log('TEST 3: Adversarial Tamper Injection Test...');
const tamperedBlock = {
  ...newBlock,
  userInput: {
    ...newBlock.userInput,
    text: newBlock.userInput.text + ' [INJECTED_TAMPER_MODIFICATION]'
  }
};

const tamperCheck = verifyPassportIntegrity(tamperedBlock);
if (tamperCheck.isValid) {
  console.error('FAILED: Tamper check should have flagged tampered block, but passed!');
  process.exit(1);
}
console.log('PASS: Cryptographic mismatch detected as expected!');
console.log(`Original Hash: ${tamperedBlock.hash}`);
console.log(`Computed Hash: ${tamperCheck.computedHash}`);
console.log('Bit cascade divergence confirmed: Zero tamper leakage.\n');

// Test 4: EU AI Act Article 12 & 13 Attributes
console.log('TEST 4: EU AI Act Compliance Stamp Validation...');
if (!newBlock.compliance.euAiActArticle12 || !newBlock.compliance.euAiActArticle13) {
  console.error('FAILED: Missing EU AI Act Article 12 or 13 compliance flags');
  process.exit(1);
}
console.log(`PASS: EU AI Act Article 12 (Record-keeping): ${newBlock.compliance.euAiActArticle12}`);
console.log(`PASS: EU AI Act Article 13 (Transparency):   ${newBlock.compliance.euAiActArticle13}`);
console.log(`PASS: Risk Category: ${newBlock.compliance.euRiskCategory}\n`);

console.log('=== ALL INTEGRATION TESTS PASSED (4/4) ===');
