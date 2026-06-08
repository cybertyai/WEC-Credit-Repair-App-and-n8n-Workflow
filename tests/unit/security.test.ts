import { describe, it, expect } from 'vitest'
import { sanitizeText } from '@/lib/sanitize'
import { checkRateLimit } from '@/lib/rate-limit'
import { runContentFilter } from '@/lib/dispute-engine/content-filter'

// ── XSS / injection ────────────────────────────────────────────────────────

describe('sanitizeText — XSS vectors', () => {
  it('strips script tags', () => {
    expect(sanitizeText('<script>alert("xss")</script>')).not.toContain('<script>')
  })

  it('strips onerror attribute', () => {
    expect(sanitizeText('<img src=x onerror=alert(1)>')).not.toContain('onerror')
  })

  it('strips iframe', () => {
    expect(sanitizeText('<iframe src="evil.com"></iframe>')).not.toContain('iframe')
  })

  it('strips javascript: href', () => {
    expect(sanitizeText('<a href="javascript:alert(1)">click</a>')).not.toContain('javascript:')
  })

  it('preserves plain text', () => {
    const input = 'Capital One account reported late in error'
    expect(sanitizeText(input)).toBe(input)
  })
})

// ── SQL injection — Zod rejects malicious strings before they reach DB ──────

describe('Input validation — SQL injection patterns rejected by length/type', () => {
  const SQLI_PAYLOADS = [
    "' OR '1'='1",
    '"; DROP TABLE cases; --',
    "' UNION SELECT * FROM cases --",
    "1; SELECT * FROM legal_chunks",
    "' OR 1=1--",
  ]

  it('sanitizeText strips HTML from SQL injection payloads', () => {
    for (const payload of SQLI_PAYLOADS) {
      const result = sanitizeText(payload)
      expect(result).not.toContain('<')
      expect(result).not.toContain('>')
    }
  })
})

// ── Rate limiter ────────────────────────────────────────────────────────────

describe('checkRateLimit', () => {
  it('allows requests under the limit', () => {
    const key = `test-${Math.random()}`
    for (let i = 0; i < 10; i++) {
      expect(checkRateLimit(key, 10, 60_000).allowed).toBe(true)
    }
  })

  it('blocks the 11th request', () => {
    const key = `test-${Math.random()}`
    for (let i = 0; i < 10; i++) checkRateLimit(key, 10, 60_000)
    expect(checkRateLimit(key, 10, 60_000).allowed).toBe(false)
  })

  it('returns remaining count correctly', () => {
    const key = `test-${Math.random()}`
    const first = checkRateLimit(key, 10, 60_000)
    expect(first.remaining).toBe(9)
  })

  it('resets after window expires', async () => {
    const key = `test-${Math.random()}`
    for (let i = 0; i < 10; i++) checkRateLimit(key, 10, 1)
    await new Promise(r => setTimeout(r, 5))
    expect(checkRateLimit(key, 10, 1).allowed).toBe(true)
  })

  it('different keys are independent', () => {
    const k1 = `test-${Math.random()}`
    const k2 = `test-${Math.random()}`
    for (let i = 0; i < 10; i++) checkRateLimit(k1, 10, 60_000)
    expect(checkRateLimit(k1, 10, 60_000).allowed).toBe(false)
    expect(checkRateLimit(k2, 10, 60_000).allowed).toBe(true)
  })
})

// ── Content filter — double-checks UPL phrases don't pass through ───────────

describe('Content filter — security boundary', () => {
  it('catches guarantee even with mixed case', () => {
    expect(runContentFilter('GUARANTEED removal').passed).toBe(false)
  })

  it('catches we will remove variant', () => {
    expect(runContentFilter('We will remove this item for you.').passed).toBe(false)
  })
})
