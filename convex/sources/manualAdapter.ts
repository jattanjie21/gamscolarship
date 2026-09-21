import type { NormalizedListing } from './types';

/**
 * The "manual" source: listings researched and entered by a person (or by
 * Claude, on request, one verified program at a time) rather than pulled
 * from an external API. This is the only source currently enabled — see
 * scripts/seedData.mjs for the actual entries and scripts/seed.mjs for how
 * they're pushed through the same ingestion pipeline as any other source.
 *
 * A manual entry still goes through the full pipeline (validation +
 * duplicate check) rather than being force-verified, so a typo'd URL or an
 * accidental duplicate gets caught the same way it would from an API.
 *
 * ---
 * ADDING A REAL EXTERNAL SOURCE LATER:
 * 1. Confirm the API's docs/terms permit displaying its data on
 *    GamScholarship (see README "Adding a new source").
 * 2. Add a row to the `sources` table (name, label, kind: "api", trustLevel).
 * 3. Create convex/sources/<name>Adapter.ts exporting a function that
 *    fetches from the API (inside a Convex `action`, so the API key stays
 *    server-side) and returns NormalizedListing[] in this same shape.
 * 4. Wire it into convex/ingestion.ts's `runIngestionForSource`.
 * 5. Add a cron entry in convex/crons.ts for how often it should run.
 * No source adapter is committed here yet beyond "manual" — per the
 * project rule against integrating an API before its terms have actually
 * been checked, and none have been confirmed yet.
 */
export function normalizeManualEntry(raw: Record<string, unknown>): NormalizedListing {
  const sourceName = 'manual';

  if (raw.kind === 'opportunity') {
    return {
      kind: 'opportunity',
      sourceName,
      sourceId: raw.sourceId as string | undefined,
      title: raw.title as string,
      organization: raw.organization as string,
      category: raw.category as string,
      country: raw.country as string,
      deadline: raw.deadline as string,
      description: raw.description as string,
      applicationUrl: raw.applicationUrl as string,
      officialSourceUrl: raw.officialSourceUrl as string | undefined,
    };
  }

  return {
    kind: 'scholarship',
    sourceName,
    sourceId: raw.sourceId as string | undefined,
    title: raw.title as string,
    organization: raw.organization as string,
    country: raw.country as string,
    level: raw.level as string,
    funding: raw.funding as string,
    field: raw.field as string,
    deadline: raw.deadline as string,
    description: raw.description as string,
    eligibility: (raw.eligibility as string[]) ?? [],
    requirements: (raw.requirements as string[]) ?? [],
    benefits: (raw.benefits as string[]) ?? [],
    applicationUrl: raw.applicationUrl as string,
    officialSourceUrl: raw.officialSourceUrl as string | undefined,
  };
}
