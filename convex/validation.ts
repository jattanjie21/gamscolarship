// Automated validation checks run against a listing before it can move to
// verificationStatus="verified". These are the checks from the project
// spec's Step 4. Pure structural/content checks live here as a plain
// function (callable from a mutation); the URL-reachability check needs
// `fetch`, so it's a Convex action (see checkUrlReachable below and its
// use in convex/ingestion.ts).

export type ValidationIssue = {
  field: string;
  problem: string;
};

export type NormalizedListingInput = {
  title: string;
  organization: string;
  country: string;
  deadline: string;
  description: string;
  applicationUrl: string;
  officialSourceUrl?: string;
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Structural/content checks that don't require any network access:
 * required fields present, URL looks like a URL, deadline is either a
 * valid ISO date or a non-empty descriptive string, deadline (if a date)
 * hasn't already passed, description isn't suspiciously short/templated.
 *
 * Returns an empty array when everything looks fine.
 */
export function runStaticChecks(input: NormalizedListingInput): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const requiredText: Array<keyof NormalizedListingInput> = [
    'title',
    'organization',
    'country',
    'description',
    'applicationUrl',
  ];
  for (const field of requiredText) {
    if (!input[field] || !String(input[field]).trim()) {
      issues.push({ field, problem: 'Required field is missing or empty.' });
    }
  }

  if (input.applicationUrl) {
    try {
      const parsed = new URL(input.applicationUrl);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        issues.push({ field: 'applicationUrl', problem: 'URL must be http(s).' });
      }
    } catch {
      issues.push({ field: 'applicationUrl', problem: 'Not a valid URL.' });
    }
  }

  if (input.officialSourceUrl) {
    try {
      new URL(input.officialSourceUrl);
    } catch {
      issues.push({ field: 'officialSourceUrl', problem: 'Not a valid URL.' });
    }
  }

  if (!input.deadline || !input.deadline.trim()) {
    issues.push({ field: 'deadline', problem: 'Deadline is missing.' });
  } else if (ISO_DATE.test(input.deadline)) {
    const today = new Date().toISOString().slice(0, 10);
    if (input.deadline < today) {
      issues.push({ field: 'deadline', problem: 'Deadline is already in the past.' });
    }
  }
  // Non-ISO deadline strings (e.g. "Varies by country") are accepted as-is —
  // there's no single date to sanity-check, so this isn't flagged here.

  if (input.description && input.description.trim().length < 40) {
    issues.push({
      field: 'description',
      problem: 'Description looks too short to be a real, useful listing.',
    });
  }

  return issues;
}

/**
 * Very rough template-farm detector: catches the exact pattern found in
 * the legacy PHP cache (see project notes) — a generic organization name
 * paired with a numbered, formulaic title like "... Program 133".
 * This is a heuristic, not a guarantee — genuine numbered cohorts/rounds
 * exist too, so this only adds a needs_review flag, never an auto-reject.
 */
export function looksTemplated(input: NormalizedListingInput): boolean {
  const numberedTitle = /\b(program|programme|scholarship)\s*#?\d{2,4}\b/i.test(input.title);
  const genericOrgWords = /\b(foundation|network|initiative)\b/i.test(input.organization);
  return numberedTitle && genericOrgWords;
}
