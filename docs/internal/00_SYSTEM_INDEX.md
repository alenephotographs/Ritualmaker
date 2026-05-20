# Ritualmaker — System Index

**Site:** Ritualmaker (`ritualmakerny.com`)  
**Repo:** [alenephotographs/Ritualmaker](https://github.com/alenephotographs/Ritualmaker)  
**Last updated:** 2026-05-20 (metasystem alignment pass)

---

## Metasystem placement (read first)

| Layer | Role | In this repo? |
|-------|------|----------------|
| **Build Control Logic / Founder Control Logic** | Operating spine — startup, verification, handoff | Referenced only; lives in BCL |
| **Alene’s Active Archive** | Ecosystem frame across repos/brands | Orientation only |
| **Ritualmaker (this repo)** | Embodied seasonal commerce, flowers, stand QR, proposals | **Full implementation here** |

Do **not** collapse Ritualmaker into generic Human Operating System language. Do **not** expose sovereign/offline material in this repo.

---

## Agent startup ritual

**Required:** [`11_TASK_ROUTING_PROTOCOL.md`](./11_TASK_ROUTING_PROTOCOL.md) § Startup ritual

1. README → 2. This index → 3. [`02_CURRENT_STATE.md`](./02_CURRENT_STATE.md) → 4. Classify task → 5. [`10_RETRIEVAL_QUERIES.md`](./10_RETRIEVAL_QUERIES.md) → 6. GitHub Issues → 7. Precognitive reorientation (if high-stakes) → 8. Act → 9. Handoff if needed

---

## Project purpose

Replace legacy **Webflow** for [ritualmakerny.com](https://ritualmakerny.com) with **Next.js 14**, preserving **zero-lapse** farm-stand QR checkout, plus farm stand commerce, on-location / Live Collage™, photography, and event proposal CRM (Supabase + Stripe).

---

## Active product domains

| Domain | Public routes | Primary data |
|--------|---------------|--------------|
| Home & brand | `/` | Sanity |
| Farm stand / QR | `/farm-stand`, `/checkout/*` | Sanity + Stripe |
| Photography | `/photography` | Static + Sanity |
| On-location / Live Collage™ | `/on-location` | Sanity inquiries |
| Event proposals | `/proposal/[token]` | Supabase `client_documents` |
| Admin | `/admin/*` | NextAuth + Supabase + Sanity |
| CMS | `/studio` | Sanity `ritualmaker` |

Details: [`01_ARCHITECTURE_MAP.md`](./01_ARCHITECTURE_MAP.md)

---

## Internal doc map

| Doc | Purpose |
|-----|---------|
| [`00_SYSTEM_INDEX.md`](./00_SYSTEM_INDEX.md) | This file — hub |
| [`01_ARCHITECTURE_MAP.md`](./01_ARCHITECTURE_MAP.md) | Routes, APIs, data split |
| [`02_CURRENT_STATE.md`](./02_CURRENT_STATE.md) | Local vs ecosystem, deploy snapshot |
| [`03_CURSOR_WORKLOG.md`](./03_CURSOR_WORKLOG.md) | Rolling agent worklog |
| [`10_RETRIEVAL_QUERIES.md`](./10_RETRIEVAL_QUERIES.md) | Task → doc/code lookup |
| [`11_TASK_ROUTING_PROTOCOL.md`](./11_TASK_ROUTING_PROTOCOL.md) | Startup ritual + precognitive reorientation |
| [`12_GITHUB_ISSUE_TAXONOMY.md`](./12_GITHUB_ISSUE_TAXONOMY.md) | Issue labels and routing |
| [`13_PENDING_ISSUES.md`](./13_PENDING_ISSUES.md) | Issue index (#6–#8); label apply reminder |

**External SoT:** [`README.md`](../../README.md), [`BUILD_NOTES.md`](../../BUILD_NOTES.md), [`docs/cutover.md`](../cutover.md), [`supabase/migrations/`](../../supabase/migrations/)

---

## Blockers

**Durable home:** GitHub Issues. Chat-only blockers are **invalid**.

| ID | Summary | Issue |
|----|---------|-------|
| B1 | Production Webflow → Vercel cutover not executed | [#6](https://github.com/alenephotographs/Ritualmaker/issues/6) |
| B3 | Dual CRM: Sanity `eventOrder` vs Supabase `client_documents` | [#7](https://github.com/alenephotographs/Ritualmaker/issues/7) |
| B5 | Stripe live + webhook not verified for production stand | [#8](https://github.com/alenephotographs/Ritualmaker/issues/8) |

Apply labels per [`12_GITHUB_ISSUE_TAXONOMY.md`](./12_GITHUB_ISSUE_TAXONOMY.md) (agent env may lack label write).

---

## Precognitive reorientation

Required before major implementation, architecture, or high-stakes decisions. Full tenet: [`11_TASK_ROUTING_PROTOCOL.md`](./11_TASK_ROUTING_PROTOCOL.md) § Precognitive reorientation.

---

## Next-safe-action (summary)

1. Protect `/farm-stand` + `/api/checkout` + webhook (`priority:stand`)
2. No DNS cutover without `docs/cutover.md` + owner sign-off
3. Metasystem/docs passes: no app/auth/schema/UI/API changes
4. Blockers → Issues; reference source docs in Issue body
5. Branch `cursor/<name>-ab0b`; handoff when ChatGPT review needed

---

## ChatGPT handoff (required format)

Every Cursor response needing **ChatGPT review** must end with one fenced block:

````
CHATGPT HANDOFF — COPY THIS
Repo: alenephotographs/Ritualmaker
Branch: <branch>
Commit SHA: <sha>
Completion stage: <e.g. metasystem-docs complete | in progress>
Files changed:
- <path>
Issues created/updated:
- #<n> or none
Tests/checks run:
- <e.g. none — docs-only per convention>
Production/deploy status:
- <e.g. unchanged; cutover not executed>
Known blockers:
- <Issue # or B-id>
What changed:
- <bullets>
What did not change:
- <app code, auth, checkout, DNS, etc.>
Startup ritual enforcement:
- yes | partial | no
Precognitive reorientation enforcement:
- yes | n/a (docs-only)
Next safe action:
- <one step>
ChatGPT verdict: accept | reject | audit further
````

---

## Quick commands

```bash
pnpm install && cp .env.example .env.local
pnpm dev
pnpm check    # compile without real Sanity
gh issue list
```
