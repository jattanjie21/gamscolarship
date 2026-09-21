// Pushes the starter dataset through the real ingestion pipeline (not a
// direct insert) — so even this "trusted" manual data gets the same
// validation, duplicate-check, and link-reachability treatment that any
// future external source would get.
//
// Usage (after `npx convex dev` has created your deployment):
//
//   npx convex env set ADMIN_KEY "choose-a-long-random-string"
//   CONVEX_URL=... ADMIN_KEY=... node scripts/seed.mjs
//
// (CONVEX_URL is written to .env.local by `npx convex dev` — most shells
// will pick it up automatically if you `export $(cat .env.local | xargs)`
// first, or just paste the value directly.)

import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';
import { scholarships, opportunities } from './seedData.mjs';

const convexUrl = process.env.CONVEX_URL || process.env.VITE_CONVEX_URL;
const adminKey = process.env.ADMIN_KEY;

if (!convexUrl) {
  console.error(
    'Missing CONVEX_URL (or VITE_CONVEX_URL) environment variable.\n' +
      'Run `npx convex dev` first — it writes CONVEX_URL to .env.local — then re-run this script.'
  );
  process.exit(1);
}

if (!adminKey) {
  console.error(
    'Missing ADMIN_KEY environment variable.\n' +
      'Set one on your Convex deployment first: npx convex env set ADMIN_KEY "your-secret"\n' +
      'then pass the same value here: ADMIN_KEY="your-secret" node scripts/seed.mjs'
  );
  process.exit(1);
}

const client = new ConvexHttpClient(convexUrl);

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function main() {
  console.log('Registering the "manual" source...');
  await client.mutation(api.admin.ensureSource, {
    adminKey,
    name: 'manual',
    label: 'Manually researched & verified entries',
    kind: 'manual',
    trustLevel: 'high',
    notes: 'Entered by a person (or Claude, on request) one program at a time, sourced from official program pages.',
  });

  console.log(`Ingesting ${scholarships.length} scholarships...`);
  for (const s of scholarships) {
    const result = await client.mutation(api.ingestion.ingestManual, {
      adminKey,
      listing: { kind: 'scholarship', sourceId: slugify(s.title), ...s },
    });
    console.log(`  ${s.title} -> ${result.verificationStatus}`);
  }

  console.log(`Ingesting ${opportunities.length} opportunities...`);
  for (const o of opportunities) {
    const result = await client.mutation(api.ingestion.ingestManual, {
      adminKey,
      listing: { kind: 'opportunity', sourceId: slugify(o.title), ...o },
    });
    console.log(`  ${o.title} -> ${result.verificationStatus}`);
  }

  console.log(
    '\nDone. Entries that came back "pending" will move to "verified" automatically within a few ' +
      'seconds once their links are confirmed reachable (see convex/ingestion.ts). Anything that ' +
      'came back "needs_review" needs a look — check verificationNotes on that record (Convex ' +
      'dashboard, or the admin query in convex/admin.ts).'
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
