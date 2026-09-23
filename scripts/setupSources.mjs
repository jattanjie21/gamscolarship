// Registers every source in convex/sources/officialSiteSources.ts as a row
// in the `sources` table, enabled by default, so convex/discovery.ts's
// weekly cron has something to run. Safe to re-run any time (ensureSource
// upserts by name) -- e.g. after adding a new source to that file.
//
// This does NOT itself fetch or ingest anything. It only registers which
// sources the automated discovery pipeline is allowed to run against.
// Actual discovery requires GOOGLE_API_KEY, GOOGLE_CSE_ID, and
// ANTHROPIC_API_KEY to also be set on the Convex deployment (see README).
//
// Usage:
//   CONVEX_URL=... ADMIN_KEY=... node scripts/setupSources.mjs

import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';

const convexUrl = process.env.CONVEX_URL || process.env.VITE_CONVEX_URL;
const adminKey = process.env.ADMIN_KEY;

if (!convexUrl || !adminKey) {
  console.error(
    'Missing CONVEX_URL (or VITE_CONVEX_URL) and/or ADMIN_KEY environment variables.\n' +
      'See README "Adding a real scholarship source" for setup steps.'
  );
  process.exit(1);
}

const client = new ConvexHttpClient(convexUrl);

// Duplicated here (rather than imported) because this is a plain Node
// script outside Convex's TypeScript build -- convex/sources/officialSiteSources.ts
// is the single source of truth for the actual list; keep this array's
// slug/label/domain fields in sync with it if you add a source there.
const SOURCES = [
  // Tier 1: genuine official feed, needs zero API keys (see convex/rssIngestion.ts).
  { name: 'erasmus-mundus-catalogue-rss', label: 'Erasmus Mundus Catalogue (EACEA / European Commission) -- official RSS feed', kind: 'api', trustLevel: 'high', notes: 'eacea.ec.europa.eu/node/253/rss_en -- no credentials required' },
  // Tier 2 (fallback): official-site discovery, needs GOOGLE_API_KEY/GOOGLE_CSE_ID/ANTHROPIC_API_KEY.
  { name: 'chevening-official-site', label: 'Chevening Scholarships (UK FCDO) -- official site', kind: 'official_site', trustLevel: 'high', notes: 'chevening.org' },
  { name: 'daad-official-site', label: 'DAAD -- German Academic Exchange Service -- official site', kind: 'official_site', trustLevel: 'high', notes: 'daad.de' },
  { name: 'mastercard-foundation-official-site', label: 'Mastercard Foundation Scholars Program -- official site', kind: 'official_site', trustLevel: 'high', notes: 'mastercardfdn.org' },
  { name: 'cscuk-official-site', label: 'Commonwealth Scholarship Commission in the UK -- official site', kind: 'official_site', trustLevel: 'high', notes: 'cscuk.fcdo.gov.uk' },
  { name: 'gatescambridge-official-site', label: 'Gates Cambridge Scholarship -- official site', kind: 'official_site', trustLevel: 'high', notes: 'gatescambridge.org' },
  { name: 'fulbright-official-site', label: 'Fulbright Foreign Student Program -- official site', kind: 'official_site', trustLevel: 'high', notes: 'foreign.fulbrightonline.org' },
  { name: 'erasmusplus-official-site', label: 'Erasmus+ / Erasmus Mundus Joint Masters -- official EU site', kind: 'official_site', trustLevel: 'high', notes: 'erasmus-plus.ec.europa.eu' },
];

async function main() {
  console.log(`Registering ${SOURCES.length} discovery sources...`);
  for (const s of SOURCES) {
    await client.mutation(api.admin.ensureSource, {
      adminKey,
      name: s.name,
      label: s.label,
      kind: s.kind,
      trustLevel: s.trustLevel,
      notes: s.notes,
    });
    console.log(`  registered: ${s.name}`);
  }
  console.log(
    '\nDone. Each source is enabled by default.\n' +
      '- erasmus-mundus-catalogue-rss starts working immediately (no extra keys needed) once the cron in convex/crons.ts runs, or right now:\n' +
      '    npx convex run rssIngestion:runErasmusMundusSync\n' +
      '- The *-official-site sources need GOOGLE_API_KEY, GOOGLE_CSE_ID, and ANTHROPIC_API_KEY set first (see README), then:\n' +
      '    npx convex run discovery:runAllDiscovery'
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
