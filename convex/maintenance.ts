import { internalMutation } from './_generated/server';

/**
 * Flips any scholarship/opportunity whose deadline has passed from
 * "active" to "expired". Only touches entries with a real ISO date in
 * `deadline` (YYYY-MM-DD) — entries like "Varies by country..." are left
 * alone since there's no single date to compare against.
 *
 * Wired up to run daily by convex/crons.ts. This keeps the site from
 * showing lapsed opportunities as open, but it does NOT discover or add
 * new listings — that still requires a source (see convex/ingestion.ts's
 * ingestManual, or a future adapter under convex/sources/) to bring in
 * new, verified opportunities.
 */
export const expireStaleListings = internalMutation({
  args: {},
  handler: async (ctx) => {
    const today = new Date().toISOString().slice(0, 10);
    const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

    for (const table of ['scholarships', 'opportunities'] as const) {
      const activeItems = await ctx.db
        .query(table)
        .withIndex('by_status', (q) => q.eq('status', 'active'))
        .collect();

      for (const item of activeItems) {
        if (isoDatePattern.test(item.deadline) && item.deadline < today) {
          await ctx.db.patch(item._id, { status: 'expired', updatedAt: new Date().toISOString() });
        }
      }
    }
  },
});
