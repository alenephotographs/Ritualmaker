# Ritualmaker — Pass 04D Live Stand-Closed QA Proof

**Date:** 2026-06-10
**Base:** `main` @ `58bde864af3fea6b9fff5b5ef9fe42ac0f89d378` (PR #11 merged)
**Mode:** Live-data verification + proof artifacts (no app code changes)

---

## URLs and deploy

| Item | Value |
| --- | --- |
| Production URL | https://ritualmakerny.com |
| Local proof URL | http://localhost:3002 (main @ 58bde86, `vr38n49n` / `production` env) |
| Production deployed SHA | `58bde864af3fea6b9fff5b5ef9fe42ac0f89d378` |

---

## Sanity standStatus before / during / after

| Phase | `qjcf272e` / `ritualmaker` | `vr38n49n` / `production` (live storefront CMS) |
| --- | --- | --- |
| **Before** | `open` | **no `siteSettings` document** (standStatus unavailable → defaults to open) |
| **During proof** | temporarily `closed` for adapter sanity, then `open` | temporary `siteSettings` doc `_id: siteSettings`, `standStatus: closed` |
| **After restore** | `open` | **deleted** temporary `siteSettings` doc (restored to absent / pre-proof) |

**Product data:** No `flowerProduct` fields (`active`, `inStock`, `shipsNationwide`, prices, slugs) were modified.

**Note:** Live production reads **`vr38n49n` / `production`**. The adapter repo documents `qjcf272e` / `ritualmaker` for Studio/settings history; only the production project affects ritualmakerny.com shop behavior.

---

## Live SKU snapshot (`vr38n49n` / `production`, `active && inStock`)

| Count | Value |
| --- | --- |
| Total live SKUs | 6 |
| Stand-only (`shipsNationwide !== true`) | 3 |
| Shipped (`shipsNationwide === true`) | 3 |

| Slug | Name | Shipped |
| --- | --- | --- |
| `glimmer` | Glimmer | no (stand-only) |
| `blessing` | Blessing | no (stand-only) |
| `abundance` | Abundance | no (stand-only) |
| `garden-oil` | Garden Oil | yes |
| `botanical-sugar` | Botanical Sugar | yes |
| `herbal-tea` | Herbal Tea | yes |

Stand-only proof slug: **`glimmer`**
Shipped proof slug: **`garden-oil`**

---

## Proof ceiling

| Check | Result |
| --- | --- |
| Production live closed UI (ritualmakerny.com) | **Not fully verified live** — production lacked a public `siteSettings` doc before proof; temporary doc was required and removed after QA |
| Closed-boundary UI + API | **Verified on local main @ 58bde86** against live `vr38n49n` product data + temporary public `siteSettings` |
| Admin Gear 1 checklist screenshot | **Missing** — requires owner admin session |
| Stripe live checkout completion | **Not run** — blocked stand-only via API only; no payment captured |

---

## Behavior results (local @ 58bde86 + live Sanity)

### Farm stand (`/farm-stand`)

- Closed-season banner present
- Stand-only SKUs hidden from shop grid
- Shipped SKUs remain visible (`garden-oil`, `botanical-sugar`, `herbal-tea`)
- Header `standClosed: true`

### Stand-only PDP (`/farm-stand/product/glimmer`)

- Unavailable / stand-closed state
- No purchase CTA
- Back-to-shop path present

### Shipped PDP (`/farm-stand/product/garden-oil`)

- Remains purchasable (ships nationwide copy intact)

### Cart / checkout API

```http
POST /api/checkout
{"items":[{"itemType":"flowerProduct","itemId":"iA3Eg1v50p1NFdwLFewf6p","quantity":1}]}
→ HTTP 409
"The farm stand is closed for the season. Stand pickup items cannot be checked out online right now. Shipped items marked for nationwide delivery may still be available."
```

### Hero / header / footer / home copy

- “24/7” softened to seasonal language when closed
- Hero CTA → “Shop shipped items”

### Success copy (`/checkout/success` without session)

- Uses softened **unknown** fulfillment copy (does not assume stand pickup)

### Open-state regression (after restore `standStatus: open`)

- Stand-only SKUs visible again
- `standClosed: false`
- “24/7” tagline returns when open
- Production HTML confirmed Glimmer visible after restore

---

## Screenshots

Saved under `docs/internal/proof/screenshots/`:

| File | Description |
| --- | --- |
| `rm-pass-04d-farm-stand-closed-desktop.png` | Shop grid with closed banner; shipped-only listing |
| `rm-pass-04d-farm-stand-closed-mobile.png` | Mobile farm stand closed state |
| `rm-pass-04d-stand-only-product-closed-desktop.png` | Glimmer PDP unavailable when closed |
| `rm-pass-04d-shipped-product-available-desktop.png` | Garden Oil PDP still available |
| `rm-pass-04d-checkout-blocked-stand-closed.png` | Documented 409 checkout block (API-verified) |
| `rm-pass-04d-hero-closed-language-desktop.png` | Homepage hero seasonal closed copy |
| `rm-pass-04d-success-copy-shipped-or-softened.png` | Success page softened unknown copy |
| `rm-pass-04d-restored-original-state.png` | Open stand regression after restore |

**Missing:** `rm-pass-04d-admin-gear-one-checklist.png` (owner admin login required)

---

## Founder follow-up (production enablement)

To activate stand-closed boundaries on **production** without code changes:

1. In Sanity project **`vr38n49n` / `production`**, create/publish a singleton **`siteSettings`** document (Studio or API).
2. Toggle `standStatus` between `open`, `restocking`, and `closed` as needed.
3. Confirm public GROQ can read `*[_type == "siteSettings"][0].standStatus` (use `_id: "siteSettings"` — custom dotted IDs were permission-omitted during QA).

---

## Verification (repo)

| Check | Result |
| --- | --- |
| `git diff --check` | PASS |
| `pnpm typecheck` | PASS |
| `pnpm test` | PASS (15/15) |
| `ALLOW_BUILD_WITHOUT_SANITY=1 pnpm build` | PASS |
