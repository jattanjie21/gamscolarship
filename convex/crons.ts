import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

const crons = cronJobs();

// Runs once a day to move any scholarship/opportunity with a passed
// ISO deadline from "active" to "expired". See convex/maintenance.ts
// for what this does and does not do.
crons.daily(
  'expire stale listings',
  { hourUTC: 3 },
  internal.maintenance.expireStaleListings
);

// Re-checks listings that are waiting for their first automated link
// verification. Unverified listings never appear publicly.
crons.interval(
  'retry pending verification',
  { minutes: 360 },
  internal.ingestion.recheckPendingListings
);

// Re-checks link reachability for every already-verified listing once a
// week, demoting anything whose application/source link has gone dead back
// to pending so automated verification can retry. See convex/ingestion.ts.
crons.weekly(
  'revalidate verified listings',
  { dayOfWeek: 'monday', hourUTC: 4, minuteUTC: 0 },
  internal.ingestion.revalidateVerifiedListings
);

// Automated discovery, tier 1: the Erasmus Mundus Catalogue RSS feed (see
// convex/rssIngestion.ts). A genuine government-published structured feed
// -- needs zero API keys, so this runs on a fresh deployment with nothing
// configured beyond ADMIN_KEY + scripts/setupSources.mjs. Twice weekly is
// deliberately conservative for a feed that's "updated yearly" per its own
// page, with occasional new items added between updates.
crons.interval(
  'sync erasmus mundus catalogue (RSS)',
  { hours: 84 },
  internal.rssIngestion.runErasmusMundusSync
);

// Opportunities for Africans scholarships RSS — aggregator discovery with
// official-URL extraction. No API keys. Daily is enough for a ~10-item feed.
crons.interval(
  'sync ofa scholarships (RSS)',
  { hours: 24 },
  internal.rssIngestion.runOfaScholarshipsSync
);

// Automated discovery, tier 2 (fallback): searches each enabled
// official-site source (see convex/sources/officialSiteSources.ts) for new
// scholarship pages and feeds anything found through the same ingestion
// pipeline as a manual entry. No-ops per source with a clear reason
// (recorded on the `sources` table) if GOOGLE_API_KEY / GOOGLE_CSE_ID /
// ANTHROPIC_API_KEY aren't set. Weekly keeps Google Custom Search usage a
// small fraction of its free 100-queries/day quota -- see
// convex/discovery.ts for the exact math.
crons.weekly(
  'discover scholarships from official sources',
  { dayOfWeek: 'wednesday', hourUTC: 5, minuteUTC: 0 },
  internal.discovery.runAllDiscovery
);

export default crons;
