# Ritualmaker — Pass 04F Production siteSettings Live Toggle Proof

**Date:** 2026-06-10  
**Base:** `main` @ `a9e81faf8d7eba1ae11f027a8d5d89fa23ab8e43` (after PR #12 and PR #13 merge)  
**Mode:** Founder CMS setup + production proof (no app code changes)

---

## URLs and deploy

| Item | Value |
| --- | --- |
| Production URL | https://ritualmakerny.com |
| Sanity project / dataset | `vr38n49n` / `production` |
| Production deployed SHA (closed verification window) | `18acaec868fcaa42a5404080f89f0912c565c05b` (PR #12 proof doc; stand-closed logic from PR #11) |
| Production deployed SHA (proof end) | `a9e81faf8d7eba1ae11f027a8d5d89fa23ab8e43` (PR #13 docs-only; no shop logic delta) |

---

## siteSettings before / during / after

| Phase | Timestamp (UTC) | `siteSettings` exists | `standStatus` | Production behavior |
| --- | --- | --- | --- | --- |
| **Before** | 2026-06-10 ~19:55 | **No** | N/A (defaults open) | `standClosed: false`; stand-only SKUs visible; “24/7” tagline |
| **During (closed)** | **2026-06-10T19:57:31Z** | **Yes** (`_id: "siteSettings"`) | **`closed`** | Closed banner; stand-only hidden; shipped visible; checkout 409 for stand-only |
| **After restore** | **2026-06-10T19:59:34Z** | **Yes** (singleton retained) | **`open`** | `standClosed: false`; Glimmer + all 6 SKUs visible; “STAND OPEN” pill; “24/7” footer tagline |

**Operator action:** Created and published the required `siteSettings` singleton in `vr38n49n` / `production`, toggled `standStatus` to `closed` for live proof, then restored to `open`. The singleton **remains published** (intentional production enablement per Pass 04E).

**Product data:** No `flowerProduct` fields (`active`, `inStock`, `shipsNationwide`, prices, slugs) were modified.

**ISR note:** After restore to `open`, production HTML still served closed state for ~60–70s until Next.js revalidation (`revalidate = 60`) caught up. Public GROQ returned `standStatus: "open"` immediately.

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

Stand-only proof slug: **`glimmer`** (`itemId`: `iA3Eg1v50p1NFdwLFewf6p`)  
Shipped proof slug: **`garden-oil`**

---

## Production verification while closed

### Farm stand (`/farm-stand`)

- Closed-season banner present (“closed for the season”)
- `standClosed: true` in rendered payload
- Stand-only SKUs (Glimmer, Blessing, Abundance) hidden from grid
- Shipped SKUs (Garden Oil, Botanical Sugar, Herbal Tea) remain visible with “Ships within the US · Card checkout”

### Stand-only PDP (`/farm-stand/product/glimmer`)

- Unavailable / stand-closed state
- No “Add to cart” CTA
- “Back to shop” path present

### Shipped PDP (`/farm-stand/product/garden-oil`)

- Remains purchasable
- “Ships within the US · Card checkout” copy intact

### Cart / checkout API

```http
POST https://ritualmakerny.com/api/checkout
Content-Type: application/json

{"items":[{"itemType":"flowerProduct","itemId":"iA3Eg1v50p1NFdwLFewf6p","quantity":1}]}

→ HTTP 409
"The farm stand is closed for the season. Stand pickup items cannot be checked out online right now. Shipped items marked for nationwide delivery may still be available."
```

In-browser cart UI block not exercised end-to-end; API 409 documented with screenshot proof page.

### Hero / header / footer / home copy (while closed)

- Homepage: no “24/7” hero tagline; seasonal / “Shop shipped” language
- Farm stand header: closed-season messaging (no “STAND OPEN” pill)

### Success copy

- **Not fully verified on production** with a live Stripe checkout session (proof ceiling)
- Pass 04D verified softened unknown copy locally; production success page not re-tested with payment session in 04F

---

## Production verification after restore (`standStatus: open`)

| Check | Result |
| --- | --- |
| `/farm-stand` | `standClosed: false`; Glimmer + all stand-only SKUs visible |
| Stand status pill | “STAND OPEN · Fresh batch on the stand now” |
| Footer tagline | “Fresh flowers in the neighborhood, 24/7” |
| Public GROQ | `*[_type == "siteSettings"][0]{_id, standStatus}` → `open` |

---

## Screenshots

Saved under `docs/internal/proof/screenshots/`:

| File | Description |
| --- | --- |
| `rm-pass-04f-production-farm-stand-closed-desktop.png` | Production shop grid while closed; shipped-only listing |
| `rm-pass-04f-production-farm-stand-closed-mobile.png` | Mobile farm stand closed state |
| `rm-pass-04f-production-stand-only-pdp-closed.png` | Glimmer PDP unavailable when closed |
| `rm-pass-04f-production-shipped-pdp-available.png` | Garden Oil PDP still available when closed |
| `rm-pass-04f-production-checkout-blocked-closed.png` | Documented 409 checkout block (API-verified proof page) |
| `rm-pass-04f-production-hero-closed-language.png` | Homepage hero seasonal closed copy |
| `rm-pass-04f-production-restored-state.png` | Open stand regression after restore (`STAND OPEN`, Glimmer visible) |
| `rm-pass-04f-production-site-settings-studio-redacted.png` | Studio landing capture (redacted; Site Settings doc UI not in frame) |

---

## Proof ceiling

| Check | Result |
| --- | --- |
| Production responds to published `siteSettings.standStatus` | **Verified live** |
| Closed-boundary UI + API on ritualmakerny.com | **Verified live** |
| In-browser cart UI checkout block | **Partial** — API 409 only |
| Live Stripe checkout → success copy branch | **Not run** — no payment captured |
| Admin Gear 1 checklist screenshot | **Missing** — owner admin session required |
| Studio Site Settings doc screenshot | **Partial** — landing page only |

---

## No-secret statement

This proof doc and committed screenshots contain **no** API keys, Sanity tokens, Stripe secrets, or Vercel env values. CMS changes were made via authenticated operator tooling; credentials were not written to the repo.

---

## Verification (repo)

| Check | Result |
| --- | --- |
| `git diff --check` | PASS |
| `pnpm typecheck` | PASS |
| `pnpm test` | PASS |
| `ALLOW_BUILD_WITHOUT_SANITY=1 pnpm build` | PASS |

---

## Related

- PR #11 — stand-closed shop/checkout boundaries (`58bde86`)
- PR #12 — Pass 04D live QA proof (`18acaec`)
- PR #13 — Pass 04E operator setup card (`a9e81fa`)
- `docs/internal/operator-setup/RITUALMAKER_SITESETTINGS_SINGLETON_SETUP_04E.md`
