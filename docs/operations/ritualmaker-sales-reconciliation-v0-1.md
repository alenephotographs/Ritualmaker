# Ritualmaker Sales Reconciliation v0.1

**Date created:** 2026-05-27

**Object type:** Revenue/sales reconciliation ledger / Admin-entry punch list / website-vs-direct comparison.

**Source status:** Mixed. This document reconciles (1) repo-backed live-log evidence, (2) main orchestration-chat memory, and (3) current known system structure. Treat all rows marked `needs admin verification` as not yet confirmed in Sanity/Admin.

**No-touch boundary:** This is a docs-only reconciliation artifact. It does not mutate Sanity, Stripe, inventory, checkout, public copy, customer records, or tax records.

---

## 1. Current reconciliation summary

| Channel | Current known gross | Admin/Sanity status | Source confidence | Notes |
| --- | ---: | --- | --- | --- |
| Direct / non-website sales | **$145** | Founder says cash sales are not marked in Admin yet | Medium-high from orchestration memory; line-item detail incomplete | Includes stand cash, direct flower sales, Venmo/direct lunch sale, and later corrected bouquet sale. |
| Website / Stripe sales | **$38** | Needs comparison against Admin/Sanity + Stripe/webhook records | Medium from orchestration memory; requires live Admin/Stripe verification | Known as prior website $12 plus missed $26 website sale processed through Stripe on 2026-05-09. |
| Season gross revenue | **$183** | Not yet consolidated in Admin | Medium-high aggregate from orchestration memory | $145 direct/non-website + $38 website = $183. |

**Important:** Current repo docs directly prove only the 2026-05-25 $12 ranunculus cash sale. Earlier cash/direct/website totals are carried from the main orchestration memory and should be verified against prior chat exports, Admin, and Stripe.

---

## 2. Known sales ledger — reconstructed

### A. Direct / non-website sales

| Date / timing | Item | Amount | Method | Admin status | Confidence | Notes |
| --- | --- | ---: | --- | --- | --- | --- |
| 2026-05-06 | Glimmer bouquet | $12 | Cash / stand/direct | Not marked in Admin per founder | Medium | Recorded in orchestration memory as part of 2026-05-06 stand/cash batch. |
| 2026-05-06 | Infused olive oil sale | $5 | Cash / stand/direct | Not marked in Admin per founder | Medium | Three infused olive oils were sold at $5 each. |
| 2026-05-06 | Infused olive oil sale | $5 | Cash / stand/direct | Not marked in Admin per founder | Medium | Three infused olive oils were sold at $5 each. |
| 2026-05-06 | Infused olive oil sale | $5 | Cash / stand/direct | Not marked in Admin per founder | Medium | Three infused olive oils were sold at $5 each. |
| 2026-05-06 | Bouquet | $20 | Cash / stand/direct | Not marked in Admin per founder | Medium | Originally recorded as $18, later corrected to $20. |
| Date not specified | Venmo/direct lunch sale to Josh | $12 | Venmo/direct | Not marked in Admin unless founder later entered manually | Medium | Included in non-website/direct total. Not necessarily flower inventory. |
| Date not specified | Direct/non-website flower sale | $20 | Direct / unknown | Not marked in Admin per founder | Medium | Added after first batch; exact item/date unknown. |
| Date not specified | Direct/non-website bouquet sale | $20 | Direct / unknown | Not marked in Admin per founder | Medium | Added after prior direct sale; exact item/date unknown. |
| Date not specified | Bouquet sale | $12 | Direct / cash likely | Not marked in Admin per founder | Medium | Later added as direct/non-website revenue. Exact item/date unknown. |
| Date not specified | Bouquet sale | $18 | Direct / cash likely | Not marked in Admin per founder | Medium | Later added as direct/non-website revenue. Exact item/date unknown. |
| 2026-05-25 | Ranunculus bouquet, first of season | $12 | Cash / walk-up stand | **Not marked in Admin per founder** | High | Repo live log confirms date, amount, item, and method. |

**Reconstructed listed direct subtotal:** $141.

**Known aggregate direct total:** $145.

**Unallocated direct delta:** $4. This means either one small sale/rounding/correction is missing from the reconstructable line items, or one line item above has incomplete amount/date detail. Do not force this delta into a fake sale; verify against prior exports/Admin notes.

### B. Website / Stripe sales

| Date / timing | Item | Amount | Method | Admin/Sanity status | Confidence | Notes |
| --- | --- | ---: | --- | --- | --- | --- |
| Earlier season / prior website sale | Website sale | $12 | Stripe / website | Needs verification | Medium | Carried in orchestration memory as prior website sale. Exact item/date not yet reconstructed. |
| 2026-05-09 | Website sale | $26 | Stripe / website | Needs verification | Medium-high | Described as missed website sale processed through Stripe on 2026-05-09. Exact item not reconstructed here. |

**Website gross total:** $38.

---

## 3. Admin entry punch list

### Enter / verify in Admin as flowerSalesRecord or appropriate sales record

