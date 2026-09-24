// Sync for the Erasmus Mundus Catalogue RSS feed (see
// convex/sources/erasmusMundusAdapter.ts for what the feed is and why it's
// trusted). This is GamScholarship's highest-priority automated source:
// an official EU government feed that needs zero API keys, so it runs
// out of the box on a fresh deployment -- unlike convex/discovery.ts's
// Google-CSE-plus-Anthropic fallback, which only fires for domains that
// don't publish a feed like this one.
//
//   RSS feed (paginated) -> parseRssFeed -> normalizeErasmusMundusItem
//        -> convex/ingestion.ts's ingestDiscovered (same validation +
//           duplicate-check + reachability pipeline as every other source)
//
// Pagination: the feed is a Drupal Views RSS export, which conventionally
// supports `?page=N`. This has NOT been confirmed against every possible
// page (only page 0, fetched directly, was confirmed while building this
// adapter) -- runSync defends against that uncertainty by stopping the
// moment a page returns zero new items or a non-200 response, rather than
// assuming a fixed page count. Worst case if pagination isn't supported:
// every "page" returns the same ~20 most-recent items, which just means
// wasted fetches, not incorrect data -- duplicate detection in
// convex/ingestion.ts (matched by sourceId = the programme's own URL)
// makes repeats a no-op re-ingest rather than a duplicate listing.

import { internalAction } from './_generated/server';
import { internal } from './_generated/api';
import { parseRssFeed, normalizeErasmusMundusItem } from './sources/erasmusMundusAdapter';
import {
  OFA_SCHOLARSHIPS_FEED_URL,
  OFA_SOURCE_NAME,
  extractOfficialUrl,
  normalizeOfaScholarshipItem,
} from './sources/ofaScholarshipsAdapter';

const FEED_URL = 'https://www.eacea.ec.europa.eu/node/253/rss_en';
const MAX_PAGES = 6; // ~20 items/page -> up to ~120 programmes per run
const FETCH_TIMEOUT_MS = 15000;
const SOURCE_NAME = 'erasmus-mundus-catalogue-rss';
const OFA_FETCH_TIMEOUT_MS = 15000;
const OFA_MAX_ITEMS = 15; // feed is typically ~10; hard cap keeps runs bounded

async function fetchText(url: string, timeoutMs: number): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': 'GamScholarshipBot/1.0 (+https://gamscholarship.online)' },
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function fetchPage(page: number): Promise<string | null> {
  const url = page === 0 ? FEED_URL : `${FEED_URL}?page=${page}`;
  return fetchText(url, FETCH_TIMEOUT_MS);
}

export const runErasmusMundusSync = internalAction({
  args: {},
  handler: async (ctx) => {
    const enabledNames: string[] = await ctx.runQuery(internal.discovery.listEnabledSourceNames, {});
    if (!enabledNames.includes(SOURCE_NAME)) return; // not registered/enabled -- see scripts/setupSources.mjs

    const startedAt = new Date().toISOString();
    let retrieved = 0;
    let accepted = 0;
    let rejected = 0;
    const errors: string[] = [];
    const seenGuids = new Set<string>();

    try {
      for (let page = 0; page < MAX_PAGES; page++) {
        const xml = await fetchPage(page);
        if (!xml) break; // end of pagination, or the page param isn't supported -- stop rather than guess further

        let items;
        try {
          items = parseRssFeed(xml);
        } catch (err) {
          errors.push(`parse page ${page}: ${(err as Error).message}`);
          break;
        }
        if (items.length === 0) break;

        const newItems = items.filter((i) => !seenGuids.has(i.guid));
        if (newItems.length === 0) break; // same items again -> pagination isn't advancing; stop
        for (const item of newItems) seenGuids.add(item.guid);

        retrieved += newItems.length;

        for (const item of newItems) {
          try {
            const listing = normalizeErasmusMundusItem(item);
            const result: any = await ctx.runMutation(internal.ingestion.ingestDiscovered, { listing });
            if (result?.verificationStatus === 'rejected') rejected++;
            else accepted++;
          } catch (err) {
            errors.push(`ingest ${item.guid}: ${(err as Error).message}`);
            rejected++;
          }
        }
      }
    } catch (err) {
      errors.push((err as Error).message);
    }

    const status = errors.length === 0 ? 'success' : accepted > 0 ? 'partial' : 'failed';
    await ctx.runMutation(internal.discovery.recordRunResult, {
      sourceName: SOURCE_NAME,
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
 * Opportunities for Africans (scholarships category) RSS sync.
 * Aggregator discovery only — each item’s OFA post is fetched so we can
 * extract an official apply URL before ingest. Items without a usable
 * official URL are skipped (counted as rejected).
 */
export const runOfaScholarshipsSync = internalAction({
  args: {},
  handler: async (ctx) => {
    const enabledNames: string[] = await ctx.runQuery(internal.discovery.listEnabledSourceNames, {});
    if (!enabledNames.includes(OFA_SOURCE_NAME)) return;

    const startedAt = new Date().toISOString();
    let retrieved = 0;
    let accepted = 0;
    let rejected = 0;
    const errors: string[] = [];

    try {
      const xml = await fetchText(OFA_SCHOLARSHIPS_FEED_URL, OFA_FETCH_TIMEOUT_MS);
      if (!xml) {
        errors.push('Failed to fetch OFA scholarships RSS feed.');
      } else {
        let items;
        try {
          items = parseRssFeed(xml);
        } catch (err) {
          items = [];
          errors.push(`parse feed: ${(err as Error).message}`);
        }

        retrieved = items.length;
        for (const item of items.slice(0, OFA_MAX_ITEMS)) {
          try {
            const postHtml = await fetchText(item.link, OFA_FETCH_TIMEOUT_MS);
            if (!postHtml) {
              rejected++;
              errors.push(`fetch post failed: ${item.link}`);
              continue;
            }
            const officialUrl = extractOfficialUrl(postHtml, item.title);
            if (!officialUrl) {
              rejected++;
              errors.push(`no official URL: ${item.title.slice(0, 60)}`);
              continue;
            }
            const listing = normalizeOfaScholarshipItem(item, officialUrl);
            if (!listing) {
              rejected++;
              continue;
            }
            const result: any = await ctx.runMutation(internal.ingestion.ingestDiscovered, {
              listing,
            });
            if (result?.verificationStatus === 'rejected') rejected++;
            else accepted++;
          } catch (err) {
            errors.push(`ingest ${item.guid}: ${(err as Error).message}`);
            rejected++;
          }
        }
      }
    } catch (err) {
      errors.push((err as Error).message);
    }

    const status = errors.length === 0 ? 'success' : accepted > 0 ? 'partial' : 'failed';
    await ctx.runMutation(internal.discovery.recordRunResult, {
      sourceName: OFA_SOURCE_NAME,
      startedAt,
      status,
      retrieved,
      accepted,
      rejected,
      error: errors.length > 0 ? errors.slice(0, 5).join(' | ') : undefined,
    });
  },
});
