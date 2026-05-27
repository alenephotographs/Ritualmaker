# Ritualmaker Sphere Atlas

**Date saved:** 2026-05-27

**Object type:** Sphere atlas / source-of-truth map / agent retrieval guide.

**Purpose:** Make Ritualmaker information available to ChatGPT, Cursor, and future agents in usable paths instead of scattered chat memory. This atlas tells agents which repo document to read for each kind of fact and when other Ritualmaker chats need additional export.

**No-touch boundary:** This is an internal routing/index document only. It does not authorize product code changes, public copy changes, Sanity mutation, checkout/payment changes, inventory mutation, revenue mutation, or customer contact.

---

## 1. Agent startup rule

Before any Ritualmaker advice, implementation prompt, Cursor pass, planting recommendation, inventory audit, website change, or revenue reconciliation, read this atlas first.

Then read the relevant source docs below.

Do not rely only on ChatGPT memory when repo source truth exists.

---

## 2. Sphere center

Ritualmaker is a physical-world seasonal production sphere. Its center of gravity is:

```text
Garden reality -> stand/product availability -> local trust -> sales -> content/proof -> next planting/offering decision
```

The website is a translation layer, not the source of truth.

The garden and stand are source layers.

---

## 3. Source-of-truth atlas

| Information needed | Read this first | Then read | Do not use |
| --- | --- | --- | --- |
| Overall Ritualmaker operating model | `docs/internal/RITUALMAKER_OPERATING_SPHERE.md` | `docs/internal/RITUALMAKER_SPHERE_MAP.json` | Generic ecommerce assumptions |
| Bed/zone/plant location | `docs/operations/ritualmaker-bed-and-planting-location-index-v0-1.md` | `docs/operations/ritualmaker-seed-tracking-database-v0-1.md` | Vague “roadside” labels |
| Seed inventory and planting ledger | `docs/operations/ritualmaker-seed-tracking-database-v0-1.md` | `docs/operations/chat-exports/` | Unverified memory |
| Daily bloom/harvest/availability | `docs/operations/ritualmaker-bloom-harvest-log-template-v0-1.md` | `docs/operations/live-logs/` if present | Static product inventory alone |
| Stand availability ritual | `docs/operations/ritualmaker-stand-availability-workflow-v0-1.md` | `docs/internal/RITUALMAKER_GEAR_1_OPERATING_RITUALS.md` | Automated inventory assumptions |
| Website/product truth model | `docs/internal/RITUALMAKER_INVENTORY_TRUTH_AUDIT_01.md` | Sanity schemas/routes | Public copy as source truth |
| Gear progression / when to automate | `docs/internal/RITUALMAKER_GEAR_1_OPERATING_RITUALS.md` | `docs/internal/RITUALMAKER_NEXT_SAFE_ACTION_QUEUE.md` | Jumping to Gear 2/3 early |
| Current work history | `docs/internal/RITUALMAKER_WORKLOG.md` | latest commits / Cursor handoffs | Old local checkout assumptions |
| Failed/other chat exports | `docs/operations/chat-exports/` | import selectively into ledgers | Flattened chat summaries |
| Revenue/sales channel truth | `docs/internal/RITUALMAKER_INVENTORY_TRUTH_AUDIT_01.md` | Sanity sales schema, Stripe/webhook code, future revenue ledgers | Merged cash + Stripe assumptions |
| Public promise risk | `docs/internal/RITUALMAKER_INVENTORY_TRUTH_AUDIT_01.md` | farm-stand/homepage source | Always-open inventory assumptions |
| Sensitive/private plant locations | `docs/operations/ritualmaker-bed-and-planting-location-index-v0-1.md` | private live logs only | Public-facing docs/copy |

---

## 4. Current canonical docs

### Internal operating docs

- `docs/internal/RITUALMAKER_OPERATING_SPHERE.md`
- `docs/internal/RITUALMAKER_SPHERE_MAP.json`
- `docs/internal/RITUALMAKER_SPHERE_ATLAS.md`
- `docs/internal/RITUALMAKER_INVENTORY_TRUTH_AUDIT_01.md`
- `docs/internal/RITUALMAKER_NEXT_SAFE_ACTION_QUEUE.md`
- `docs/internal/RITUALMAKER_GEAR_1_OPERATING_RITUALS.md`
- `docs/internal/RITUALMAKER_WORKLOG.md`

### Operational docs

- `docs/operations/ritualmaker-seed-tracking-database-v0-1.md`
- `docs/operations/ritualmaker-bed-and-planting-location-index-v0-1.md`
- `docs/operations/ritualmaker-stand-availability-workflow-v0-1.md`
- `docs/operations/ritualmaker-bloom-harvest-log-template-v0-1.md`

### Chat export folder

- `docs/operations/chat-exports/`

### Live logs folder

- `docs/operations/live-logs/`

---

