# WEC Credit Repair App — Architecture

## Stack

| Layer | Technology | Rationale |
|---|---|---|
| Frontend | Next.js 15 (App Router) | Server components + streaming for performance; Vercel native |
| Styling | Tailwind CSS | WEC dark-brand design system; mobile-first |
| Auth | Supabase Auth (magic link OTP) | No password exposure; CROA-compliant audit trail |
| Database | Supabase (PostgreSQL 15) | Row Level Security, pgvector for RAG, real-time subscriptions |
| Vector store | pgvector (1024-dim) | Co-located with relational data; no extra infra |
| Embeddings | Voyage AI `voyage-law-2` | Domain-optimized for legal text; 1024-dim output |
| LLM | Anthropic Claude (`claude-opus-4-7`) | Best-in-class instruction following; structured output |
| Automation | n8n Cloud (8 workflows) | Low-code pipeline; webhook-driven; MCP connected |
| Mail dispatch | Lob (certified mail API) | FCRA audit trail for physical dispute letters |
| Email | Gmail OAuth2 (via n8n WF07) | Client notification emails |
| SMS | Twilio (via n8n WF07) | Optional client SMS alerts |
| Deployment | Vercel (auto-deploy from GitHub master) | Edge functions; zero-config Next.js |
| PDF generation | Puppeteer (scripts/generate-report.js) | Server-side; no client-side PDF libs |

## Key Architectural Decisions

### Auth: Magic Link Only
No passwords. Supabase OTP email. Admin routing via `ADMIN_EMAIL` env var — auth callback auto-routes to `/admin`. Client routing to `/portal`. Middleware protects all `/portal` and `/admin` routes.

### AI Calls: RAG-Grounded Only (Phase 2+)
All Claude calls in the dispute engine are grounded in retrieved legal chunks. No hallucinated statute citations. The RAG pipeline: query → Voyage AI embed → pgvector similarity search on `legal_chunks` → top-5 chunks injected into Claude system prompt.

### Content Filter: Pre- and Post-Generation
`lib/dispute-engine/content-filter.ts` runs before the Claude prompt is assembled (to catch UPL-triggering user input) and after generation (to scan output for banned phrases). Hard block on any language that could constitute unauthorized practice of law.

### Dispute Rounds
- Round 1: Factual dispute (§1681i) — letter to bureau claiming item is inaccurate
- Round 2: Method of verification demand (§1681i(a)(7)) — demand proof of verification procedure
- Round 3: Pre-litigation notice (§1681n) — willful non-compliance notice, escalate to attorney referral

### CROA Compliance
- 3-day cooling-off period enforced in WF00 orchestrator
- `cancellation_deadline` stored on every case
- Full CROA disclosure gated before any user action (onboarding screen)
- No upfront fees: payment only after services rendered

### RLS: Per-User Data Isolation
Every table with user data has RLS enabled. Clients can only SELECT/INSERT/UPDATE their own rows. `legal_chunks` is public read (no PII). Service role key never exposed to client.

## Data Flow

```
User submits intake form (/)
  → WF01: CROA compliance gate → case created in DB
  → WF00: Hourly orchestrator (after 3-day cooling off)
    → WF02: Credit report ingestion → negative_items populated
    → WF03: Claude analysis (RAG-grounded) → dispute_potential scored
    → WF04: Letter generation (Claude + templates) → dispute_letters created
    → WF05: Admin reviews → Lob certified mail dispatch
    → WF06: 30-day response tracking → outcome evaluation → escalation
    → WF07: Email/SMS notifications at each milestone
User portal (/portal) reads live Supabase data throughout
```

## File Structure

```
├── automations/          # n8n workflow JSON exports (source of truth)
├── database/
│   └── migrations/       # SQL DDL — apply via Supabase CLI or dashboard
├── docs/                 # Persistent project memory (this folder)
├── rag/
│   └── corpus/           # Raw legal text files for ingestion
├── reports/              # Generated daily PDF reports (gitignored)
├── scripts/
│   └── generate-report.js  # Puppeteer markdown→PDF
├── tests/
│   ├── mock-data/          # JSON fixtures for dispute engine tests
│   ├── unit/               # Vitest unit tests
│   └── integration/        # Integration test results + e2e
└── webapp/               # Next.js 15 application
    ├── app/
    │   ├── api/            # API routes (dispute engine endpoints)
    │   ├── (auth)/         # Auth pages (login, onboarding)
    │   └── (dashboard)/    # Protected portal + admin routes
    ├── lib/
    │   ├── dispute-engine/ # Content filter, engine, letter generator
    │   ├── rag/            # Ingest + retrieve functions
    │   └── supabase/       # Browser + server Supabase clients
    └── middleware.ts       # Auth + route protection
```
