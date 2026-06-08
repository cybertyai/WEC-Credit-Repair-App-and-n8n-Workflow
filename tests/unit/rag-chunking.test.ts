import { describe, it, expect } from 'vitest'
import { chunkDocument } from '@/lib/rag/chunk'

const SHORT_DOC = `§ 1681a. Definitions

The term "consumer" means an individual.

The term "consumer report" means any written, oral, or other communication of any information bearing on a consumer's creditworthiness.`

const MULTI_SECTION_DOC = `§ 1681a. Definitions

The term "consumer" means an individual.

§ 1681b. Permissible purposes

A consumer reporting agency may furnish a consumer report for the following purposes.

§ 1681i. Dispute procedure

If the completeness or accuracy of any item of information is disputed, the agency shall reinvestigate.`

describe('chunkDocument', () => {
  it('returns at least one chunk for a non-empty document', () => {
    const chunks = chunkDocument('FCRA', SHORT_DOC)
    expect(chunks.length).toBeGreaterThan(0)
  })

  it('sets source_document on every chunk', () => {
    const chunks = chunkDocument('FCRA', SHORT_DOC)
    expect(chunks.every(c => c.source_document === 'FCRA')).toBe(true)
  })

  it('chunk_index values are unique within a document', () => {
    const chunks = chunkDocument('FCRA', MULTI_SECTION_DOC)
    const indices = chunks.map(c => c.chunk_index)
    const unique = new Set(indices)
    expect(unique.size).toBe(indices.length)
  })

  it('chunk_index starts at 0 and increments sequentially', () => {
    const chunks = chunkDocument('FDCPA', MULTI_SECTION_DOC)
    chunks.forEach((c, i) => expect(c.chunk_index).toBe(i))
  })

  it('section field is populated and reflects the correct heading', () => {
    const chunks = chunkDocument('FCRA', MULTI_SECTION_DOC)
    const sections = [...new Set(chunks.map(c => c.section))]
    expect(sections.some(s => s.includes('1681a'))).toBe(true)
    expect(sections.some(s => s.includes('1681b'))).toBe(true)
    expect(sections.some(s => s.includes('1681i'))).toBe(true)
  })

  it('no chunk has empty content', () => {
    const chunks = chunkDocument('CROA', MULTI_SECTION_DOC)
    expect(chunks.every(c => c.content.trim().length > 0)).toBe(true)
  })

  it('splits a large section into multiple chunks with max 1800 chars each', () => {
    const bigPara = 'A'.repeat(400)
    const bigDoc = `§ 1681a. Definitions\n\n${[bigPara, bigPara, bigPara, bigPara, bigPara, bigPara].join('\n\n')}`
    const chunks = chunkDocument('FCRA', bigDoc)
    expect(chunks.length).toBeGreaterThan(1)
    expect(chunks.every(c => c.content.length <= 1800 + 200)).toBe(true)
  })
})
