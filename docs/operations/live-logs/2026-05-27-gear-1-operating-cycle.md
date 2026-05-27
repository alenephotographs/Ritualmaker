# Ritualmaker bloom & harvest log — first live Gear 1 cycle

**Date:** 2026-05-27  
**Logged by:** _[founder name — not yet provided]_  
**Session:** [ ] pre-open  [x] setup / field notes  [ ] mid-day  [ ] end-of-day  
**Cycle type:** First live Gear 1 operating cycle (docs-only log; no Sanity or inventory changes by this pass)

**Related workflow:** `docs/operations/ritualmaker-stand-availability-workflow-v0-1.md`  
**Template source:** `docs/operations/ritualmaker-bloom-harvest-log-template-v0-1.md`

**No-touch reminder:** This log captures operational truth only. Filling it does not update the website, Sanity, checkout, or inventory.

---

## Active planting update (founder-reported)

**Truth state:** Current active planting update — logged 2026-05-27.

| Field | Value |
| --- | --- |
| Crop | Cannabis (2 seedlings) |
| Planted | Outside, **2026-05-26** (yesterday relative to log date) |
| Location | Behind the vegetable garden, slightly downhill |
| Hydrology | Where water from the vegetable garden and general slope drains through before continuing downhill |
| Light | Full sun until plants fall into the house shadow |
| Nearest reference | Closest to broccoli and Brussels sprouts in the raised bed |
| Public / shop relevance | **None** — internal garden production only; not a storefront SKU |

**Next action (monitor):**

- [ ] Waterlogging after rain or irrigation (drainage path zone)
- [ ] Transplant shock (new outdoor placement)
- [ ] Animal pressure
- [ ] Legal / privacy / security considerations (placement, visibility, access)

**Seed ledger follow-up:** Consider adding this zone to `ritualmaker-seed-tracking-database-v0-1.md` when founder confirms variety/ID and long-term placement — _not done in this pass._

---

## Founder update — 2026-05-27 (field + sales notes)

_Reported same day as log; sale occurred **the other day** (~2026-05-25 / 2026-05-26 — exact date not confirmed)._

### Garden / bloom

- **Ranunculus:** More coming on in the round (additional stems/flushes expected).
- **Peonies:** Buds getting larger — not harvest-ready; **leave to grow**.
- **First ranunculus bouquet:** Sold for **$12** — founder notes this was the **first ranunculus bouquet** of the season (likely aligns with Glimmer-tier pricing; confirm SKU in Admin if logging formally).

### Stand / neighbor

- A **neighbor left a jar** at the stand (gift / return — not a sale). Contents and pantry-SKU relevance **not yet specified**.

### Revenue follow-up (Gear 1)

- [ ] Log **$12 ranunculus bouquet** in Admin → Settings → **Record walk-up sale** if not already entered (`itemName` e.g. “Ranunculus bouquet” or matching `publicName`).
- [ ] Note payment method (cash / venmo / other): _[not yet provided]_
- [ ] Reconcile shelf / optional `quantity` if that bouquet came off the stand

---

## Weather context

- Overnight low / daytime high: _[not yet provided]_
- Rain / frost / wind / heat note: _[not yet provided]_
- Watering done? [ ] yes  [ ] no  [ ] partial
- Protection needed? (row cover, shade, extra water): _[not yet provided — watch cannabis drainage zone after rain]_

---

## Beds / zones checked

| Zone / bed | Checked? | General condition |
| --- | --- | --- |
| Behind vegetable garden — downhill drainage (cannabis ×2) | [x] noted | New outdoor plantings 2026-05-26; monitor hydrology |
| Raised bed — broccoli / Brussels sprouts | [ ] | Nearest reference to cannabis placement; _condition not yet logged_ |
| Vegetable garden (general) | [ ] | _[not yet provided]_ |
| Roadside / cut-flower zones (see seed ledger) | [x] partial | Ranunculus — more in the round; peony buds enlarging |
| Stand shelf (38 Miller Hill Road) | [ ] | _[not yet provided]_ |

---

## Blooming now

What is visibly in flower (not necessarily cut-ready).

- **Ranunculus** — in production; first $12 bouquet sold the other day; more stems coming on in the round
- **Peonies** — buds getting larger; stage: [x] bud  [ ] peak  [ ] fading — not cut-ready
- Zone: _[bed/zone label not yet provided]_
- Notes: First ranunculus bouquet of season = sales + content milestone

---

## Harvestable today

What you would actually cut for bouquets / stand within the next few hours.

