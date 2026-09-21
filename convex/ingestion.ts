import { v } from 'convex/values';
import { mutation, internalMutation, internalQuery, internalAction } from './_generated/server';
import { internal } from './_generated/api';
import { requireAdmin } from './lib/adminAuth';
import { normalizeManualEntry } from './sources/manualAdapter';
import { runStaticChecks, looksTemplated } from './validation';
import { duplicateScore, DUPLICATE_REVIEW_THRESHOLD } from './duplicates';
import type { NormalizedListing } from './sources/types';

const TABLE_FOR_KIND = { scholarship: 'scholarships', opportunity: 'opportunities' } as const;

/**
 * Runs the static (non-network) part of the pipeline for one normalized
 * listing — validation + duplicate check — and inserts or updates it with
 * the resulting verificationStatus. Shared by every source adapter's entry
 * point (currently just ingestManual below).
 *
 * Does NOT check URL reachability itself (mutations can't make network
 * calls); it schedules checkReachabilityAndPromote to do that as a
 * follow-up action, so a listing that passes static checks starts as
 * "pending" and only becomes "verified" once its links have actually been
 * confirmed reachable.
 */
async function ingestNormalized(ctx: any, listing: NormalizedListing) {
  const table = TABLE_FOR_KIND[listing.kind];
  const now = new Date().toISOString();

  const staticIssues = runStaticChecks(listing);
  const templated = looksTemplated(listing);

  // Duplicate check against every existing row in this table that isn't
  // already rejected. Simple O(n) scan — fine at hundreds/low-thousands of
  // rows; revisit with a smarter index if the table grows much larger.
  const existing = await ctx.db
    .query(table)
    .filter((q: any) => q.neq(q.field('verificationStatus'), 'rejected'))
    .collect();

  let bestMatch: { id: string; score: number } | null = null;
  for (const doc of existing) {
    if (listing.sourceId && doc.sourceName === listing.sourceName && doc.sourceId === listing.sourceId) {
      // Same source re-sending the same record (e.g. a re-run) — treat as
      // an update target, not a duplicate to flag.
      bestMatch = { id: doc._id, score: 1 };
      break;
    }
    const score = duplicateScore(doc, listing);
    if (!bestMatch || score > bestMatch.score) {
      bestMatch = { id: doc._id, score };
    }
  }

  const isReingestOfSameRecord =
    bestMatch !== null &&
    bestMatch.score === 1 &&
    listing.sourceId !== undefined;

  let verificationStatus: 'pending' | 'needs_review' | 'rejected' = 'pending';
  let verificationNotes: string | undefined;
  let possibleDuplicateOf: string | undefined;

  if (staticIssues.length > 0) {
    verificationStatus = 'needs_review';
    verificationNotes = staticIssues.map((i) => `${i.field}: ${i.problem}`).join('; ');
  } else if (templated) {
    verificationStatus = 'needs_review';
    verificationNotes =
      'Title/organization pattern resembles known templated/fabricated listings — needs manual confirmation.';
  } else if (!isReingestOfSameRecord && bestMatch && bestMatch.score >= DUPLICATE_REVIEW_THRESHOLD) {
    verificationStatus = 'needs_review';
    possibleDuplicateOf = bestMatch.id;
    verificationNotes = `Possible duplicate of an existing listing (similarity score ${bestMatch.score.toFixed(2)}).`;
  }

  const baseFields = {
    title: listing.title,
    organization: listing.organization,
    country: listing.country,
    deadline: listing.deadline,
    description: listing.description,
    applicationUrl: listing.applicationUrl,
    officialSourceUrl: listing.officialSourceUrl,
    status: 'active' as const,
    sourceName: listing.sourceName,
    sourceId: listing.sourceId,
    verificationStatus,
    verificationNotes,
    possibleDuplicateOf,
    isSample: false,
    lastCheckedAt: now,
    lastVerifiedAt: undefined,
    updatedAt: now,
  };

  const specificFields =
    listing.kind === 'scholarship'
      ? {
          level: listing.level,
          funding: listing.funding,
          field: listing.field,
          eligibility: listing.eligibility,
          requirements: listing.requirements,
          benefits: listing.benefits,
        }
      : { category: listing.category };

  let docId: string;
  if (isReingestOfSameRecord && bestMatch) {
    await ctx.db.patch(bestMatch.id, { ...baseFields, ...specificFields });
    docId = bestMatch.id;
  } else {
    docId = await ctx.db.insert(table, { ...baseFields, ...specificFields, createdAt: now });
  }

  // Only worth checking reachability if it isn't already flagged for a
  // human — no point spending a network call on something that's going to
  // sit in the review queue regardless.
  if (verificationStatus === 'pending') {
    await ctx.scheduler.runAfter(0, internal.ingestion.checkReachabilityAndPromote, {
      table,
      id: docId,
    });
  }

  return { docId, verificationStatus };
}

