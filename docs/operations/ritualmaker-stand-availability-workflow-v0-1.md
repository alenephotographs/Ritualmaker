# Ritualmaker Stand Availability Workflow v0.1

**Repo:** `alenephotographs/Ritualmaker`  
**Mode:** Manual operational ritual — Gear 1  
**Status:** Founder-run checklist; not enforced by software

**Related docs:**

- `docs/internal/RITUALMAKER_INVENTORY_TRUTH_AUDIT_01.md` — what the website actually reads
- `docs/operations/ritualmaker-bloom-harvest-log-template-v0-1.md` — garden-side truth capture
- `docs/operations/ritualmaker-seed-tracking-database-v0-1.md` — planting and zone context

**No-touch boundary:** This workflow describes manual steps. It does not authorize code changes, Sanity bulk edits by agents, checkout changes, or automated inventory sync.

---

## Purpose

Reconcile **garden reality → stand shelf → website/Stripe state → revenue records** before customers rely on what they see online or at 38 Miller Hill Road.

Today the site is honest only when a founder manually aligns Sanity fields with physical truth. Checkout does **not** decrement stock; `quantity` is optional and ignored at purchase time.

---

## Three layers of truth

| Layer | What it is | Where it lives | Customer-visible? |
| --- | --- | --- | --- |
| **Public website state** | What buyers can see and attempt to purchase | Sanity `flowerProduct` (`active`, `inStock`, price, images, `shipsNationwide`); `siteSettings.standStatus` / `standMessage`; `/farm-stand` copy | **Yes** |
| **Internal operational state** | Counts, notes, sales logs, garden logs, audit timestamps | Admin quick stock (`quantity`), `internalNotes`, `flowerSalesRecord`, bloom/harvest log, seed ledger | **No** |
| **Founder judgment** | Quality, timing, “worth listing,” leave-to-grow, weather calls, photo choice | Your head + field notes until logged | **Indirectly** (via what you publish) |

**Do not yet automate:** stock decrement on Stripe webhook, cart caps from `quantity`, bloom-driven `inStock`, or stand-closed checkout blocks. Gear 1 must run reliably by hand first.

---

## When to run this workflow

| Rhythm | Minimum ritual |
| --- | --- |
| **Before opening / restocking stand** | Full pre-open checklist (below) |
| **Mid-day (busy stand days)** | Quick shelf + `quantity` + cash log spot-check |
| **After website orders** | Admin → Orders; reconcile shelf if shipped/stand pickup implied |
| **End of day** | End-of-day reset (below) |
| **Season close** | Season-close ritual (below) |

---

## Pre-open checklist (full)

Complete in order. Use `docs/operations/ritualmaker-bloom-harvest-log-template-v0-1.md` for garden steps 1–3.

### 1. Stand walk (physical)

- [ ] Walk the stand: shelves clean, labels readable, QR codes intact
- [ ] Count what is actually on the shelf (by SKU / bouquet tier if possible)
- [ ] Note anything wilted, damaged, or mislabeled — pull or replace before opening
- [ ] Confirm cash box / QR checkout path works (optional: one test scan to staging if changing systems)

### 2. Bloom / harvest check (garden)

- [ ] Fill bloom/harvest log for today (beds checked, harvestable now, leave-to-grow)
- [ ] Decide **potential bouquet count** vs **stand-ready count** (they are not the same)
- [ ] Cross-check seed ledger zones if cutting from specific beds

### 3. Product readiness check (quality + CMS)

For each SKU you intend to sell today (core: Glimmer, Blessing, Abundance; plus pantry as applicable):

- [ ] **Worth listing?** (founder judgment — stems ready, water fresh, packaging on hand)
- [ ] **Photo matches reality?** Gallery should resemble what is on the shelf or in hand today
- [ ] **Price still correct?**
- [ ] **Shipping flag correct?** (`shipsNationwide` only if you will actually pack and ship)
- [ ] Admin **product issues** clear? (title, price, image — see Admin → Products badges)

### 4. Sanity — stand status (`siteSettings`)

Edit in **Sanity Studio** (not yet in Next admin Settings):

| Field | Values | Public effect |
| --- | --- | --- |
| `standStatus` | `open` \| `restocking` \| `closed` | Pill on home + farm-stand; header “Shop” vs “Stand closed” |
| `standMessage` | Short line, e.g. “Restocked through the day” | Shown with status pill |

- [ ] Set `standStatus` to match today (open / restocking / closed)
- [ ] Set `standMessage` to a true, short line — not a promise you cannot keep

**Note:** `standStatus === closed` does **not** hide products or block checkout. Pair with `inStock` changes for flowers if the stand is closed but shipped pantry continues.

### 5. Sanity — product availability (`flowerProduct`)

Per SKU on Admin → Dashboard **Quick stock** or Admin → Products:

| Field | Public effect | Checkout effect |
| --- | --- | --- |
| `active` | Hidden from shop if false | Blocked if false |
| `inStock` | Hidden from shop if false | Blocked if false |
| `quantity` | **Not shown to customers; not enforced** | **Ignored** — internal notebook only |

- [ ] Turn **on** only SKUs you can fulfill today
- [ ] Turn **off** (`inStock: false` or `active: false`) anything not on the shelf or not cuttable
- [ ] Optional: set `quantity` to **bouquets on shelf right now** (manual decrement after each sale)

**Semantics for `quantity` (Gear 1):** “Physical units I believe are available at the stand **right now**.” Update after each stand sale and website order you fulfill from stand stock. Software will not do this for you yet.

### 6. Direct / cash sale log review

- [ ] Open Admin → Settings → **Record walk-up sale**
- [ ] Log any cash/Venmo sales since last check (use `itemName` matching `publicName` until SKU picker exists)
- [ ] Compare logged sales to shelf count and optional `quantity`

### 7. Website / Stripe sale awareness

- [ ] Admin → Dashboard → **Recent checkout orders** or Admin → Orders
- [ ] For each new Stripe order: note item names, fulfill from shelf or ship queue
- [ ] Manually adjust `quantity` / `inStock` if shelf is now empty
- [ ] Remember: webhook creates `flowerSalesRecord` only — **no automatic stock update**

### 8. Photo / content capture prompt

If anything looks especially good today:

- [ ] Capture 1–3 photos (stand, bouquet in hand, bed in bloom)
- [ ] Upload via Admin → Media; attach to product gallery if replacing stale hero image
- [ ] Optional: Instagram story/post if stand is open and stock is real

Do not publish product promises in social copy that exceed Sanity `inStock` state.

---

## Mid-day spot-check (5 minutes)

- [ ] Glance at shelf vs `quantity`
- [ ] Log cash sales
- [ ] Toggle `inStock` off for anything sold out
- [ ] Update `standMessage` if restocking later (“Back on shelf ~4pm”)

---

## End-of-day reset

- [ ] Final stand walk — pull unsold perishables or move to compost/cool storage
- [ ] Set `inStock: false` for flower SKUs not carried overnight on the stand
- [ ] Update `quantity` to 0 or next-morning expected count
- [ ] Log remaining cash sales
- [ ] Note in bloom/harvest log: what was left in field, what to cut tomorrow
- [ ] If stand empty for the day: consider `standStatus: restocking` or `closed` with honest `standMessage`

---

## Season-close ritual

When the stand season ends (or flowers pause but pantry shipping may continue):

1. `siteSettings.standStatus` → **closed**
2. `standMessage` → honest seasonal line (e.g. “Closed for the season — pantry ships while marked”)
3. All **flower** `flowerProduct` rows → `inStock: false` (or `active: false` if fully delisting)
4. **Pantry** SKUs: leave `inStock: true` only if you will ship; verify `shipsNationwide` matches fulfillment capacity
5. Do **not** expand public “24/7” or always-open structured data claims until operational proof exists

---

## What remains founder judgment (not system truth)

- Whether stems are long enough for Blessing vs Glimmer
- Whether weather makes today a stand day or ship-only day
- Whether a bed should be cut hard or left for seed / next flush
- Whether a product photo is “good enough” or misleading
- Whether to answer Instagram DMs with “yes, still there” — always verify shelf + Sanity first
- Whether to honor a website order when shelf just sold out (human fulfillment decision)

---

## What should not yet be automated

| Automation | Why defer |
| --- | --- |
| Webhook → decrement `quantity` / flip `inStock` | Cash/stand sales bypass the webhook; would over-report stock |
| Bloom calendar → auto `inStock` | Garden judgment and quality gates are not codified |
| Cart max from `quantity` | `quantity` discipline not proven in Gear 1 |
| Hide shop when `standStatus: closed` | Shipped pantry may still be valid; needs Gear 2 banner UX |
| Public “last updated” timestamp | Needs honest update ritual first |

---

## Quick reference — Sanity fields touched

**Site Settings** (`siteSettings`): `standStatus`, `standMessage`  
**Flower Service Product** (`flowerProduct`): `active`, `inStock`, `quantity` (optional), `shipsNationwide`, `gallery`, `internalNotes`  
**Flower Sales Record** (`flowerSalesRecord`): manual cash/Venmo; Stripe auto via webhook

**Storefront query:** `active == true && inStock == true` → `/farm-stand`  
**Stand pill:** `StandStatus` component — does not gate products

---

## Success criteria (Gear 1)

You can answer “yes” without guessing:

1. What is on the shelf right now?
2. What does the website say is purchasable?
3. Do those match?
4. Where did today’s sales get recorded (Stripe vs manual)?
5. What will tomorrow’s cut list look like?

When this is stable for **2–4 weeks**, consider Gear 2 (admin stand controls, stale-stock warnings, seasonal banner) per `RITUALMAKER_INVENTORY_TRUTH_AUDIT_01.md`.
