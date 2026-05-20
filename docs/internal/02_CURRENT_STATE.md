# Ritualmaker — Current State

**As-of:** 2026-05-20 (issue operationalization)  
**Repo:** `alenephotographs/Ritualmaker`  
**Branch baseline:** `main` @ `1fd65ef` · metasystem docs on `cursor/metasystem-alignment-ab0b` @ `0f7099f`

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
