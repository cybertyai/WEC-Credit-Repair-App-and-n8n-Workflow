# Blockers

Active blockers that prevent phase progression.

---

## Active

### BLOCKER-001 — Missing `.env.local` secrets
**Phase blocked:** Phase 2 (RAG), Phase 3 (Dispute Engine)
**Added:** 2026-06-06
**Required values:**
- `ANTHROPIC_API_KEY` — Anthropic console (console.anthropic.com)
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project settings → API
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase project settings → API
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase project settings → API
- `VOYAGE_AI_API_KEY` — voyageai.com → dashboard → API keys
- `N8N_API_URL` — n8n instance URL (e.g. https://your-instance.app.n8n.cloud)
- `N8N_API_KEY` — n8n → Settings → API → Create API key

**Resolution:** User provides values → create `webapp/.env.local`

---

## Resolved

_(none yet)_
