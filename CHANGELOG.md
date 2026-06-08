# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0-rc1] - 2026-06-08

### Added

#### Security Hardening (Phase 6)
- **`lib/rate-limit.ts`** — in-memory rate limiter, 10 req/min per user on all LLM-calling routes
- **`lib/sanitize.ts`** — `isomorphic-dompurify` wrapper strips all HTML before user input reaches Claude
- **Zod validation** on `/api/dispute/generate` and `/api/learn/ask` — strict schema enforcement with typed error responses
- **`tests/unit/security.test.ts`** — 13 security tests: 5 XSS vectors, 5 SQL injection payloads, 5 rate limiter cases

### Changed
- `lib/rag/ingest.ts` + `retrieve.ts` — refactored retry logic into `embedWithRetry()` to satisfy strict TypeScript null checks
- `next build` — clean, all type errors resolved
- `docs/ROADMAP.md` — all phases marked complete

### Fixed
- Type errors in `disputes/page.tsx` (`unknown` not assignable to `ReactNode`)
- `Object is possibly undefined` in Voyage AI response handling

## [0.3.0] - 2026-06-08

### Added

#### RAG Pipeline (Phase 2)
- **`rag/corpus/`** — 5 legal statute corpus files: FCRA, FDCPA, CROA, ECOA, FCBA
- **`webapp/lib/rag/chunk.ts`** — section-aware text chunker with paragraph splitting and character overlap; assigns globally unique `chunk_index` per source document
- **`webapp/lib/rag/ingest.ts`** — ingestion script: reads corpus files, embeds with Voyage AI `voyage-law-2` (1024-dim), upserts 46 chunks into Supabase `legal_chunks` table; includes exponential-backoff retry for API rate limits
- **`webapp/lib/rag/retrieve.ts`** — `retrieveLegalContext(query, matchCount)` — embeds a query with Voyage AI and calls the `match_legal_chunks` Supabase RPC for cosine similarity search
- **`webapp/vitest.config.ts`** — Vitest configuration pointing to `tests/unit/` with `@` alias

#### Tests
- **`tests/unit/rag-chunking.test.ts`** — 7 unit tests covering chunk count, source_document field, unique/sequential chunk_index, section heading extraction, empty content prevention, and large-section splitting
- **`tests/integration/rag-query.ts`** — 5 integration queries against live Supabase; all return correct statute sections with similarity ≥ 0.4

#### Database
- **Migration 004** (applied) — `legal_chunks` table with `vector(1024)` embedding column, HNSW cosine index, `match_legal_chunks` RPC function, and RLS policies

### Changed
- `webapp/package.json` — added `test` and `test:ui` scripts (`vitest run --config vitest.config.ts`)
- `README.md` — added Claude Code / AI development notes section

## [0.2.0] - 2026-05-27

### Added

#### Webapp — Full Brand & UI Overhaul
- **WEC Dark Brand** applied across all pages: navy (#0A1628) + gold (#C9952A) design system
- **Tailwind config** expanded with brand colors, bureau colors, status colors, gold gradient
- **globals.css** redesigned with `.card`, `.btn-gold`, `.btn-ghost`, `.badge-*`, `.stat-card` component classes
- **Inter font** loaded via Google Fonts in root layout
- **lib/utils.ts** — `cn()`, `fmtDate()`, `fmtRelative()`, `scoreColor()`, `scoreLabel()`, `statusInfo()`
- **Portal layout** — new sidebar navigation with WEC brand logo, FCRA badge, and all portal routes
- **Portal dashboard** — rich overview: stats row, case status alerts, dispute letters, activity timeline, score snapshot, quick actions, legal tools CTA
- **Portal /letters** — full dispute letters view with letter body preview, tracking numbers, FCRA deadlines, lint violation display
- **Portal /score** — score tracker with SVG arc gauges per bureau, score history table, milestone tracker
- **Portal /notifications** — full activity feed with event-type labels and channel indicators
- **Portal /legal** — Legal Letter Generator: 10 FDCPA/FCRA/CFPB templates, client form, inline generation, copy/download
- **Admin page** — redesigned with WEC brand, letter preview, reject action, stats cards
- **Login page** — WEC branded with dark navy, magic link flow, security badge

#### Server Actions (`app/actions.ts`)
- `approveLetters()` — triggers n8n approval webhook, revalidates portal/admin
- `rejectLetter()` — flags letter for rewrite with admin note
- `recordScoreSnapshot()` — inserts score history rows for a case
- `saveLegalLetter()` — persists generated legal letter to `legal_letter_requests` table
- `triggerN8nWorkflow()` — generic webhook trigger for any n8n workflow
- `requestCancellation()` — CROA 3-day window cancellation with event logging

#### n8n Workflow Improvements
- **WF03** — Upgraded to `claude-opus-4-7`, improved analysis prompt with obsolescence rules (§ 1681c), unverifiability rules (§ 1681i(a)(5)), `dispute_strategy` field, today's date context
- **WF04** — Upgraded to `claude-opus-4-7`, dramatically improved letter prompt with bureau addresses, round-specific legal strategies, real statute citations, Gorman/Safeco/Drew case law; compliance lint adds deadline check, remedy check, stronger banned-phrase list; `requires_notarization` flag for Round 3
- **WF06** — Added response evaluation pipeline: DB query for remaining disputable items, escalation decision node, `DB: Update Case for Next Round`, `DB: Log Escalation Event`, `Notify: Escalation or Resolution`
- **WF07** — Complete email template rewrite: 9 event types with professional, legally-grounded content; portal link in every message; CROA/FCRA statute references where appropriate

#### Database
- **Migration 003** — `score_history` table (bureau scores over time), `legal_letter_requests` table (FDCPA/FCRA demand letters), `webhook_log` table (n8n debug log), performance indexes on all high-query columns, RLS policies for new tables

### Changed
- Portal main page (`/portal`) — replaced basic case table with rich dashboard connected to real Supabase data
- Admin page (`/admin`) — added reject button, letter body preview, stats cards, WEC brand
- `package.json` — added `lucide-react`, `clsx`, `tailwind-merge`

## [0.1.0] - 2026-05-26

### Added
- **8-workflow n8n automation pipeline** for end-to-end credit repair case management
  - WF00: Hourly orchestrator with CROA 3-day cooling-off enforcement
  - WF01: Client intake webhook with CROA/FCRA compliance gate
  - WF02: Credit report ingestion (CRS API, PDF upload, IdentityIQ RPA adapter)
  - WF03: AI-powered negative item analysis via Claude (FCRA dispute classification)
  - WF04: Dispute letter generation with compliance lint (banned phrases, statute citation check)
  - WF05: Letter review, optional Proof.com notarization, and Lob certified mail dispatch
  - WF06: Daily response tracking, outcome evaluation, and multi-round escalation
  - WF07: Client notifications via Gmail OAuth2 and optional Twilio SMS
- **Next.js 15 webapp** (App Router, TypeScript, Tailwind CSS)
  - Client portal: case status, dispute letters, notification timeline
  - Admin dashboard: case management, letter approval and dispatch
  - Supabase Auth with magic-link login and role-based routing
- **Supabase PostgreSQL schema** with Row Level Security
  - 6 tables: cases, credit_reports, negative_items, dispute_letters, notifications, events
  - RLS policies limiting client access to their own data
- **GitHub Actions CI** for type-check and lint on push/PR
