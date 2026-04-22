# Ritualmaker

The Next.js + Sanity + Stripe rebuild of [ritualmakerny.com](https://ritualmakerny.com), replacing the prior Webflow site with no lapse to the QR-code stand checkout flow.

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

```
src/
  app/
    layout.tsx                root layout, fonts, header/footer
    page.tsx                  long-scroll home
    shop/page.tsx             dedicated shop
    gallery/page.tsx          archive.boutique gallery
    checkout/{success,cancel}
    api/checkout/route.ts     creates Stripe Checkout Sessions
    api/stripe/webhook/       handles checkout.session.completed
    studio/                   embedded Sanity Studio at /studio
  components/                 React UI
  lib/                        formatters + Stripe singleton
  sanity/
    client.ts                 Sanity client + image URL builder
    env.ts                    runtime env validation
    queries.ts                GROQ queries
    schemas/                  document schemas
    types.ts                  TypeScript types for queried docs
sanity.config.ts              Studio configuration
```
