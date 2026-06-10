# Ritualmaker — Site / Business System Audit (Pass 04B)

**Date:** 2026-06-10
**Mode:** Read-only adapter + audit — no public fixes, no Sanity mutations, no checkout changes
**Repo:** alenephotographs/Ritualmaker
**Production domain:** https://ritualmakerny.com
**Adapter:** `docs/internal/project-adapters/RITUALMAKER_SITE_ADAPTER.md`
**Canonical protocol:** Founder-Control-Logic Universal Site Architecture Protocol
**Prior internal audit:** `docs/internal/RITUALMAKER_INVENTORY_TRUTH_AUDIT_01.md` (2026-05-27) — inventory truth model; findings retained and cross-referenced here.

---

## Executive summary

Ritualmaker is a **Next.js 14 + Sanity + Stripe** seasonal commerce site with three public service lines (farm stand shop, photography inquiries, on-location floristry) and a separate admin/proposal layer. The **canonical sellable SKU is `flowerProduct`**; the live shop at `/farm-stand` loads only `active && inStock` products. **Highest drift risks** are operational, not missing code paths: (1) `standStatus: closed` changes header CTA only — it does not hide products or block checkout; (2) default tagline/hero implies **24/7** availability while stand can be season-closed; (3) **`inStock` is manual** with no decrement on website or cash sales; (4) legacy `bouquet`/`pantryItem` checkout paths remain while shop uses `flowerProduct` only.

**04B outcome:** Adapter + audit complete. **No blockers** prevent merging this documentation pass. **No production visual proof** captured in 04B. Recommended first implementation pass: **04C stand-status ↔ shop/checkout boundary alignment**.

---

## Route inventory (public)

| Route | File | Indexed | Role |
| --- | --- | --- | --- |
| `/` | `src/app/page.tsx` | yes | Home — hero, Instagram, FAQ |
| `/farm-stand` | `src/app/farm-stand/page.tsx` | yes | Primary shop |
| `/farm-stand/product/[slug]` | `src/app/farm-stand/product/[slug]/page.tsx` | dynamic | Product detail (404 if inactive/OOS) |
| `/photography` | `src/app/photography/page.tsx` | yes | Photography + inquiry |
| `/on-location` | `src/app/on-location/page.tsx` | yes | On-location services + inquiry |
| `/checkout/success` | `src/app/checkout/success/page.tsx` | noindex | Post-Stripe success |
| `/checkout/cancel` | `src/app/checkout/cancel/page.tsx` | noindex | Abandoned checkout |
| `/proposal/[token]` | `src/app/proposal/[token]/page.tsx` | noindex | Token-gated client proposal |
| `/studio` | `src/app/studio/[[...tool]]/page.tsx` | noindex | Embedded Sanity Studio |

**Sitemap (`src/app/sitemap.ts`):** `/`, `/farm-stand`, `/photography`, `/on-location` — **product slugs omitted**.

**Robots (`src/app/robots.ts`):** disallows `/studio`, `/api/`, `/checkout/`, `/admin`.

**Admin (private):** `/admin/sign-in`, `/admin/dashboard`, `/admin/orders`, `/admin/products`, `/admin/weddings`, `/admin/payments`, `/admin/media`, `/admin/settings`, `/admin/events/*`.

---

## Verification (04B)

| Check | Result |
| --- | --- |
| `git diff --check` | **PASS** (on docs branch vs main, after doc add) |
| `pnpm typecheck` | **PASS** |
| `ALLOW_BUILD_WITHOUT_SANITY=1 pnpm build` | **PASS** |
| `pnpm test` / `npm test` | **ABSENT** — no test script in `package.json` |
| `pnpm lint` | Not run (not in required list) |

Local `node_modules` installed for verification. Full build with live Sanity requires `.env.local` per `BUILD_NOTES.md`.

---

## Findings by audit category

Classification key: **blocker** · **launch polish** · **later** · **no action**

---

### 1. Route role clarity

