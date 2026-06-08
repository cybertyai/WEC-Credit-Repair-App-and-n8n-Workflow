/**
 * Integration test: Multi-round re-dispute generation
 * Tests 4 escalation scenarios — one per round transition
 * Run: cd webapp && npx tsx --env-file=.env.local ../tests/integration/re-dispute.ts
 */

import { generateReDispute } from '../webapp/lib/dispute-engine/re-dispute'

const DELAY_MS = 22_000

const CASES = [
  {
    label: 'Round 1 → 2 (verified, late payment, Equifax)',
    input: {
      caseId: 'test-001',
      bureau: 'Equifax' as const,
      previousRound: 1,
      itemType: 'late_payment',
      creditor: 'Capital One',
      originalReason: 'Payment was made on time — bank records confirm timely payment',
      bureauResponseText: 'We have investigated your dispute and the information has been verified as accurate.',
      responseOutcome: 'verified' as const,
      clientName: 'John Smith',
      clientAddress: '123 Main St, Dallas, TX 75201',
    },
  },
  {
    label: 'Round 2 → 3 (no response, collection, TransUnion)',
    input: {
      caseId: 'test-002',
      bureau: 'TransUnion' as const,
      previousRound: 2,
      itemType: 'collection',
      creditor: 'Midland Credit Management',
      originalReason: 'Account does not belong to me — identity theft',
      bureauResponseText: '',
      responseOutcome: 'no_response' as const,
      clientName: 'Maria Garcia',
      clientAddress: '456 Oak Ave, Atlanta, GA 30301',
    },
  },
  {
    label: 'Round 1 → 2 (verified, hard inquiry, Experian)',
    input: {
      caseId: 'test-003',
      bureau: 'Experian' as const,
      previousRound: 1,
      itemType: 'hard_inquiry',
      creditor: 'Unknown Lender',
      originalReason: 'I did not authorize this inquiry',
      bureauResponseText: 'The inquiry was verified with the creditor and will remain on file.',
      responseOutcome: 'verified' as const,
      clientName: 'David Johnson',
      clientAddress: '789 Elm St, Chicago, IL 60601',
    },
  },
  {
    label: 'Round 3 → 4 (verified, charge_off, Equifax)',
    input: {
      caseId: 'test-004',
      bureau: 'Equifax' as const,
      previousRound: 3,
      itemType: 'charge_off',
      creditor: 'Citibank',
      originalReason: 'Account was settled in full — improper reporting of charge-off status',
      bureauResponseText: 'After review, the account information has been verified as accurate.',
      responseOutcome: 'verified' as const,
      clientName: 'Ashley Williams',
      clientAddress: '321 Pine Rd, Houston, TX 77001',
    },
  },
]

async function run() {
  console.log('=== Re-Dispute Integration Tests ===\n')
  let passed = 0

  for (let i = 0; i < CASES.length; i++) {
    const { label, input } = CASES[i]
    console.log(`[${i + 1}/${CASES.length}] ${label}`)

    try {
      const result = await generateReDispute(input)
      const expectedRound = Math.min(input.previousRound + 1, 4)

      const checks = {
        'correct round':          result.round === expectedRound,
        'letter body non-empty':  result.letterBody.length > 100,
        'strategy set':           typeof result.strategy === 'string' && result.strategy.length > 0,
        'notarization on R3+':    expectedRound < 3 ? !result.requiresNotarization : result.requiresNotarization,
        'no banned phrases':      !/guarantee|we will remove|100% certain/i.test(result.letterBody),
      }

      const failures = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k)
      if (failures.length === 0) {
        console.log(`  ✅ PASS  round=${result.round}  strategy=${result.strategy}  notarization=${result.requiresNotarization}`)
        console.log(`  Preview: ${result.letterBody.slice(0, 120).replace(/\n/g, ' ')}…`)
        passed++
      } else {
        console.log(`  ❌ FAIL  checks failed: ${failures.join(', ')}`)
      }
    } catch (err: any) {
      console.log(`  ❌ ERROR  ${err.message}`)
    }

    if (i < CASES.length - 1) {
      console.log(`  Waiting ${DELAY_MS / 1000}s for rate limit…`)
      await new Promise(r => setTimeout(r, DELAY_MS))
    }

    console.log()
  }

  console.log(`=== Results: ${passed}/${CASES.length} passed ===`)
  process.exit(passed === CASES.length ? 0 : 1)
}

run().catch(err => { console.error(err); process.exit(1) })
