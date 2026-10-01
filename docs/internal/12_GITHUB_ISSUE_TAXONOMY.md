# Ritualmaker — GitHub Issue Taxonomy

**Repo:** [alenephotographs/Ritualmaker](https://github.com/alenephotographs/Ritualmaker)

Issues are the **action and blocker layer**. Source docs and methodology stay in `docs/` — Issues **reference** them, they do not replace them.

---

## What becomes an Issue

| Situation | Issue type |
|-----------|------------|
| **Blocker** — work cannot proceed safely | `type:blocker` |
| **Failed verification** — test, build, stand test, webhook | `type:bug` or `type:blocker` |
| **Deferred task** — agreed but not now | `type:task` |
| **Drift correction** — doc/code mismatch (e.g. eventOrder vs client_documents) | `type:task` or `type:docs` |
| **Implementation** — feature or fix | `type:task` or `type:feature` |

**Do not file Issues for:** long-form archive essays, sovereign/offline kits, or Build Control Logic methodology — those belong in archive/BCL silos.

---

## Required Issue body (implementation / blocker)

```markdown
## Context
Link: docs/internal/00_SYSTEM_INDEX.md @ <commit sha>

## Problem
(One paragraph)

## Acceptance
- [ ] Verifiable criterion

## Paths affected
Revenue / Archive / Implementation / Sovereignty (as applicable)

## Next safe action
(Single step)

## Source docs
- [ ] e.g. docs/cutover.md
```

---

## Labels

### Domain (product area)

| Label | Use |
|-------|-----|
| `domain:farm-stand` | QR checkout, bouquets, flower products, Shippo |
| `domain:proposals` | `/proposal/[token]`, PDF, payment links, invoices |
| `domain:admin` | Portal, auth, vendor Connect |
| `domain:cms` | Sanity schemas, Studio, scripts |
| `domain:infra` | Vercel, Supabase, env, cutover |
| `domain:content` | Copy, on-location, trademark, photography |

### Type

| Label | Use |
|-------|-----|
| `type:blocker` | Stops safe progress |
| `type:bug` | Incorrect behavior |
| `type:task` | Planned work |
| `type:feature` | New capability |
| `type:docs` | Documentation only |

### Priority

| Label | Use |
|-------|-----|
| `priority:stand` | **P0** — physical stand sales or checkout at risk |
| `priority:high` | Cutover, auth, payments |
| `priority:normal` | Default |
| `priority:low` | Nice-to-have |

---

## Routing matrix

| Symptom | Labels | First doc |
|---------|--------|-----------|
| Checkout fails at stand | `domain:farm-stand`, `priority:stand`, `type:blocker` | cutover.md + checkout route |
| Proposal payment stale | `domain:proposals`, `type:bug` | clientDocumentPaymentState.ts |
| Dashboard shows wrong CRM | `domain:admin`, `type:task` | 02_CURRENT_STATE (eventOrder drift) |
| Build fails on Vercel | `domain:infra`, `type:bug` | BUILD_NOTES.md |
| DNS swap request | `domain:infra`, `priority:high`, `type:task` | cutover.md — **owner sign-off** |

---

## Chat-only blockers → Issue migration

If a blocker was only mentioned in Cursor/ChatGPT chat:

1. Open Issue with `type:blocker`
2. Paste summary + link to handoff commit
3. Close the chat thread only after Issue exists

---

## Agent workflow

1. After startup ritual, list open Issues matching task domain
2. If fixing blocker, reference Issue number in PR title/body
3. On handoff, fill `Issues created/updated:` field
