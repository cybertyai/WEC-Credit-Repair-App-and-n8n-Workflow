# Docs Changelog

Session-level changes to project documentation and architecture decisions.
For application feature changelog, see `/CHANGELOG.md` (repo root).

## 2026-06-06

### Added
- `docs/ARCHITECTURE.md` — full tech stack documentation with data flow diagram
- `docs/ROADMAP.md` — all phases with current completion status
- `docs/LEGAL_COMPLIANCE.md` — CROA disclosures, AI guardrails, dispute strategy matrix, statute reference
- `docs/CHANGELOG.md` — this file
- `docs/BLOCKERS.md` — blocker tracking
- `docs/BACKLOG.md` — out-of-scope ideas
- `rag/corpus/` — directory for legal text corpus (Phase 2)
- `tests/unit/`, `tests/integration/`, `tests/mock-data/` — test directories (Phase 2+)
- `reports/` — generated PDF reports directory (Phase 5+)
- Updated `.env.local.example` with Phase 2–3 keys (ANTHROPIC_API_KEY, VOYAGE_AI_API_KEY, N8N_API_URL, N8N_API_KEY, SUPABASE_SERVICE_ROLE_KEY)
- Installed `pnpm` 11.5.2 globally
