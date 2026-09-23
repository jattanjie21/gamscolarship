# GamScholarship

GamScholarship is a scholarship discovery platform. The public site focuses on scholarship listings and sends applicants to the official application page.

## Core rules

- Only active scholarships with `verificationStatus = verified` are public.
- API responses are not treated as proof by themselves.
- Listings go through automated validation, duplicate checks, and URL reachability checks.
- Unverified or rejected listings stay hidden.
- There is no human approval step in the scholarship publishing workflow.
- Source/API keys must stay server-side.

## Tech stack

- React 18
- Vite
- React Router v6
- Convex
- Plain CSS

## Local setup

```bash
npm install
npx convex dev
```

Copy the Convex URL into `.env.local`:

```env
VITE_CONVEX_URL=https://your-deployment.convex.cloud
```

For source setup/seed scripts, set a server-side admin key:

```bash
npx convex env set ADMIN_KEY "choose-a-long-random-string"
```

Then seed the current starter records:

```bash
CONVEX_URL=https://your-deployment.convex.cloud ADMIN_KEY="choose-a-long-random-string" node scripts/seed.mjs
```

The seed script uses the same automated ingestion pipeline as future source adapters.

## Development

```bash
npm run dev
npm run build
```

Convex regenerates `convex/_generated/` when `npx convex dev` runs. Do not edit generated files by hand.

## Automated discovery

GamScholarship discovers, ingests, and verifies new scholarships automatically — no daily manual entry required — using a two-tier priority order:

**Tier 1 — official feed (no credentials needed).** The [Erasmus Mundus Catalogue](https://www.eacea.ec.europa.eu/scholarships/erasmus-mundus-catalogue_en), published as an RSS feed by EACEA (a European Commission executive agency), lists 200+ currently EU-funded Erasmus Mundus Joint Master programmes — most offering full scholarships. `convex/rssIngestion.ts` syncs it directly:

```
EACEA RSS feed (eacea.ec.europa.eu/node/253/rss_en, paginated)
        -> parseRssFeed -> normalizeErasmusMundusItem (convex/sources/erasmusMundusAdapter.ts)
        -> convex/ingestion.ts (same validation + duplicate + reachability checks as any other source)
```

This works immediately after `scripts/setupSources.mjs` is run — no API key of any kind. Runs every 84 hours by default (`convex/crons.ts`).

**Tier 2 — official-site discovery (fallback, needs 3 API keys).** For official providers that don't publish a feed, `convex/discovery.ts` searches only that provider's own domain and extracts a structured listing from the page it finds:

```
Google Custom Search (site-restricted to one official domain at a time)
        -> candidate page URLs
        -> fetch page, strip to text
        -> Anthropic API extracts ONE listing per page, or reports "not found"
        -> convex/ingestion.ts (same validation + duplicate + reachability checks)
```

**This only searches each source's own official domain** (`siteSearch`) — it never crawls the open web or third-party scholarship directories, which is what keeps discovered pages first-party and avoids re-importing the template-farm problem the legacy PHP cache had. Google Search is a fallback for sources without a feed/API — never the platform's primary data source.

### Enabling it

1. Register the curated sources (safe to re-run any time):
   ```bash
   CONVEX_URL=... ADMIN_KEY=... node scripts/setupSources.mjs
   ```
   This alone is enough for Tier 1 (the Erasmus Mundus RSS feed) to start working — trigger it immediately instead of waiting for the cron with:
   ```bash
   npx convex run rssIngestion:runErasmusMundusSync
   ```
2. For Tier 2 (official-site discovery), set three more Convex environment variables (in addition to `ADMIN_KEY`):
   ```bash
   npx convex env set GOOGLE_API_KEY "your-google-api-key"
   npx convex env set GOOGLE_CSE_ID "your-programmable-search-engine-id"
   npx convex env set ANTHROPIC_API_KEY "your-anthropic-api-key"
   ```
   - `GOOGLE_API_KEY` / `GOOGLE_CSE_ID`: create a [Programmable Search Engine](https://programmablesearchengine.google.com/) set to "search the entire web" (the code restricts it per-domain at query time via `siteSearch`), then enable the [Custom Search JSON API](https://developers.google.com/custom-search/v1/overview) in Google Cloud and generate an API key. Free tier: 100 queries/day.
   - `ANTHROPIC_API_KEY`: an Anthropic API key, used server-side only (inside a Convex `action`) to extract structured fields from page text. Never exposed to the frontend.
   Then either wait for the weekly cron or trigger a run immediately:
   ```bash
   npx convex run discovery:runAllDiscovery
   ```

If any of the three Tier 2 keys is missing, discovery for that run is skipped and the reason is recorded on the `sources` table (`lastError`) and in `ingestionRuns` — it does not crash the cron or affect Tier 1 or other sources. Tier 1 has no such dependency and runs regardless.

### Adding another source

- **Another official feed/API** (highest priority): write a new adapter under `convex/sources/`, following the shape of `erasmusMundusAdapter.ts`, then a sync action following `convex/rssIngestion.ts`'s pattern, and register it in `scripts/setupSources.mjs`.
- **Another official-site fallback**: add an entry to `OFFICIAL_SITE_SOURCES` in `convex/sources/officialSiteSources.ts` (domain, label, trust level, search queries) **only after independently confirming it's that provider's own official domain**, then re-run `scripts/setupSources.mjs`.

## Adding a different kind of real scholarship source

Before connecting any other external source (a genuine partner API, an official feed, etc.):

1. Confirm its terms permit the intended use and public display.
2. Confirm it provides enough information to identify the scholarship and its official application/source page.
3. Confirm the data can be checked automatically.
4. Confirm API credentials can remain server-side.

A source adapter should normalize external records into the existing `NormalizedListing` shape (`convex/sources/types.ts`), then pass them through `convex/ingestion.ts`'s pipeline. No source should bypass verification.
