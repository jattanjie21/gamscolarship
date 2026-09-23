import { mutation } from './_generated/server';
import { v } from 'convex/values';
import { requireAdmin } from './lib/adminAuth';

/**
 * Source registry only. Scholarship verification is automatic; there is no
 * public/admin approval step. This mutation is used by source setup scripts.
 */
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

    const patch = {
      name,
      label,
      kind,
      trustLevel,
      enabled: true,
      notes,
      lastRunAt: new Date().toISOString(),
    };

    if (existing) await ctx.db.patch(existing._id, patch);
    else await ctx.db.insert('sources', patch);
  },
});
