import { ConvexError } from 'convex/values';

/**
 * Minimal admin gate: callers must pass the same secret that's set as the
 * `ADMIN_KEY` environment variable on this Convex deployment
 * (`npx convex env set ADMIN_KEY "your-secret"`).
 *
 * This is intentionally simple rather than a full login system — it keeps
 * write access out of the public frontend (nothing in src/ ever sends this
 * key; it lives only in admin tooling/scripts you run yourself) without
 * requiring a user-accounts system before any ingestion work can start.
 * Swap this for Convex Auth (or another provider) later without changing
 * the shape of the functions that call it — just replace the body of
 * `requireAdmin`.
 */
export function requireAdmin(providedKey: string | undefined) {
  const expected = process.env.ADMIN_KEY;

  if (!expected) {
    throw new ConvexError(
      'ADMIN_KEY is not set on this Convex deployment. Run `npx convex env set ADMIN_KEY "your-secret"` first.'
    );
  }

  if (!providedKey || providedKey !== expected) {
    throw new ConvexError('Not authorized: missing or incorrect admin key.');
  }
}
