# Ritualmaker — Architecture Map

Companion to [`00_SYSTEM_INDEX.md`](./00_SYSTEM_INDEX.md). Describes runtime shape as of **2026-05-20**.

---

## High-level diagram

```mermaid
flowchart TB
  subgraph clients [Clients]
    Browser[Browser / QR phone]
    Studio[Sanity Studio /studio]
  end

  subgraph vercel [Vercel — Next.js 14 App Router]
    Pages[Server Components pages]
    API[Route Handlers /api/*]
    Auth[NextAuth /api/auth]
  end

  subgraph data [Data & payments]
    Sanity[(Sanity dataset ritualmaker)]
    Supabase[(Supabase Postgres + Storage)]
    Stripe[Stripe API]
    Shippo[Shippo USPS rates]
    IG[Instagram Graph API]
  end

  Browser --> Pages
  Browser --> API
  Studio --> Sanity
  Pages --> Sanity
  Pages --> Supabase
  API --> Sanity
  API --> Supabase
  API --> Stripe
  API --> Shippo
  Pages --> IG
  Auth --> Supabase
```

---

## Data ownership split

| Concern | Sanity | Supabase |
|---------|--------|----------|
| Site copy, FAQs, reviews, archive photos | ✓ | — |
| Bouquets, pantry, flower products, vendors (catalog) | ✓ | vendors table also (Connect state) |
| Wedding / on-location inquiries | ✓ (`weddingInquiry`) | — |
| UX CTA analytics events | ✓ (`uxEvent`) | — |
| **Client proposals & invoices** | legacy `eventOrder` (dashboard only) | ✓ **`client_documents`** (canonical) |
| Vendor sign-in codes | mirrored in Sanity vendor docs | ✓ `vendors` |
| Product image uploads (admin) | ✓ assets | optional storage bucket |

**Rule of thumb:** public catalog and marketing → **Sanity**; money + proposal lifecycle + CRM rows → **Supabase** + **Stripe**.

---

## Public route map

| Path | Module | Notes |
|------|--------|-------|
| `/` | `src/app/page.tsx` | Home, FAQ, Instagram |
| `/farm-stand` | `src/app/farm-stand/page.tsx` | Shop grid |
| `/farm-stand/product/[slug]` | product detail | Stripe buy CTA |
| `/photography` | portfolio | Local + Sanity |
| `/on-location` | Live Collage™, inquiries | TM mark |
| `/proposal/[token]` | hosted proposal | `noindex`, token auth |
| `/checkout/success`, `/cancel` | post-Stripe | |
| `/studio` | embedded Sanity | |
| `/shop`, `/pantry`, `/weddings`, … | `next.config.mjs` redirects | Legacy URLs |

---

## Admin route map

| Path | Audience | Backend |
|------|----------|---------|
| `/admin/sign-in` | owner + vendors | NextAuth credentials |
| `/admin` | redirect hub | |
| `/admin/(portal)/dashboard` | owner (+ vendor scoped) | Sanity via `loadAdminDashboardData` |
| `/admin/(portal)/products` | catalog CRUD | Sanity API routes |
| `/admin/(portal)/orders` | stand orders | Sanity + Stripe |
| `/admin/(portal)/payments` | Connect status | Stripe + Supabase vendors |
| `/admin/(portal)/weddings` | inquiries | Sanity |
| `/admin/events` | **owner only** | Supabase `listClientDocuments` |
| `/admin/events/new`, `[id]` | proposal editor | Supabase + Stripe admin APIs |

---

## API surface (grouped)

**Commerce**

- `POST /api/checkout` — Stripe Checkout Session (bouquet / pantry / flowerProduct)
- `POST /api/stripe/webhook` — `checkout.session.completed`, etc.
- `GET/POST /api/stripe/connect/*` — Connect onboarding links

**Proposals**

- `GET /api/proposal/[token]/view|pdf|checkout|approve`
- `CRUD /api/admin/client-documents/*` — PDF, Stripe invoice, payment links, sync

**Admin CMS**

- `/api/admin/flower-products`, `vendors`, `products`, `sales-records`, `event-orders`

**Other**

- `POST /api/inquiries` — wedding / on-location / photography forms
- `POST /api/analytics/cta` — UX events

---

## Auth model

```
Owner:  email ∈ ADMIN_ALLOWED_EMAILS + ADMIN_OWNER_ACCESS_CODE
Vendor: email + per-vendor access_code (Supabase vendors + Sanity)
```

JWT session fields: `role` (`owner` | `vendor`), `vendorId` (vendors only).

---

## Key libraries

| Path | Role |
|------|------|
| `src/lib/db.ts` | Supabase ORM-style helpers |
| `src/lib/stripe.ts` | Stripe singleton |
| `src/lib/clientDocument*.ts` | Proposal payload, money, payment stale state |
| `src/lib/proposalLifecycleLogic.ts` | Lifecycle derivation |
| `src/lib/pdf/` | `@react-pdf/renderer` documents |
| `src/sanity/client.ts` | Public read client |
| `src/sanity/writeClient.ts` | Token write (admin uploads) |

---

## Deployment

- **Hosting:** Vercel (production domain `ritualmakerny.com` per cutover plan)
- **Build:** `next build` requires `NEXT_PUBLIC_SANITY_*` unless `ALLOW_BUILD_WITHOUT_SANITY=1` (local only)
- **DB:** `supabase link` + `supabase db push` for migrations in `supabase/migrations/`

---

## Root repository map

```
/workspace
├── src/app/              # App Router pages + API routes
├── src/components/       # UI
├── src/lib/              # Server helpers (db, stripe, pdf, …)
├── src/sanity/           # CMS schemas, queries, types
├── supabase/migrations/  # Postgres DDL
├── scripts/              # One-off Sanity maintenance
├── docs/                 # External + internal docs
├── public/               # Static assets (photography portfolio)
├── sanity.config.ts
├── next.config.mjs       # redirects, images, proposal noindex
├── BUILD_NOTES.md
└── README.md
```
