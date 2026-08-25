# Ritualmaker — Retrieval Queries

Use these **GROQ-style questions** (for humans or agents) to pull the right doc or code area before acting. Pair with [`11_TASK_ROUTING_PROTOCOL.md`](./11_TASK_ROUTING_PROTOCOL.md).

---

## Startup / orientation

| Query | Go to |
|-------|--------|
| What is this repo? | `README.md`, `00_SYSTEM_INDEX.md` |
| What is true right now? | `02_CURRENT_STATE.md` |
| How do I start a Cursor session? | `11_TASK_ROUTING_PROTOCOL.md` § Startup ritual |
| Local vs ecosystem? | `02_CURRENT_STATE.md` § Ecosystem vs local |

---

## Commerce & stand (revenue — highest risk)

| Query | Go to |
|-------|--------|
| QR checkout flow | `src/app/api/checkout/route.ts`, `src/app/farm-stand/` |
| Stripe webhook | `src/app/api/stripe/webhook/route.ts` |
| Connect vendors | `src/app/api/stripe/connect/`, `src/lib/db.ts` vendors |
| Shippo shipping | `src/lib/shippo.ts`, `.env.example` SHIPPO_* |
| Cutover / DNS | `docs/cutover.md` |
| Redirects from Webflow | `next.config.mjs` |

---

## Proposals & CRM

| Query | Go to |
|-------|--------|
| Hosted proposal page | `src/app/proposal/[token]/` |
| Client document CRUD | `src/lib/db.ts`, `src/app/api/admin/client-documents/` |
| Proposal PDF | `src/lib/pdf/` |
| Lifecycle rules | `src/lib/proposalLifecycleLogic.ts` |
| Payment stale / invoice mismatch | `src/lib/clientDocumentPaymentState.ts` |

---

## CMS & content

| Query | Go to |
|-------|--------|
| Sanity schemas | `src/sanity/schemas/` |
| Public queries | `src/sanity/queries.ts` |
| Admin product upload | `src/app/api/admin/flower-products/` |
| Seed / migrate scripts | `scripts/*.mjs` |
| Site settings / FAQ | `siteSettings`, `faq` schemas |

---

## Admin & auth

| Query | Go to |
|-------|--------|
| NextAuth setup | `src/auth.ts` |
| Owner vs vendor | `src/lib/adminAuth.ts`, `02_CURRENT_STATE.md` |
| Events list (Supabase) | `src/app/admin/events/page.tsx` |
| Portal dashboard (Sanity) | `src/app/admin/(portal)/dashboard/page.tsx` |

---

## Infra & build

| Query | Go to |
|-------|--------|
| Env vars | `.env.example`, `BUILD_NOTES.md` |
| Postgres schema | `supabase/migrations/*.sql` |
| Build without Sanity | `pnpm check`, `src/sanity/env.ts` |
| Architecture diagram | `01_ARCHITECTURE_MAP.md` |

---

## Archive / trademark (not revenue-critical)

| Query | Go to |
|-------|--------|
| Live Collage first use | `docs/live-collage-first-use.md` |
| USPTO draft | `docs/uspto-live-collage-draft.md` |
| On-location page | `src/app/on-location/page.tsx` |

---

## Metasystem (external — do not implement here)

| Query | Action |
|-------|--------|
| Build Control Logic procedures | Retrieve from BCL repo / founder docs — **not stored in Ritualmaker** |
| Alene’s Active Archive essays | **Not** in GitHub Issues; separate archive silo |
| New brand website (future silo) | Separate repo when created; apply same startup ritual there |

---

## Issue lookup

| Query | Go to |
|-------|--------|
| Open blockers | GitHub Issues: `label:type:blocker` |
| Stand P0 | `label:priority:stand` |
| Taxonomy | `12_GITHUB_ISSUE_TAXONOMY.md` |