| Finding | Class | Evidence |
| --- | --- | --- |
| Three-line nav (Farm stand / Photography / On location) clearly separates commerce vs inquiry paths | **no action** | `RitualmakerCategoryNav.tsx` |
| Home routes to shop via hero CTA; FAQ on same page | **no action** | `Hero.tsx`, `page.tsx` |
| `/farm-stand` is live shop; README still mentions obsolete `/shop` | **launch polish** | `README.md` vs `farm-stand/page.tsx` |
| Product PDPs exist but not in sitemap — SEO/discovery gap | **launch polish** | `sitemap.ts` |
| `/studio` uses root layout Header/Footer around NextStudio | **launch polish** | `layout.tsx` + `studio/[[...tool]]/page.tsx` |

---

### 2. Product / inventory truth

| Finding | Class | Evidence |
| --- | --- | --- |
| Public shop uses `flowerProduct` with GROQ `active && inStock` | **no action** | `publicFlowerProductsQuery` in `queries.ts` |
| `quantity` does not affect storefront or checkout | **no action** | `flowerProduct.ts`, inventory audit |
| Website + cash sales do not decrement `inStock` | **launch polish** | webhook writes `flowerSalesRecord` only |
| Cards can render without images (gradient fallback) while admin save may require images | **launch polish** | `shopProduct.ts`, `BouquetGrid.tsx` |
| Legacy `bouquet`/`pantryItem` still in checkout API; shop passes `bouquets={[]}` | **later** | `api/checkout/route.ts`, `farm-stand/page.tsx` |
| `ensureRequiredOfferings()` seeds Glimmer/Blessing/Abundance + pantry presets | **no action** | `requiredOfferings.ts` — verify live Sanity matches before claiming stock |

---

### 3. Seasonal availability and local sales clarity

| Finding | Class | Evidence |
| --- | --- | --- |
| Farm-stand intro states FCFS + Instagram to confirm stock | **no action** | `farm-stand/page.tsx` |
| `standStatus: closed` changes header to "Stand closed" but **does not** block checkout or hide SKUs | **launch polish** | `Header.tsx`, inventory audit |
| Default tagline "Fresh flowers in the neighborhood, **24/7**" conflicts with seasonal stand closure | **launch polish** | `siteSettings.ts`, `Hero.tsx` |
| Checkout success assumes stand pickup at 38 Miller Hill Road even for shipped carts — copy may mislead | **launch polish** | `checkout/success/page.tsx` |
| Empty flower SKU banner when only pantry live — helpful admin hint | **no action** | `farm-stand/page.tsx` |

---

### 4. Sanity / CMS schema and data integrity

| Finding | Class | Evidence |
| --- | --- | --- |
| Schemas registered: flowerProduct, siteSettings, faq, weddingInquiry, vendor, flowerSalesRecord, legacy bouquet/pantryItem | **no action** | `src/sanity/schemas/index.ts` |
| Site settings singleton drives stand status, contact, hero | **no action** | `siteSettings.ts` |
| FAQ content CMS-driven — not hardcoded | **no action** | `FAQSection.tsx`, `faqsQuery` |
| Required offerings seed does not overwrite existing price/stock | **no action** | `ensureRequiredOfferings()` comment + logic |
| Studio at `/studio` is public URL (Sanity auth); robots noindex only | **launch polish** | `robots.ts`, studio page |
| No 04B live Sanity document audit performed — preset SKUs may differ from production CMS | **proof missing** | read-only code audit only |

---

### 5. Checkout / cart / order flow risk

| Finding | Class | Evidence |
| --- | --- | --- |
| Stripe Checkout Session server-side; cart in client memory | **no action** | `BouquetGrid.tsx`, `api/checkout/route.ts` |
| Checkout returns 409 when product unavailable at submit time | **no action** | `isUnavailable()` in checkout route |
| Shippo USPS line item when `shipsNationwide` + address | **no action** | `shippo.ts`, `BouquetGrid.tsx` |
| Webhook idempotent `flowerSalesRecord` creation | **no action** | `api/stripe/webhook/route.ts` |
| Supabase `orders` table exists but app primarily uses Stripe + Sanity | **later** | `supabase/migrations/00004_commerce.sql` |
| Ritual bundle discount ($3/pantry line with flower in cart) | **no action** | `ritualBundle.ts` |
| No automated tests for checkout paths | **later** | no test script |

---

### 6. Pickup / delivery / shipping boundaries

