import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

const crons = cronJobs();

// Runs once a day to move any scholarship/opportunity with a passed
// ISO deadline from "active" to "expired". See convex/maintenance.ts
// for what this does and does not do.
crons.daily(
  'expire stale listings',
  { hourUTC: 3, minuteUTC: 0 },
  internal.maintenance.expireStaleListings
);

// Re-checks link reachability for every already-verified listing once a
// week, demoting anything whose application/source link has gone dead back
// to needs_review. See convex/ingestion.ts revalidateVerifiedListings.
crons.weekly(
  'revalidate verified listings',
  { dayOfWeek: 'monday', hourUTC: 4, minuteUTC: 0 },
  internal.ingestion.revalidateVerifiedListings
);

// No ingestion cron is registered yet — there is no external source
// adapter enabled yet (see convex/sources/manualAdapter.ts for why). Add
// one here (e.g. crons.daily('ingest <source>', ..., internal.sources.<x>.run))
// once a real source has been evaluated and approved.

export default crons;
