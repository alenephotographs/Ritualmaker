# Ritualmaker — Task Routing Protocol

How Cursor agents (and humans) classify work, route to docs, and avoid founder retranslation. Complements **Build Control Logic** (operating spine) without replacing **Ritualmaker** as this repo’s identity.

---

## Startup ritual (required before acting)

Execute in order on **every new session** or **non-trivial task**:

1. Read [`README.md`](../../README.md)
2. Read [`00_SYSTEM_INDEX.md`](./00_SYSTEM_INDEX.md)
3. Read [`02_CURRENT_STATE.md`](./02_CURRENT_STATE.md)
4. **Classify the task** (§ Task classes below)
5. **Retrieve** task-specific docs via [`10_RETRIEVAL_QUERIES.md`](./10_RETRIEVAL_QUERIES.md)
6. **Check GitHub Issues** — `gh issue list` or UI; prefer Issues over chat-only blockers
7. Run **precognitive reorientation** (§ below) before major prompts, architecture changes, implementation, or high-stakes decisions
8. **Only then act** — smallest safe change; Ritualmaker-scoped only unless explicitly cross-repo
9. End with **ChatGPT handoff** (§ in `00_SYSTEM_INDEX.md`) when review is needed

**Docs-only passes** may skip step 7 if the change is typos/links only; still run steps 1–6.

---

## Precognitive reorientation tenet (required)

> The founder should not have to repeatedly force alternate-perspective thinking. The system must make that automatic.

Before **major implementation**, **architecture changes**, **metasystem changes in this repo**, or **high-stakes decisions** (DNS cutover, Stripe live, schema migrations, auth changes), the agent **must**:

1. **Step back** from the immediate local task
2. **Identify the actual problem** behind the local problem (e.g. “fix button” vs “stand revenue at risk”)
3. **Consider at least one alternate framing** (e.g. defer feature vs fix checkout first)
4. **Name what would go wrong** if work continued from the current framing only
5. **Separate paths** as relevant to Ritualmaker:
   - **Revenue** — stand QR, checkout, proposals paid
   - **Sovereignty** — secrets, owner access, data custody (**do not expose offline/sovereign material**)
   - **Archive** — photography, trademark evidence, inquiry records
   - **Implementation** — code, migrations, deploy, cutover
6. **List what the founder should not have to re-explain** (e.g. “QR codes stay on same domain”, “Webflow stays up during swap”)
7. **Only then** produce the operational prompt or **next safe action**

Record a 3–5 line reorientation summary in the worklog for passes that change architecture or production risk.

---

## Task classes

| Class | Examples | Primary docs | Issue labels |
|-------|----------|--------------|--------------|
| **stand-commerce** | Checkout, webhook, farm-stand UI | cutover.md, checkout route | `domain:farm-stand`, `priority:stand` |
| **proposals-crm** | client_documents, PDF, Stripe invoice | db.ts, proposal routes | `domain:proposals` |
| **admin-auth** | NextAuth, vendor codes, portal | auth.ts, admin routes | `domain:admin` |
| **cms** | Sanity schema, seed, Studio | sanity/schemas | `domain:cms` |
| **infra** | Vercel, Supabase migrate, env | BUILD_NOTES, migrations | `domain:infra` |
| **content-archive** | Copy, Live Collage™, USPTO | docs/live-collage-* | `domain:content` |
| **metasystem-docs** | Index, routing, handoff | docs/internal/* | `type:docs` |
| **out-of-scope** | New brand site, BCL rewrites, sovereign offline kits | — | Do not implement here; note in handoff |

---

## Next-safe-action rules (Ritualmaker)

1. **Protect stand checkout** — `/farm-stand`, `/api/checkout`, webhook; `priority:stand` blocks release
2. **No DNS cutover** without [`docs/cutover.md`](../cutover.md) checklist + owner sign-off
3. **No app/auth/schema/UI changes** during metasystem-docs passes unless explicitly requested
4. **Blockers → Issues** — chat-only blockers are not durable (see `12_GITHUB_ISSUE_TAXONOMY.md`)
5. **Supabase / Sanity** — review migrations and `pnpm sanity:deploy-schema` before apply
6. **Handoff** — use fenced `CHATGPT HANDOFF — COPY THIS` block when escalating

---

## What not to do in this repo

- Flatten Ritualmaker into generic “Human Intelligence Operating System” product language
- Store methodology essays or sovereign/offline archive material in this repo
- Use GitHub Issues as permanent home for long-form archive essays
- Create cross-brand features (Alene Creates, Artwork Identify, etc.) without a dedicated repo and startup ritual

---

## Escalation

| Situation | Route |
|-----------|--------|
| Needs ChatGPT review | Handoff block in `00_SYSTEM_INDEX.md` |
| Blocks stand or cutover | Issue + `priority:stand` |
| Cross-repo metasystem change | Handoff notes BCL / Active Archive; implement in correct repo |
| Unclear task class | Run precognitive reorientation; ask one focused question |