| Finding | Class | Evidence |
| --- | --- | --- |
| `shipsNationwide` gates Shippo vs stand copy on cards | **no action** | `BouquetGrid.tsx`, product schema |
| Farm-stand page explains nationwide vs stand/pickup split | **no action** | `farm-stand/page.tsx` |
| On-location services use inquiry — not cart | **no action** | `on-location/page.tsx` |
| Success page pickup steps may not fit shipped-only orders | **launch polish** | `checkout/success/page.tsx` |
| No public claim of delivery radius beyond US shipping flag | **no action** | code review — no forbidden range copy found |

---

### 7. Contact / form behavior

| Finding | Class | Evidence |
| --- | --- | --- |
| Photography + on-location forms POST `/api/inquiries` → Sanity `weddingInquiry` | **no action** | `api/inquiries/route.ts` |
| Validation: name, email required; service/kind enums | **no action** | inquiries route |
| No Resend/email outbound verified in 04B — persistence is Sanity-only | **launch polish** | inquiries route (no mailer import) |
| Contact outreach block on farm stand `#visit` uses Sanity contact links | **no action** | `ContactOutreachBlock.tsx`, `siteContact.ts` |
| Footer email/Instagram/Facebook/Google from siteSettings | **no action** | `Footer.tsx` |

---

### 8. Header / nav / footer coherence

| Finding | Class | Evidence |
| --- | --- | --- |
| Header: logo, cart, Shop/Stand closed, mobile nav | **no action** | `HeaderClient.tsx` |
| Category tabs consistent desktop + mobile scroll | **no action** | `RitualmakerCategoryNav.tsx` |
| Footer duplicates farm stand under Shop and Ritualmaker columns | **launch polish** | `Footer.tsx` — minor redundancy |
| FAQ linked from footer as `/#faq` | **no action** | `Footer.tsx` |
| No admin/studio links in public nav | **no action** | header/footer review |

---

### 9. CTA hierarchy

| Finding | Class | Evidence |
| --- | --- | --- |
| Primary commerce CTA: header **Shop** → `/farm-stand#shop` | **no action** | `HeaderClient.tsx` |
| Home hero secondary: ritual bundle note + shop | **no action** | `Hero.tsx` |
| Service pages end in inquiry forms — correct lead hierarchy | **no action** | photography/on-location pages |
| Stand closed label on CTA but shop still reachable | **launch polish** | standStatus vs checkout boundary |
| No equal-weight product grid across three service lines | **no action** | separate routes |

---

### 10. Visual density / mobile readability

| Finding | Class | Evidence |
| --- | --- | --- |
| Responsive shop grid with auto-fit minmax cards | **no action** | `BouquetGrid.tsx` |
| Mobile category nav horizontal scroll | **no action** | `RitualmakerCategoryNav` mobile-scroll variant |
| Hero min-h 88vh with overlay text — verify mobile legibility | **proof missing** | code-only; no screenshots in 04B |
| Studio embedded in full marketing layout — cramped on small screens | **launch polish** | root layout + NextStudio |

---

### 11. Public / private boundary

| Finding | Class | Evidence |
| --- | --- | --- |
| Admin portal gated via NextAuth per layout/API | **no action** | `admin/(portal)/layout.tsx`, `adminAuth.ts` |
| Owner-only `/admin/events/*` and client-documents API | **no action** | admin events pages |
| `/proposal/[token]` token-gated; noindex | **no action** | proposal layout/page |
| `/studio` noindex but publicly reachable URL | **launch polish** | relies on Sanity login |
| Internal docs under `docs/internal/` not exposed via routes | **no action** | path review |
| Forbidden internal terms absent from `src/` | **no action** | grep pass |

---

### 12. Missing proof / screenshots

| Gap | Class |
| --- | --- |
| No `docs/internal/proof/screenshots/rm-pass-*` captures | **proof missing** |
| No production SHA verification in 04B | **proof missing** |
| No live Sanity SKU snapshot vs `requiredOfferings` | **proof missing** |
| No mobile/desktop renders for stand open/closed, cart, shipped card | **proof missing** |
| Prior inventory audit was code-only (2026-05-27) | **no action** — superseded by this pass for adapter linkage |

---

