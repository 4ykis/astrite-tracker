<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- Everything below is hand-written. `next dev` only manages the block above. -->

# Astrite Tracker — project guide for AI agents

Read this first: it is a map of the repo, so you do not need to scan it. If it disagrees with the code, the code wins — then fix this file (see "Keeping this file true").

## Snapshot

- Personal Wuthering Waves tracker: Astrite balance, gacha pity log, weapon/skill materials, echo prefarm builds. **Multi-user** (Google login); every user sees only their own data.
- Next 16.3.5 (App Router) · React 19.2 · Prisma 6 + Postgres · Tailwind 4 (dark theme only) · Recharts 3 · TypeScript strict. Alias `@/` → `src/`. `src/` is ~70 files.
- **No test suite.** Verify with `npx tsc --noEmit`, `npm run lint` and the dev server (preview config `wuwa`, port 3000).
- Language: talk to the user in Ukrainian. UI copy is Ukrainian; code, comments and commit messages are English (`feat:` / `fix:` / `refactor:` / `chore:`).
- Repo: `origin` = `git@github.com:4ykis/astrite-tracker.git`, default branch `master`. Vercel project: `astrite-tracker-v547`.

## Map

Route folder = URL; `(app)` is a route group (not in the URL). Paths below are relative to `src/app/(app)/`.

| URL | Files | Logic | Tables |
| --- | --- | --- | --- |
| `/` dashboard | `page.tsx`, `BalanceForm`, `IncomeStats`, `SpendStats`, `actions.ts` (balance CRUD) | `lib/income.ts`, `lib/spending.ts` | BalanceEntry, SpendEntry |
| `/gacha` | `gacha/page.tsx`, `PityBlock`, `PullList`, `gacha/actions.ts` | `lib/gacha.ts` | PityCounter, PullEntry, SpendEntry |
| `/resources` | `resources/page.tsx`, `ResourcesForm`, `resources/actions.ts` | `lib/materials.ts` (catalogue), `lib/resources.ts` | ResourceEntry |
| `/echoes` | `echoes/page.tsx`, `BuildCard.tsx` (biggest file, editing UI) + `*Picker`/`StatRow`/`SonataSelect`, `echoes/actions.ts` | `lib/echoes.ts`, `lib/data/*.json` | EchoBuild |
| `/history` | `history/page.tsx` (queries prisma directly, paginated) composing `BalanceHistory`, `spending/SpendList`, `gacha/PullList`, `ResourceHistory`; `spending/actions.ts` (edit/delete spend) | `lib/resources.ts` (timeline) | Balance/Spend/Pull/Resource |
| `/stats` | `stats/page.tsx`, `StatsChart`, `SpendByCategoryChart` | `lib/income.ts` (`getIncomeSeries`) | BalanceEntry, SpendEntry |
| `/login`, `/login/google`, `/login/google/callback`, `/logout` | `src/app/login/**`, `src/app/logout/route.ts` | `lib/google.ts` (OAuth + PKCE), `lib/auth.ts` (HMAC session token), `lib/session.ts` | User |

Cross-cutting:

- `src/proxy.ts` — Next 16's renamed middleware (`proxy`, not `middleware`). Redirects to `/login` without a valid `wuwa_session` cookie. Its matcher **excludes** `login`, `materials`, `icons`, `_next/static`, `_next/image`, `favicon.ico`.
- `src/lib/session.ts` — `requireUserId()` (redirects to `/login`) and `getCurrentUser()`. `(app)/layout.tsx` renders `NavBar` for the current user.
- `src/lib/prisma.ts` singleton client · `src/lib/date.ts` all day/timezone logic.
- `src/components/` — `Card`, `Modal` (client), `MaterialIcon`, `NavBar` (the list of nav links lives here).
- `prisma/schema.prisma` + `prisma/migrations/` · `scripts/` — `local-db.mjs` (embedded Postgres), `fetch-echo-data.ts`, `fetch-material-icons.ts`.

Finding things fast:

