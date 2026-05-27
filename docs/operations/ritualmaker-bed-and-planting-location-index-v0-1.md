# Ritualmaker Bed and Planting Location Index v0.1

**Date saved:** 2026-05-27

**Object type:** Spatial planting map / bed-location index / field-truth export from main Ritualmaker orchestration chat.

**Purpose:** Give Cursor and future agents enough spatial context to know which bed/zone the flowers, vegetables, herbs, and sensitive plantings are in. This document supplements `docs/operations/ritualmaker-seed-tracking-database-v0-1.md` and should be read before any planting, bloom, harvest, stand-availability, or garden-layout work.

**Use rule:** Before asking the founder where a known planting is, check this document and the seed tracking database. If a location is uncertain, preserve the uncertainty instead of inventing a bed.

**Do-not-use rule:** Do not treat this as a precise survey map. This is a working spatial index from field narration and photos. Do not expose sensitive plant locations publicly. Do not mutate inventory, Sanity, checkout, public copy, or customer-facing content from this document alone.

---

## 1. Core spatial ontology

Ritualmaker currently uses named field zones, not a single flat garden. The most important mistake to avoid is treating “roadside,” “vegetable garden,” “raised bed,” “rock garden,” and “lower slope” as interchangeable.

| Zone ID | Working name | Operational meaning | Major current plantings |
| --- | --- | --- | --- |
| Z1 | Main arch / protected vegetable garden | Main annual food and high-value production core; arch/fence system; closest to tomatoes, basil, broccoli, Brussels, cucurbits | Tomatoes, basil, broccoli, Brussels sprouts, possible rosemary seedlings, vine crops nearby, sensitive seedlings just behind/downhill |
| Z1A | Raised bed / brassica edge | Raised bed closest to broccoli and Brussels sprouts; reference point for nearby sensitive seedlings | Broccoli, Brussels sprouts, possible rosemary seedlings |
| Z1B | Behind vegetable garden downhill drainage pocket | Slightly downhill behind the vegetable garden where runoff from veggie garden and general slope flows through before continuing downhill | Two cannabis/marijuana seedlings planted outside on 2026-05-26; sensitive/private tracking only |
| Z2 | Upper roadside strip / roadside production bed | Road-facing production/visibility band; mixed annual flowers, dahlias, overflow tomatoes, direct-sown seeds; includes black plastic/fabric-strip geometry | Dahlias, marigolds, unidentified flower seed, direct-sown watermelon/delicata/speckled swan gourd context, overflow tomatoes near upper stump |
| Z2A | Two black plastic/fabric strips in roadside production bed | Specific geometry within roadside production bed: seeds planted between two black strips | Three small bags unidentified flower seed (~150 total), marigolds; nearby dahlia strip context |
| Z2B | Uppermost stump near road | Roadside/upper slope stump area, slightly in from road | 27 tomato seedlings rescued from thinning/overcrowding |
| Z2C | Topmost roadside spring bed near stump and big tree | Top of roadside production/spring bed system, near the stump and big tree; separate from dahlia strips | Ranunculus; newly planted calendula seed lining the front edge (planted night before 2026-05-28 report) |
| Z2D | Lower mailbox roadside spring bed | Bottom of roadside production bed just behind mailbox, on main yard level about 4–5 feet above road level | Ranunculus |
| Z3 | Lower slope bed under driveway | Lowest slope bed under driveway, next to prior seed bands; meadow/pollinator/visual impact zone | 1/4 lb Birds & Butterfly mix; yarrow, marigold, zinnia seed nearby; earlier/lighter soil and later/right-side bands |
| Z4 | Big tree bed at top of hill slope | Base of big tree at top of hill slope, wrapping around toward roadside; root-competitive edge | Calendula saved seed ring all around base, wrapping toward roadside |
| Z5 | Rock garden / shaded upper house garden | Perennial/woodland/crevice garden near upper side of house; intentionally built by founder, not generic inherited shade bed | Hostas, daylilies, forest-collected ferns, lamb’s ear/stachys, yarrow, rosebush chunk, bleeding heart, heuchera/coral bells, saved spiky purple seed area, main peony grouping |
| Z5A | Bleeding heart / yarrow / rose-chunk pocket | Specific pocket in rock/house garden in front of bleeding heart and yarrow clump, between transplanted rosebush chunk and grass | Saved purple spiky flower seed, possible gomphrena or scabiosa, under light soil |
| Z5B | Rock bed nearest vegetable garden / septic-water movement path | Rock bed closest to vegetable garden where septic-area watering/moisture starts to move toward; main peony zone | Most peonies; spring perennial/bud watch |
| Z6 | Raised-bed seam by rock garden | Narrow transition seam between raised beds and rock garden; harsh/dry/edge ecology | Hardy transplants, lamb’s ear, fern/groundcover pockets, perennial experiments |
| Z7 | House-side compacted/muddy bed | Near-house compacted/muddy bed with lower seed success | Avoid relying on direct seeding; better for established transplants/amended pockets |
| Z7A | Foundation bed near middle of property | Foundation/perennial bed nearest middle of property; separate from main rock bed | A couple peonies |
| Z8 | Upper roadside/tree/trellis root-competition zone | Roadside upper/root-heavy dry edge near big tree/trellis context | Direct seeding weaker; transplants/amended pockets preferred |
| Z9 | Stream/downhill moisture zone | Downhill/moisture-influenced area; pollinator/flower expansion potential | Some earlier seed/wildflower context; exact entries need more data |
| Z10 | Indoor/holding area | Seedlings before transplant | Dahlias before planting; tomatoes/Money Maker at earlier stage |
| Z11 | Walkway / stairs bed | Bed near walkway/stairs | A couple peonies; prior saved seed source context nearby |

