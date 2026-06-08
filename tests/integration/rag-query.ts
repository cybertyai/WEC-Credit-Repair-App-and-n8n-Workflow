import { retrieveLegalContext } from '../../webapp/lib/rag/retrieve'

const QUERIES = [
  'What are my rights to dispute inaccurate items on my credit report?',
  'How long can negative items remain on a credit report?',
  'What must a debt collector include in a validation notice?',
  'What is prohibited under the Credit Repair Organizations Act?',
  'What damages can a consumer recover for FCRA violations?',
]

async function main() {
  let passed = 0

  for (let i = 0; i < QUERIES.length; i++) {
    const query = QUERIES[i]
    console.log(`\nQuery ${i + 1}: "${query}"`)

    const results = await retrieveLegalContext(query, 3)

    if (!results || results.length === 0) {
      console.log('  FAIL — no results returned')
      continue
    }

    const top = results[0]
    console.log(`  Top match: [${top.source_document}] ${top.section}`)
    console.log(`  Similarity: ${top.similarity.toFixed(4)}`)
    console.log(`  Preview: ${top.content.slice(0, 120).replace(/\n/g, ' ')}...`)

    if (top.similarity > 0.4) {
      console.log('  PASS')
      passed++
    } else {
      console.log(`  FAIL — similarity ${top.similarity.toFixed(4)} below 0.4 threshold`)
    }

    if (i < QUERIES.length - 1) await new Promise(r => setTimeout(r, 21000))
  }

  console.log(`\n${passed}/${QUERIES.length} queries passed`)
  if (passed < QUERIES.length) process.exit(1)
}

main().catch(err => { console.error(err); process.exit(1) })
