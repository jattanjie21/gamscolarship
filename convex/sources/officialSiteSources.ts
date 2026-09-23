// Curated allowlist for the "official site" discovery adapter
// (convex/discovery.ts). This is the actual list of real sources the
// automated pipeline is allowed to touch — nothing outside this list is
// ever searched or ingested by discovery.
//
// Why an allowlist instead of open-web crawling:
//   1. Legality/reliability: these are the providers' own official domains
//      — first-party information, not a third-party aggregator with
//      unclear reuse terms.
//   2. Signal quality: general web search for "scholarship" surfaces mostly
//      SEO-farmed aggregator/directory sites (the exact "International
//      Education Foundation"-style template-farm problem this project has
//      already hit once with the old PHP cache). Restricting discovery to
//      a provider's own domain avoids re-importing that problem.
//   3. Every entry here is either already used in scripts/seedData.mjs
//      (i.e. a domain the user has already manually verified points to a
//      real, currently-running program) or a well-documented, widely-cited
//      official government/university/foundation scholarship site. This
//      list is a starting point, not a finished catalog — add to it only
//      with domains you have independently confirmed are the provider's
//      own official site.
//
// Each entry becomes one row in the `sources` table (see
// scripts/setupSources.mjs) and one discovery target. `enabled` can be
// flipped per-source via convex/admin.ts's ensureSource without touching
// this file, but a source can only ever be enabled if it's listed here
// first — the code, not the database, is the source of truth for which
// domains are allowed.

export type OfficialSiteSource = {
  slug: string; // sourceName stored on scholarships/opportunities rows
  label: string;
  domain: string; // bare hostname, used as Google CSE `siteSearch`
  trustLevel: 'high' | 'medium' | 'low';
  region: string;
  notes: string;
  // Query terms tried against this domain, most useful first. Discovery
  // stops after the configured page budget regardless of how many queries
  // are listed — see MAX_RESULTS_PER_SOURCE in discovery.ts.
  searchQueries: string[];
};

export const OFFICIAL_SITE_SOURCES: OfficialSiteSource[] = [
  {
    slug: 'chevening-official-site',
    label: 'Chevening Scholarships (UK FCDO) — official site',
    domain: 'chevening.org',
    trustLevel: 'high',
    region: 'Global',
    notes: 'UK government scholarship programme; already used as a manual seed entry.',
    searchQueries: ['scholarship apply deadline', 'award eligibility apply now'],
  },
  {
    slug: 'daad-official-site',
    label: 'DAAD — German Academic Exchange Service — official site',
    domain: 'daad.de',
    trustLevel: 'high',
    region: 'Germany',
    notes: 'German government academic exchange agency; already used as a manual seed entry.',
    searchQueries: ['scholarship deadline apply', 'funding programme application'],
  },
  {
    slug: 'mastercard-foundation-official-site',
    label: 'Mastercard Foundation Scholars Program — official site',
    domain: 'mastercardfdn.org',
    trustLevel: 'high',
    region: 'Africa-focused',
    notes: 'Foundation-run program; already used as a manual seed entry.',
    searchQueries: ['scholars program apply', 'scholarship application deadline'],
  },
  {
    slug: 'cscuk-official-site',
    label: 'Commonwealth Scholarship Commission in the UK — official site',
    domain: 'cscuk.fcdo.gov.uk',
    trustLevel: 'high',
    region: 'Commonwealth countries, incl. The Gambia',
    notes: 'UK government body (FCDO); confirmed official domain via web search on 2026-09-22.',
    searchQueries: ['scholarships apply deadline', "master's PhD scholarship application"],
  },
  {
    slug: 'gatescambridge-official-site',
    label: 'Gates Cambridge Scholarship — official site',
    domain: 'gatescambridge.org',
    trustLevel: 'high',
    region: 'Global',
    notes: 'University of Cambridge / Gates Cambridge Trust program.',
    searchQueries: ['scholarship apply deadline', 'application requirements'],
  },
  {
    slug: 'fulbright-official-site',
    label: 'Fulbright Foreign Student Program — official site',
    domain: 'foreign.fulbrightonline.org',
    trustLevel: 'high',
    region: 'Global',
    notes: 'US Department of State exchange program.',
    searchQueries: ['apply deadline country', 'eligibility application'],
  },
  {
    slug: 'erasmusplus-official-site',
    label: 'Erasmus+ / Erasmus Mundus Joint Masters — official EU site',
    domain: 'erasmus-plus.ec.europa.eu',
    trustLevel: 'high',
    region: 'Global (EU-hosted programmes)',
    notes: 'European Commission official Erasmus+ site.',
    searchQueries: ['joint master scholarship apply', 'call for applications deadline'],
  },
];
