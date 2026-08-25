# Ritualmaker

The Next.js + Sanity + Stripe rebuild of [ritualmakerny.com](https://ritualmakerny.com), replacing the prior Webflow site with no lapse to the QR-code stand checkout flow.

## Documentation

**Agents:** start with [`docs/internal/11_TASK_ROUTING_PROTOCOL.md`](./docs/internal/11_TASK_ROUTING_PROTOCOL.md) (startup ritual).

| Doc | Description |
|-----|-------------|
| [`docs/internal/00_SYSTEM_INDEX.md`](./docs/internal/00_SYSTEM_INDEX.md) | Hub — domains, metasystem placement, handoff format |
| [`docs/internal/02_CURRENT_STATE.md`](./docs/internal/02_CURRENT_STATE.md) | Local repo vs ecosystem; deploy snapshot |
| [`docs/internal/11_TASK_ROUTING_PROTOCOL.md`](./docs/internal/11_TASK_ROUTING_PROTOCOL.md) | Startup ritual + precognitive reorientation |
| [`docs/internal/10_RETRIEVAL_QUERIES.md`](./docs/internal/10_RETRIEVAL_QUERIES.md) | Task → doc/code retrieval |
| [`docs/internal/12_GITHUB_ISSUE_TAXONOMY.md`](./docs/internal/12_GITHUB_ISSUE_TAXONOMY.md) | GitHub Issue labels and routing |
| [`docs/internal/01_ARCHITECTURE_MAP.md`](./docs/internal/01_ARCHITECTURE_MAP.md) | Routes, APIs, Sanity vs Supabase |
| [`docs/internal/03_CURSOR_WORKLOG.md`](./docs/internal/03_CURSOR_WORKLOG.md) | Agent worklog |
| [`BUILD_NOTES.md`](./BUILD_NOTES.md) | Build and Vercel env requirements |
| [`docs/cutover.md`](./docs/cutover.md) | Webflow → Vercel cutover (stand QR safety) |
| [`.env.example`](./.env.example) | Environment variable reference |

## Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS, palette mirrors `alenephotographs.com`
- **CMS:** Sanity (project `qjcf272e`, dataset `ritualmaker`) — embedded Studio at `/studio`
- **Payments:** Stripe Checkout Sessions (server-side, no client SDK needed)
- **Hosting:** Vercel
- **Photo source:** [archive.boutique](https://archive.boutique) — pulled in via `archivePhoto` documents in Sanity

## Local development

```bash
pnpm install
cp .env.example .env.local      # then fill in real values
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The Studio lives at `/studio`.

## Required env vars

See `.env.example`. Minimum to get the site rendering:

- `NEXT_PUBLIC_SANITY_PROJECT_ID=qjcf272e`
- `NEXT_PUBLIC_SANITY_DATASET=ritualmaker`

**Local `pnpm build`:** without those variables in `.env.local`, `next build` will fail during page data collection. Use `cp .env.example .env.local` and fill values, or run **`pnpm check`** for a compile-only build (see [`BUILD_NOTES.md`](./BUILD_NOTES.md)).

To enable Stripe checkout you also need:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

## Sanity setup

The dataset is shared inside the existing `qjcf272e` Sanity project. Schemas live in `src/sanity/schemas/`. To deploy schema changes:

```bash
pnpm sanity:deploy-schema
```

CORS for local + production must include both origins. Use the Sanity MCP `add_cors_origin` tool, or the [Sanity dashboard](https://sanity.io/manage).

## Stripe setup

For each bouquet you can either:

1. **Inline pricing (simplest):** leave `stripePriceId` blank in Sanity. The `/api/checkout` route will create an inline `price_data` line item from the `priceCents` field on the bouquet.
2. **Pre-created Stripe products:** create products + prices in the Stripe dashboard and paste the price IDs into the bouquet documents in Sanity. Better for analytics but no functional difference for buyers.

The webhook endpoint is `/api/stripe/webhook`. Add it in the Stripe dashboard once the site is live and put the resulting signing secret in `STRIPE_WEBHOOK_SECRET`.

## Cutover plan (no-lapse swap from Webflow)

See [`docs/cutover.md`](./docs/cutover.md).

## Project structure

See [`docs/internal/01_ARCHITECTURE_MAP.md`](./docs/internal/01_ARCHITECTURE_MAP.md). Core layout:

```
src/app/           pages + API (farm-stand, proposal, admin, checkout, studio)
src/components/    UI
src/lib/           Supabase, Stripe, client documents, PDF
src/sanity/        CMS schemas and queries
supabase/migrations/
docs/internal/     system index, routing protocol, worklog
```