## 5. Current bed/zone shortcut

Do not collapse these zones into “roadside.”

| Zone | Meaning |
| --- | --- |
| Z1 | Main arch / protected vegetable garden |
| Z1A | Raised bed / brassica edge with broccoli and Brussels sprouts |
| Z1B | Behind vegetable garden downhill drainage pocket; private sensitive planting zone |
| Z2 | Upper roadside strip / roadside production bed |
| Z2A | Between the two black plastic/fabric strips in the roadside production bed |
| Z2B | Uppermost stump near road |
| Z3 | Lower slope bed under driveway |
| Z4 | Big tree bed at top of hill slope |
| Z5 | Rock garden / shaded upper house garden |
| Z5A | Bleeding heart / yarrow / rose-chunk pocket |
| Z6 | Raised-bed seam by rock garden |
| Z7 | House-side compacted/muddy bed |
| Z8 | Upper roadside/tree/trellis root-competition zone |
| Z9 | Stream/downhill moisture zone |
| Z10 | Indoor/holding area |

---

## 6. What other Ritualmaker chats still need to export

Other chats only need additional export if they contain hard facts not already present in the repo.

### Export required if the chat contains:

- exact planting counts not in the seed database;
- exact bed/zone locations not in the bed index;
- corrected plant IDs;
- seed packet names/details;
- bloom, bud, harvest, damage, or fading observations;
- stand-ready counts;
- bouquet/pantry sales;
- cash/Venmo/Stripe revenue details;
- corrected revenue totals;
- arch/fence/wood chip/irrigation/material placement;
- product names/prices/bundles/public promise issues;
- customer/vendor/community signals;
- founder corrections that prevent future wrong advice.

### Export not needed if the chat contains only:

- generic gardening advice;
- repeated strategy already in docs;
- philosophical framing without operational facts;
- broad website/business advice with no new source-truth detail;
- duplicate field entries already captured in repo docs.

---

## 7. Other-chat export instruction

Use this decision rule for each other Ritualmaker chat:

```text
Only export if this chat contains facts not already captured in the Ritualmaker repo.
Prioritize exact plantings, bed locations, counts, dates, corrected IDs, sales/revenue, bloom/harvest status, infrastructure placement, website/product facts, and founder corrections.
Do not repeat generic advice.
Save the export to docs/operations/chat-exports/ if the chat has GitHub access.
If the chat lacks GitHub access, paste the export into the main Ritualmaker orchestration chat for ingestion.
```

---

## 8. Import routing rules

When a chat export arrives, route it as follows:

| Incoming fact type | Destination |
| --- | --- |
| Planting/seed/location fact | `ritualmaker-seed-tracking-database-v0-1.md` and/or bed index |
| Bed/spatial clarification | `ritualmaker-bed-and-planting-location-index-v0-1.md` |
| Bloom/harvest observation | live log or bloom/harvest template-derived entry |
| Stand inventory status | stand availability workflow/live log |
| Cash/Venmo/Stripe sale | revenue/sales ledger when created; until then chat export + worklog |
| Product/website truth | inventory truth audit or next safe action queue |
| Infrastructure/materials | future infrastructure/materials ledger; until then chat export |
| Community/customer signal | future community/customer signal archive; until then chat export |
| Founder operating correction | internal docs/worklog; possibly operating sphere or atlas |
| Generic/stale advice | no action or source archive only |

---

## 9. Cursor behavior rules

1. Cursor should read this atlas before asking the founder for spatial or operating context.
2. Cursor should not assume a missing local doc is absent from the repo; fetch/pull/check remote first.
3. Cursor should not flatten field data into generic summaries.
4. Cursor should preserve uncertainty rather than inventing precision.
5. Cursor should use zone IDs in all planting/live-log docs.
6. Cursor should not mutate Sanity or inventory from docs alone.
7. Cursor should keep sensitive planting locations out of public copy.
8. Cursor should update worklog entries when adding docs.
9. Cursor should return ChatGPT-ready handoffs with files read, files created/updated, checks, commit hash, push status, and no-touch confirmation.

---

## 10. Next missing atlas layers

These are not blockers, but future docs should be added when enough data exists:

- `docs/operations/ritualmaker-revenue-sales-ledger-v0-1.md`
- `docs/operations/ritualmaker-infrastructure-materials-ledger-v0-1.md`
- `docs/operations/ritualmaker-content-photo-plan-v0-1.md`
- `docs/operations/ritualmaker-community-customer-signal-archive-v0-1.md`
- `docs/operations/ritualmaker-seasonal-calendar-v0-1.md`

---

## 11. No-touch confirmation

This atlas does not authorize:

- code implementation;
- public copy changes;
- product publishing/unpublishing;
- Sanity mutation;
- checkout/payment changes;
- inventory changes;
- customer messages;
- subscription launch;
- delivery promises;
- automated availability claims.
