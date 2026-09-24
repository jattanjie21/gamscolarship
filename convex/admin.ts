import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { ConvexError } from 'convex/values';
import { requireAdmin } from './lib/adminAuth';
import type { Id } from './_generated/dataModel';

const tableArg = v.union(v.literal('scholarships'), v.literal('opportunities'));

function checkAdminKey(providedKey: string | undefined): boolean {
  const expected = process.env.ADMIN_KEY;
  return Boolean(expected && providedKey && providedKey === expected);
}

function expectedAdminUsername(): string {
  return process.env.ADMIN_USER || 'admin';
}

/**
 * Login check for the admin dashboard.
 * Username defaults to "admin" (override with ADMIN_USER on the deployment).
 * Password must match ADMIN_KEY.
 */
export const login = query({
  args: { username: v.string(), password: v.string() },
  handler: async (_ctx, { username, password }) => {
    const userOk = username.trim().toLowerCase() === expectedAdminUsername().toLowerCase();
    const passOk = checkAdminKey(password);
    return { ok: userOk && passOk };
  },
});

/**
 * Overview counts for the dashboard home.
 */
export const dashboardStats = query({
  args: { adminKey: v.string() },
  handler: async (ctx, { adminKey }) => {
    if (!checkAdminKey(adminKey)) {
      return { authorized: false as const };
    }

    const scholarships = await ctx.db.query('scholarships').collect();
    const opportunities = await ctx.db.query('opportunities').collect();
    const sources = await ctx.db.query('sources').collect();

    const countBy = (rows: { verificationStatus: string; status: string }[]) => ({
      total: rows.length,
      verified: rows.filter((r) => r.verificationStatus === 'verified' && r.status === 'active').length,
      pending: rows.filter((r) => r.verificationStatus === 'pending' || r.verificationStatus === 'needs_review').length,
      rejected: rows.filter((r) => r.verificationStatus === 'rejected').length,
      expired: rows.filter((r) => r.status === 'expired').length,
    });

    return {
      authorized: true as const,
      scholarships: countBy(scholarships),
      opportunities: countBy(opportunities),
      sources: {
        total: sources.length,
        enabled: sources.filter((s) => s.enabled).length,
      },
    };
  },
});

/**
 * Source registry only. Used by source setup scripts.
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

/**
 * Pending / needs_review listings for the /admin review queue.
 * Returns { authorized: false } on a bad key instead of throwing,
 * so the UI can show a clear unlock error.
 */
export const listQueue = query({
  args: { adminKey: v.string() },
  handler: async (ctx, { adminKey }) => {
    if (!checkAdminKey(adminKey)) {
      return { authorized: false as const, scholarships: [], opportunities: [] };
    }

    const scholarships = [
      ...(await ctx.db
        .query('scholarships')
        .withIndex('by_verification', (q) => q.eq('verificationStatus', 'pending'))
        .collect()),
      ...(await ctx.db
        .query('scholarships')
        .withIndex('by_verification', (q) => q.eq('verificationStatus', 'needs_review'))
        .collect()),
    ];

    const opportunities = [
      ...(await ctx.db
        .query('opportunities')
        .withIndex('by_verification', (q) => q.eq('verificationStatus', 'pending'))
        .collect()),
      ...(await ctx.db
        .query('opportunities')
        .withIndex('by_verification', (q) => q.eq('verificationStatus', 'needs_review'))
        .collect()),
    ];

    return { authorized: true as const, scholarships, opportunities };
  },
});

export const approve = mutation({
  args: {
    adminKey: v.string(),
    table: tableArg,
    id: v.string(),
  },
  handler: async (ctx, { adminKey, table, id }) => {
    requireAdmin(adminKey);
    const docId = ctx.db.normalizeId(table, id);
    if (!docId) throw new ConvexError('Invalid id.');
    const doc = await ctx.db.get(docId as Id<'scholarships'> | Id<'opportunities'>);
    if (!doc) throw new ConvexError('Listing not found.');
    const now = new Date().toISOString();
    await ctx.db.patch(docId, {
      verificationStatus: 'verified',
      verificationNotes: 'Approved by admin.',
      lastVerifiedAt: now,
      lastCheckedAt: now,
      updatedAt: now,
    });
  },
});

export const reject = mutation({
  args: {
    adminKey: v.string(),
    table: tableArg,
    id: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { adminKey, table, id, reason }) => {
    requireAdmin(adminKey);
    const docId = ctx.db.normalizeId(table, id);
    if (!docId) throw new ConvexError('Invalid id.');
    const doc = await ctx.db.get(docId as Id<'scholarships'> | Id<'opportunities'>);
    if (!doc) throw new ConvexError('Listing not found.');
    const now = new Date().toISOString();
    await ctx.db.patch(docId, {
      verificationStatus: 'rejected',
      verificationNotes: reason || 'Rejected by admin.',
      lastCheckedAt: now,
      updatedAt: now,
    });
  },
});

export const markExpired = mutation({
  args: {
    adminKey: v.string(),
    table: tableArg,
    id: v.string(),
  },
  handler: async (ctx, { adminKey, table, id }) => {
    requireAdmin(adminKey);
    const docId = ctx.db.normalizeId(table, id);
    if (!docId) throw new ConvexError('Invalid id.');
    const doc = await ctx.db.get(docId as Id<'scholarships'> | Id<'opportunities'>);
    if (!doc) throw new ConvexError('Listing not found.');
    const now = new Date().toISOString();
    await ctx.db.patch(docId, {
      status: 'expired',
      lastCheckedAt: now,
      updatedAt: now,
    });
  },
});
