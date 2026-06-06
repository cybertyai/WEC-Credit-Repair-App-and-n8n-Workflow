# Blockers

Active blockers that prevent phase progression.

---

## Active

_(none)_

---

## Resolved

### BLOCKER-001 — Missing `.env.local` secrets
**Resolved:** 2026-06-06
**Resolution:** User created `webapp/.env.local` with all 7 required keys. Two placeholder values (SUPABASE_URL, N8N_API_URL) were auto-corrected by deriving from JWT ref field and webhook URLs respectively.
