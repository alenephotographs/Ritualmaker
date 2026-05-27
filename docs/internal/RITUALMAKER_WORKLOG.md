# Ritualmaker Worklog

## 2026-05-27 — Operating-system reentry pass

### Mode

Docs/audit/system architecture only.

### Actions completed

- inspected README;
- inspected cutover plan;
- inspected homepage and farm-stand routes;
- inspected storefront/grid logic;
- inspected Sanity product and sales schemas;
- inspected repo-local seed tracking database;
- created Ritualmaker operating sphere document;
- created next-safe-action queue.

### Key findings

- Ritualmaker already has stronger operational infrastructure than a generic flower stand site.
- The repo already supports:
  - Stripe checkout;
  - stand purchase flow;
  - shipped products;
  - pantry products;
  - sales records;
  - inventory state fields;
  - bundle discount logic;
  - event/custom-order structures.
- Main operational weakness is not missing ecommerce infrastructure.
- Main weakness is truth reconciliation between:
  - garden reality;
  - seasonal timing;
  - stand inventory;
  - Sanity product state;
  - direct/cash sales;
  - website claims.

### Current operational gravity

Seasonal flower and small-batch commerce anchored by local trust and physical-world production.

### Current major pressure

Founder memory/reconciliation burden.

### Files created

- `docs/internal/RITUALMAKER_OPERATING_SPHERE.md`
- `docs/internal/RITUALMAKER_NEXT_SAFE_ACTION_QUEUE.md`
- `docs/internal/RITUALMAKER_WORKLOG.md`

### Blockers

- Dedicated weather/bloom log not found.
- Complete inventory reconciliation workflow not found.
- Direct/cash sales are not proven fully consolidated.
- Some audit-doc creation attempts triggered connector safety filtering.

### No-touch confirmation

No:

- code changes;
- product mutations;
- checkout changes;
- inventory changes;
- public copy deployment;
- customer actions;
- payment-flow mutations.

---

## 2026-05-27 — Inventory truth audit 01

**Mode:** Read-only audit + docs update only
**Agent pass:** Operational inventory truth audit (storefront/product vs seasonal operating model)

### Files read

- `README.md`, `docs/cutover.md`
- `src/app/page.tsx`, `src/app/farm-stand/page.tsx`, `src/app/farm-stand/product/[slug]/page.tsx`
- `src/components/Hero.tsx`, `StandStatus.tsx`, `BouquetGrid.tsx`, `Header.tsx`, `HeaderClient.tsx`
- `src/sanity/queries.ts`, schemas (`flowerProduct`, `flowerSalesRecord`, `siteSettings`, `bouquet`, `pantryItem`)
- `src/lib/shopProduct.ts`, `requiredOfferings.ts`, `ritualBundle.ts`, `adminData.ts`
- `src/app/api/checkout/route.ts`, `stripe/webhook` (sales section), `admin/flower-products`, `admin/sales-records`
- `src/app/admin/(portal)/products/page.tsx`, `dashboard/page.tsx`, `AdminDashboard` (key sections)

### Unavailable at audit time (stale local checkout)

- `docs/operations/ritualmaker-seed-tracking-database-v0-1.md`
- `docs/internal/RITUALMAKER_OPERATING_SPHERE.md`
- `docs/internal/RITUALMAKER_NEXT_SAFE_ACTION_QUEUE.md`
- `docs/internal/RITUALMAKER_SPHERE_MAP.json`
- Prior `docs/internal/RITUALMAKER_WORKLOG.md`

### Files created/updated

- **Created** `docs/internal/RITUALMAKER_INVENTORY_TRUTH_AUDIT_01.md`
- **Created** local worklog draft (merged into this file on reconciliation pass)

### Findings (summary)

1. **`flowerProduct`** is the live shop SKU; visibility = `active && inStock` (GROQ) + title/price (client). `quantity` and `recurringItem` are non-enforcing.
2. **`shipsNationwide`** drives fulfillment UX, not listing eligibility.
3. **`standStatus`** affects header/pill only — not product queries or checkout.
4. **Sales do not update stock** — Stripe webhook and manual cash records append `flowerSalesRecord` only.
5. Public cards may lack images; legacy `bouquet` / `pantryItem` checkout remains; farm-stand uses `bouquets={[]}`.

### Checks run (audit pass)

- `git diff --check` — pass
- `pnpm check` — pass

### No-touch confirmation

Documentation only. No product code, Sanity data, checkout, or inventory changes.

### Recommended next action

Gear 1 manual rituals in audit doc; then Gear 2 admin stand controls + seasonal banner (no checkout automation).

---

## 2026-05-27 — Inventory truth audit reconciliation

### Repo sync status

- **Branch:** `main`
- **Before sync:** local `main` was **5 commits behind** `origin/main` (fast-forwardable)
- **Action:** `git fetch origin`; initial `git pull --ff-only origin main` blocked by untracked local `docs/internal/RITUALMAKER_WORKLOG.md`; moved aside, pull succeeded (`1fd65ef` → `6e29998`)
- **After sync:** local `main` matches `origin/main` for pulled commits; audit artifact retained locally

### Seed-tracking doc after sync

**Found:** `docs/operations/ritualmaker-seed-tracking-database-v0-1.md` (from remote, not present in stale checkout)

### Files confirmed (all present locally post-sync)

- `docs/operations/ritualmaker-seed-tracking-database-v0-1.md`
- `docs/internal/RITUALMAKER_OPERATING_SPHERE.md`
- `docs/internal/RITUALMAKER_NEXT_SAFE_ACTION_QUEUE.md`
- `docs/internal/RITUALMAKER_WORKLOG.md`
- `docs/internal/RITUALMAKER_SPHERE_MAP.json`
- `docs/internal/RITUALMAKER_INVENTORY_TRUTH_AUDIT_01.md`