/**
 * Public entry point for the "manual" source — the only source enabled so
 * far. Called by scripts/seed.mjs, or by hand for a one-off addition.
 * Requires the ADMIN_KEY (see convex/lib/adminAuth.ts) since it's a public
 * mutation reachable by anyone with the Convex URL.
 */
export const ingestManual = mutation({
  args: {
    adminKey: v.string(),
    listing: v.any(),
  },
  handler: async (ctx, { adminKey, listing }) => {
    requireAdmin(adminKey);
    const normalized = normalizeManualEntry(listing);
    return await ingestNormalized(ctx, normalized);
  },
});

/**
 * Follow-up action: confirms the applicationUrl (and officialSourceUrl, if
 * present) actually resolve, then promotes the listing to "verified" or
 * demotes it to "needs_review" accordingly. Scheduled automatically by
 * ingestNormalized above, and re-run periodically for already-verified
 * listings by revalidateVerifiedListings (see convex/crons.ts).
 */
export const checkReachabilityAndPromote = internalAction({
  args: {
    table: v.union(v.literal('scholarships'), v.literal('opportunities')),
    id: v.string(),
  },
  handler: async (ctx, { table, id }) => {
    const doc: any = await ctx.runQuery(internal.ingestion.getById, { table, id });
    if (!doc) return;

    const urlsToCheck = [doc.applicationUrl, doc.officialSourceUrl].filter(Boolean) as string[];
    let allReachable = urlsToCheck.length > 0;
    const problems: string[] = [];

    for (const url of urlsToCheck) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(url, { method: 'GET', redirect: 'follow', signal: controller.signal });
        clearTimeout(timeout);
        if (!res.ok) {
          allReachable = false;
          problems.push(`${url} responded with status ${res.status}`);
        }
      } catch (err) {
        allReachable = false;
        problems.push(`${url} was not reachable (${(err as Error).message})`);
      }
    }

    const now = new Date().toISOString();
    if (allReachable) {
      await ctx.runMutation(internal.ingestion.applyVerificationResult, {
        table,
        id,
        verificationStatus: 'verified',
        verificationNotes: undefined,
        lastCheckedAt: now,
        lastVerifiedAt: now,
      });
    } else {
      await ctx.runMutation(internal.ingestion.applyVerificationResult, {
        table,
        id,
        verificationStatus: 'needs_review',
        verificationNotes: `Automated link check failed: ${problems.join('; ')}`,
        lastCheckedAt: now,
      });
    }
  },
});

export const getById = internalQuery({
  args: { table: v.union(v.literal('scholarships'), v.literal('opportunities')), id: v.string() },
  handler: async (ctx, { table, id }) => {
    const normalized = ctx.db.normalizeId(table, id);
    if (!normalized) return null;
    return await ctx.db.get(normalized);
  },
});

export const applyVerificationResult = internalMutation({
  args: {
    table: v.union(v.literal('scholarships'), v.literal('opportunities')),
    id: v.string(),
    verificationStatus: v.union(v.literal('verified'), v.literal('needs_review')),
    verificationNotes: v.optional(v.string()),
    lastCheckedAt: v.string(),
    lastVerifiedAt: v.optional(v.string()),
  },
  handler: async (ctx, { table, id, verificationStatus, verificationNotes, lastCheckedAt, lastVerifiedAt }) => {
    const normalized = ctx.db.normalizeId(table, id);
    if (!normalized) return;
    const patch: Record<string, unknown> = {
      verificationStatus,
      verificationNotes,
      lastCheckedAt,
      updatedAt: lastCheckedAt,
    };
    if (lastVerifiedAt) patch.lastVerifiedAt = lastVerifiedAt;
    await ctx.db.patch(normalized, patch);
  },
});

/**
 * Re-checks link reachability for every currently-verified, active listing
 * across both tables. A listing whose links stop resolving is demoted back
 * to "needs_review" rather than silently staying verified forever — this
 * is what keeps "verified" meaning "checked recently", not just "checked
 * once at ingestion time". Scheduled weekly by convex/crons.ts.
 */
export const revalidateVerifiedListings = internalAction({
  args: {},
  handler: async (ctx) => {
    for (const table of ['scholarships', 'opportunities'] as const) {
      const verified: any[] = await ctx.runQuery(internal.ingestion.listVerifiedForTable, { table });
      for (const doc of verified) {
        await ctx.runAction(internal.ingestion.checkReachabilityAndPromote, { table, id: doc._id });
      }
    }
  },
});

export const listVerifiedForTable = internalQuery({
  args: { table: v.union(v.literal('scholarships'), v.literal('opportunities')) },
  handler: async (ctx, { table }) => {
    return await ctx.db
      .query(table)
      .withIndex('by_status', (q) => q.eq('status', 'active'))
      .filter((q) => q.eq(q.field('verificationStatus'), 'verified'))
      .collect();
  },
});
