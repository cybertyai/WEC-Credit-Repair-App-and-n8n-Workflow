// UPL = Unauthorized Practice of Law. CROA bans guarantees and outcome promises.
const UPL_PATTERNS = [
  /\bguarantee[sd]?\b/i,
  /\bwe\s+will\s+(remove|delete|erase|eliminate)\b/i,
  /\bpromise[sd]?\s+to\s+remove\b/i,
  /\b100%\s+(guaranteed?|certain|sure)\b/i,
  /\blegal\s+advice\b/i,
  /\byou\s+should\s+sue\b/i,
  /\bfile\s+(a\s+)?lawsuit\b/i,
  /\battorney.client\b/i,
  /\bwe\s+represent\s+you\b/i,
  /\bour\s+lawyers?\b/i,
  /\binstant(ly)?\s+(remove|delete|fix)\b/i,
  /\bclean\s+(up\s+)?your\s+credit\s+(report\s+)?(overnight|instantly|immediately)\b/i,
]

export interface FilterResult {
  passed: boolean
  violations: string[]
  cleaned: string
}

export function runContentFilter(text: string): FilterResult {
  const violations: string[] = []

  for (const pattern of UPL_PATTERNS) {
    const match = text.match(pattern)
    if (match) violations.push(match[0])
  }

  const cleaned = violations.reduce((t, v) => t.replace(new RegExp(escapeRegex(v), 'gi'), '[REMOVED]'), text)

  return { passed: violations.length === 0, violations, cleaned }
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
