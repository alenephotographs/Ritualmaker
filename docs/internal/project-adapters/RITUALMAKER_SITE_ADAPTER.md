# Ritualmaker Site Adapter

Status: internal project adapter (Pass 04B)
Completion stage: source-ready / audit-backed — not production-verified
Scope: ritualmakerny.com public site + commerce architecture
Public use: prohibited — internal routing and proof standard
Canonical protocol: Founder-Control-Logic `docs/internal/UNIVERSAL_SITE_ARCHITECTURE_PROTOCOL.md`
Rollout reference: Founder-Control-Logic `docs/internal/CROSS_REPO_SITE_ARCHITECTURE_ROLLOUT_PLAN_04A.md`

---

## Adapter identity

```text
Repo name: Ritualmaker
GitHub org/repo: alenephotographs/Ritualmaker
Site / sphere type: Seasonal flower stand + garden pantry + on-location floristry + photography field rental
Public domain(s): https://ritualmakerny.com
App root: repo root (Next.js 14 App Router)
CMS: Sanity project qjcf272e, dataset ritualmaker
Physical stand: 38 Miller Hill Road, Hudson Valley, NY
Adapter owner: Founder / Ritualmaker
Last verified date: 2026-06-10 (Pass 04B read-only audit)
Completion stage of this adapter: source-ready
```

---

## Public promise (buyer-safe)

Ritualmaker sells seasonal flowers and small-batch pantry goods from a self-serve Hudson Valley stand, ships marked pantry items nationwide when configured, and takes inquiries for on-location floristry and photography. Availability is seasonal and manual — what is listed in the shop reflects Sanity `active` + `inStock` toggles, not live shelf counts. Stand pickup, cash/Venmo sales, and website checkout are separate channels.

---

## Physical-world business model

| Layer | What it is | Site role |
| --- | --- | --- |
| **Farm stand** | Self-serve shelf at 38 Miller Hill Road; cash/Venmo + website checkout | `/farm-stand`, `/farm-stand/product/[slug]` |
| **Garden production** | Seasonal blooms, pantry inputs | Internal ops — not auto-synced to storefront |
| **Shipped pantry/flowers** | USPS via Shippo when `shipsNationwide: true` | Checkout collects US address + shipping line item |
| **On-location floristry** | Weddings, pop-ups, hospitality, Live Collage™ | `/on-location` → inquiry form |
| **Photography** | Field rental, sessions, wedding coverage | `/photography` → inquiry form |
| **Proposals / events** | Client documents, deposits, event orders | `/proposal/[token]` (private), `/admin/events/*` (owner) |

**Do not conflate:** stand cash sales, shelf FCFS pickup, and website Stripe checkout as one inventory pool on the public site.

---

## Seasonal product model

| Concept | Source | Public behavior |
| --- | --- | --- |
| **Canonical SKU** | Sanity `flowerProduct` | Glimmer / Blessing / Abundance (flowers) + Botanical Sugar / Herbal Tea / Garden Oil (pantry presets in `src/lib/requiredOfferings.ts`) |
| **Listed** | `active == true` | Required for public GROQ |
| **Available now** | `inStock == true` | Required for public GROQ + checkout 409 if false |
| **Stand season** | `siteSettings.standStatus` | `open` \| `restocking` \| `closed` — header CTA label only today |
| **Shipping mode** | `shipsNationwide` | US shipping via Shippo vs stand/pickup copy |
| **Quantity** | Optional Sanity number | Admin notebook — **does not** gate storefront or checkout |
| **Legacy types** | `bouquet`, `pantryItem` | Still in schema + `/api/checkout`; **not** loaded on live shop (`bouquets={[]}`) |

Seasonal honesty rule: never imply always-in-stock, 24/7 fresh inventory, or specific varieties unless Sanity data and founder ops support it.

---

## Primary money routes

| Route | Product / offer | Primary CTA | Fulfillment type |
| --- | --- | --- | --- |
| `/farm-stand#shop` | Seasonal bouquets + pantry SKUs | Add to cart → Stripe Checkout | Stand pickup, local pickup metadata, or Shippo USPS |
| `/farm-stand/product/[slug]` | Single SKU detail | Add to cart / Buy | Same as shop |
| `/on-location` | Wedding/event/pop-up floristry | Submit inquiry | Form → Sanity `weddingInquiry` |
| `/photography` | Field rental / sessions / coverage | Submit inquiry | Form → Sanity `weddingInquiry` |
| `/proposal/[token]` | Event proposal deposit/balance | Pay via Stripe (token) | Stripe webhook → Supabase / Sanity event order |

---

## Public trust routes

