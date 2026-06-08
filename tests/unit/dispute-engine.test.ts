import { describe, it, expect } from 'vitest'
import { runContentFilter } from '@/lib/dispute-engine/content-filter'
import { buildDisputeLetter } from '@/lib/dispute-engine/letter-generator'

describe('runContentFilter', () => {
  it('passes clean professional text', () => {
    const result = runContentFilter('I am disputing this item under 15 U.S.C. § 1681i.')
    expect(result.passed).toBe(true)
    expect(result.violations).toHaveLength(0)
  })

  it('flags guarantee language', () => {
    const result = runContentFilter('We guarantee removal of this item within 30 days.')
    expect(result.passed).toBe(false)
    expect(result.violations.length).toBeGreaterThan(0)
  })

  it('flags outcome promise', () => {
    const result = runContentFilter('We will remove this negative item from your report.')
    expect(result.passed).toBe(false)
  })

  it('flags legal advice claim', () => {
    const result = runContentFilter('This letter constitutes legal advice for your situation.')
    expect(result.passed).toBe(false)
  })

  it('removes violation from cleaned output', () => {
    const result = runContentFilter('We guarantee this will work.')
    expect(result.cleaned).not.toMatch(/guarantee/i)
    expect(result.cleaned).toContain('[REMOVED]')
  })
})

describe('buildDisputeLetter', () => {
  const base = {
    clientName: 'John Doe',
    clientAddress: '123 Main St, Atlanta, GA 30301',
    bureau: 'Equifax' as const,
    body: 'This item is inaccurate under 15 U.S.C. § 1681i.',
    date: 'June 8, 2026',
  }

  it('includes client name', () => {
    expect(buildDisputeLetter(base)).toContain('John Doe')
  })

  it('includes correct bureau address', () => {
    expect(buildDisputeLetter(base)).toContain('P.O. Box 740256')
  })

  it('includes TransUnion address for TransUnion', () => {
    const letter = buildDisputeLetter({ ...base, bureau: 'TransUnion' })
    expect(letter).toContain('P.O. Box 2000')
  })

  it('includes Experian address for Experian', () => {
    const letter = buildDisputeLetter({ ...base, bureau: 'Experian' })
    expect(letter).toContain('P.O. Box 4500')
  })

  it('includes the body text', () => {
    expect(buildDisputeLetter(base)).toContain('15 U.S.C. § 1681i')
  })

  it('includes the date', () => {
    expect(buildDisputeLetter(base)).toContain('June 8, 2026')
  })
})
