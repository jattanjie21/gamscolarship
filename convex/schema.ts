import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

// GamScholarship data model.
//
// Two concepts that are easy to conflate but must stay separate:
//   - `status`             lifecycle: is this opportunity still open?
//                           ("active" | "expired")
//   - `verificationStatus` trust: has GamScholarship confirmed this is a
//                           real, accurately-described opportunity?
//                           ("pending" | "verified" | "needs_review" | "rejected")
//
// Only rows with status="active" AND verificationStatus="verified" are
// ever returned by the public queries in scholarships.ts / opportunities.ts.
// An API returning a record is NOT verification — verificationStatus only
// moves to "verified" after the checks in convex/validation.ts pass.
//
// Deadlines are stored as ISO date strings ("YYYY-MM-DD") when a fixed
// date is known, or as a short descriptive string ("Varies by country —
// check the official site") when a program sets deadlines per country/
// institution.

const verificationStatus = v.union(
  v.literal('pending'), // newly ingested, not yet checked — never public
  v.literal('verified'), // passed validation — eligible for public display
  v.literal('needs_review'), // validation found something uncertain — needs a human
  v.literal('rejected') // failed validation or confirmed fake/invalid — never public
);

const lifecycleStatus = v.union(v.literal('active'), v.literal('expired'));

const listingSharedFields = {
  // --- public-facing content ---
  title: v.string(),
  organization: v.string(), // provider/institution running the program
  country: v.string(),
  deadline: v.string(),
  description: v.string(),
  applicationUrl: v.string(), // where a student applies
  officialSourceUrl: v.optional(v.string()), // the page GamScholarship verified this against, if different from applicationUrl

  // --- lifecycle ---
  status: lifecycleStatus,

  // --- provenance / pipeline (never shown to public users) ---
  sourceName: v.string(), // e.g. "manual", "owlflow", "daad-official-site"
  sourceId: v.optional(v.string()), // the source's own id for this record, for dedup/re-sync
  verificationStatus,
  verificationNotes: v.optional(v.string()), // why it's needs_review/rejected, for the admin queue
  possibleDuplicateOf: v.optional(v.string()), // another doc id, flagged not auto-merged
  isSample: v.boolean(), // illustrative/demo entry vs a freshly-verified real one
  lastCheckedAt: v.optional(v.string()), // ISO datetime — last time the pipeline touched this record
  lastVerifiedAt: v.optional(v.string()), // ISO datetime — last time it passed verification
  createdAt: v.string(),
  updatedAt: v.string(),
};

export default defineSchema({
  scholarships: defineTable({
    ...listingSharedFields,
    level: v.string(),
    funding: v.string(),
    field: v.string(),
    eligibility: v.array(v.string()),
    requirements: v.array(v.string()),
    benefits: v.array(v.string()),
  })
    .index('by_status', ['status'])
    .index('by_verification', ['verificationStatus'])
    .index('by_source', ['sourceName', 'sourceId']),

  opportunities: defineTable({
    ...listingSharedFields,
    category: v.string(),
  })
    .index('by_status', ['status'])
    .index('by_verification', ['verificationStatus'])
    .index('by_source', ['sourceName', 'sourceId']),

  // One row per external/internal data source. Lets the ingestion pipeline
  // and admin UI show where listings come from and how much to trust them,
  // without hard-coding source names throughout the codebase.
  sources: defineTable({
    name: v.string(), // stable slug, matches sourceName above e.g. "owlflow"
    label: v.string(), // human-readable, e.g. "OwlFlow / ScholarshipOwl API"
    kind: v.union(v.literal('manual'), v.literal('api'), v.literal('official_site')),
    trustLevel: v.union(v.literal('high'), v.literal('medium'), v.literal('low')),
    enabled: v.boolean(),
    lastRunAt: v.optional(v.string()),
    notes: v.optional(v.string()),
  }).index('by_name', ['name']),
});