| Route | Role | Primary action |
| --- | --- | --- |
| `/` | Orientation — stand hero, Instagram, FAQ | Shop → `/farm-stand#shop` |
| `/farm-stand#visit` | Local visit / directions / outreach | Maps, Instagram, Google profile |
| `/#faq` | Boundary / operational FAQ | Read (Sanity `faq` docs) |
| `/checkout/success` | Post-purchase utility | Stand pickup instructions |
| `/checkout/cancel` | Abandoned checkout utility | Return to shop |

---

## Footer routes

| Route | Role | Why footer |
| --- | --- | --- |
| `/farm-stand` | Shop hub | Secondary discovery |
| `/#faq` | FAQ | Operational honesty |
| `/photography` | Service line | Category discovery |
| `/on-location` | Service line | Category discovery |
| Instagram / Facebook / Google / email | Connect | Trust + local presence |

---

## Navigation spine

| Nav label | Route | Role | Surface |
| --- | --- | --- | --- |
| Logo | `/` | Orientation | Header |
| **Shop** (or Stand closed) | `/farm-stand#shop` | Primary commerce CTA | Header button |
| Cart | `/farm-stand#cart` | Commerce utility | Header |
| **Farm stand** | `/farm-stand` | Product / money | Category tab |
| **Photography** | `/photography` | Lead / service | Category tab |
| **On location** | `/on-location` | Lead / service | Category tab |

Source: `src/components/HeaderClient.tsx`, `src/components/RitualmakerCategoryNav.tsx`, `src/components/Footer.tsx`.

---

## Homepage role

```text
Page: Home
Route: /
Role in site: Orientation — seasonal stand invitation + social proof (Instagram) + FAQ
Visitor question: What is Ritualmaker and can I buy flowers or visit the stand today?
Primary action: Shop → /farm-stand#shop
Secondary routes: /farm-stand, /photography, /on-location, #faq
Evidence/proof available: StandStatus pill, hero tagline from Sanity, FAQ from CMS
What homepage must not do: Imply guaranteed stock; claim 24/7 availability when stand is season-closed without qualifying copy; invent SKUs/prices; expose admin/studio paths as buyer CTAs
Visual proof required: yes — hero, stand status, mobile category nav, FAQ accordion
Screenshot paths: docs/internal/proof/screenshots/rm-pass-* (convention — none captured in 04B)
```

---

## Product page pattern (repo-specific)

```text
Default pattern: Shop grid card → optional PDP at /farm-stand/product/[slug] → cart panel → Stripe Checkout
Primary CTA style: "Add to cart" / checkout — not multi-product comparison grid
Alternate path rule: Instagram to confirm stand stock; /on-location for custom floristry; /photography for field rental
Forbidden equal-card grid: Do not present farm stand, photography, and on-location as equal checkout products on one page
Honesty / limits copy source: Sanity product fields + farm-stand intro copy + checkout success pickup instructions
Fulfillment copy rule: "Ships within the US" only when shipsNationwide; otherwise stand · FCFS / local pickup framing
```

---

## Route architecture map

### `/` — Home

```text
Page: Home
Route: /
Role in site: Orientation / router
Visitor question: What is Ritualmaker and is the stand worth a visit?
Primary action: Shop
Secondary routes: /farm-stand, /photography, /on-location, #faq
Evidence/proof available: Hero, StandStatus, Instagram feed, Sanity FAQs
What this page must not do: Manifesto overclaim; fake inventory; internal vocabulary
Visual proof required: yes — desktop + mobile hero and nav
```

### `/farm-stand` — Shop hub

```text
Page: Farm stand shop
Route: /farm-stand
Role in site: Product / money route (primary)
Visitor question: What can I buy right now — flowers, pantry, shipped items?
Primary action: Add to cart → checkout
Secondary routes: #visit, /on-location, Instagram confirm stock
Evidence/proof available: Live Sanity flowerProduct list (active + inStock)
What this page must not do: Show unavailable SKUs; imply stand is open when products are stale; merge shipped and stand items without labels
Visual proof required: yes — product cards, out-of-stock empty state, cart, mobile
```

### `/farm-stand/product/[slug]` — Product detail

```text
Page: Product detail
Route: /farm-stand/product/[slug]
Role in site: Product / money route (single SKU)
Visitor question: What is this offering and how do I buy it?
Primary action: Add to cart / buy
Secondary routes: Back to /farm-stand#shop
Evidence/proof available: Sanity product document
What this page must not do: Render inactive or out-of-stock products (404); invent descriptions not in CMS
Visual proof required: yes — PDP desktop + mobile
```

### `/photography` — Photography services

