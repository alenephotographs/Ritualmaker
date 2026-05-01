# Build notes

## Local `next build`

`next build` runs **lint + typecheck** and collects route data. Any module that imports `@/sanity/client` (or `getSanityProjectId` / `getSanityDataset`) runs at build time and **requires**:

- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`

Optional:

- `NEXT_PUBLIC_SANITY_API_VERSION` (defaults to `2024-11-01` in `src/sanity/env.ts`)

Copy `.env.example` → `.env.local` and set real values. Next.js loads `.env.local` automatically.

**Local-only compile check:** `pnpm check` runs `lint`, `tsc --noEmit`, then `ALLOW_BUILD_WITHOUT_SANITY=1 pnpm build` so the app can compile when those vars are unset (placeholder project/dataset — **no real CMS data**). See `src/sanity/env.ts`.

## Vercel

Confirm **Production** (and Preview, if used) has at least:

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Public; required for build + runtime reads |
| `NEXT_PUBLIC_SANITY_DATASET` | Public; required |
| `NEXT_PUBLIC_SANITY_API_VERSION` | Optional; defaults in code |

Server-only (set in Vercel if used by your deployment):

- `SANITY_API_READ_TOKEN` — only if any server code uses a read token (this repo’s public client does not require it for basic reads)
- `SANITY_API_WRITE_TOKEN` — admin writes / webhooks as implemented

**Do not** set `ALLOW_BUILD_WITHOUT_SANITY=1` on Vercel for a real site unless you intentionally want placeholder IDs (you almost never do).

## Scripts

- `pnpm build` — production-style build; **needs real Sanity env** (or placeholders only if you manually export `ALLOW_BUILD_WITHOUT_SANITY=1`, not recommended for real data).
- `pnpm check` — `lint` + `typecheck` + compile-only build with `ALLOW_BUILD_WITHOUT_SANITY=1`.

## Verifying deployments

After `git push`, open the Vercel project → **Deployments** → latest → **Building** logs. A green build means `next build` completed on Vercel’s env (including their configured variables). This repository cannot read your Vercel dashboard from CI unless the `vercel` CLI is logged in.
