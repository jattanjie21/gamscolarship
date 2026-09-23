// The "official site" discovery adapter. Unlike manualAdapter.ts (which
// normalizes a shape a human already typed in), this adapter has to turn an
// arbitrary official-site web page into a NormalizedListing itself. That
// happens in two steps, both implemented here as plain, testable functions;
// convex/discovery.ts wires them together inside a Convex action (network
// access + calling the Anthropic API requires an action, not a mutation):
//
//   1. htmlToText — strip an HTML page down to readable text.
//   2. buildExtractionPrompt / parseExtractionResponse — ask the Anthropic
//      API to read that text and return ONLY what's actually written on
//      the page, as strict JSON, or {"found": false} if the page isn't
//      really a scholarship listing. This is extraction, not invention:
//      the prompt explicitly forbids filling in unstated fields, and
//      parseExtractionResponse rejects anything that doesn't parse as
//      well-formed JSON with the required fields present and non-empty.
//
// Every listing that comes out of this adapter still goes through the same
// runStaticChecks / looksTemplated / duplicateScore / URL-reachability
// pipeline as a manual entry (see convex/ingestion.ts) before it can become
// public — this adapter only gets a listing to "pending", never "verified".

import type { NormalizedListing } from './types';

/** Very small HTML→text reducer: strips scripts/styles/tags, collapses whitespace. */
export function htmlToText(html: string, maxChars = 12000): string {
  const withoutScripts = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');
  const text = withoutScripts
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
  return text.slice(0, maxChars);
}

const EXTRACTION_SYSTEM_PROMPT = `You extract structured scholarship information from a web page's text content.

Rules:
- Use ONLY information explicitly present in the page text you are given.
- Never invent, estimate, or fill in a field that is not clearly stated on the page.
- If the page is not actually describing one specific scholarship/funding opportunity a student could apply to (e.g. it's a homepage, a blog post, a news article, a list of many programs, or a page with no application details), respond with exactly {"found": false}.
- If it IS a specific opportunity but a required field is genuinely not stated, omit that field rather than guessing.
- Respond with ONLY a single JSON object. No markdown, no commentary, no code fences.

When a specific opportunity is found, respond with this shape:
{
  "found": true,
  "kind": "scholarship" | "opportunity",
  "title": string,
  "organization": string,
  "country": string,
  "deadline": string,
  "description": string,
  "applicationUrl": string,
  "level": string,
  "funding": string,
  "field": string,
  "eligibility": string[],
  "requirements": string[],
  "benefits": string[]
}

Use "opportunity" only for internships/fellowships/study-abroad programs that aren't a scholarship in the funding sense; otherwise use "scholarship". level/funding/field/eligibility/requirements/benefits are scholarship-only fields — omit them for kind "opportunity" and include a "category" string instead.`;

export function buildExtractionPrompt(pageText: string, pageUrl: string, sourceLabel: string): string {
  return `Source: ${sourceLabel}\nPage URL: ${pageUrl}\n\nPage text:\n"""\n${pageText}\n"""`;
}

export type ExtractionResult =
  | { found: false }
  | {
      found: true;
      listing: NormalizedListing;
    };

/**
 * Parses the Anthropic API's text response into a NormalizedListing.
 * Deliberately strict: any structural problem (not JSON, missing a
 * required field, empty string in a required field) is treated the same as
 * {"found": false} rather than partially trusted — a malformed extraction
 * is exactly the kind of thing runStaticChecks would reject anyway, so
 * failing here just avoids wasting a duplicate-check/reachability cycle on
 * junk.
 */
export function parseExtractionResponse(
  raw: string,
  sourceName: string,
  pageUrl: string
): ExtractionResult {
  let parsed: any;
  try {
    // Strip accidental code fences even though the prompt forbids them.
    const cleaned = raw.trim().replace(/^```(json)?/i, '').replace(/```$/, '').trim();
    parsed = JSON.parse(cleaned);
  } catch {
    return { found: false };
  }

  if (!parsed || parsed.found !== true) return { found: false };

  const requiredCommon = ['title', 'organization', 'country', 'deadline', 'description', 'applicationUrl'];
  for (const field of requiredCommon) {
    if (typeof parsed[field] !== 'string' || !parsed[field].trim()) return { found: false };
  }

  const officialSourceUrl = pageUrl;
  const sourceId = pageUrl; // the page URL is a stable, unique id for re-sync/dedup purposes

  if (parsed.kind === 'opportunity') {
    if (typeof parsed.category !== 'string' || !parsed.category.trim()) return { found: false };
    return {
      found: true,
      listing: {
        kind: 'opportunity',
        sourceName,
        sourceId,
        title: parsed.title,
        organization: parsed.organization,
        category: parsed.category,
        country: parsed.country,
        deadline: parsed.deadline,
        description: parsed.description,
        applicationUrl: parsed.applicationUrl,
        officialSourceUrl,
      },
    };
  }

  const requiredScholarship = ['level', 'funding', 'field'];
  for (const field of requiredScholarship) {
    if (typeof parsed[field] !== 'string' || !parsed[field].trim()) return { found: false };
  }

  return {
    found: true,
    listing: {
      kind: 'scholarship',
      sourceName,
      sourceId,
      title: parsed.title,
      organization: parsed.organization,
      country: parsed.country,
      level: parsed.level,
      funding: parsed.funding,
      field: parsed.field,
      deadline: parsed.deadline,
      description: parsed.description,
      eligibility: Array.isArray(parsed.eligibility) ? parsed.eligibility.filter((s: unknown) => typeof s === 'string') : [],
      requirements: Array.isArray(parsed.requirements) ? parsed.requirements.filter((s: unknown) => typeof s === 'string') : [],
      benefits: Array.isArray(parsed.benefits) ? parsed.benefits.filter((s: unknown) => typeof s === 'string') : [],
      applicationUrl: parsed.applicationUrl,
      officialSourceUrl,
    },
  };
}

export { EXTRACTION_SYSTEM_PROMPT };
