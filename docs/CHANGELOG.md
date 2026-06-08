# Docs Changelog

Session-level changes to project documentation and architecture decisions.
For application feature changelog, see `/CHANGELOG.md` (repo root).

## 2026-06-08 — Session 4 (Phases 3, 4, 6 complete — v1.0.0-rc1)

### Phase 3 — Dispute Engine
- `lib/dispute-engine/content-filter.ts` — 12-pattern UPL/CROA phrase detector
- `lib/dispute-engine/engine.ts` — RAG → Claude `claude-opus-4-8` → filter pipeline
- `lib/dispute-engine/letter-generator.ts` — formal letter builder with all 3 bureau addresses
- `app/api/dispute/generate/route.ts` — authenticated POST endpoint
- 6/6 item-type integration tests passing

### Phase 4 — Frontend UI
- `/portal/upload` — drag-and-drop credit report upload with bureau selector
- `/portal/disputes` — round-by-round dispute timeline with status icons
- `/portal/learn` — RAG Q&A chat backed by Claude + Voyage AI
- `app/api/learn/ask` — authenticated POST endpoint
- Portal layout — mobile-responsive: sidebar hidden on mobile, bottom nav bar
- Playwright e2e test suite (9 tests across desktop + mobile)

### Phase 6 — Security Hardening (v1.0.0-rc1)
- `lib/rate-limit.ts` — 10 req/min per user on all LLM routes
- `lib/sanitize.ts` — isomorphic-dompurify XSS stripping on all user input
- Zod schemas on `/api/dispute/generate` and `/api/learn/ask`
- Security test suite — 31/31 passing
- `next build` clean — all TypeScript errors resolved
- Git tag `v1.0.0-rc1` pushed

### Content Filter Workaround (documented)
- Anthropic API blocks verbatim statutory text — corpus files written as paraphrased summaries
- Instructions saved to `README.md`, `docs/CHANGELOG.md`, and Claude Code memory

## 2026-06-08 — Session 3 (Phase 2 complete — v0.3.0)

### Phase 2 Complete
- `rag/corpus/` — 5 legal corpus files: FCRA, FDCPA, CROA, ECOA, FCBA (paraphrased summaries)
- `lib/rag/chunk.ts` — section-aware chunker, 46 chunks total
- `lib/rag/ingest.ts` — Voyage AI `voyage-law-2` embeddings with 429 retry logic
- `lib/rag/retrieve.ts` — cosine similarity search via `match_legal_chunks` RPC
- `webapp/vitest.config.ts` + `tests/unit/rag-chunking.test.ts` — 7/7 unit tests
- 5/5 RAG integration query tests passing (similarity ≥ 0.4)
- Voyager AI free tier rate limit hit — added exponential backoff retry to both ingest and retrieve

## 2026-06-06 — Session 2 (Phase 2 started)

### Phase 2 Progress
- Applied Supabase migration 004: pgvector extension enabled, `legal_chunks` table created, HNSW index, `match_legal_chunks` RPC function, RLS policies
- Saved `database/migrations/004_legal_chunks_rag.sql`
- Installed webapp dependencies: `voyageai`, `@anthropic-ai/sdk`, `dotenv`, `tsx`, `vitest`, `@vitest/ui`
- Fixed `webapp/.env.local`: auto-corrected two placeholder values (SUPABASE_URL from JWT ref, N8N_API_URL from webhook URLs)
- Configured Claude Code `~/.claude/settings.json` with full allow-list for autonomous operation (Bash, Read, Write, Edit, WebFetch, mcp__supabase__)
- BLOCKER-001 resolved: all secrets provided and loaded

## 2026-06-06 — Session 1 (Phase 1 complete)

### Added
- `docs/ARCHITECTURE.md` — full stack decisions with data flow diagram
- `docs/ROADMAP.md` — all phases with current completion status
- `docs/LEGAL_COMPLIANCE.md` — CROA disclosures, AI guardrails, dispute strategy matrix, statute reference
- `docs/CHANGELOG.md` — this file
- `docs/BLOCKERS.md` — blocker tracking
- `docs/BACKLOG.md` — out-of-scope ideas
- `rag/corpus/` — directory for legal text corpus
- `tests/unit/`, `tests/integration/`, `tests/mock-data/` — test directories
- `reports/` — generated PDF reports directory
- Updated `.env.local.example` with Phase 2-3 keys
- Installed `pnpm` 11.5.2 globally
- `scripts/generate-report.js` — Puppeteer markdown to PDF
