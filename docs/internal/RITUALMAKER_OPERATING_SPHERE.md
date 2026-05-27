# Ritualmaker Operating Sphere

**Mode:** Internal operating-system map. Not public/customer copy.

**Last updated:** 2026-05-27

**No-touch boundary:** This document does not authorize product code changes, public copy changes, migrations, checkout/payment changes, inventory mutation, or customer contact.

---

## Ritualmaker sphere identity

Ritualmaker is a physical-world production sphere and seasonal revenue/creative-output sphere. It connects garden production, bouquet and small-batch product production, stand sales, website sales, local buyer trust, photography/content, and founder labor.

It is not the same kind of sphere as Build Control Logic or Boutique Archive. It uses the same operating intelligence but needs a garden/seasonal-production adapter: timing, weather, bloom windows, perishability, cash/direct sales, embodied labor, and visible local trust matter as much as software state.

## Current center of gravity

A seasonal flower and creative production business that turns garden output into local sales, bouquet offerings, photography/content, and small-batch trust-driven commerce.

### State classification

| Area | State | Proof / source |
| --- | --- | --- |
| Website rebuild | Partial / active | README defines Next.js + Sanity + Stripe rebuild replacing Webflow with no lapse to QR-code stand checkout. |
| Stand sales trust path | Proven need / operationally important | Cutover doc treats stand QR checkout downtime as high risk because buyers expect to pay fast at the physical stand. |
| Seed and planting tracking | Partial but now repo-local | `docs/operations/ritualmaker-seed-tracking-database-v0-1.md` exists and contains seed inventory, planting zones, and field ledger rules. |
| Product inventory | Partial | Sanity schemas support flower products, active/in-stock flags, quantities, shipping flag, pricing, gallery, and internal notes. |
| Revenue records | Partial | Sanity has `flowerSalesRecord` with amount, payment method, Stripe IDs, bundle discount, and notes. |
| Website public promise | Needs audit before expansion | Home and farm stand pages contain 24/7, first-come-first-serve, stock-confirmation, local pickup/stand, and shipping language. |
| Weather/season/bloom tracking | Missing/mostly memory-held | No dedicated season/weather/bloom log found in this pass. |
| Photo/content tracking | Partial | Homepage pulls Instagram and gallery/archive photo systems; no seasonal content calendar found. |

---

## Core sphere areas

### 1. Garden production

Includes beds, seeds, plantings, bloom timing, harvest windows, weather risk, succession planting, and crop inventory.

Current source of truth: `docs/operations/ritualmaker-seed-tracking-database-v0-1.md`.

Current weakness: bloom status and harvestable-flower state are still not consolidated into a daily/weekly availability record.

### 2. Flower/product production

Includes bouquets, stems, pantry items, pricing, availability, perishability, packaging, and quality/readiness.

Current source of truth: Sanity product schemas and storefront queries. Product documents can be active/in stock, have price, quantity, recurring status, shipping flag, product images, internal notes, and Stripe IDs.

Current weakness: product truth can diverge from real garden availability unless updated manually.

### 3. Sales channels

Channels include:

- physical flower stand;
- cash/direct payment app sales;
- website/Stripe checkout;
- local pickup/stand purchase;
- shipped items where explicitly marked;
- future custom/event orders.

Current source of truth: Stripe/webhook for website sales; Sanity `flowerSalesRecord` for recorded sales; founder reports for some cash/direct sales.

Current weakness: cash/direct sales are not proven to be fully captured in repo/Sanity.

### 4. Website / public promise

The site currently presents Ritualmaker as a stand/shop system with local stand availability, product checkout, and gallery/content surfaces.

Current weakness: public claims must stay seasonal and conditional. The site should not promise stable ecommerce inventory if the real inventory is perishable, seasonal, local, and manually updated.

### 5. Revenue/accounting

Revenue has at least three lanes:

- website/Stripe;
- stand cash;
- direct payment app/direct sales.

Current weakness: direct revenue and website revenue must remain separated unless the founder explicitly imports or reconciles them.

### 6. Customer trust

Customer trust depends on:

- what is actually available now;
- whether the stand is open/restocking/closed;
- whether stock can be confirmed before visiting;
- whether pickup/shipping promises are precise;
- whether QR checkout works with no lapse.

### 7. Photography/content

Ritualmaker content is operational proof, marketing, garden documentation, and reusable archive material. Photos should serve multiple purposes: product listings, social media, seasonal documentation, and brand memory.

### 8. Founder labor

Founder currently carries much of the reconciliation manually: what was planted, what is blooming, what sold, what is available, what the site implies, what needs posting, and what should be cut or left growing.

### 9. Future/deferred surfaces

Future/deferred surfaces include subscriptions, CSA-style flowers, events, workshops, wedding/custom orders, expanded product shop, seed/plant inventory system, garden map/calendar, and automated availability tracking.

---

## Local operating translation

| Internal term | Ritualmaker translation |
| --- | --- |
| Location | Where the friction/opportunity lives: bed, stand, website, Sanity, Stripe, Instagram, cash log. |
| Motion | How flowers/products/revenue/content move through garden, stand, website, customer, and records. |
| Pressure | Where founder, garden, inventory, weather, customers, or website feel strain. |
| Proof | What is actually known versus remembered, assumed, or planned. |
| Source of truth | The reliable record currently governing decisions. |
| Hidden founder labor | What the founder is manually remembering, reconciling, explaining, deciding, or updating. |
| Next safe action | Smallest useful step that does not overbuild or overpromise. |

---

## No-touch boundaries

This operating sphere does not authorize:

- website code changes;
- public copy edits;
- product publishing;
- checkout/payment changes;
- inventory mutation;
- revenue record mutation;
- customer contact;
- subscription launch;
- delivery promises;
- automated availability claims.