```text
Page: Photography
Route: /photography
Role in site: Lead / service inquiry
Visitor question: Can I rent the field or book photography sessions?
Primary action: Submit photography inquiry form
Secondary routes: Portfolio images (static), /on-location
Evidence/proof available: Static portfolio paths in src/lib/photographyPortfolio.ts
What this page must not do: Imply guaranteed availability; quote prices not in inquiry flow
Visual proof required: yes — form + portfolio section
```

### `/on-location` — On-location floristry

```text
Page: On location
Route: /on-location
Role in site: Lead / service inquiry
Visitor question: Do you do weddings, pop-ups, or Live Collage for my event?
Primary action: Submit on-location inquiry form
Secondary routes: /farm-stand, /photography
Evidence/proof available: Service copy blocks; JSON-LD service schema
What this page must not do: Promise dates/outcomes; conflate with stand SKU checkout
Visual proof required: yes — service sections + form
```

### `/checkout/success` and `/checkout/cancel`

```text
Page: Checkout result
Route: /checkout/success | /checkout/cancel
Role in site: Utility / post-purchase
Visitor question: What do I do after paying (or if I cancelled)?
Primary action: Read pickup instructions / return to shop
Secondary routes: Maps, Google, Instagram, /farm-stand
Evidence/proof available: Stand address copy
What this page must not do: Imply order shipped when stand pickup; index in search (noindex set)
Visual proof required: recommended for success pickup copy
```

### `/proposal/[token]` — Hosted proposal (semi-public)

```text
Page: Client proposal
Route: /proposal/[token]
Role in site: Utility / post-quote commerce (token-gated)
Visitor question: What am I approving and paying for?
Primary action: Approve / pay deposit or balance
Secondary routes: PDF download
Evidence/proof available: Supabase client document + generated PDF
What this page must not do: Leak without token; appear in sitemap (noindex)
Visual proof required: owner QA only — not general public marketing
```

---

## Public / private boundary

| Surface | Access | Must not |
| --- | --- | --- |
| Marketing + shop routes | Public | Expose admin URLs as CTAs |
| `/studio` | Sanity login (embedded Studio; robots noindex) | Treat as customer-facing shop admin |
| `/admin/*` | NextAuth owner/vendor | Appear in nav/footer/sitemap |
| `/api/admin/*` | Session-gated | Unauthenticated write |
| `/api/checkout`, `/api/inquiries` | Public POST with validation | Fake success without persistence |
| Internal ops docs | `docs/internal/`, `docs/operations/` | Publish verbatim as marketing |

**Note:** Root layout wraps `/studio` with public Header/Footer — studio inherits marketing chrome (see audit).

---

## Product / inventory boundary

```text
Public truth = Sanity flowerProduct where active && inStock && card-complete (title + price)
Operational truth = founder manual toggles + stand shelf + cash sales (not auto-synced)
standStatus = marketing/CTA signal only — does not hide products or block checkout today
quantity field = admin notebook only
Legacy bouquet/pantryItem = checkout API compatibility — not live shop source
Required offerings seed = creates missing canonical SKUs on owner dashboard load only; does not overwrite existing stock/price
```

Reference: `docs/internal/RITUALMAKER_INVENTORY_TRUTH_AUDIT_01.md`

---

## Local pickup / delivery / shipping boundary

| Mode | When | Checkout behavior | Public copy |
| --- | --- | --- | --- |
| **Stand FCFS** | `shipsNationwide` false | US address collection for metadata; pickup at stand | "Stand · FCFS", Instagram confirm |
| **Nationwide ship** | `shipsNationwide` true | Shippo USPS rate line item; requires ship address | "Ships within the US" |
| **On-location delivery** | Custom events | Inquiry form — not cart checkout | `/on-location` services copy |
| **Cash/Venmo at stand** | Physical | Not website checkout | Do not imply website captures stand cash sales |

Success page assumes **stand pickup** for local flow — verify copy when cart is ship-only.

---

## Sanity / data source boundary

| Data | Authority | Consumer |
| --- | --- | --- |
| `flowerProduct` | Sanity CMS | Shop, checkout, admin products |
| `siteSettings` | Sanity singleton | Header, hero, footer, stand status |
| `faq` | Sanity documents | Home FAQ section |
| `weddingInquiry` | Sanity (write via API) | Inquiry forms, admin weddings/events |
| `flowerSalesRecord` | Sanity (webhook write) | Sales ledger post-Stripe |
| Photography portfolio | Static files in `public/photography/portfolio/` | `/photography` |
| Hero fallback image | Static `/photos/` + optional Sanity hero | Home, metadata OG |
| Instagram feed | Meta Graph API (env) | Home section |
| Proposals | Supabase `client_documents` (+ Sanity legacy event orders) | `/proposal/[token]`, admin events |

**Env minimum:** `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`. Stripe + Shippo + Supabase optional per feature.

