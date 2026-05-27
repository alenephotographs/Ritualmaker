# Ritualmaker Bloom & Harvest Log Template v0.1

**Repo:** `alenephotographs/Ritualmaker`  
**Mode:** Repeatable field log — Gear 1  
**Use:** Copy one block per day (paper, Notes app, or new dated section in a running doc)

**Feeds into:** `ritualmaker-stand-availability-workflow-v0-1.md` (pre-open checklist)  
**Cross-reference:** `ritualmaker-seed-tracking-database-v0-1.md` (beds, zones, plant IDs)

**No-touch boundary:** Logging only. Does not update Sanity, inventory, or the website by itself.

---

## How to use

1. Fill **before** the stand walk on days you sell flowers.
2. Keep entries short — bullets beat paragraphs.
3. “Sanity updates needed” is your punch list for Admin / Studio after field truth is clear.
4. Unknown plant IDs stay unknown; link to seed ledger corrections instead of guessing.

---

## Daily log template (copy below)

```markdown
# Ritualmaker bloom & harvest log

**Date:** YYYY-MM-DD
**Logged by:**
**Session:** [ ] pre-open  [ ] mid-day  [ ] end-of-day

---

## Weather context

- Overnight low / daytime high:
- Rain / frost / wind / heat note:
- Watering done? [ ] yes  [ ] no  [ ] partial
- Protection needed? (row cover, shade, extra water):

---

## Beds / zones checked

List zones from seed ledger or your own shorthand.

| Zone / bed | Checked? | General condition |
| --- | --- | --- |
| e.g. roadside zinnia strip | [ ] | |
| e.g. raised planter — stock | [ ] | |
| e.g. tulip / spring patch | [ ] | |

---

## Blooming now

What is visibly in flower (not necessarily cut-ready).

- Variety / crop:
- Zone:
- Stage: [ ] bud  [ ] peak  [ ] fading
- Notes:

---

## Harvestable today

What you would actually cut for bouquets / stand within the next few hours.

| Crop / variety | Zone | Est. stems | Target SKU (Glimmer / Blessing / Abundance / other) |
| --- | --- | --- | --- |
| | | | |

**Founder judgment:** stems long enough? cool enough to cut? worth the cut?

---

## Leave to grow / leave for seed

Do **not** cut these today — note why.

- Crop / zone — reason (next flush, seed saving, weak stand, experiment):

---

## Damaged / fading / discard

- Pest, heat, rain damage, blown blooms, broken stems:

---

## Bouquet potential vs stand-ready

| Tier / SKU | Potential bouquets (field) | Stand-ready now (packed/on shelf) |
| --- | --- | --- |
| Glimmer (small) | | |
| Blessing (standard) | | |
| Abundance (premium) | | |
| Pantry / other | | |

**Rule of thumb:** Potential ≠ stand-ready. Only stand-ready counts for `quantity` and customer promises.

---

## Content / photo opportunities

- [ ] Bed in full bloom
- [ ] Bouquet in hand / at stand
- [ ] Pantry jar / process shot
- [ ] Before/after harvest
- Notes for caption (seasonal, no overpromise):

---

## Sanity updates needed

Punch list after field truth — do not skip if website sells today.

| Action | SKU / setting | Field | New intent |
| --- | --- | --- | --- |
| e.g. Turn on Glimmer | glimmer | inStock | true — 4 on shelf |
| e.g. Set quantity | blessing | quantity | 2 |
| e.g. Stand open | siteSettings | standStatus | open |
| e.g. Turn off sold out | abundance | inStock | false |

---

## Cash / direct sales to log

Sales not captured by Stripe webhook.

| Time | Item (use publicName) | Amount | Method (cash/venmo/other) | Logged in Admin? |
| --- | --- | --- | --- | --- |
| | | | | |

---

## Next watering / protection note

- Tomorrow or next visit:
- Watch list (beds stressing, forecast):

---

## End-of-day snapshot (optional)

- Shelf empty? [ ] yes  [ ] partial  [ ] n/a
- Field carryover for tomorrow:
- One-line summary:
```

---

## Weekly rollup (optional, Sunday or slow day)

Add a short section to the same running doc:

```markdown
## Week of YYYY-MM-DD — rollup

- Best performers (beds + SKUs):
- Gaps (wanted X, did not have Y):
- Recurring drift (website vs shelf):
- Seed ledger updates needed:
- Gear 1 discipline score (1–5): ___ 
  - 5 = every sale logged, Sanity matched shelf daily
  - 1 = mostly memory-held
```

---

## Mapping field notes → Sanity (reminder)

| Log section | Typical Sanity touch |
| --- | --- |
| Stand-ready count | `flowerProduct.quantity`, `inStock` |
| Sold out | `inStock: false` |
| Not listing today | `inStock: false` or `active: false` |
| Stand closed | `siteSettings.standStatus`, `standMessage` |
| Cash sale | Admin → Settings → manual `flowerSalesRecord` |
| Stripe order | Auto `flowerSalesRecord`; you still adjust shelf/`quantity` |

Software does **not** read this log file. You translate it manually until Gear 2+ tooling exists.

---

## Related canonical SKUs (flowers)

From `src/lib/requiredOfferings.ts` — verify slugs in Sanity match:

| publicName | Typical tier | Default stand/shipping |
| --- | --- | --- |
| Glimmer | small | stand |
| Blessing | standard | stand |
| Abundance | premium | stand |
| Botanical Sugar | pantry | ships nationwide |
| Herbal Tea | pantry | ships nationwide |
| Garden Oil | pantry | ships nationwide |