- All DB access is in `src/lib/*.ts`, in `actions.ts`, or directly in a `page.tsx` (history, stats, echoes, resources). To find every use of a table: grep `prisma\.<model>\.`.
- Server actions: grep `export async function` in `src/app/**/actions.ts`. Numbers/formulas live in `lib/*.ts`, not in pages.
- Do not read: `public/`, `.next/`, `.pgdata/`, `node_modules/`, `package-lock.json`, `*.tsbuildinfo`, old `prisma/migrations/*`, `src/lib/data/*.json` (generated). **Never read, print or commit `.env`** (secrets; variable names are in `.env.example`).

## Invariants (breaking these fails silently)

1. **Tenant scoping.** Every model except `User` has `userId` → `User` (`onDelete: Cascade`, plus an `@@index`/`@@id`/`@@unique` that starts with `userId`). Every read/write starts with `const userId = await requireUserId()` and filters by it; update/delete use `where: { id, userId }`. Never trust a client-supplied id alone. A new model follows the same shape and gets a relation field on `User`.
2. **Dates.** `date` columns are UTC-midnight markers of the *tracked day* = calendar day in `Europe/Kyiv` that rolls over at **12:00**, not midnight (hard-coded for all users). Create with `toDayStart(new Date())` (now) or `parseDateInput("YYYY-MM-DD")` (form input, no noon shift); shift with `addDays`/`addMonths`/… from `lib/date.ts`. Never `new Date()`, `setHours` or `toISOString().slice(0, 10)` for these fields.
3. **Income vs spend.** `income = balance_end − balance_start` (pure balance change). Spend lives in `SpendEntry` and is never added to income. All-time income also counts the very first balance (`getIncomeSummary`).
4. **Gacha.** `PULL_COST` 160, soft pity 66, hard pity 80 (`lib/gacha.ts`). Pity buttons create `SpendEntry` rows in the same `prisma.$transaction` as the pity/pull change — keep that atomic.
5. **Resources are sparse.** A `ResourceEntry` row exists only when an item's amount changed that day (`saveResources` drops rows equal to the carried-forward value). Current amounts = `getResourcesAsOf()`, history = `getResourceTimeline()`. Item ids are in-game ids from `lib/materials.ts`; changing an id orphans stored rows.
6. **Echo builds.** `EchoBuild.slots` is a Json column, read and written as a whole and always through `normalizeSlots()` (shape: `EchoSlot` in `lib/echoes.ts`). Order = `position`, then `createdAt`.
7. **Generated data.** `src/lib/data/*.json`, `public/icons/**`, `public/materials/**` come from `scripts/` (source: static.nanoka.cc; game version is a constant in `fetch-echo-data.ts`). Re-run the script instead of hand-editing.
8. **Cache.** Every `(app)` page is `export const dynamic = "force-dynamic"`. After a mutation call `revalidatePath` for every page that shows the data (current convention: balance → `/`, `/history`; spend edit/delete → `/`, `/stats`, `/history`; pity/5★ → `/gacha`, `/`, `/history`, `/stats`; pull edit/delete → `/gacha`, `/`, `/history`; resources → `/resources`, `/history`; echoes → `/echoes`).
9. **Public assets vs auth.** A new folder under `public/` that must load without a session (like `icons`, `materials`) has to be added to the `src/proxy.ts` matcher exclusions, otherwise it redirects to `/login`.
10. **UI.** Dark only (slate-950/900 surfaces, amber accents, `color-scheme: dark` in `globals.css`), Tailwind utilities inline, no CSS modules. Reuse `Card`, `Modal`, `MaterialIcon`. Server components by default; `"use client"` only for interactive parts (currently: forms, lists with inline editing, pickers, charts, `Modal`). Form actions take `(…args, _prevState, formData)` and return `{ error?: string }` with a Ukrainian message.

Patterns already in use for Next 16 — copy them: `cookies()` is async; `searchParams` is a `Promise`; layout props typed as `LayoutProps<"/">`. For anything new, read the matching guide in `node_modules/next/dist/docs/01-app/` first (e.g. `01-getting-started/07-mutating-data.md`, `09-revalidating.md`, `16-proxy.md`, `02-guides/authentication.md`, `02-guides/environment-variables.md`).

