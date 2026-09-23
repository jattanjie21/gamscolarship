import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { requireAdmin } from './lib/adminAuth';

/**
 * Public listing: only scholarships that are both currently active AND
 * have passed verification. This is the one query the frontend (src/pages)
 * calls — it never sees pending/rejected rows, regardless of
 * where they came from.
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('scholarships')
      .withIndex('by_status_verification', (q) =>
        q.eq('status', 'active').eq('verificationStatus', 'verified')
      )
      .order('desc')
      .collect();
  },
});

/**
 * A single scholarship by its Convex document id. Only returns it if
 * verified+active — a direct link to a pending/rejected id 404s the same
 * as an unknown id, so unverified content is never reachable publicly even
 * via a guessed/shared URL.
 */
export const getById = query({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const normalized = ctx.db.normalizeId('scholarships', id);
    if (!normalized) return null;
    const doc = await ctx.db.get(normalized);
    if (!doc) return null;
    if (doc.status !== 'active' || doc.verificationStatus !== 'verified') return null;
    return doc;
  },
});

/**
 * Direct admin edit of an already-ingested scholarship (e.g. fixing a typo,
 * updating a deadline). For adding a *new* scholarship, go through
 * convex/ingestion.ts's ingestManual instead, so it gets the same
 * validation/duplicate checks as any other source.
 */
export const adminUpdate = mutation({
  args: {
    adminKey: v.string(),
    id: v.id('scholarships'),
    patch: v.object({
      title: v.optional(v.string()),
      organization: v.optional(v.string()),
      country: v.optional(v.string()),
      level: v.optional(v.string()),
      funding: v.optional(v.string()),
      field: v.optional(v.string()),
      deadline: v.optional(v.string()),
      status: v.optional(v.union(v.literal('active'), v.literal('expired'))),
      description: v.optional(v.string()),
      eligibility: v.optional(v.array(v.string())),
      requirements: v.optional(v.array(v.string())),
      benefits: v.optional(v.array(v.string())),
      applicationUrl: v.optional(v.string()),
      officialSourceUrl: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { adminKey, id, patch }) => {
    requireAdmin(adminKey);
    await ctx.db.patch(id, { ...patch, updatedAt: new Date().toISOString() });
  },
});

/** Remove a scholarship entirely. Admin-only. */
export const adminRemove = mutation({
  args: { adminKey: v.string(), id: v.id('scholarships') },
  handler: async (ctx, { adminKey, id }) => {
    requireAdmin(adminKey);
    await ctx.db.delete(id);
  },
});
