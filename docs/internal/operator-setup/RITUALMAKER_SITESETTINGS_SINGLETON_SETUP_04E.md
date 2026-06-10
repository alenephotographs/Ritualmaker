# Ritualmaker — Site Settings singleton setup (Pass 04E)

**Audience:** Founder / operator  
**Mode:** CMS data setup — not a code change  
**Related:** PR #11 stand-closed boundaries · Pass 04D live QA proof

---

## 1. Purpose

This card enables **production stand season control** on https://ritualmakerny.com.

- **`standStatus`** drives open / restocking / closed behavior for the public shop (PR #11).
- Without a published **`siteSettings`** document in the **live storefront Sanity project**, the site defaults to **open** behavior: stand-only products stay visible and checkoutable even when the physical stand is closed.
- Pass 04D verified PR #11 logic against live product data only after a temporary public `siteSettings` doc existed; that doc was removed after QA. **You must publish this singleton once** for production control to work.

---

## 2. Dataset / project (read this first)

| Role | Project ID | Dataset | Used by |
| --- | --- | --- | --- |
| **Public storefront (authoritative for ritualmakerny.com)** | `vr38n49n` | `production` | Vercel production env · live `flowerProduct` + **`siteSettings`** |
| **Adapter / Studio cross-check** | `qjcf272e` | `ritualmaker` | Repo README · embedded Studio when local env points here |

**Warning:** Both projects can hold a `siteSettings` document. **Only `vr38n49n` / `production` affects the public site.** Editing `qjcf272e` / `ritualmaker` does **not** change ritualmakerny.com shop or stand status.

**Studio entry point (production):** https://ritualmakerny.com/studio — uses the Vercel production Sanity env (`vr38n49n` / `production`).

---

## 3. Required document

| Item | Value |
| --- | --- |
| **Document ID** | `siteSettings` (exactly — no prefix, no suffix) |
| **Document type** | `siteSettings` (Studio title: **Site Settings**) |
| **Critical field** | `standStatus`: `"open"` \| `"restocking"` \| `"closed"` |

### Schema reference

Source: `src/sanity/schemas/siteSettings.ts`

**No fields are marked required for publish validation.** Recommended minimum when creating the singleton:

| Field | Suggested initial value | Notes |
| --- | --- | --- |
| `title` | `Ritualmaker` | Site title |
| `tagline` | `Fresh flowers in the neighborhood, 24/7` | Softened automatically when `standStatus === "closed"` |
| `description` | Self-serve flowers at 38 Miller Hill Road… | Home meta / JSON-LD |
| `standStatus` | `open` | Start open unless intentionally closing |
| `standMessage` | e.g. `Restocked through the day` | Shown in stand status pill |
| `address` | `38 Miller Hill Road, Hudson Valley, NY` | Visit block |
| `instagramUrl` | `https://www.instagram.com/ritualmakerny` | Footer / outreach |
| `instagramHandle` | `@ritualmakerny` | Display |
| `facebookUrl` | `https://www.facebook.com/ritualmakerny` | Footer |
| `email` | `ritualmakerny@gmail.com` | Contact |

Optional: `mapUrl`, `googleReviewUrl`, `googleProfileUrl`, `heroImage`, `heroImageUrl`.

### ID warning (from Pass 04D)

Use **`_id: "siteSettings"`** only. A dotted ID such as `siteSettings.ritualmaker` was **not publicly readable** during QA and did not drive the storefront.

### Public read check (after publish)

Run in [Sanity Vision](https://www.sanity.io/docs/the-vision-plugin) against **`vr38n49n` / `production`**:

```groq
*[_type == "siteSettings"][0]{_id, standStatus, tagline}
```

Expect: `_id` is `siteSettings` and `standStatus` matches what you set.

---

## 4. Founder instructions (step-by-step)

1. **Open Studio for the production dataset**  
   Go to https://ritualmakerny.com/studio and sign in. Confirm you are editing **`vr38n49n` / `production`** (check project/dataset in Studio settings or Vision — not `qjcf272e` / `ritualmaker`).

2. **Create or locate Site Settings**  
   - If no `siteSettings` doc exists: create a new **Site Settings** document.  
   - Set document ID to **`siteSettings`** when prompted (or use Sanity Manage / API if Studio assigns a random ID — then recreate with the correct ID).  
   - If a doc exists with a different `_id`, prefer one canonical doc with `_id: "siteSettings"` and remove duplicates after verifying the public GROQ query above.

3. **Fill recommended fields** (section 3) and set **`standStatus`** to your intended public state.

4. **Publish** the document (not draft-only).

5. **Wait for cache / revalidate**  
   `/farm-stand` uses ISR with **`revalidate = 60`** seconds. Allow up to ~1 minute, or hard-refresh. If still stale, trigger a Vercel **production redeploy** and record the deploy SHA.

6. **Test on production**  
   - https://ritualmakerny.com/farm-stand  
   - https://ritualmakerny.com/farm-stand/product/glimmer (stand-only)  
   - https://ritualmakerny.com/farm-stand/product/garden-oil (shipped)

7. **Restore intended public state** after any closed-state test (usually `standStatus: "open"`).

---

## 5. Safe values for `standStatus`

| Value | Public behavior (PR #11) |
| --- | --- |
| **`open`** | Stand-only SKUs appear when `active && inStock`. Stand pickup checkout allowed. Header CTA: **Shop**. Default tagline may include “24/7”. |
| **`restocking`** | **Not treated as closed.** Shop/checkout behave like **open** (stand-only items remain visible and purchasable). UI shows **Restocking soon** pill via `StandStatus` component. Use for messaging only unless you intend full open behavior. |
| **`closed`** | Stand-only SKUs **hidden** from shop grid. Stand-only PDP shows unavailable / no purchase CTA. Stand-only checkout **blocked** (409). Shipped SKUs with `shipsNationwide === true` remain if `active && inStock`. Hero/footer copy softens “24/7”; header CTA: **Shop shipped items** (or **Stand closed**). |

---

## 6. Verification checklist

After publishing `siteSettings` in **`vr38n49n` / `production`**:

- [ ] Vision GROQ returns `_id: "siteSettings"` and expected `standStatus`
- [ ] `/farm-stand` stand-status pill / banner matches `standStatus`
- [ ] **`closed`:** Glimmer, Blessing, Abundance hidden from shop; Garden Oil / pantry shipped SKUs still listed if live
- [ ] **`closed`:** `/farm-stand/product/glimmer` — unavailable, no Add to cart
- [ ] **`closed`:** stand-only checkout blocked (409 or disabled checkout — do not complete a live payment for proof)
- [ ] **`open`:** all six live SKUs visible again (when `active && inStock`)
- [ ] Restore **`standStatus: "open"`** (or intended season state) after testing
- [ ] **No product edits** — do not change `active`, `inStock`, `shipsNationwide`, prices, or slugs to simulate closure
- [ ] Record **production deploy SHA** used during verification

---

## 7. Caching note

| Layer | Behavior |
| --- | --- |
| **Sanity client** | `useCdn: false` — published edits visible on next server fetch |
| **Next.js ISR** | `/farm-stand` revalidates every **60s** |
| **If stale** | Hard refresh → wait 60s → Vercel production redeploy |

During verification, note the **Vercel production commit SHA** (GitHub deployment or `VERCEL_GIT_COMMIT_SHA`).

---

## 8. Do-not-do list

- Do **not** set `active: false` or `inStock: false` on products just to close the stand — use `standStatus: "closed"`.
- Do **not** delete `flowerProduct` documents.
- Do **not** change prices, slugs, or `shipsNationwide` for stand-closure testing.
- Do **not** leave `standStatus: "closed"` on production after testing unless the stand is actually closed for the season.
- Do **not** paste API tokens, write tokens, or `.env` values into docs or tickets.
- Do **not** assume editing **`qjcf272e` / `ritualmaker`** changes the live site.

---

## 9. Next verification pass

After this singleton is published on production, run:

**RITUALMAKER PASS 04F — PRODUCTION SITESETTINGS LIVE TOGGLE PROOF**

Capture production screenshots with live `standStatus` toggles, admin Gear 1 checklist (if logged in), and record deploy SHA + before/during/after `standStatus` in a proof doc under `docs/internal/proof/`.

---

## Quick reference — live SKUs (Pass 04D snapshot)

| Slug | Type |
| --- | --- |
| `glimmer`, `blessing`, `abundance` | Stand-only |
| `garden-oil`, `botanical-sugar`, `herbal-tea` | Shipped (`shipsNationwide: true`) |