---

## 2. Current known flower locations

### Dahlias

| Field | Current truth |
| --- | --- |
| Planting status | Transplanted outside after being hardened off |
| Hardening | 5–6 days in bucket before going outside |
| Main location | Z2 upper roadside strip / roadside production bed / slope fabric-covered strips |
| Placement logic | Earlier decision favored upper roadside amended pockets/strips over lower mailbox/root-competitive areas; not a return to prior rock-garden default |
| Condition/action | Monitor establishment, wilt, heat stress, staking/support needs, slug/animal pressure |
| Public/sensitivity | Normal flower crop; okay for public planning |

### Unidentified flower seed between black strips

| Field | Current truth |
| --- | --- |
| Planting status | Direct-sown |
| Amount | Three little bags, about 50 seeds each; approximately 150 seeds total |
| Location | Z2A, between the two black plastic/fabric strips on the roadside production bed |
| Identification | Unknown; do not label until true leaves/bloom or founder remembers packet/source |
| Associated planting | Some marigolds sown in same area |
| Next action | Track germination and later ID; do not let Cursor infer flower type |

### Marigolds

| Field | Current truth |
| --- | --- |
| Planting status | Direct-sown in multiple roadside/slope contexts |
| Latest specific location | Z2A, between the two black plastic/fabric strips on roadside production bed with unidentified flower seed |
| Earlier locations | Z2/Z3 roadside slope seed bands with cosmos/yarrow/zinnia/wildflower context |
| Operational role | Companion/pollinator/fill/visual roadside production |

### Calendula saved seed

| Field | Current truth |
| --- | --- |
| Planting status | Direct-sown from saved seed |
| Locations | Z4, all the way around the base of the big tree bed at the top of the hill slope, wrapping around to the roadside; plus new calendula seed lining the front of Z2C topmost roadside ranunculus bed near the stump/big tree |
| Latest planting | New calendula seed planted night before 2026-05-28 report, in front of the topmost roadside ranunculus bed |
| Microclimate | Root-competitive tree base / upper hill edge; selection trial; Z2C also connects spring ranunculus display to roadside production |
| Operational role | Flower/pantry/medicinal/pollinator; saved-seed performance test |
| Next action | Track germination under tree competition and along the Z2C front edge; mark as saved-seed trial |

