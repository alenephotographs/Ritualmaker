# Worklog — System index pass

**Date:** 2026-05-20  
**Agent:** Cloud Agent (Cursor)  
**Branch:** `cursor/system-index-pass-ab0b`  
**Scope:** Documentation only — no product features

## Objective

Create or update the repo-native **system index** for Ritualmaker per SYSTEM INDEX PASS request.

## Deliverables

| File | Action |
|------|--------|
| `docs/internal/00_SYSTEM_INDEX.md` | Created — purpose, domains, SoT, blockers, GitHub routing, handoff template, next-safe-action rules |
| `docs/internal/01_ARCHITECTURE_MAP.md` | Created — mermaid diagram, route/API maps, Sanity vs Supabase split |
| `docs/internal/worklog/2026-05-20_system-index-pass.md` | Created (this file) |
| `README.md` | Updated — Documentation section with discovery links |

## Findings

- No prior `docs/internal/` tree; no GitHub Issues in repo yet.
- Canonical proposal CRM is **Supabase** (`client_documents`); Sanity `eventOrder` still listed on owner dashboard (blocker B3).
- README project tree partially stale (`/shop`, `/gallery` as pages vs redirects/sections).
- Latest `main` commit at pass start: `1fd65ef` (admin events route clash fix).

## Blockers recorded

See `00_SYSTEM_INDEX.md` § Unresolved blockers (B1–B5).

## Next safe action

Human or ChatGPT: validate index against production reality; open GitHub Issues for cutover prep and `eventOrder` deprecation decision.

## Handoff

Use the filled block at the bottom of `00_SYSTEM_INDEX.md` with commit SHA after push.