| Priority | Record | Suggested Admin fields | Notes |
| --- | --- | --- | --- |
| 1 | 2026-05-25 ranunculus bouquet cash sale | `itemName`: Ranunculus bouquet; `amountCents`: 1200; `saleDate`: 2026-05-25; `paymentMethod`: cash; `notes`: first ranunculus bouquet of season / walk-up stand | Founder explicitly said this cash sale was not marked yet. |
| 2 | 2026-05-06 Glimmer bouquet | `itemName`: Glimmer bouquet; `amountCents`: 1200; `paymentMethod`: cash; date 2026-05-06 if correct | Verify date and whether SKU/publicName matches website. |
| 3 | 2026-05-06 three infused olive oil sales | Three records at `amountCents`: 500 each, or one combined record with quantity note if Admin does not support quantity | Need product/legal/category decision if oil is not a normal flowerProduct. |
| 4 | 2026-05-06 bouquet corrected to $20 | `amountCents`: 2000; `paymentMethod`: cash/direct | Make sure not entered as the earlier incorrect $18. |
| 5 | Josh Venmo lunch sale | `amountCents`: 1200; `paymentMethod`: venmo; itemName should clearly indicate lunch/direct non-flower if entered | Decide whether this belongs in Ritualmaker sales or separate personal/direct ledger. |
| 6 | Other direct $20 flower sale | amount 2000; payment method/date unknown | Needs date/item confirmation. |
| 7 | Other direct $20 bouquet sale | amount 2000; payment method/date unknown | Needs date/item confirmation. |
| 8 | Later $12 and $18 direct bouquet sales | amount 1200 and 1800; payment/date unknown | Need dates/items. |
| 9 | Website $12 and $26 sales | Compare Stripe checkout and Sanity records | Should already be web/Stripe-origin if webhook ran; verify not duplicated manually. |

---

## 4. Website/Admin comparison state

| Comparison | Current result |
| --- | --- |
| Direct/cash/Venmo vs Admin | Founder reports none of the cash sales have been marked in Admin yet. Treat direct $145 as external/docs-held until entered or verified. |
| Website/Stripe vs Admin | Needs live Admin/Stripe comparison. Repo code/schema can support records, but docs do not prove which website records currently exist. |
| Repo docs vs Admin | Repo docs currently document at least one sale clearly: 2026-05-25 ranunculus bouquet, $12 cash. Other aggregates are orchestration-memory carried and should be backfilled from prior chat exports. |
| Website gross vs direct gross | Website: $38. Direct/non-website: $145. Total: $183. Direct is currently the larger unentered channel. |
| Duplicate risk | High if website/Stripe sales are manually entered without checking whether webhook already created flowerSalesRecord rows. |

---

## 5. Reconciliation math

```text
Known aggregate direct/non-website sales = $145
Known aggregate website/Stripe sales      = $38
Known season gross revenue                = $183

145 + 38 = 183
```

Known reconstructed direct line items from current memory total $141, leaving $4 unallocated. This delta must remain unresolved until prior exports/Admin notes are checked.

---

## 6. Source/proof notes

### Repo-backed proof

- `docs/operations/live-logs/2026-05-27-gear-1-operating-cycle.md` records a 2026-05-25 ranunculus bouquet sale for $12 cash and says Admin logging still needs confirmation.
- `src/sanity/schemas/flowerSalesRecord.ts` confirms the Admin/Sanity model supports `itemName`, `amountCents`, `saleDate`, Stripe IDs, `paymentMethod`, and notes.

### Chat-memory / orchestration proof

The following are carried from the main orchestration memory and need Admin/Stripe/export verification before being treated as final accounting records:

- direct/non-website total = $145;
- website gross total = $38;
- season gross total = $183;
- 2026-05-06 stand/cash batch;
- Josh Venmo/direct lunch sale;
- later direct $20 / $20 / $12 / $18 sales;
- missed $26 website sale processed through Stripe on 2026-05-09;
- correction of an $18 bouquet sale to $20.

---

## 7. Next safe actions

1. **Admin comparison pass:** Export or inspect current Sanity `flowerSalesRecord` documents and Stripe checkout/session records.
2. **Do not duplicate website sales:** Verify whether the $12 and $26 website/Stripe sales already generated records before manual entry.
3. **Enter direct sales manually:** Cash/Venmo/direct records should be added to Admin if they are confirmed and belong to Ritualmaker revenue.
4. **Resolve $4 direct delta:** Search prior chat exports and admin notes before inventing any sale.
5. **Create a durable revenue workflow:** Add a daily/weekly sales reconciliation ritual that separates direct, Venmo, website/Stripe, pantry, bouquet, and non-flower direct sales.

---

## 8. Cursor prompt — Admin / website sales comparison

```text
RITUALMAKER — ADMIN SALES RECONCILIATION AGAINST DOCS

Repo: alenephotographs/Ritualmaker
Mode: READ/COMPARE/REPORT FIRST. Do not mutate Sanity until explicitly instructed.

Read:
- docs/operations/ritualmaker-sales-reconciliation-v0-1.md
- docs/operations/live-logs/2026-05-27-gear-1-operating-cycle.md
- src/sanity/schemas/flowerSalesRecord.ts
- src/app/api/stripe/webhook/route.ts or equivalent webhook route
- any admin sales-record pages/components

Task:
1. Inspect current Admin/Sanity flowerSalesRecord records if environment access is available.
2. Compare records against the sales ledger in ritualmaker-sales-reconciliation-v0-1.md.
3. Separately list:
   - already in Admin;
   - missing from Admin;
   - website/Stripe-origin records that should not be duplicated;
   - cash/Venmo/direct records safe to enter manually;
   - records requiring founder confirmation.
4. Do not create/update/delete records in Sanity yet.
5. Return a ChatGPT-ready handoff with exact deltas and recommended entry order.

No-touch confirmation required.
```