### Aster peony Duchess Apricot

| Field | Current truth |
| --- | --- |
| Planting status | Direct-sown earlier |
| Identity correction | Founder corrected prior confusion: this is Aster peony Duchess Apricot, not “PNE” |
| Location | Small roughly 36 x 40 inch section downhill/frontside from the heavily seeded cosmos/marigold/yarrow area, near/inside transplanted zinnia line in roadside/midslope context |
| Next action | Track germination; preserve corrected ID |

### Saved purple spiky flower seed

| Field | Current truth |
| --- | --- |
| Planting status | Direct-sown under light soil |
| Location | Z5A rock/house garden pocket: just in front of bleeding heart and yarrow clump, between transplanted rosebush chunk and grass |
| Possible ID | Gomphrena or scabiosa, not confirmed |
| Source | Saved seed from prior purple spiky flower near stairs |
| Next action | Wait for true leaves/bloom before ID |

### Yarrow

| Field | Current truth |
| --- | --- |
| Status | Existing clumps plus direct-sown seed in multiple zones |
| Locations | Z2/Z3 roadside and lower slope contexts; Z5 rock garden near bleeding heart; earlier heavy seed bands with cosmos/marigolds |
| Role | Perennial anchor, pollinator, slope/roadside continuity |

### Cosmos

| Field | Current truth |
| --- | --- |
| Status | Direct-sown heavily in roadside/slope contexts |
| Locations | Midslope/lower roadside flower bed; around the area later referenced for aster placement |
| Role | Summer annual visual/pollinator mass; may help fill slope |

### Zinnias

| Field | Current truth |
| --- | --- |
| Status | Both direct-sown and transplanted |
| Locations | Z2/Z3 roadside and mid-slope areas; near transplanted sunflowers; inside/near aster peony Duchess Apricot area; Z2B has tomato overflow nearby, not zinnia |
| Founder note | “Zeus” in transcript likely refers to zinnias looking good outside |
| Role | Core cut-flower crop and roadside visual production |

### Sunflowers

| Field | Current truth |
| --- | --- |
| Status | Direct-sown and transplanted; transplants looked rough at one point |
| Locations | Roadside/midslope production areas; also planned as structural/visual supports for vine crops in broader garden logic |
| Role | Visual, seed-saving, structure, bouquet/production, pollinator |

### Hollyhocks

| Field | Current truth |
| --- | --- |
| Status | Transplanted and looked rough at one point |
| Location | Roadside/flower system context; exact bed needs further confirmation |
| Next action | Track survival; transplant shock possible |

### Ranunculus

| Field | Current truth |
| --- | --- |
| Status | Budding / blooming spring flower zone; first $12 bouquet sold 2026-05-25 |
| Top location | Z2C topmost roadside spring bed near the stump and big tree |
| Top bed edge | Z2C is now lined in front with newly planted calendula seed (planted night before 2026-05-28 report) |
| Bottom location | Z2D bottom of roadside production bed just behind mailbox, on main yard level about 4–5 feet above road level |
| Note | Keep distinct from Z2 dahlia fabric strips and from Z3 lower slope under driveway |
| Next action | Track flushes by Z2C vs Z2D so bouquet availability can be tied to actual spring beds |

### Peonies

| Field | Current truth |
| --- | --- |
| Status | Budding earlier; buds getting larger; mostly leave to grow until harvest-ready |
| Main location | Mostly Z5B rock bed nearest the vegetable garden, where septic-area watering/moisture starts to move toward |
| Secondary locations | A couple in Z7A foundation bed nearest the middle of the property; a couple in Z11 walkway/stairs bed |
| Note | Do not flatten all peonies into generic Z5; most are Z5B, with smaller clumps in Z7A and Z11 |
| Next action | Confirm individual clump count and harvest readiness by sub-zone during field walk |

