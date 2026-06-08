import { generateDisputeLetter, DisputeInput, ItemType } from '../../webapp/lib/dispute-engine/engine'

const CASES: { label: string; input: DisputeInput }[] = [
  {
    label: 'Late payment',
    input: {
      itemType: 'late_payment',
      creditor: 'Capital One',
      accountNumber: '****1234',
      reason: 'Payment was made on time but reported late in error',
      clientName: 'Jane Smith',
      clientAddress: '456 Oak Ave, Dallas, TX 75201',
      bureau: 'Equifax',
    },
  },
  {
    label: 'Collection account',
    input: {
      itemType: 'collection',
      creditor: 'Midland Credit Management',
      amount: 842,
      reason: 'Debt is past the statute of limitations and cannot be verified',
      clientName: 'Jane Smith',
      clientAddress: '456 Oak Ave, Dallas, TX 75201',
      bureau: 'TransUnion',
    },
  },
  {
    label: 'Charge-off',
    input: {
      itemType: 'charge_off',
      creditor: 'Synchrony Bank',
      amount: 1200,
      reason: 'Account balance is inaccurate and does not reflect payments made',
      clientName: 'Jane Smith',
      clientAddress: '456 Oak Ave, Dallas, TX 75201',
      bureau: 'Experian',
    },
  },
  {
    label: 'Bankruptcy',
    input: {
      itemType: 'bankruptcy',
      creditor: 'US Bankruptcy Court',
      reason: 'Bankruptcy was discharged over 10 years ago and must be removed',
      clientName: 'Jane Smith',
      clientAddress: '456 Oak Ave, Dallas, TX 75201',
      bureau: 'Equifax',
    },
  },
  {
    label: 'Hard inquiry',
    input: {
      itemType: 'hard_inquiry',
      creditor: 'First Premier Bank',
      reason: 'I did not authorize this inquiry and have no record of applying',
      clientName: 'Jane Smith',
      clientAddress: '456 Oak Ave, Dallas, TX 75201',
      bureau: 'TransUnion',
    },
  },
  {
    label: 'Not mine',
    input: {
      itemType: 'not_mine',
      creditor: 'Citibank',
      accountNumber: '****9999',
      amount: 3500,
      reason: 'This account does not belong to me — possible identity theft',
      clientName: 'Jane Smith',
      clientAddress: '456 Oak Ave, Dallas, TX 75201',
      bureau: 'Experian',
    },
  },
]

async function main() {
  let passed = 0

  for (let i = 0; i < CASES.length; i++) {
    const { label, input } = CASES[i]
    console.log(`\nCase ${i + 1}: ${label}`)

    try {
      const result = await generateDisputeLetter(input)

      const checks = [
        { name: 'letter non-empty', ok: result.letter.length > 200 },
        { name: 'filter passed', ok: result.filter.passed },
        { name: 'contains client name', ok: result.letter.includes(input.clientName) },
        { name: 'contains bureau address', ok: result.letter.includes('P.O. Box') },
        { name: 'has RAG sources', ok: result.sources.length > 0 },
        { name: 'contains statute citation', ok: /§\s*\d+/.test(result.letter) },
      ]

      const failed = checks.filter(c => !c.ok)
      if (failed.length === 0) {
        console.log(`  PASS — ${result.sources[0].source_document} § cited, filter clean`)
        passed++
      } else {
        console.log(`  FAIL — ${failed.map(f => f.name).join(', ')}`)
        console.log(`  Filter violations: ${result.filter.violations.join(', ') || 'none'}`)
      }
    } catch (err: any) {
      console.log(`  ERROR — ${err.message}`)
    }

    if (i < CASES.length - 1) await new Promise(r => setTimeout(r, 22000))
  }

  console.log(`\n${passed}/${CASES.length} cases passed`)
  if (passed < CASES.length) process.exit(1)
}

main().catch(err => { console.error(err); process.exit(1) })
