# WEC Credit Repair App & n8n Workflow

**Williams Equity Capital** — AI-powered credit repair pipeline with a full-stack client portal and admin dashboard.

## What This Is

An end-to-end credit repair system built on:
- **n8n Cloud** — 8-workflow automation pipeline (intake → analysis → letters → dispatch → tracking)
- **Claude AI** — FCRA compliance analysis and dispute letter drafting
- **Next.js 15** — Client portal (case status, dispute letters, notifications) and admin dashboard
- **Supabase** — PostgreSQL database with Row Level Security

## Repository Structure

```
├── automations/          # n8n workflow JSON exports (importable)
│   ├── WF00-credit-repair-orchestrator.json
│   ├── WF01-client-intake-compliance-gate.json
│   ├── WF02-credit-report-ingestion.json
│   ├── WF03-negative-item-analysis.json
│   ├── WF04-dispute-letter-generation.json
│   ├── WF05-letter-review-notarization-dispatch.json
│   ├── WF06-response-tracking-escalation.json
│   └── WF07-client-notifications.json
├── database/
│   └── migrations/
│       ├── 001_initial_schema.sql    # Full schema DDL
│       └── 002_enable_rls.sql        # Row Level Security policies
├── webapp/               # Next.js 15 application
│   ├── app/
│   │   ├── page.tsx              # Landing page + intake form
│   │   ├── login/page.tsx        # Magic-link auth
│   │   ├── auth/callback/route.ts
│   │   ├── portal/page.tsx       # Client portal
│   │   ├── admin/page.tsx        # Admin dashboard
│   │   └── actions.ts            # Server actions
│   ├── lib/supabase/
│   │   ├── client.ts             # Browser Supabase client
│   │   └── server.ts             # Server Supabase client
│   ├── middleware.ts             # Auth + route protection
│   └── .env.local.example        # Environment variable template
├── scripts/
│   └── test-webhook.ps1          # PowerShell intake test script
├── docs/
└── .github/workflows/ci.yml      # GitHub Actions CI
```

## Pipeline Overview

```
Client submits intake form
        ↓
WF01 — Compliance Gate (CROA/FCRA validation, 3-day cooling-off window)
        ↓ (after cooling-off expires, hourly)
WF00 — Orchestrator
  ├── WF02 — Credit Report Ingestion (CRS API / PDF / IdentityIQ)
  ├── WF03 — Negative Item Analysis (Claude FCRA classification)
  ├── WF04 — Dispute Letter Generation (Claude drafts, compliance lint)
  └── WF07 — Client Notification (Gmail OAuth2 + optional Twilio SMS)
        ↓ (admin reviews in dashboard)
WF05 — Letter Dispatch (optional Proof.com notarization → Lob certified mail)
        ↓ (daily, after 30-day FCRA window)
WF06 — Response Tracking & Escalation (re-ingest → Claude evaluation → round++)
```

## Quick Start

### Webapp

```bash
cd webapp
npm install
cp .env.local.example .env.local
# Fill in SUPABASE_URL, SUPABASE_ANON_KEY, N8N webhook URLs
npm run dev
```

### Database

Run migrations in order against your Supabase project:
```sql
-- In Supabase SQL editor or via CLI:
\i database/migrations/001_initial_schema.sql
\i database/migrations/002_enable_rls.sql
```

### n8n Workflows

1. Open your n8n instance
2. Import each JSON from `automations/` via **Workflows → Import from file**
3. Configure credentials: Supabase Postgres, Anthropic API, Gmail OAuth2
4. Publish workflows in order: WF07 → WF04 → WF03 → WF02 → WF01 → WF05 → WF06 → WF00

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `NEXT_PUBLIC_N8N_INTAKE_WEBHOOK` | n8n WF01 production webhook URL |
| `N8N_APPROVAL_WEBHOOK` | n8n WF05 approval webhook URL |
| `ADMIN_EMAIL` | Email address that gets admin access |

## Compliance

This system is built to comply with the **Credit Repair Organizations Act (CROA)** and the **Fair Credit Reporting Act (FCRA)**:
- No upfront fees collected before services are performed
- Mandatory 3-day right-to-cancel cooling-off window
- All required disclosures captured at intake
- Dispute letters cite specific FCRA statute sections
- Compliance lint prevents banned phrases (guarantees, outcome promises)
- All case events logged to an append-only `events` table

## License

Proprietary — Williams Equity Capital. All rights reserved.
