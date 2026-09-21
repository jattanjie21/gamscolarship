# GamScholarship

Gambia Scholarship & Study Abroad Portal &mdash; helping Gambian and
international students discover scholarships, study-abroad opportunities,
fellowships, and internships.

## Features

- Home page with featured scholarships, categories, and latest opportunities
- Searchable, filterable Scholarships listing (degree level, country,
  funding type, field of study)
- Scholarship details pages with eligibility, requirements, benefits, and
  an official application link
- Study Abroad page covering popular destinations (UK, Canada, USA,
  Germany, France, Turkey, China, Australia)
- Opportunities page (internships, fellowships, competitions, exchanges,
  research, training) with search and category filtering
- Prep Tips page &mdash; general guidance on documents, timelines, and how
  to prepare a strong application
- SmartCV promotion linking to an external CV-builder tool
- About and Contact pages (contact form uses a `mailto:` fallback &mdash;
  no backend required)
- Custom 404 page
- Responsive design (320px &ndash; 1440px+), accessible markup, and basic
  on-page SEO (titles + meta descriptions per page)
- Scholarship/opportunity data lives in a Convex database (not hardcoded
  files) so listings can be added, edited, or expired without a redeploy
- A private verification pipeline: nothing becomes publicly visible just
  because it was imported — every listing passes through validation,
  duplicate detection, and a link-reachability check before it counts as
  "verified." An automatic daily job expires anything past its deadline;
  a weekly job re-checks already-verified links and flags anything now
  broken
- A private admin review queue (`/admin`, not linked from the public nav)
  for approving, rejecting, or expiring listings by hand

## Tech Stack

- React 18
- Vite
- React Router v6
- Convex (database + backend functions, including the ingestion/
  verification pipeline)
- Plain CSS (no UI framework dependency)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Convex (one-time)

The site's scholarship/opportunity data lives in a Convex database, not in
static files. You need your own free Convex project:

```bash
npx convex dev
```

This will:
- Prompt you to log in / create a free account at convex.dev
- Create a new Convex project (or link to an existing one)
- Push the schema and functions in `convex/` to your deployment
- Write your deployment URL to `.env.local` as `CONVEX_URL`

Keep this command running in a terminal while you develop &mdash; it
watches `convex/` and pushes changes automatically.

Copy the URL it wrote into `.env.local` as `VITE_CONVEX_URL` too (Vite only
exposes env vars prefixed `VITE_` to the browser):

```bash
# .env.local
VITE_CONVEX_URL=https://your-deployment-name.convex.cloud
```

### 3. Set an admin key (one-time)

Every write to the database (ingesting a listing, approving/rejecting from
the review queue, editing a record) requires an admin key, checked
server-side — nothing in `src/` ever contains it. Pick a long random
string and set it on your deployment:

```bash
npx convex env set ADMIN_KEY "choose-a-long-random-string"
```

Keep this value somewhere you can paste it back in later (a password
manager) — you'll need it to seed data, review the queue, or run any
admin script. It is **not** stored in `.env`/`.env.local` and should never
be committed to Git.

### 4. Seed the starter dataset (one-time)

With `npx convex dev` still running in one terminal, run this in another:

```bash
CONVEX_URL=https://your-deployment-name.convex.cloud ADMIN_KEY="choose-a-long-random-string" node scripts/seed.mjs
```

