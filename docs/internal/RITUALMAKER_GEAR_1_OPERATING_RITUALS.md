# Ritualmaker Gear 1 Operating Rituals

**Date:** 2026-05-27  
**Mode:** Internal ops summary — manual workflows before automation  
**Audience:** Founder + future agent passes

---

## Why Gear 1 comes before automation

The repo already has ecommerce infrastructure (Sanity products, Stripe checkout, sales records, admin quick stock). The **inventory truth audit** (`RITUALMAKER_INVENTORY_TRUTH_AUDIT_01.md`) showed the gap is not missing features — it is **reconciliation**:

- Garden reality ≠ Sanity `inStock`
- Stand shelf ≠ optional `quantity`
- Cash sales ≠ webhook-driven records
- `standStatus` ≠ product visibility
- Public cards can outlive perishable truth by up to ~60 seconds (ISR) plus however long since the last manual edit

Automating decrement or bloom-driven listings **before** manual rituals are stable would encode false confidence and hide founder judgment calls that are still essential (quality, weather, leave-to-grow).

**Gear 1 goal:** Make truth legible and repeatable on paper/docs, with existing Sanity fields as the **manual** publication layer.

---

## Operating rhythm

### Daily (stand / flower sales days)

1. **Bloom & harvest log** — `docs/operations/ritualmaker-bloom-harvest-log-template-v0-1.md`
2. **Stand availability workflow** — `docs/operations/ritualmaker-stand-availability-workflow-v0-1.md` (pre-open → mid-day → end-of-day)
3. **Revenue touch:** log cash; scan Stripe orders; align shelf counts

### Weekly

- Review Admin → Products issue badges (missing image, out of stock, legacy category)
- Roll up bloom log: gaps, drift patterns, seed ledger corrections
- Cross-check `RITUALMAKER_NEXT_SAFE_ACTION_QUEUE.md` priority 1 items

### Seasonal

- Open season: verify core SKUs exist (Glimmer, Blessing, Abundance); images current
- Close season: season-close ritual in stand workflow doc
- Pantry shipping may continue — isolate `shipsNationwide` SKUs from stand-only flowers

---

## Four truths — keep separate, reconcile deliberately

```text
Garden truth     →  bloom/harvest log + seed ledger
Stand truth      →  physical shelf + optional quantity
Website truth    →  Sanity active/inStock + standStatus pill
Revenue truth    →  Stripe webhook records + manual flowerSalesRecord
```

| Truth | Source of truth (Gear 1) | Drift signal |
| --- | --- | --- |
| Garden | Bloom log, seed tracking doc | Cutting list surprises, empty beds |
| Stand | Stand walk, quantity notebook | Customer arrives, shelf empty |
| Website | Sanity after your edit | Instagram “still available?” DMs |
| Revenue | Orders + manual sales form | End-of-day cash ≠ records |

**Reconciliation rule:** Website may only claim in-stock what stand + fulfillment can honor **today**. When in doubt, toggle `inStock: false` first; explain on Instagram if needed.

---

## What Gear 2 should wait for

Do **not** start Gear 2 implementation until Gear 1 shows:

| Proof | Threshold (suggested) |
| --- | --- |
| Pre-open checklist used | ≥10 stand days without “website lied” incidents |
| Bloom log maintained | Field notes exist for most selling days |
| Cash sales logged | Stand cash/Venmo captured in Admin same day |
| `quantity` semantics agreed | You use it consistently OR explicitly ignore it |
| Season close executed once | Flowers off site when stand closed |

Gear 2 scope (from audit — **still no checkout automation**):

- Admin UI for `standStatus` / `standMessage`
- Farm-stand banner when stand not open
- Stale-stock warnings in admin
- Optional “updated at” on cards
- Manual sales → product picker

---

## Next implementation threshold

**Ready for Gear 2 code pass when:**

1. This doc + stand workflow + bloom template are in active use (not shelfware).
2. You can point to a week of bloom logs and matching Sanity edit timestamps.
3. No unresolved high-severity drift from audit (sold-out shelf + `inStock: true`) for several consecutive selling days.

**Still not ready for Gear 3 when:**

- Cash sales are sometimes skipped in Admin
- `quantity` and shelf count routinely disagree
- Flower listings stay `inStock: true` after season close

---

## Doc map (Gear 1 kit)

| Document | Role |
| --- | --- |
| `RITUALMAKER_OPERATING_SPHERE.md` | Sphere identity, pressures, no-touch boundaries |
| `RITUALMAKER_INVENTORY_TRUTH_AUDIT_01.md` | Code/storefront truth model |
| `ritualmaker-seed-tracking-database-v0-1.md` | Garden / planting ledger |
| `ritualmaker-stand-availability-workflow-v0-1.md` | Stand + Sanity manual ritual |
| `ritualmaker-bloom-harvest-log-template-v0-1.md` | Daily field log template |
| `RITUALMAKER_NEXT_SAFE_ACTION_QUEUE.md` | Prioritized queue |
| `RITUALMAKER_SPHERE_MAP.json` | Machine-readable sphere snapshot |

---

## No-touch confirmation

Gear 1 is **documentation and founder ritual only**. It does not authorize agents to mutate Sanity, inventory, checkout, or public copy.
