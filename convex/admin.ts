import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { requireAdmin } from './lib/adminAuth';

const tableArg = v.union(v.literal('scholarships'), v.literal('opportunities'));

/**
 * Everything currently sitting in the review queue (needs_review) or
 * awaiting its first reachability check (pending), across both tables.
 * This is what a private admin UI (src/pages/admin) would render — never
 * imported by any public-facing page.
 */
export const listQueue = query({
  args: { adminKey: v.string() },
  handler: async (ctx, { adminKey }) => {
    if (adminKey !== process.env.ADMIN_KEY || !process.env.ADMIN_KEY) {
      return { authorized: false, scholarships: [], opportunities: [] };
    }

    const [pendingScholarships, needsReviewScholarships, pendingOpportunities, needsReviewOpportunities] =
      await Promise.all([
        ctx.db
          .query('scholarships')
          .withIndex('by_verification', (q) => q.eq('verificationStatus', 'pending'))
          .collect(),
        ctx.db
          .query('scholarships')
          .withIndex('by_verification', (q) => q.eq('verificationStatus', 'needs_review'))
          .collect(),
        ctx.db
          .query('opportunities')
          .withIndex('by_verification', (q) => q.eq('verificationStatus', 'pending'))
          .collect(),
        ctx.db
          .query('opportunities')
          .withIndex('by_verification', (q) => q.eq('verificationStatus', 'needs_review'))
          .collect(),
      ]);

    return {
      authorized: true,
      scholarships: [...needsReviewScholarships, ...pendingScholarships].map((d) => ({ ...d, table: 'scholarships' })),
      opportunities: [...needsReviewOpportunities, ...pendingOpportunities].map((d) => ({ ...d, table: 'opportunities' })),
    };
  },
});

/** Approve a queued listing: sets verificationStatus to "verified" directly (bypassing the automated URL check — use when a human has already confirmed the links). */
export const approve = mutation({
  args: { adminKey: v.string(), table: tableArg, id: v.string() },
  handler: async (ctx, { adminKey, table, id }) => {
    requireAdmin(adminKey);
    const normalized = ctx.db.normalizeId(table, id);
    if (!normalized) throw new Error('Unknown listing id');
    const now = new Date().toISOString();
    await ctx.db.patch(normalized, {
      verificationStatus: 'verified',
      verificationNotes: undefined,
      possibleDuplicateOf: undefined,
      lastVerifiedAt: now,
      lastCheckedAt: now,
      updatedAt: now,
    });
  },
});

/** Reject a queued listing: it never appears publicly, and stays recorded (not deleted) so it isn't re-ingested from the same source without a person seeing it again. */
export const reject = mutation({
  args: { adminKey: v.string(), table: tableArg, id: v.string(), reason: v.optional(v.string()) },
  handler: async (ctx, { adminKey, table, id, reason }) => {
    requireAdmin(adminKey);
    const normalized = ctx.db.normalizeId(table, id);
    if (!normalized) throw new Error('Unknown listing id');
    await ctx.db.patch(normalized, {
      verificationStatus: 'rejected',
      verificationNotes: reason ?? 'Rejected by admin.',
      updatedAt: new Date().toISOString(),
    });
  },
});

/** Manually mark a listing expired (deadline passed, program confirmed closed, etc.) outside the daily automatic sweep. */
export const markExpired = mutation({
  args: { adminKey: v.string(), table: tableArg, id: v.string() },
  handler: async (ctx, { adminKey, table, id }) => {
    requireAdmin(adminKey);
    const normalized = ctx.db.normalizeId(table, id);
    if (!normalized) throw new Error('Unknown listing id');
    await ctx.db.patch(normalized, { status: 'expired', updatedAt: new Date().toISOString() });
  },
});

/** Registers (or updates) a row in the `sources` table. Idempotent — safe to call every time a seed/ingestion script runs. */
export const ensureSource = mutation({
  args: {
    adminKey: v.string(),
    name: v.string(),
    label: v.string(),
    kind: v.union(v.literal('manual'), v.literal('api'), v.literal('official_site')),
    trustLevel: v.union(v.literal('high'), v.literal('medium'), v.literal('low')),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { adminKey, name, label, kind, trustLevel, notes }) => {
    requireAdmin(adminKey);
    const existing = await ctx.db
      .query('sources')
      .withIndex('by_name', (q) => q.eq('name', name))
      .unique();

    const patch = { name, label, kind, trustLevel, enabled: true, notes, lastRunAt: new Date().toISOString() };
    if (existing) {
      await ctx.db.patch(existing._id, patch);
    } else {
      await ctx.db.insert('sources', patch);
    }
  },
});