---

## Checkout / order boundary

```text
Cart: in-memory client state (ShopCartContext) — not server session cart
Checkout: POST /api/checkout → Stripe Checkout Session (hosted)
Availability gate: 409 if active/inStock false at checkout time
Webhook: /api/stripe/webhook → flowerSalesRecord (idempotent) + proposal/event side effects
Inventory: no automatic inStock decrement on sale
Connect: transfer_data when single vendor stripeAccountId applies
Ritual bundle: $3 off each pantry line when cart has flower + pantry (src/lib/ritualBundle.ts)
```

Do not claim order/inventory sync beyond Stripe + Sanity sales records without verifying live ops.

---

## Visual proof standard

```text
Screenshot storage path: docs/internal/proof/screenshots/rm-pass-*
Desktop width target: 1440×900 (or ≥1280)
Mobile width target: 390×844
Preview URL pattern: Vercel preview or https://ritualmakerny.com
Required SHA in proof packet: yes for production-verified claims
Failure patterns to watch: stand closed + shop open mismatch; cards without images; shipped vs stand label confusion; studio wrapped in marketing header
```

Reference: Founder-Control-Logic `docs/internal/VISUAL_OBSERVATION_AND_SCREENSHOT_PROOF_GATE.md`

---

## Forbidden terms / claims (public)

### Forbidden internal terms

```text
sphere
wedge
gravity
topology
metasystem
doctrine
proof gate
operating system
```

### Forbidden public claims (unless proven in Sanity / founder ops)

```text
Always in stock / 24/7 fresh flowers when standStatus is closed or inStock is false
Specific flower varieties or bouquet sizes not in live CMS
Delivery/shipping range beyond shipsNationwide + Shippo US
Website inventory equals stand shelf count
Cash/Venmo stand sales reflected automatically in online stock
Invented SKU names (e.g. "Daily Ritual") not in requiredOfferings or Sanity
Guaranteed wedding/event dates or outcomes from inquiry forms alone
Press, awards, or testimonials not sourced from CMS review docs
```

---

## Deploy / production verification rules

```text
Preview deploy provider: Vercel
Production domain: https://ritualmakerny.com
How to confirm deployed SHA: GitHub Production deployment or Vercel dashboard; optional x-vercel-id headers
What counts as production-verified: live DOM + SHA match + screenshots — not source-ready audit alone
Founder sign-off required for: seasonal availability copy, stand-closed behavior, checkout boundary changes
```

---

## Known repo-specific risks

```text
standStatus closed does not block checkout or hide inStock products
Hero/tagline default "24/7" can overclaim when stand is season-closed
Manual inStock/active toggles with no sales-driven decrement
Legacy bouquet/pantry checkout paths still live in API
Product PDP URLs omitted from sitemap.ts
/studio renders inside public Header/Footer shell
README references obsolete /shop route — live shop is /farm-stand
No automated test script in package.json
Prior inventory audit (RITUALMAKER_INVENTORY_TRUTH_AUDIT_01) predates adapter; findings incorporated here
```

---

## Risk classification (adapter-level)

| Area | Level | Notes |
| --- | --- | --- |
| Checkout / Stripe | **Medium** | Live money path; webhook + 409 gate |
| Inventory truth | **Medium** | Manual booleans; ops-dependent honesty |
| Sanity CMS | **Medium** | Public catalog source of truth |
| Auth / admin | **Medium** | Per-route NextAuth; no middleware |
| Inquiry forms | **Low–medium** | Sanity write; no email delivery verified in 04B |
| Photography / on-location | **Low** | Lead forms only |
| Public copy overclaim | **Medium** | Seasonal + 24/7 drift |

---

## First safe implementation pass (recommended)

**Pass 04C — Stand status + shop/checkout boundary alignment**

Scope (suggested):

1. When `standStatus === "closed"`, block or strongly gate checkout for non-`shipsNationwide` items (or hide stand-only SKUs) — founder decision required.
2. Align hero/tagline/JSON-LD defaults with seasonal stand messaging when closed.
3. Document Gear 1 manual pre-open checklist in ops doc linked from admin dashboard (no automation).
4. Visual proof: stand open/closed, empty shop, shipped vs stand cards, mobile cart.

**Out of scope for first pass:** automatic inventory sync, legacy type removal, Supabase order migration, studio layout refactor.

---

## Transfer checklist

```text
[x] Adapter file created from template
[x] Route table matches live routes in code (2026-06-10)
[x] Forbidden terms aligned with public copy boundary
[x] Screenshot proof folder convention declared (rm-pass-*)
[ ] System index / agent entry updated (future pass)
[ ] Not claiming automation is enforced until CI exists
```