| Crop / variety | Zone | Est. stems | Target SKU (Glimmer / Blessing / Abundance / other) |
| --- | --- | --- | --- |
| Ranunculus | _[zone TBD]_ | More in the round | Glimmer ($12) or ad hoc — first sale logged |
| Peonies | _[zone TBD]_ | Buds only — not yet | Hold — buds enlarging |

**Founder judgment:** stems long enough? cool enough to cut? worth the cut? — _[not yet provided]_

---

## Leave to grow / leave for seed

- Cannabis seedlings (behind veg garden, downhill) — **leave**; just planted; monitor only
- **Peonies** — buds enlarging; do not cut until founder judgment says ready
- **Ranunculus** — leave remaining flush to size up where not yet cut for stand

---

## Damaged / fading / discard

- _[not yet provided]_

---

## Bouquet potential vs stand-ready

| Tier / SKU | Potential bouquets (field) | Stand-ready now (packed/on shelf) |
| --- | --- | --- |
| Glimmer (small) | Ranunculus flush building | 1 sold ~$12 the other day; rest TBD |
| Blessing (standard) | _[not yet provided]_ | _[not yet provided]_ |
| Abundance (premium) | _[not yet provided]_ | _[not yet provided]_ |
| Pantry / other | _[not yet provided]_ | _[not yet provided]_ |

**Rule of thumb:** Potential ≠ stand-ready. Only stand-ready counts for `quantity` and customer promises.

---

## Stand availability workflow (same day)

_Pre-open / mid-day / end-of-day checklist — not yet run for 2026-05-27._

| Step | Status |
| --- | --- |
| Stand walk | _[not yet provided]_ |
| Bloom/harvest log (this doc) | **Started** — planting update captured |
| Product readiness (Sanity SKUs) | _[not yet provided]_ |
| `siteSettings.standStatus` / `standMessage` | _[not yet provided — Studio only]_ |
| `flowerProduct` active / inStock / quantity | _[not yet provided]_ |
| Cash / direct sales review | **Partial** — $12 ranunculus bouquet noted; confirm Admin log |
| Stripe / website orders review | _[not yet provided]_ |
| Photo / content capture | _[not yet provided]_ |
| End-of-day reset | _[not yet provided]_ |

---

## Content / photo opportunities

- [x] Bouquet in hand / at stand — **first ranunculus bouquet** (sold; photo may be retrospective)
- [ ] Pantry jar / process shot — neighbor left a jar; contents TBD
- [ ] Before/after harvest
- Notes for caption (seasonal, no overpromise): _[not yet provided]_

---

## Sanity updates needed

Punch list after field truth — partial from founder notes.

| Action | SKU / setting | Field | New intent |
| --- | --- | --- | --- |
| Log first ranunculus sale | _manual record_ | flowerSalesRecord | $12 — date ~2026-05-25/26 if not in Admin |
| Peonies | — | — | Do not list until harvest-ready |

---

## Cash / direct sales to log

| Time | Item (use publicName) | Amount | Method (cash/venmo/other) | Logged in Admin? |
| --- | --- | --- | --- | --- |
| ~2026-05-25/26 | Ranunculus bouquet (first of season) | $12.00 | _[cash/venmo/other — TBD]_ | [ ] confirm in Admin |

---

## Next watering / protection note

- **Cannabis zone:** Watch for waterlogging where veg-garden and slope drainage converges; check seedlings after next rain or irrigation.
- **General:** _[not yet provided]_
- Watch list (beds stressing, forecast): _[not yet provided]_

---

## End-of-day snapshot

- Shelf empty? [ ] yes  [ ] partial  [ ] n/a  [ ] not checked
- Field carryover for tomorrow: Cannabis monitoring; **ranunculus flush + peony bud watch**; log $12 sale in Admin if missing; note neighbor jar
- One-line summary: **First ranunculus bouquet sold ($12); more ranunculus coming on; peony buds sizing up; neighbor left jar at stand.**

---

## Four-truths reconciliation (Gear 1)

| Truth | Status on 2026-05-27 |
| --- | --- |
| Garden | Partial — cannabis, ranunculus flush, peony buds logged |
| Stand | Partial — neighbor jar noted; ranunculus sale |
| Website (Sanity) | Not reviewed this cycle — no changes authorized by this pass |
| Revenue | Partial — $12 ranunculus sale reported; Admin log unconfirmed |

---

## Founder fill-in queue

Sections marked _[not yet provided]_ should be completed on the next stand day or field walk. Priority after cannabis monitoring notes:

1. Weather + beds checked (full garden pass)
2. Harvestable today + bouquet/stand-ready counts
3. Stand walk + Sanity punch list
4. Cash and Stripe reconciliation