---

## 3. Current known vegetable/herb/sensitive crop locations

### Tomatoes

| Field | Current truth |
| --- | --- |
| Main crop | Many transplanted tomatoes in Z1 main vegetable/arch/protected garden |
| Money Maker | Healthier indeterminate starts remained at one point; needs confirmation whether all were planted |
| Thinned/rescued seedlings | 27 seedlings planted by uppermost stump, slightly in from road, Z2B |
| Operational role | Food crop + survivor-selection experiment in upper roadside strip |

### Basil

| Field | Current truth |
| --- | --- |
| Status | Transplanted outside |
| Location | Z1 main garden near tomatoes / under fabric openings |
| Role | Companion/herb/pantry crop; planted before remaining tomatoes and brassicas |

### Broccoli and Brussels sprouts

| Field | Current truth |
| --- | --- |
| Status | Transplanted, looked weak/stressed earlier |
| Location | Z1A raised bed / raised planter near main vegetable garden |
| Importance as reference point | The two cannabis seedlings are closest to this broccoli/Brussels raised bed |
| Next action | Monitor survival/recovery; succession planting was discussed |

### Possible rosemary seedlings

| Field | Current truth |
| --- | --- |
| Status | Two possible seedlings in brassica/raised planter context |
| Identification | Unconfirmed |
| Next action | Confirm by needle leaf/scent before treating as rosemary |

### Cannabis / marijuana seedlings

| Field | Current truth |
| --- | --- |
| Status | Two seedlings planted outside yesterday relative to 2026-05-27 conversation, likely 2026-05-26 |
| Location | Z1B: behind the vegetable garden, a little downhill |
| Hydrology | Placed where water from the vegetable garden and general slope will flow down to, then continue downhill |
| Light | Full sun until the plants are in the shadow of the house |
| Nearest reference | Closest to broccoli and Brussels sprouts in the raised bed |
| Prior placement evolution | Earlier location options included behind tomatoes and downhill past chairs; final chosen direction moved uphill/closer to main garden and then settled behind/downhill from vegetable garden |
| Sensitivity | Private/sensitive crop; do not expose location in public content; track only for private operational planning |
| Next action | Monitor transplant shock, drainage/waterlogging after irrigation/rain, animal pressure, privacy, and legality; do not provide public-facing details |

### Watermelon Allsweet / Delicata squash / Speckled Swan gourd

| Field | Current truth |
| --- | --- |
| Status | Direct-sown in roadside/production-bed context from packet photo/update |
| Location | Roadside/production bed context shown with dahlia update; exact placement relative to black strips needs confirmation |
| Packet details | Allsweet ~90 days; Delicata ~100 days; Speckled Swan gourd ~100 days; packet counts shown as 25 seeds each |
| Next action | Confirm exact count and location before thinning/trellis advice |

---

## 4. Major beds and what Cursor should know

### Z1 — Main arch / protected vegetable garden

This is the main vegetable and high-value annual production area. It includes tomatoes, basil, broccoli, Brussels sprouts, possible rosemary seedlings, and the arch/fence infrastructure. It is not the same as the roadside flower strip.

Known nearby/downhill extension: two cannabis seedlings are behind the vegetable garden, slightly downhill, in a water-flow path that continues downhill.

### Z2 — Upper roadside strip / roadside production bed

This is a high-visibility mixed production strip. It now includes both flowers and food crops. Cursor should not assume it is flowers only.

Known contents:

- dahlias in fabric-covered roadside/slope strips;
- unidentified flower seed between two black strips;
- marigolds between two black strips;
- direct-sown watermelon/delicata/speckled swan gourd context;
- earlier zinnia/sunflower/marigold/cosmos/yarrow systems;
- 27 rescued tomato seedlings by uppermost stump;
- top and bottom ranunculus spring beds as Z2C and Z2D.

