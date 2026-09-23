// Duplicate detection: the same real-world scholarship can arrive from
// several sources (an API, an official university page, a manual entry).
// Per the project spec, uncertain matches are flagged for review — never
// silently deleted or auto-merged.

export type DuplicateCandidateFields = {
  title: string;
  organization: string;
  applicationUrl?: string;
  officialSourceUrl?: string;
  deadline: string;
};

/** Lowercase, strip punctuation/extra whitespace, drop common noise words. */
export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\b(scholarship|scholarships|program|programme|award|grant)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeUrl(url?: string): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return (parsed.hostname + parsed.pathname).replace(/\/$/, '').toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Returns a confidence score in [0, 1] that two listings describe the same
 * real-world opportunity. This is intentionally conservative and explainable
 * rather than a black-box similarity metric, since a wrong auto-merge is
 * worse than an extra review-queue item.
 */
export function duplicateScore(a: DuplicateCandidateFields, b: DuplicateCandidateFields): number {
  let score = 0;

  // Application URL or official source URL matching exactly is the
  // strongest signal — two genuinely different programs essentially never
  // share an application link.
  const urlA = normalizeUrl(a.applicationUrl) ?? normalizeUrl(a.officialSourceUrl);
  const urlB = normalizeUrl(b.applicationUrl) ?? normalizeUrl(b.officialSourceUrl);
  if (urlA && urlB && urlA === urlB) {
    score += 0.55;
  }

  const titleA = normalizeTitle(a.title);
  const titleB = normalizeTitle(b.title);
  if (titleA && titleB) {
    if (titleA === titleB) {
      score += 0.35;
    } else if (titleA.includes(titleB) || titleB.includes(titleA)) {
      score += 0.2;
    }
  }

  const orgA = a.organization.trim().toLowerCase();
  const orgB = b.organization.trim().toLowerCase();
  if (orgA && orgB && orgA === orgB) {
    score += 0.15;
  }

  if (a.deadline && b.deadline && a.deadline === b.deadline) {
    score += 0.1;
  }

  return Math.min(score, 1);
}

/**
 * Threshold above which two listings are flagged as possible duplicates
 * (verificationStatus -> rejected, possibleDuplicateOf set) rather than
 * treated as unrelated. Deliberately conservative — false negatives (an
 * undetected duplicate slipping through as two listings) are a much smaller
 * problem than false positives (a real, distinct listing getting stuck in
 * review because it superficially resembles another one).
 */
export const DUPLICATE_REVIEW_THRESHOLD = 0.6;
