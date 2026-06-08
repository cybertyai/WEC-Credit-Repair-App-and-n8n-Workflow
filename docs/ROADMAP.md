# WEC Credit Repair App — Roadmap

## Status Legend
- ✅ Complete
- 🔄 In Progress
- ⏳ Pending

---

## Phase 1 — Scaffold & Docs
**Status:** ✅ Complete (v0.1.0 base + v0.2.0 brand overhaul)

- ✅ Next.js 15 (App Router, TypeScript, Tailwind)
- ✅ Supabase auth + RLS
- ✅ n8n 8-workflow pipeline (WF00–WF07)
- ✅ GitHub repo + Vercel auto-deploy
- ✅ WEC dark brand design system (navy #0A1628 + gold #C9952A)
- ✅ `.env.local.example` with all required keys
- ✅ `docs/` directory with project memory files
- ✅ `rag/corpus/` — legal text corpus (5 statutes, 46 chunks embedded)
- ✅ `tests/` — unit (31), integration (11), e2e (9) test suite
- ✅ `scripts/generate-report.js` — Puppeteer PDF generator

---

## Phase 2 — RAG Pipeline
**Status:** ✅ Complete (v0.3.0 — 2026-06-08)

- ✅ `legal_chunks` table + pgvector migration (migration 004)
- ✅ `match_legal_chunks` SQL function + HNSW index
- ✅ webapp deps: `voyageai`, `@anthropic-ai/sdk`, `tsx`, `vitest` installed
- ✅ Legal corpus files in `rag/corpus/`: FCRA, FDCPA, CROA, ECOA, FCBA
- ✅ `lib/rag/chunk.ts` — section-aware chunker with overlap (46 chunks total)
- ✅ `lib/rag/ingest.ts` — Voyage AI voyage-law-2 embeddings + rate-limit retry
- ✅ `lib/rag/retrieve.ts` — cosine similarity search via Supabase RPC
- ✅ `tests/unit/rag-chunking.test.ts` — 7/7 passing
- ✅ 5/5 RAG integration query tests passing

---

## Phase 3 — Dispute Engine + Claude Integration
**Status:** ✅ Complete (v0.4.0 — 2026-06-08)

- ✅ `lib/dispute-engine/content-filter.ts` — 12-pattern UPL phrase detection with cleaned output
- ✅ `lib/dispute-engine/engine.ts` — RAG → Claude `claude-opus-4-8` → filter pipeline
- ✅ `lib/dispute-engine/letter-generator.ts` — formal letter builder with all 3 bureau addresses
- ✅ `app/api/dispute/generate/route.ts` — authenticated POST endpoint with Zod validation
- ✅ 6/6 item-type integration tests passing (late payment, collection, charge-off, bankruptcy, hard inquiry, not mine)

---

## Phase 4 — Frontend UI Enhancements
**Status:** ✅ Complete (v0.4.0 — 2026-06-08)

- ✅ Onboarding / CROA disclosure gate
- ✅ Dashboard (`/portal`)
- ✅ Dispute letters view (`/portal/letters`)
- ✅ Score tracker (`/portal/score`)
- ✅ Notifications feed (`/portal/notifications`)
- ✅ Legal letter generator (`/portal/legal`)
- ✅ Admin console (`/admin`)
- ✅ Upload credit report flow (`/portal/upload`)
- ✅ Dispute tracker timeline (`/portal/disputes`)
- ✅ Education hub RAG Q&A (`/portal/learn`)
- ✅ Mobile-responsive layout — sidebar hidden on mobile, bottom nav bar at 375px
- ✅ Playwright e2e test suite (9 tests — auth redirects, form visibility, mobile viewport)

---

## Phase 7 — Multi-Round Automation
**Status:** 🔄 In Progress (2026-06-08)

- ✅ DB migration 005 — bureau response fields on `dispute_letters` + `bureau_responses` table
- ✅ `lib/dispute-engine/re-dispute.ts` — round escalation strategy (R1→R2→R3→R4)
- ✅ `app/api/case/bureau-response/route.ts` — WF06 webhook records bureau response + triggers re-dispute
- ✅ `app/api/dispute/re-dispute/route.ts` — generates next-round escalated letter
- ✅ `/portal/disputes` — shows bureau response text, outcome badge, re-dispute history
- ✅ Integration tests — 4 round-escalation cases

---

## Phase 5 — n8n Workflow Automation
**Status:** ✅ Complete (8 workflows live)

- ✅ WF00 — Hourly orchestrator + CROA cooling-off
- ✅ WF01 — Client intake compliance gate
- ✅ WF02 — Credit report ingestion
- ✅ WF03 — Negative item analysis (Claude `claude-opus-4-7`)
- ✅ WF04 — Dispute letter generation (Claude + compliance lint)
- ✅ WF05 — Letter review + Lob certified mail dispatch
- ✅ WF06 — Response tracking + multi-round escalation
- ✅ WF07 — Client notifications (Gmail + Twilio)
- ⏳ WF08 — Daily PDF report (GitHub commits + n8n execution stats)
- ⏳ WF09 — RAG corpus update (new document → chunk → embed → upsert)

---

## Phase 6 — Security Hardening & Launch Readiness
**Status:** ✅ Complete (v1.0.0-rc1 — 2026-06-08)

- ✅ Zero secrets in committed code (git grep scan — clean)
- ✅ Rate limiting — 10 req/min per user on all LLM routes (`lib/rate-limit.ts`)
- ✅ Zod input validation on all POST endpoints (`/api/dispute/generate`, `/api/learn/ask`)
- ✅ XSS sanitization — `isomorphic-dompurify` strips all HTML tags before user input reaches Claude
- ✅ Security test suite — 31/31 passing (XSS vectors, SQL injection payloads, rate limiter, content filter)
- ✅ `next build` clean — all type errors resolved
- ✅ Git tag `v1.0.0-rc1`