### Z2A — Between the two black plastic/fabric strips

This is a critical sub-zone that Cursor was missing. It is not generic roadside. It is the specific seed lane between two black strips in the roadside production bed.

Known contents:

- three little bags of unidentified flower seed, ~50 seeds each, ~150 seeds total;
- marigolds;
- near/within the broader dahlia roadside strip context.

### Z2C — Topmost roadside spring bed near stump and big tree

This is a top roadside spring-flower sub-zone near the stump and big tree, not a generic roadside area and not the dahlia strip.

Known contents:

- ranunculus;
- new calendula seed lining the front of the bed, planted night before 2026-05-28 report;
- adjacency to stump/big-tree/root-competition context.

### Z2D — Lower mailbox roadside spring bed

This is at the bottom of the roadside production bed, just behind the mailbox, on the main yard level approximately 4–5 feet above road level.

Known contents:

- ranunculus.

### Z3 — Lower slope bed under driveway

This is the lowest slope bed below/under the driveway and near earlier roadside seed bands.

Known contents:

- 1/4 lb Birds & Butterfly wildflower mix;
- yarrow/marigold/zinnia seed nearby;
- right side planted later;
- lighter soil area planted the week before;
- significant meadow/pollinator/erosion/visual-impact function.

### Z4 — Big tree bed at top of hill slope

This is the base of the large tree at the top of the hill slope, wrapping around toward roadside.

Known contents:

- calendula saved seed ring all around base;
- root competition likely;
- performance should be treated as saved-seed / hardy-selection trial.

### Z5 — Rock garden / shaded upper house garden

This is an intentional woodland/perennial/crevice garden built by the founder. It was originally mostly hostas and daylilies, but the founder has added and propagated many plants.

Known contents:

- hostas;
- daylilies;
- forest-collected ferns from near Appalachian Trail;
- lamb’s ear/stachys;
- yarrow;
- rosebush chunk/division;
- bleeding heart;
- heuchera/coral-bells-like foliage;
- moss/ferns in wet seams;
- saved spiky purple flower seed pocket;
- peony zone Z5B near the vegetable garden / septic-water movement path.

Founder correction: do not give generic plant-community aesthetic advice here. Advice should be microclimate, soil, root competition, drainage, compaction, transplant tolerance, and operational follow-through.

### Z5A — Bleeding heart / yarrow / rose-chunk pocket

Specific sub-zone inside rock/house garden.

Known contents:

- saved purple spiky flower seed;
- possible gomphrena or scabiosa, unconfirmed;
- located in front of bleeding heart and yarrow clump, between transplanted rosebush chunk and grass.

### Z5B — Rock bed nearest vegetable garden / septic-water movement path

Specific rock-bed sub-zone nearest the vegetable garden where septic-area watering/moisture starts to move toward.

Known contents:

- most peonies;
- spring perennial bud watch.

### Z6 — Raised-bed seam by rock garden

A transition strip between raised beds and rock garden. Treat as harsh edge ecology, not blank space.

Known contents:

- hardy transplants;
- lamb’s ear;
- fern/groundcover pockets;
- other perennial experiments.

### Z7A — Foundation bed near middle of property

Foundation bed nearest the middle of the property.

Known contents:

- a couple peonies.

### Z11 — Walkway / stairs bed

Bed near the walkway/stairs.

Known contents:

- a couple peonies.

---

## 5. Chronological corrections and stale assumptions

