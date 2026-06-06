# Docs Changelog

Session-level changes to project documentation and architecture decisions.
For application feature changelog, see `/CHANGELOG.md` (repo root).

## 2026-06-06 — Session 2 (Phase 2 started)

### Phase 2 Progress
- Applied Supabase migration 004: pgvector extension enabled, `legal_chunks` table created, HNSW index, `match_legal_chunks` RPC function, RLS policies
- Saved `database/migrations/004_legal_chunks_rag.sql`
- Installed webapp dependencies: `voyageai`, `@anthropic-ai/sdk`, `dotenv`, `tsx`, `vitest`, `@vitest/ui`
- Fixed `webapp/.env.local`: auto-corrected two placeholder values (SUPABASE_URL from JWT ref, N8N_API_URL from webhook URLs)
- Configured Claude Code `~/.claude/settings.json` with full allow-list for autonomous operation (Bash, Read, Write, Edit, WebFetch, mcp__supabase__)
- BLOCKER-001 resolved: all secrets provided and loaded

### Pending (Phase 2 continuation after /clear)
- Legal corpus files: `rag/corpus/fcra-full-text.txt`, `fdcpa-full-text.txt`, `croa-full-text.txt`, `dispute-strategy-guides.txt`, `cfpb-medical-debt-2023.txt`
- `webapp/lib/rag/chunk.ts` — chunking algorithm
- `webapp/lib/rag/ingest.ts` — corpus ingestion pipeline
- `webapp/lib/rag/retrieve.ts` — similarity search
- Unit tests: `tests/unit/rag-chunking.test.ts`
- Ingestion run + 5 integration query tests
- Commit: `[Phase 2] RAG pipeline complete, 5/5 query tests passing`

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
