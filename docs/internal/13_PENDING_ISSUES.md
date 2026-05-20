# Pending GitHub Issues (file manually)

`gh` integration cannot create labels/issues in this environment (HTTP 403). Copy each block into a new GitHub Issue, then delete this file’s corresponding section or close when filed.

Apply labels per [`12_GITHUB_ISSUE_TAXONOMY.md`](./12_GITHUB_ISSUE_TAXONOMY.md).

---

## Issue 1 — Cutover blocker (B1)

**Title:** Blocker: Webflow → Vercel production cutover not executed  
**Labels:** `type:blocker`, `domain:infra`, `priority:high`

```markdown
## Context
docs/internal/00_SYSTEM_INDEX.md — B1

## Problem
Live domain may still point at Webflow. Stand QR depends on zero-lapse swap per docs/cutover.md.

## Acceptance
- [ ] Staging E2E purchase at stand
- [ ] DNS checklist completed with owner sign-off
- [ ] First production purchase on Vercel confirmed

## Paths affected
Revenue, Implementation

## Next safe action
Follow docs/cutover.md T-7 checklist on staging; do not change DNS without owner.

## Source docs
- docs/cutover.md
```

---

## Issue 2 — CRM drift (B3)

**Title:** Drift: Sanity eventOrder vs Supabase client_documents (canonical CRM)  
**Labels:** `type:task`, `domain:admin`, `priority:normal`

```markdown
## Context
docs/internal/02_CURRENT_STATE.md — B3

## Problem
Owner dashboard still loads Sanity eventOrder while new proposals use Supabase client_documents.

## Acceptance
- [ ] Decision: deprecate eventOrder or sync display
- [ ] Dashboard shows single canonical CRM source

## Paths affected
Implementation, Revenue (admin accuracy)

## Next safe action
Audit AdminDashboard eventOrders usage; plan deprecation or migration.

## Source docs
- docs/internal/01_ARCHITECTURE_MAP.md
```

---

## Issue 3 — Stripe live (B5)

**Title:** Blocker: Stripe live mode + webhook verification for production stand  
**Labels:** `type:blocker`, `domain:farm-stand`, `priority:stand`

```markdown
## Context
docs/internal/00_SYSTEM_INDEX.md — B5

## Problem
Production stand checkout requires live Stripe + webhook; not verified in repo state.

## Acceptance
- [ ] STRIPE_WEBHOOK_SECRET on production
- [ ] Real-money test purchase at stand succeeds
- [ ] checkout.session.completed handled

## Paths affected
Revenue

## Next safe action
Configure webhook on staging; phone test before cutover.

## Source docs
- README.md, .env.example
```