## Commands

```bash
npm run dev            # http://localhost:3000
npm run db:local       # embedded Postgres on :51218, data in .pgdata — keep it running in its own terminal
npm run db:migrate     # prisma migrate dev (create + apply a migration after editing schema.prisma)
npm run db:studio
npx tsc --noEmit && npm run lint
npx tsx scripts/fetch-echo-data.ts        # refresh characters/echoes/sonatas + icons (needs network)
npx tsx scripts/fetch-material-icons.ts
```

`npm run build` = `prisma migrate deploy && next build`: it **applies pending migrations to whatever DB the env vars point at**. The local `.env` points at local Postgres (`localhost:51218`), so local builds are safe; never run it with production URLs in the environment.

## Workflows

**Change the schema.** Edit `prisma/schema.prisma` → with `db:local` running: `npx prisma migrate dev --name <snake_case>` → commit the new `prisma/migrations/<timestamp>_<name>/`. Never edit an already-applied migration. Migrations run on production automatically at every deploy build, so they must be safe for existing rows: add nullable/defaulted columns or backfill (model: `20260929180000_users`). Anything destructive (drop/rename column or table, data rewrite) needs explicit user approval first. Keep the `legacy-owner` user row: it holds pre-login data until the `LEGACY_OWNER_EMAIL` account first logs in. If Prisma types look stale: `npx prisma generate` (also runs on `npm install`).

**Add a page.** `src/app/(app)/<route>/page.tsx` (+ `actions.ts` and client components next to it) → `requireUserId()` at the top → `export const dynamic = "force-dynamic"` → link in `src/components/NavBar.tsx` → new row in the Map above.

**Add a server action.** In that route's `actions.ts` (`"use server"`): `requireUserId()` → validate input → Prisma call scoped by `userId` → `revalidatePath` for every page showing the data.

**Add an env var.** Read it in one place (like `getSecret()` in `lib/auth.ts`, throwing a clear error if unset) → add to `.env.example` and the README → set it in the Vercel project before deploying.

## Pre-deploy checklist

1. `npx tsc --noEmit` and `npm run lint` are clean.
2. Every `schema.prisma` change has a committed migration, and it is non-destructive (or approved).
3. Required env vars exist in Vercel: `WUWA_PRISMA_DATABASE_URL`, `WUWA_DATABASE_URL` (auto-injected by the Vercel Postgres/Neon integration), `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SESSION_SECRET`, optional `LEGACY_OWNER_EMAIL`.
4. A new production domain needs `https://<domain>/login/google/callback` in the Google OAuth client's redirect URIs.
5. New public asset folders are in the proxy matcher exclusions (invariant 9).
6. `.env` is not staged (it is gitignored and listed in `.vercelignore`).
7. **Deploy = `git push` to `master`.** Vercel's git integration builds and releases automatically; there is no manual step. So pushing to `master` is a production release, including `prisma migrate deploy`: run items 1–6 *before* pushing, and push only when the user asks. After a push, the result is visible in the Vercel dashboard (project `astrite-tracker-v547`); a failed build leaves the previous deployment live, but a migration that already ran is not rolled back.
8. Other branches (`feat/*`) may also get Vercel Preview builds that run the same `npm run build`. Before pushing a branch that contains a migration, check which database the Preview env vars point to — if it is the production one, the branch push alone would migrate production.

## Known stale docs (trust the code, not these)

- `README.md` "Структура" omits `/resources` and `/echoes`.
- `lib/date.ts` header calls the app "single-user"; it is multi-user (the timezone is still one fixed value for everyone).
- The `getIncomeSeries` doc comment in `lib/income.ts` says income adds spend; the code returns them separately (invariant 3).

## Keeping this file true

When you add, move or remove a route, `lib/` module, model, env var, script, or change how deploys work, update the matching section here in the same change. Keep it a map, not a manual: paths and non-obvious rules only.
