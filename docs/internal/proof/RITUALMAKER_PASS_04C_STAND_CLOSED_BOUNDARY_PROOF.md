# Ritualmaker — Pass 04C Stand-Closed Boundary Proof

**Date:** 2026-06-10
**Branch:** `fix/stand-closed-shop-checkout-boundaries-04c`
**Mode:** Implementation + unit-test proof (visual capture deferred)

---

## Summary

Aligns `siteSettings.standStatus === "closed"` with shop listing, product detail, cart/checkout API, success copy, hero/footer taglines, and admin Gear 1 checklist.

**standStatus source:** Sanity `siteSettings.standStatus` via `siteSettingsQuery` (`open` | `restocking` | `closed`).

---

## Behavior (founder default)

| Surface | When stand closed |
| --- | --- |
| **Shop listing** | Stand-only SKUs hidden (`shipsNationwide !== true`); shipped SKUs remain if `active && inStock` |
| **Product detail** | Stand-only: unavailable banner, no purchase CTA; shipped: unchanged |
| **Cart / checkout** | Stand-only lines blocked client-side + `409` from `/api/checkout` |
| **Success page** | Branches on Stripe `metadata.fulfillmentMode` (`pickup` / `shipped` / `mixed` / softened `unknown`) |
| **Hero / footer** | Softens taglines containing “24/7”; hero CTA → “Shop shipped items” |
| **Home JSON-LD** | Omits 24/7 `openingHoursSpecification` when closed |
| **Admin dashboard** | Gear 1 manual checklist (owner only) |

---

## Files changed

- `src/lib/standAvailability.ts` — boundary helpers
- `src/lib/checkoutSuccessCopy.ts` — success messaging
- `src/lib/standAvailability.test.ts` — 15 unit tests
- `src/app/farm-stand/page.tsx`, `src/app/farm-stand/product/[slug]/page.tsx`
- `src/components/BouquetGrid.tsx`, `src/components/Hero.tsx`, `src/components/Footer.tsx`
- `src/app/page.tsx`, `src/app/checkout/success/page.tsx`
- `src/app/api/checkout/route.ts`
- `src/components/AdminDashboard.tsx`
- `package.json` — `test` script + `tsx` devDependency

---

## Verification

| Check | Result |
| --- | --- |
| `git diff --check` | PASS |
| `pnpm typecheck` | PASS |
| `pnpm test` | PASS (15/15) |
| `ALLOW_BUILD_WITHOUT_SANITY=1 pnpm build` | PASS |

---

## Screenshots

**Not captured in 04C** — local dev requires `.env.local` with Sanity credentials; attempted Playwright captures returned blank/error pages without env.

**Deferred to Pass 04F (production visual):**

- `rm-pass-04c-farm-stand-closed-desktop.png`
- `rm-pass-04c-farm-stand-closed-mobile.png`
- `rm-pass-04c-stand-only-product-closed-desktop.png`
- `rm-pass-04c-shipped-product-available-desktop.png`
- `rm-pass-04c-checkout-blocked-stand-closed.png`
- `rm-pass-04c-success-copy-shipped-or-softened.png`

Capture after deploy with Sanity `standStatus: closed` and at least one `shipsNationwide` SKU live.

---

## No-code-change boundaries preserved

- No Sanity schema changes
- No inventory decrement automation
- No legacy bouquet/pantry deprecation
- No Supabase order migration
