// Automated discovery pipeline for the "official site" sources listed in
// convex/sources/officialSiteSources.ts.
//
//   Google Programmable Search (site-restricted) -> candidate page URLs
//         v
//   fetch each page, strip to text (htmlToText)
//         v
//   Anthropic API extracts ONE structured listing per page, or {found:false}
//         v
//   convex/ingestion.ts's ingestDiscovered -- same validation, duplicate
//   check, and URL-reachability verification as every other source
//
// This file is the only place that calls two external, keyed APIs (Google
// Custom Search JSON API and the Anthropic Messages API). Both keys are
// read from Convex environment variables and never touch the frontend.
// If either key is missing, runDiscoveryForSource records why in the
// `sources` table and returns early rather than throwing -- a missing key
// on one source should never crash the whole cron run.
//
// Rate limiting: the free tier of the Google Custom Search JSON API is 100
// queries/day. With ~7 sources x up to 2 queries each = ~14 queries per
// run, running this weekly (see convex/crons.ts) uses a small fraction of
// that and leaves headroom to add more sources later. Increase the cron
// frequency only after checking your actual Google Cloud quota/billing.

import { v } from 'convex/values';
import { internalAction, internalMutation, internalQuery } from './_generated/server';
import { internal } from './_generated/api';
import { OFFICIAL_SITE_SOURCES } from './sources/officialSiteSources';
import {
  htmlToText,
  buildExtractionPrompt,
  parseExtractionResponse,
  EXTRACTION_SYSTEM_PROMPT,
} from './sources/officialSiteAdapter';

const MAX_RESULTS_PER_SOURCE = 6; // candidate pages per source per run -- keeps CSE + Anthropic usage predictable
const FETCH_TIMEOUT_MS = 10000;
const ANTHROPIC_MODEL = 'claude-sonnet-4-6';

type CseResult = { url: string; title: string };

async function searchGoogleCse(
  domain: string,
  query: string,
  apiKey: string,
  cseId: string
): Promise<CseResult[]> {
  const params = new URLSearchParams({
    key: apiKey,
    cx: cseId,
    q: query,
    siteSearch: domain,
    siteSearchFilter: 'i',
    num: '10',
  });
  const res = await fetch(`https://www.googleapis.com/customsearch/v1?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Google Custom Search API responded with status ${res.status}`);
  }
  const data: any = await res.json();
  const items = Array.isArray(data.items) ? data.items : [];
  return items
    .map((item: any) => ({ url: item.link as string, title: (item.title as string) ?? '' }))
    .filter((r: CseResult) => typeof r.url === 'string' && r.url.startsWith('http'));
}

async function fetchPageText(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(url, { redirect: 'follow', signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') ?? '';
    if (!contentType.includes('text/html') && !contentType.includes('text/plain')) return null;
    const html = await res.text();
    return htmlToText(html);
  } catch {
    return null;
  }
}

async function extractListingFromPage(
  pageUrl: string,
  pageText: string,
  sourceLabel: string,
  sourceName: string,
  anthropicApiKey: string
) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': anthropicApiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 1200,
      system: EXTRACTION_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildExtractionPrompt(pageText, pageUrl, sourceLabel) }],
    }),
  });
  if (!res.ok) {
    throw new Error(`Anthropic API responded with status ${res.status}`);
  }
  const data: any = await res.json();
  const textBlock = (data.content ?? []).find((b: any) => b.type === 'text');
  if (!textBlock) return { found: false as const };
  return parseExtractionResponse(textBlock.text, sourceName, pageUrl);
}

/**
 * Runs discovery for a single source: search -> fetch -> extract -> ingest.
 * Always records a result to the `sources` table and an `ingestionRuns`
 * row, whether it succeeds, partially succeeds, or fails outright -- so a
 * source that's silently broken shows up rather than just going quiet.
 */