(`CONVEX_URL` is the same value Convex wrote to `.env.local`.) This pushes
the starter dataset in `scripts/seedData.mjs` through the real ingestion
pipeline (`convex/ingestion.ts`'s `ingestManual`) — the same validation and
duplicate checks any future source would go through — rather than
inserting directly. The script prints each entry's resulting status
(`pending` → will auto-promote to `verified` within seconds once its link
is confirmed reachable; `needs_review` → check `verificationNotes` on that
record before it'll show publicly).

Re-running the script is safe-ish: entries carry a stable `sourceId`
(derived from title) so a re-run updates the existing record rather than
creating a duplicate, for the "manual" source specifically.

### 5. Run the dev server

```bash
npm run dev
```

The dev server runs at the URL Vite prints in the terminal (typically
`http://localhost:5173`).

### 6. Review the queue (as needed)

Visit `/admin` (e.g. `http://localhost:5173/admin`), paste in your admin
key, and approve/reject/expire anything sitting in `pending` or
`needs_review`. This page is not linked from the public site and is
excluded from `robots.txt` — treat the URL itself as semi-private, and see
"Admin access" below before giving anyone else the key.

> **Note on this generated project:** the `convex/_generated/` folder here
> was hand-written to match Convex's own codegen output exactly, so the
> project type-checks and builds before you've connected a deployment.
> The moment you run `npx convex dev`, Convex regenerates that folder
> itself against your real schema &mdash; that's expected, not an error.

## Production Build

```bash
npm run build
npm run preview
```

`npm run build` outputs static files to the `dist/` folder.

## Project Structure

```text
gamscolarship/
├── convex/
│   ├── schema.ts             # scholarships, opportunities & sources tables
│   ├── scholarships.ts       # public list/getById (verified+active only) + adminUpdate/adminRemove
│   ├── opportunities.ts      # same, for opportunities
│   ├── ingestion.ts          # ingestManual + the validate → dedupe → check-links pipeline
│   ├── validation.ts         # static content checks (required fields, URL shape, deadline sanity)
│   ├── duplicates.ts         # duplicate-likelihood scoring
│   ├── admin.ts              # listQueue / approve / reject / markExpired / ensureSource
│   ├── lib/adminAuth.ts      # shared admin-key check
│   ├── sources/
│   │   ├── types.ts          # NormalizedListing shape every adapter must produce
│   │   └── manualAdapter.ts  # the only active source right now — see its header comment
│   │       # for how to add a real external API adapter later
│   ├── maintenance.ts        # expireStaleListings (daily auto-expiry)
│   ├── crons.ts              # schedules expiry (daily) + link revalidation (weekly)
│   └── _generated/           # Convex codegen output (see note above)
├── scripts/
│   ├── seedData.mjs          # starter dataset (source of truth for seeding)
│   └── seed.mjs              # pushes seedData.mjs through the ingestion pipeline
├── public/
│   ├── favicon/
│   └── images/
├── src/
│   ├── components/           # Navbar, Footer, cards, SEO helper, etc.
│   ├── pages/                # One file per public route
│   ├── pages/admin/          # Private review queue (/admin) — not in the navbar
│   ├── data/                 # countries.js (Study Abroad page — still static)
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
├── vite.config.js
├── vercel.json                # SPA rewrite rules for Vercel
├── .env.example
└── README.md
```

## Data & Verification Pipeline

Scholarship and opportunity data lives in Convex, not in static files.
Every listing carries two independent status fields:

- **`status`** (`active` | `expired`) — is the opportunity still open?
  Maintained by the daily `expireStaleListings` cron.
- **`verificationStatus`** (`pending` | `verified` | `needs_review` |
  `rejected`) — has GamScholarship actually confirmed this is real and
  accurately described? **Only `verified` (and `active`) listings are ever
  returned by the public queries** in `scholarships.ts`/`opportunities.ts`
  — a direct link to an unverified listing's id 404s the same as an
  unknown id.

A listing becomes verified by going through `convex/ingestion.ts`:
1. Static checks (`convex/validation.ts`) — required fields present, URLs
   well-formed, deadline not already past, description not suspiciously
   thin, and a heuristic flag for templated/fabricated-looking entries
   (the exact pattern found in this project's old PHP-era scholarship
   cache — see git history/prior notes).
2. Duplicate scoring (`convex/duplicates.ts`) against existing listings —
   matches above a conservative threshold are flagged `needs_review` with
   `possibleDuplicateOf` set, never auto-merged or auto-deleted.
3. If both pass, the listing is inserted as `pending` and a follow-up
   action confirms its application/source links are actually reachable
   before promoting it to `verified`.

Anything that doesn't cleanly pass sits in `needs_review` or `pending`
until a person resolves it at `/admin` — nothing is published on an API's
word alone.

**Growing the dataset:** `scripts/seedData.mjs` ships with a curated
starter set of real, currently-running scholarships and opportunities
(Chevening, DAAD, Fulbright, MEXT, Gates Cambridge, and others), each with
a real official application link. There is currently no free, reliable
public API that aggregates scholarships globally, and no external source
adapter is wired up yet (see `convex/sources/manualAdapter.ts` for why and
what's needed to add one). Growing this toward hundreds of entries is a
curation process for now: research a program, confirm its current deadline
on its official page, then add it by calling `ingestion.ingestManual`
(from a script, the Convex dashboard's function runner, or by asking a
future Claude session to research and add a batch) — it'll go through the
same pipeline as everything else.

## Admin Access

The current setup uses a single shared `ADMIN_KEY` rather than individual
logins — enough to keep write access and the review queue out of the
public frontend, but not meant for handing out to more than one or two
trusted people long-term. Before growing the admin side beyond that:
- Swap `convex/lib/adminAuth.ts`'s `requireAdmin` for real per-person
  authentication (Convex Auth supports email/password, OAuth, etc.)
  without needing to change any of the functions that call it
- Consider IP-allowlisting or a signed, short-lived session token instead
  of a long-lived shared secret
- Rotate `ADMIN_KEY` (`npx convex env set ADMIN_KEY "..."`) if it's ever
  shared insecurely or you suspect it leaked

## Environment Variables

```text
VITE_CONVEX_URL=https://your-deployment-name.convex.cloud   # required — see Convex setup above
VITE_GA_ID=your-ga-measurement-id                              # optional — Google Analytics
```

`ADMIN_KEY` is **not** a `VITE_` variable and is never read by the
frontend build — it's set directly on the Convex deployment with
`npx convex env set ADMIN_KEY "..."` and passed as an argument by whoever
calls an admin function (the seed script, the `/admin` page, or a future
script), never baked into any bundled file.

`npx convex dev` writes `VITE_CONVEX_URL` into `.env.local` for local
development. For a deployed site (e.g. on Vercel), add the same variable
under Project Settings → Environment Variables using your **production**
Convex deployment URL (from `npx convex deploy` or the Convex dashboard).

## Deploying: GitHub

If this folder is not yet a Git repository:

```bash
git init
git remote add origin https://github.com/Palouis25/gamscolarship.git
git add .
git commit -m "Initial commit: GamScholarship React/Vite site"
git branch -M main
git push -u origin main
```

If the repository already exists locally (has a `.git` folder) or the
`origin` remote is already set, skip `git init` / `git remote add` and
just commit and push:

```bash
git add .
git commit -m "Rebuild GamScholarship as a React/Vite site"
git push -u origin main
```

> The previous version of this repository was a PHP/MySQL site. This
> rebuild replaces it with a static React/Vite front end with no backend
> or database — pushing will overwrite the PHP files in the repository
> history's latest commit (they remain recoverable via Git history).

## Deploying: Vercel

1. Push your Convex schema/functions to a **production** deployment first:
   ```bash
   npx convex deploy
   ```
   This gives you a production Convex URL, separate from your local dev
   deployment.
2. Go to [vercel.com](https://vercel.com) and import the
   `Palouis25/gamscolarship` GitHub repository.
3. Vercel should auto-detect the **Vite** framework preset. Confirm:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
4. Add environment variables under Project Settings → Environment
   Variables:
   - `VITE_CONVEX_URL` &mdash; your **production** Convex URL from step 1
   - `VITE_GA_ID` &mdash; optional
5. Seed the production database once, pointing the seed script at
   production:
   ```bash
   CONVEX_URL=https://your-prod-deployment.convex.cloud node scripts/seed.mjs
   ```
6. Deploy. The included `vercel.json` rewrite rule ensures client-side
   routes (e.g. `/scholarships`, `/study-abroad`) work correctly on
   refresh and direct navigation.