| Earlier/incorrect assumption | Corrected active truth |
| --- | --- |
| Cursor/agent can infer beds from generic labels like “roadside” | Must use named sub-zones: Z2, Z2A, Z2B, Z2C, Z2D, Z3, Z4, etc. |
| Ranunculus was one vague lower mailbox/spring zone | Ranunculus is in at least two roadside spring sub-zones: Z2C topmost near stump/big tree and Z2D lower mailbox/main-yard-level bed |
| Peonies are generic house/rock perennials | Most peonies are in Z5B near the vegetable garden/septic-water movement path; a couple are in Z7A foundation middle-property bed and Z11 walkway/stairs bed |
| Dahlia placement is just “roadside” | Dahlias are in Z2 roadside production bed/fabric-covered strips; earlier decision favored upper roadside amended pockets over lower root-heavy mailbox zone |
| Black strip seed planting is generic roadside | It is specifically between two black plastic/fabric strips in the roadside production bed, Z2A |
| Big tree planting is same as roadside strip | Calendula saved seed is around big tree bed at top of hill slope, wrapping toward roadside, Z4; a separate new calendula line also fronts Z2C |
| Rock garden is inherited shade bed | Rock garden is intentionally built/propagated/perennial woodland-edge system with founder-selected plants |
| Cannabis location is behind tomatoes by default | Final update: two seedlings are behind vegetable garden, slightly downhill in drainage path, closest to broccoli/Brussels raised bed |
| Direct-seeded areas are all equally likely to germinate | Root competition, compaction, moisture, and slope strongly affect success |
| The website/product system is the main business map | Garden/stand/bed truth is the source; website is translation layer |

---

## 6. Active tracking rules for future agents

1. Do not ask “what bed are the flowers in?” until this document and the seed tracking database have been checked.
2. Preserve sub-zones, especially Z2A, Z2B, Z2C, Z2D, Z4, Z5A, Z5B, Z7A, and Z11.
3. Do not over-identify unknown flower seed, saved purple seed, possible rosemary, or sweet pea seedlings.
4. Direct-sown seed, transplanted seedlings, saved seed trials, and established perennials must remain separate categories.
5. Cannabis/sensitive crop locations are internal/private only.
6. The roadside production bed is mixed-use: flowers, food crops, visibility, and production all overlap.
7. Big tree/root-competition plantings are trials; do not assume normal germination or yield.
8. Rock garden advice must be microclimate-first, not generic aesthetics-first.
9. When the founder reports field updates conversationally, convert them into structured ledger entries.
10. If a location is uncertain, mark uncertainty; do not invent precision.

---

## 7. Immediate Cursor guidance

Cursor should read this file before any Ritualmaker planting/logging prompt. If Cursor needs to create a live log, it should include bed IDs and sub-zone names.

Minimum field reference format:

```text
Plant/item:
Action:
Date/relative timing:
Zone ID:
Named bed/sub-zone:
Nearest landmark:
Sun/shade:
Moisture/drainage:
Source/count:
Condition:
Uncertainty:
Next action:
```

---

## 8. Current unresolved spatial questions

- Exact final placement/count of remaining Money Maker tomatoes.
- Exact final placement/count for Watermelon Allsweet, Delicata squash, and Speckled Swan gourd relative to dahlias and black strips.
- Exact surviving count/location of stock flowers.
- Exact zone for hollyhock transplants.
- Confirmation of possible rosemary seedlings.
- Germination success in Z2A black-strip lane.
- Germination success of calendula around Z4 big tree bed.
- Germination success of newly planted calendula along Z2C front edge.
- Whether lower slope Birds & Butterfly mix has distinct emergence bands from lighter-soil/previous-week vs later/right-side planting.
- Exact count of peonies by Z5B, Z7A, and Z11.

---

## 9. Routing

This document should be routed as:

- Seed/planting ledger support;
- Garden zone/spatial map;
- Bloom/harvest log support;
- Stand availability workflow support;
- Cursor context source;
- Founder operating-system pattern: conversational field log to structured spatial truth.

It should not be used as:

- public garden map;
- customer-facing copy;
- inventory mutation source;
- legal advice;
- exact survey map.