## Summary tables

### Blockers

**None** for completing Pass 04B documentation. No code changes required to merge adapter + audit.

*(Operational honesty gaps below are launch polish — not merge blockers for this docs pass.)*

### Launch polish

1. Align `standStatus: closed` with shop visibility and/or checkout for stand-only SKUs
2. Reconcile "24/7" tagline/hero with seasonal stand closure copy
3. Checkout success copy for shipped-only orders vs stand pickup
4. Product PDP URLs in sitemap (optional SEO)
5. Studio route without marketing Header/Footer wrapper
6. Inquiry forms — confirm founder notification path (Sanity-only today)
7. README route drift (`/shop` → `/farm-stand`)
8. Visual proof pass (04F-style) for stand open/closed, mobile cart, shipped labels

### Later

1. Remove or deprecate legacy `bouquet`/`pantryItem` checkout paths
2. Automated inventory sync / sales-driven `inStock` decrement (Gear 2+)
3. Supabase orders table adoption vs Stripe+Sanity ledger
4. Automated test suite for checkout and inquiries
5. Card image requirement parity (storefront vs admin save rules)

### No-action confirmations

- Three-route service architecture is coherent (shop vs inquiry split)
- `flowerProduct` + `active`/`inStock` GROQ is the documented public truth model
- Checkout 409 unavailable gate exists
- Shippo integration scoped to `shipsNationwide`
- Forbidden internal vocabulary not present in public `src/`
- Admin/auth boundaries use NextAuth per-route guards
- Ritual bundle discount logic is intentional and documented in code
- Required offerings seed preserves existing CMS edits

---

## Boundary findings (condensed)

### Product / inventory

- **Public boundary:** Sanity `flowerProduct` where `active && inStock &&` card-complete.
- **Not public truth:** `quantity`, cash sales, stand shelf count, garden production state.
- **Drift:** `standStatus` and hero 24/7 copy vs manual `inStock`.

### Checkout / order

- **Public boundary:** Stripe hosted checkout; webhook → `flowerSalesRecord`.
- **Not guaranteed:** inventory decrement, email confirmations, Supabase order row.
- **Drift:** success page pickup copy for all fulfillment modes.

### Sanity / data

- **Public boundary:** CMS documents queried on marketing/shop routes + static photography assets.
- **Private boundary:** admin APIs, vendor docs, internal ops markdown.
- **Gap:** 04B did not diff live Sanity against `requiredOfferings` presets.

---

## Recommended first implementation PR

**Title (suggested):** `fix: align stand-closed state with shop and checkout boundaries`

**Scope (Pass 04C):**

1. When stand is closed, hide or block checkout for stand-only (`!shipsNationwide`) SKUs — **founder decision on exact UX**.
2. Soften hero/tagline/metadata defaults when `standStatus === "closed"`.
3. Branch checkout success copy for shipped vs stand pickup.
4. Add Gear 1 manual checklist link on admin dashboard (docs-only ops reference).
5. Visual proof packet with `rm-pass-04c-*` screenshots.

**Explicitly out of scope:** schema migration, auto inventory, legacy type deletion, studio layout refactor.

---

## No-code-change statement

Pass 04B created **documentation only**: project adapter + this audit. No application code, Sanity schema, checkout, or deployment changes were made.

---

## Related artifacts

| Artifact | Path |
| --- | --- |
| Site adapter | `docs/internal/project-adapters/RITUALMAKER_SITE_ADAPTER.md` |
| Inventory truth audit (prior) | `docs/internal/RITUALMAKER_INVENTORY_TRUTH_AUDIT_01.md` |
| Stand availability workflow | `docs/operations/ritualmaker-stand-availability-workflow-v0-1.md` |
| Gear 1 operating rituals | `docs/internal/RITUALMAKER_GEAR_1_OPERATING_RITUALS.md` |
| Next safe action queue | `docs/internal/RITUALMAKER_NEXT_SAFE_ACTION_QUEUE.md` |

---

## ChatGPT acceptance

**Complete** for Pass 04B adapter + read-only audit deliverables.

**Partial** for overall Ritualmaker rollout proof — production visual verification and live Sanity SKU audit remain open (Pass 04F / ops verification).
