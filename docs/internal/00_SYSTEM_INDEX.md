# Ritualmaker — System Index

**Site:** Ritualmaker (`ritualmakerny.com`)  
**Repo:** [alenephotographs/Ritualmaker](https://github.com/alenephotographs/Ritualmaker)  
**Last index pass:** 2026-05-20  
**Index maintainer:** Cloud Agent / Cursor (update on every major pass)

---

## Project purpose

Replace the legacy **Webflow** site for [ritualmakerny.com](https://ritualmakerny.com) with a **Next.js 14** App Router application that preserves **zero-lapse** operation of the physical **farm-stand QR checkout** flow, while adding:

- Public marketing home, farm stand commerce, photography portfolio, and on-location / Live Collage™ services
- Embedded **Sanity Studio** for CMS content
- **Supabase Postgres** for transactional CRM (event proposals, client documents, vendor auth)
- **Stripe** Checkout, Connect, Invoices, and Payment Links for stand sales and event florals

---

## Active product domains

| Domain | Public routes | Admin / API | Primary data store |
|--------|---------------|-------------|-------------------|
| **Home & brand** | `/` | — | Sanity (`siteSettings`, `faq`, Instagram API) |
| **Farm stand / QR checkout** | `/farm-stand`, `/farm-stand/product/[slug]`, `/checkout/*` | `/admin/(portal)/*`, `/api/checkout`, `/api/stripe/webhook` | Sanity (`bouquet`, `pantryItem`, `flowerProduct`, `vendor`) |
| **Photography** | `/photography` | — | Static `/public/photography` + Sanity archive (legacy) |
| **On-location / weddings / Live Collage™** | `/on-location` (redirects: `/weddings`, `/events`, `/live`) | `/admin/(portal)/weddings`, `/api/inquiries` | Sanity (`weddingInquiry`) + inquiry forms |
| **Event proposals (CRM)** | `/proposal/[token]` | `/admin/events`, `/admin/events/new`, `/admin/events/[id]`, `/api/admin/client-documents/*`, `/api/proposal/*` | **Supabase** (`client_documents`) |
| **Vendor / owner admin** | `/admin`, `/admin/sign-in` | NextAuth + portal sections | Supabase vendors + Sanity catalog |
| **CMS editing** | `/studio` | Sanity write token | Sanity dataset `ritualmaker` |
| **Analytics (UX)** | — | `/api/analytics/cta` | Sanity (`uxEvent`) |

**Redirects (SEO / legacy):** see `next.config.mjs` — e.g. `/shop` → `/farm-stand`, `/admin/documents/*` → `/admin/events/*`.

---

## Source-of-truth docs

| Doc | Role |
|-----|------|
| [`README.md`](../../README.md) | Stack, local dev, env vars, high-level tree |
| [`BUILD_NOTES.md`](../../BUILD_NOTES.md) | Build/env requirements (`pnpm build` vs `pnpm check`) |
| [`.env.example`](../../.env.example) | Canonical env var list |
| [`docs/cutover.md`](../cutover.md) | Webflow → Vercel DNS swap (highest business risk) |
| [`docs/internal/01_ARCHITECTURE_MAP.md`](./01_ARCHITECTURE_MAP.md) | Routes, data flows, dependency diagram |
| [`docs/live-collage-first-use.md`](../live-collage-first-use.md) | Trademark first-use record |
| [`docs/uspto-live-collage-draft.md`](../uspto-live-collage-draft.md) | USPTO filing draft (not legal advice) |
| [`supabase/migrations/*.sql`](../../supabase/migrations/) | Postgres schema source of truth |

---

## Architecture docs

- **[`01_ARCHITECTURE_MAP.md`](./01_ARCHITECTURE_MAP.md)** — system diagram, route map, Sanity vs Supabase split
- **`src/lib/db.ts`** — Supabase access layer for `client_documents` and vendors
- **`src/sanity/`** — schemas, GROQ queries, public + write clients
- **`src/auth.ts`** — NextAuth credentials (owner email + access code, vendor access codes)

---

## Backlog docs

No dedicated backlog file yet. Track work via **GitHub Issues** (repo currently has **no open issues**).

**Known doc/code drift (backlog candidates):**

- `README.md` project tree still lists `/shop`, `/gallery` pages that are redirects or sections elsewhere
- Sanity `eventOrder` documents still surface on owner dashboard while **Supabase `client_documents`** is canonical for proposals
- USPTO specimen screenshots noted in `docs/live-collage-first-use.md` not yet captured post-deploy

---

## Unresolved blockers

| ID | Blocker | Impact | Mitigation |
|----|---------|--------|------------|
| B1 | **Production cutover not executed** | Live site may still be Webflow | Follow [`docs/cutover.md`](../cutover.md); do not change DNS without checklist |
| B2 | **GitHub Issues empty** | No routed triage for bugs/features | File issues with labels; link in handoffs |
| B3 | **Dual CRM paths** (Sanity `eventOrder` vs Supabase `client_documents`) | Confusion for admins / agents | Prefer Supabase for new proposals; migrate or deprecate Sanity event orders explicitly |
| B4 | **Full stack requires many secrets** | Local/CI builds fail without `.env.local` | Use `pnpm check` for compile-only; Vercel env per `BUILD_NOTES.md` |
| B5 | **Stripe live + webhook** | Payments incomplete until configured | Dashboard webhook → `STRIPE_WEBHOOK_SECRET`; test on staging QR first |

---

## GitHub Issues routing

**Repo:** `alenephotographs/Ritualmaker`

| Label (suggested) | Use for |
|-------------------|---------|
| `domain:farm-stand` | QR checkout, bouquets, flower products, Shippo shipping |
| `domain:proposals` | `/proposal/[token]`, PDF, Stripe payment links/invoices |
| `domain:admin` | Portal, auth, vendor Connect |
| `domain:cms` | Sanity schemas, Studio, seed/migrate scripts |
| `domain:infra` | Vercel, Supabase migrations, env, cutover |
| `domain:content` | Copy, photography, on-location, trademark |
| `priority:stand` | Blocks physical stand sales (treat as P0) |
| `type:docs` | Index, architecture, runbooks only |

**When opening an issue:** link affected routes, env vars, migration files, and the latest system index commit SHA.

---

## Cursor → ChatGPT handoff format

Every Cursor response that needs **ChatGPT review** must end with the **one-click copy block** below (filled in). ChatGPT should treat that block as the single source of truth for the turn.

### Required one-click copy block (template)

```
--- CHATGPT HANDOFF (copy below) ---
SITE: Ritualmaker
REPO: alenephotographs/Ritualmaker
BRANCH: <branch or main>
COMMIT: <full SHA or "uncommitted">
FILES_CHANGED:
- <path>
BLOCKERS:
- <B1..Bn or "none">
CONTEXT: <1-3 sentences>
NEXT_SAFE_ACTION: <one concrete step that respects next-safe-action rules>
ASK_CHATGPT: <specific review question>
--- END HANDOFF ---
```

### This pass (filled example)

```
--- CHATGPT HANDOFF (copy below) ---
SITE: Ritualmaker
REPO: alenephotographs/Ritualmaker
BRANCH: cursor/system-index-pass-ab0b
COMMIT: <see git log after push>
FILES_CHANGED:
- docs/internal/00_SYSTEM_INDEX.md
- docs/internal/01_ARCHITECTURE_MAP.md
- docs/internal/worklog/2026-05-20_system-index-pass.md
- README.md
BLOCKERS:
- B1 Production cutover not executed
- B2 No GitHub Issues filed yet
- B3 Dual CRM (Sanity eventOrder vs Supabase client_documents)
CONTEXT: Repo-native system index and architecture map added; no product code changed.
NEXT_SAFE_ACTION: Review index for accuracy; file GitHub Issues for B3 and cutover prep; do not merge DNS/cutover changes without owner sign-off.
ASK_CHATGPT: Confirm index completeness and whether eventOrder deprecation should be a tracked issue before next feature work.
--- END HANDOFF ---
```

---

## Next-safe-action rules

Agents and humans should pick the **smallest action** that does not widen blast radius. In order of precedence:

1. **Protect stand checkout** — Do not merge changes that break `/farm-stand`, `/api/checkout`, or Stripe webhook handling without a phone-based test plan. Treat `priority:stand` issues as blocking.
2. **No production DNS/cutover without checklist** — DNS TTL, Vercel domain, and Webflow fallback per [`docs/cutover.md`](../cutover.md). Owner sign-off required.
3. **Docs-only passes** — OK to update `docs/internal/*`, `README.md`, worklogs without env or schema changes.
4. **Schema changes** — Supabase: review `supabase/migrations/*.sql`, run `supabase db push` only on linked project; never expose `SUPABASE_SERVICE_ROLE_KEY` to client. Sanity: `pnpm sanity:deploy-schema` after schema edits.
5. **Env discipline** — Never set `ALLOW_BUILD_WITHOUT_SANITY=1` on Vercel production. Use `pnpm check` locally when Sanity vars missing.
6. **Auth boundaries** — Owner routes (`/admin/events/*`) require `session.user.role === "owner"`. Vendor sessions scoped by `vendorId`.
7. **Proposal tokens** — `/proposal/[token]` is `noindex`; do not log or cache tokens in public analytics.
8. **Branch + PR** — Feature work on `cursor/<name>-ab0b`; push before testing; open/update PR each agent turn.
9. **No new features during index passes** — Index updates only unless user explicitly requests implementation.
10. **Handoff required** — If escalating to ChatGPT, include the one-click block with real `COMMIT` SHA after push.

---

## Internal doc map

```
docs/
  cutover.md
  live-collage-first-use.md
  uspto-live-collage-draft.md
  internal/
    00_SYSTEM_INDEX.md      ← you are here
    01_ARCHITECTURE_MAP.md
    worklog/
      2026-05-20_system-index-pass.md
```

---

## Quick commands

```bash
pnpm install && cp .env.example .env.local
pnpm dev                    # http://localhost:3000 , Studio /studio
pnpm check                  # lint + typecheck + compile without real Sanity
pnpm build                  # production build (needs Sanity env)
pnpm sanity:deploy-schema   # after schema changes
```