### Audit file path

`docs/internal/RITUALMAKER_INVENTORY_TRUTH_AUDIT_01.md` — kept as a **specific audit artifact**; does not replace operating sphere or action queue.

### No-touch confirmation

No product code, public copy, Sanity mutation, checkout/payment changes, or inventory mutation. Docs-only reconciliation and commit.

### Checks run

- `git diff --check` — see commit pass
- `pnpm check` — see commit pass

### Next safe action

Commit audit docs; then execute Gear 1 checklist from `RITUALMAKER_INVENTORY_TRUTH_AUDIT_01.md` cross-referenced with `RITUALMAKER_NEXT_SAFE_ACTION_QUEUE.md`.

---

## 2026-05-27 — Gear 1 availability workflow docs

### Mode

Docs / operational workflow only.

### Audit commit pushed

**Yes.** `fb4521fa31ee4907636936e605a538698c083665` pushed to `origin/main` (`6e29998..fb4521f`).

### Files read

- `README.md`
- `docs/internal/RITUALMAKER_OPERATING_SPHERE.md`
- `docs/internal/RITUALMAKER_INVENTORY_TRUTH_AUDIT_01.md`
- `docs/internal/RITUALMAKER_NEXT_SAFE_ACTION_QUEUE.md`
- `docs/internal/RITUALMAKER_WORKLOG.md`
- `docs/internal/RITUALMAKER_SPHERE_MAP.json`
- `docs/operations/ritualmaker-seed-tracking-database-v0-1.md`
- `src/sanity/schemas/flowerProduct.ts`, `flowerSalesRecord.ts`, `siteSettings.ts`
- `src/app/farm-stand/page.tsx`
- `src/components/StandStatus.tsx`, `BouquetGrid.tsx`

### Files created

- `docs/operations/ritualmaker-stand-availability-workflow-v0-1.md`
- `docs/operations/ritualmaker-bloom-harvest-log-template-v0-1.md`
- `docs/internal/RITUALMAKER_GEAR_1_OPERATING_RITUALS.md`

### Files updated

- `docs/internal/RITUALMAKER_WORKLOG.md` (this entry)

### Checks run

- `git diff --check` — see commit pass
- `pnpm check` — see commit pass

### No-touch confirmation

No product code, public copy, Sanity mutation, checkout/payment changes, migrations, or inventory mutation. Uncommitted product work left untouched.

### Recommended next action

Use Gear 1 rituals on the next stand day; after 2–4 weeks of stable manual reconciliation, run Gear 2 implementation pass from `RITUALMAKER_INVENTORY_TRUTH_AUDIT_01.md`.

---

## 2026-05-27 — First live Gear 1 operating cycle log

### Mode

Docs only — live operational log setup; no Sanity, inventory, checkout, or public copy changes.

### Files read

- `docs/internal/RITUALMAKER_OPERATING_SPHERE.md`
- `docs/internal/RITUALMAKER_GEAR_1_OPERATING_RITUALS.md`
- `docs/operations/ritualmaker-stand-availability-workflow-v0-1.md`
- `docs/operations/ritualmaker-bloom-harvest-log-template-v0-1.md`
- `docs/operations/ritualmaker-seed-tracking-database-v0-1.md`
- `docs/internal/RITUALMAKER_WORKLOG.md`

### Files created

- `docs/operations/live-logs/2026-05-27-gear-1-operating-cycle.md`

### Files updated

- `docs/internal/RITUALMAKER_WORKLOG.md` (this entry)

### Known data captured

- Two cannabis seedlings planted outside 2026-05-26; behind vegetable garden, downhill drainage path; full sun until house shadow; nearest broccoli/Brussels sprouts in raised bed; monitor waterlogging, transplant shock, animal pressure, legal/privacy/security.

### Checks run

- `git diff --check` — see commit pass

### No-touch confirmation

No product code, public copy, Sanity mutation, checkout/payment changes, or inventory mutation.

### Recommended next action

Founder completes placeholder sections on next field walk / stand day; optionally backfill seed ledger with cannabis zone when ID/placement is stable.

---

## 2026-05-27 — Live Gear 1 log: ranunculus sale + peony buds

### Mode

Docs only — founder field/sales notes appended to live cycle log.

### Files updated

- `docs/operations/live-logs/2026-05-27-gear-1-operating-cycle.md`
- `docs/internal/RITUALMAKER_WORKLOG.md` (this entry)

### Founder data captured

- $12 ranunculus bouquet sold the other day — first ranunculus bouquet of season
- More ranunculus in the round
- Peony buds getting larger (hold for cut)
- Neighbor left a jar at stand (contents TBD)

### No-touch confirmation

No product code, Sanity, checkout, inventory, or public copy changes.

### Recommended next action

Confirm sale date + payment method; log in Admin → Settings if missing; note what was in neighbor’s jar.

---

## 2026-05-27 — Live Gear 1 log: sale date + empty jar

### Mode

Docs only — founder follow-up on ranunculus sale and neighbor jar.

### Files updated

- `docs/operations/live-logs/2026-05-27-gear-1-operating-cycle.md`
- `docs/internal/RITUALMAKER_WORKLOG.md` (this entry)

### Founder data captured

- Ranunculus bouquet: **2026-05-25**, **$12**, **walk-up cash**
- Neighbor jar: **empty**, left for founder stand/pantry use

### No-touch confirmation

No product code, Sanity, checkout, inventory, or public copy changes.

### Recommended next action

Enter 2026-05-25 cash sale in Admin if not done; reconcile stand `quantity` if tracked.