export const runDiscoveryForSource = internalAction({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const source = OFFICIAL_SITE_SOURCES.find((s) => s.slug === slug);
    const startedAt = new Date().toISOString();
    if (!source) {
      await ctx.runMutation(internal.discovery.recordRunResult, {
        sourceName: slug,
        startedAt,
        status: 'failed',
        retrieved: 0,
        accepted: 0,
        rejected: 0,
        error: `Unknown source slug "${slug}" -- not present in officialSiteSources.ts.`,
      });
      return;
    }

    const googleApiKey = process.env.GOOGLE_API_KEY;
    const googleCseId = process.env.GOOGLE_CSE_ID;
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

    if (!googleApiKey || !googleCseId) {
      await ctx.runMutation(internal.discovery.recordRunResult, {
        sourceName: source.slug,
        startedAt,
        status: 'failed',
        retrieved: 0,
        accepted: 0,
        rejected: 0,
        error: 'GOOGLE_API_KEY / GOOGLE_CSE_ID not configured on this Convex deployment.',
      });
      return;
    }
    if (!anthropicApiKey) {
      await ctx.runMutation(internal.discovery.recordRunResult, {
        sourceName: source.slug,
        startedAt,
        status: 'failed',
        retrieved: 0,
        accepted: 0,
        rejected: 0,
        error: 'ANTHROPIC_API_KEY not configured on this Convex deployment.',
      });
      return;
    }

    let retrieved = 0;
    let accepted = 0;
    let rejected = 0;
    const errors: string[] = [];

    try {
      const seenUrls = new Set<string>();
      const candidates: CseResult[] = [];
      for (const query of source.searchQueries) {
        if (candidates.length >= MAX_RESULTS_PER_SOURCE) break;
        try {
          const results = await searchGoogleCse(source.domain, query, googleApiKey, googleCseId);
          for (const r of results) {
            if (!seenUrls.has(r.url) && candidates.length < MAX_RESULTS_PER_SOURCE) {
              seenUrls.add(r.url);
              candidates.push(r);
            }
          }
        } catch (err) {
          errors.push(`search "${query}": ${(err as Error).message}`);
        }
      }

      retrieved = candidates.length;

      for (const candidate of candidates) {
        const pageText = await fetchPageText(candidate.url);
        if (!pageText || pageText.length < 200) {
          rejected++;
          continue;
        }

        let extraction;
        try {
          extraction = await extractListingFromPage(
            candidate.url,
            pageText,
            source.label,
            source.slug,
            anthropicApiKey
          );
        } catch (err) {
          errors.push(`extract ${candidate.url}: ${(err as Error).message}`);
          rejected++;
          continue;
        }

        if (!extraction.found) {
          rejected++;
          continue;
        }

        try {
          const result: any = await ctx.runMutation(internal.ingestion.ingestDiscovered, {
            listing: extraction.listing,
          });
          if (result?.verificationStatus === 'rejected') {
            rejected++;
          } else {
            accepted++;
          }
        } catch (err) {
          errors.push(`ingest ${candidate.url}: ${(err as Error).message}`);
          rejected++;
        }
      }
    } catch (err) {
      errors.push((err as Error).message);
    }

    const status = errors.length === 0 ? 'success' : accepted > 0 ? 'partial' : 'failed';
    await ctx.runMutation(internal.discovery.recordRunResult, {
      sourceName: source.slug,
      startedAt,
      status,
      retrieved,
      accepted,
      rejected,
      error: errors.length > 0 ? errors.slice(0, 5).join(' | ') : undefined,
    });
  },
});

/**
 * Loops every enabled source and runs discovery for each in turn. Enabled
 * is read from the `sources` table (see scripts/setupSources.mjs), not
 * hardcoded here, so a source can be paused (e.g. it's failing repeatedly,
 * or its terms changed) with `ensureSource`/a dashboard edit rather than a
 * code change. Sources not yet registered in the table are skipped -- run
 * scripts/setupSources.mjs once after deploying to register the curated
 * list from officialSiteSources.ts.
 */
export const runAllDiscovery = internalAction({
  args: {},
  handler: async (ctx) => {
    const enabledNames: string[] = await ctx.runQuery(internal.discovery.listEnabledSourceNames, {});
    for (const slug of OFFICIAL_SITE_SOURCES.map((s) => s.slug)) {
      if (!enabledNames.includes(slug)) continue;
      await ctx.runAction(internal.discovery.runDiscoveryForSource, { slug });
    }
  },
});

export const listEnabledSourceNames = internalQuery({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query('sources').collect();
    return all.filter((s) => s.enabled).map((s) => s.name);
  },
});

export const recordRunResult = internalMutation({
  args: {
    sourceName: v.string(),
    startedAt: v.string(),
    status: v.union(v.literal('success'), v.literal('partial'), v.literal('failed')),
    retrieved: v.number(),
    accepted: v.number(),
    rejected: v.number(),
    error: v.optional(v.string()),
  },
  handler: async (ctx, { sourceName, startedAt, status, retrieved, accepted, rejected, error }) => {
    const finishedAt = new Date().toISOString();
    await ctx.db.insert('ingestionRuns', {
      sourceName,
      startedAt,
      finishedAt,
      status,
      retrieved,
      accepted,
      rejected,
      error,
    });

    const existing = await ctx.db
      .query('sources')
      .withIndex('by_name', (q) => q.eq('name', sourceName))
      .unique();
    if (!existing) return; // source not registered yet -- run result is still logged above

    const patch: Record<string, unknown> = {
      lastRunAt: finishedAt,
      lastRunStats: { retrieved, accepted, rejected },
    };
    if (status === 'failed') {
      patch.lastFailureAt = finishedAt;
      patch.lastError = error;
      patch.consecutiveFailures = ((existing as any).consecutiveFailures ?? 0) + 1;
    } else {
      patch.lastSuccessAt = finishedAt;
      patch.consecutiveFailures = 0;
      if (status === 'partial') patch.lastError = error;
      else patch.lastError = undefined;
    }
    await ctx.db.patch(existing._id, patch);
  },
});
