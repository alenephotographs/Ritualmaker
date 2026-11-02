# Ritualmaker — Current State

**As-of:** 2026-09-30 (cold-reentry supersession; May snapshot preserved below)  
**Repo:** `alenephotographs/Ritualmaker`  
**Historical branch baseline:** `main` @ `1fd65ef` · metasystem docs on `cursor/metasystem-alignment-ab0b` @ `0f7099f`

## 2026-09-30 currentness supersession

The May state below is historical-valid but no longer sufficient for work selection.

Current live program field must include at least:

- PR #5 — startup/currentness/metasystem lineage;
- PR #19 — active client-portal payment/invoice recovery on current-main ancestry;
- the PR #19 payment/invoice horizon remains source/nonprod work with protected live Stripe, email, migration, merge and deployment effects;
- current `main` carries `vercel.json` with Git-triggered deployment disabled; historical deploy assumptions must not re-arm it.

PR #19's unresolved lawful work includes nonprod reconciliation/idempotency/recovery proof around invoice creation, local custody, payment-state persistence, notification failure/retry, and legacy public-token expiry. Those obligations remain selectable even while live provider effects are protected.

```text
HISTORICAL_CURRENT_STATE != CURRENT_SELECTION_AUTHORITY
ACTIVE PROGRAM OMITTED FROM COLD REENTRY => FAIL CLOSED
PAYMENT EFFECT PROTECTED != PAYMENT/RECOVERY PLANNING EXHAUSTED
GREEN SOURCE != LIVE STRIPE/EMAIL/MIGRATION PROOF
```

Read with [`00_SYSTEM_INDEX.md`](./00_SYSTEM_INDEX.md) and [`01_ARCHITECTURE_MAP.md`](./01_ARCHITECTURE_MAP.md).

---

## Local repo identity (this repo only)

**Ritualmaker** is the embodied seasonal commerce system: Hudson Valley flowers, 24/7 farm-stand QR checkout, on-location / Live Collage™ event florals, and owner–vendor admin. It is **not** Build Control Logic, Archive Architect, Alene Photographs, or future sibling silos (e.g. separate brand sites). Those live in other repos under **Alene’s Active Archive**; this repo implements **Ritualmaker** only.

---

## Ecosystem vs local (do not conflate)

| Layer | What it is | Where it lives |
|-------|------------|----------------|
| **Operating spine** | Build Control Logic / Founder Control Logic — how work is routed, verified, handed off | External metasystem docs (not in this repo) |
| **Ecosystem frame** | Alene’s Active Archive — portfolio of repos, brands, evidence | Cross-repo; referenced here for orientation only |
| **This repo** | Ritualmaker product + ops — Next.js, Sanity, Supabase, Stripe | This codebase |

Agents must **not** collapse Ritualmaker into generic “Human Operating System” language or treat BCL as a substitute product name for this site.

---

## Production / deploy snapshot

| Item | State |
|------|--------|
| Live domain | `ritualmakerny.com` — cutover to Vercel **not completed** (may still be Webflow) |
| Vercel project | Configured per README; confirm in Vercel dashboard |
| Sanity | Project `qjcf272e`, dataset `ritualmaker`, Studio `/studio` |
| Supabase | Migrations in `supabase/migrations/`; requires linked project + service role on server |
| Stripe | Test/live keys per env; webhook + live stand test **pending verification** |
| GitHub Issues | **#6** (B1 cutover), **#7** (B3 CRM drift), **#8** (B5 Stripe) — labels pending manual apply |

---

## Codebase health (engineering)

- **Latest `main` fix:** Admin `/admin/events` route clash with portal CRM resolved (`1fd65ef`).
- **Canonical proposals:** Supabase `client_documents` + `/proposal/[token]`.
- **Legacy drift:** Sanity `eventOrder` still loaded on owner dashboard — not canonical for new proposals.
- **Build:** `pnpm build` needs Sanity env; `pnpm check` for compile-only local audit.

---

## Path lenses (for precognitive reorientation)

When stepping back before high-stakes work, separate:

| Path | Ritualmaker meaning |
|------|---------------------|
| **Revenue** | Farm-stand checkout, shipped flower products, proposal deposits/balances, Stripe Connect vendors |
| **Sovereignty** | Founder control of data, auth, and deploy — handled via env/secrets and owner-only admin; **do not document or expose offline/sovereign material in this repo** |
| **Archive** | Photography page, `archivePhoto` / archive.boutique, Live Collage™ first-use docs, USPTO draft |
| **Implementation** | Migrations, API routes, cutover DNS, schema deploys, CI/Vercel |

---

## Open blockers (durable home: GitHub Issues)

| Doc ID | Issue | Title |
|--------|-------|--------|
| B1 | [#6](https://github.com/alenephotographs/Ritualmaker/issues/6) | Webflow → Vercel cutover not executed |
| B3 | [#7](https://github.com/alenephotographs/Ritualmaker/issues/7) | Sanity eventOrder vs Supabase client_documents |
| B5 | [#8](https://github.com/alenephotographs/Ritualmaker/issues/8) | Stripe live + webhook verification |

B4 (env/build) remains operational guidance in `BUILD_NOTES.md` — file an Issue only if Vercel build is failing in production.

---

## What changed last (worklog)

See [`03_CURSOR_WORKLOG.md`](./03_CURSOR_WORKLOG.md).
