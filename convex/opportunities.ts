import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { requireAdmin } from './lib/adminAuth';

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('opportunities')
      .withIndex('by_status', (q) => q.eq('status', 'active'))
      .filter((q) => q.eq(q.field('verificationStatus'), 'verified'))
      .order('desc')
      .collect();
  },
});

export const adminUpdate = mutation({
  args: {
    adminKey: v.string(),
    id: v.id('opportunities'),
    patch: v.object({
      title: v.optional(v.string()),
      organization: v.optional(v.string()),
      category: v.optional(v.string()),
      country: v.optional(v.string()),
      deadline: v.optional(v.string()),
      status: v.optional(v.union(v.literal('active'), v.literal('expired'))),
      description: v.optional(v.string()),
      applicationUrl: v.optional(v.string()),
      officialSourceUrl: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { adminKey, id, patch }) => {
    requireAdmin(adminKey);
    await ctx.db.patch(id, { ...patch, updatedAt: new Date().toISOString() });
  },
});

export const adminRemove = mutation({
  args: { adminKey: v.string(), id: v.id('opportunities') },
  handler: async (ctx, { adminKey, id }) => {
    requireAdmin(adminKey);
    await ctx.db.delete(id);
  },
});
