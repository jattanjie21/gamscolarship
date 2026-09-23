import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

// GamScholarship data model.
//
// Two concepts that are easy to conflate but must stay separate:
//   - `status`             lifecycle: is this opportunity still open?
//                           ("active" | "expired")
//   - `verificationStatus` trust: has GamScholarship confirmed this is a
//                           real, accurately-described opportunity?
//                           ("pending" | "verified" | "rejected")
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
  v.literal('pending'), // newly ingested or waiting for an automated retry — never public
  v.literal('verified'), // passed automated checks — eligible for public display
  v.literal('rejected'), // failed automated checks — never public
  v.literal('needs_review') // legacy value kept for old records; never created by the new pipeline
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
  verificationNotes: v.optional(v.string()), // automated verification/rejection reason
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
    .index('by_status_verification', ['status', 'verificationStatus'])
    .index('by_verification', ['verificationStatus'])
    .index('by_source', ['sourceName', 'sourceId']),

  opportunities: defineTable({
    ...listingSharedFields,
    category: v.string(),
  })
    .index('by_status', ['status'])
    .index('by_status_verification', ['status', 'verificationStatus'])
    .index('by_verification', ['verificationStatus'])
    .index('by_source', ['sourceName', 'sourceId']),

  // One row per external/internal data source. Lets the ingestion pipeline
  // and admin UI show where listings come from and how much to trust them,
  // without hard-coding source names throughout the codebase.
  //
  // The health fields below (last*At, lastError, lastRunStats,
  // consecutiveFailures) let the discovery pipeline (convex/discovery.ts)
  // know when a source has stopped working so it can back off automatically
  // instead of hammering a dead endpoint, without ever deleting the
  // scholarships that source already contributed.
  sources: defineTable({
    name: v.string(), // stable slug, matches sourceName above e.g. "daad-official-site"
    label: v.string(), // human-readable, e.g. "DAAD — official site"
    kind: v.union(
      v.literal('manual'),
      v.literal('api'),
      v.literal('official_site') // discovered + extracted from an official provider's own site
    ),
    trustLevel: v.union(v.literal('high'), v.literal('medium'), v.literal('low')),
    enabled: v.boolean(),
    lastRunAt: v.optional(v.string()),
    lastSuccessAt: v.optional(v.string()),
    lastFailureAt: v.optional(v.string()),
    lastError: v.optional(v.string()),
    consecutiveFailures: v.optional(v.number()),
    lastRunStats: v.optional(
      v.object({
        retrieved: v.number(), // candidate pages/records the source returned
        accepted: v.number(), // passed static checks and were ingested as pending/verified
        rejected: v.number(), // failed validation, looked templated, or flagged as a duplicate
      })
    ),
    notes: v.optional(v.string()),
  }).index('by_name', ['name']),

  // One row per discovery/ingestion run, for diagnosing a source that stops
  // producing listings without having to reconstruct it from scattered
  // console logs. Practical/minimal: not a full audit log, just enough to
  // answer "did the last run work, and if not, why?" per source.
  ingestionRuns: defineTable({
    sourceName: v.string(),
    startedAt: v.string(),
    finishedAt: v.optional(v.string()),
    status: v.union(v.literal('success'), v.literal('partial'), v.literal('failed')),
    retrieved: v.number(),
    accepted: v.number(),
    rejected: v.number(),
    error: v.optional(v.string()),
  }).index('by_source', ['sourceName']),
});
