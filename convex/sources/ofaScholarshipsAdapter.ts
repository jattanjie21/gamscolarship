// Adapter for the Opportunities for Africans (OFA) scholarships RSS feed:
//
//   https://www.opportunitiesforafricans.com/category/scholarships/feed/
//
// OFA is a third-party aggregator aimed at African students — useful for
// discovery, but NOT an official provider. Every listing we keep must point
// `applicationUrl` / `officialSourceUrl` at an official (non-OFA) page
// extracted from the OFA post HTML. If we can't find one, we skip the item
// rather than publishing an aggregator URL as the apply link.
//
// Trust level for this source should stay "medium" in the sources table.

import type { NormalizedListing } from './types';
import type { RssItem } from './erasmusMundusAdapter';

export const OFA_SCHOLARSHIPS_FEED_URL =
  'https://www.opportunitiesforafricans.com/category/scholarships/feed/';

export const OFA_SOURCE_NAME = 'ofa-scholarships-rss';

const SKIP_HOST_RE =
  /opportunitiesforafricans|facebook\.|twitter\.|x\.com|linkedin\.|whatsapp|instagram|t\.co|pinterest|youtube|googleapis|gstatic|w3\.org|wordpress|gravatar|jetpack|wp\.com|reputiva|gmpg\.org|mailto:|javascript:/i;

const APPLYISH_RE = /scholarship|fellowship|apply|admission|programme|program|funding|bursary|grant|masters?|phd|postgrad/i;

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#0?39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&nbsp;/g, ' ');
}

export function stripHtml(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
}

/**
 * Pulls absolute http(s) hrefs out of an OFA post and picks the best
 * candidate that looks like an official programme / apply page.
 * Returns null when nothing trustworthy is found.
 */
export function extractOfficialUrl(html: string, title: string): string | null {
  const hrefs = Array.from(html.matchAll(/href=["'](https?:\/\/[^"']+)["']/gi)).map((m) => m[1]);
  const titleTokens = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 4);

  type Scored = { url: string; score: number };
  const bestByHost = new Map<string, Scored>();

  for (const raw of hrefs) {
    let parsed: URL;
    try {
      parsed = new URL(raw);
    } catch {
      continue;
    }
    if (!['http:', 'https:'].includes(parsed.protocol)) continue;
    if (SKIP_HOST_RE.test(parsed.href) || SKIP_HOST_RE.test(parsed.hostname)) continue;

    let score = 0;
    const host = parsed.hostname.toLowerCase();
    const path = `${host}${parsed.pathname}`.toLowerCase();

    if (APPLYISH_RE.test(path)) score += 3;
    if (/\.(edu|ac\.|gov)/i.test(host) || host.endsWith('.org')) score += 2;
    for (const token of titleTokens) {
      if (host.includes(token) || path.includes(token)) {
        score += 2;
        break;
      }
    }
    // Prefer homepage-ish official domains over random deep junk when tied
    if (parsed.pathname === '/' || parsed.pathname.length < 2) score += 1;

    if (score < 2) continue;

    const existing = bestByHost.get(host);
    if (!existing || score > existing.score) {
      bestByHost.set(host, { url: parsed.href, score });
    }
  }

  const ranked = Array.from(bestByHost.values()).sort((a, b) => b.score - a.score);
  return ranked[0]?.url ?? null;
}

export function extractDeadline(text: string): string {
  const m = text.match(/Application Deadline[:\s]+([^\n.]{3,80})/i);
  if (m) {
    const cleaned = m[1].replace(/\s+/g, ' ').trim();
    // Stop before "Applications are now open..." bleed
    const cut = cleaned.split(/Applications are/i)[0].trim();
    if (cut.length >= 4) return cut;
  }
  return 'See official programme website for the current deadline.';
}

function guessLevel(title: string): string {
  if (/\bph\.?d\b|doctoral/i.test(title)) return 'PhD';
  if (/\bpostgraduate|master'?s?\b|mba\b/i.test(title)) return "Master's / Postgraduate";
  if (/\bundergraduate|bachelor/i.test(title)) return 'Undergraduate';
  return 'See official site';
}

function guessFunding(title: string, description: string): string {
  if (/fully\s*funded/i.test(title) || /fully\s*funded/i.test(description)) {
    return 'Described as fully funded on the listing — confirm coverage on the official site.';
  }
  if (/partial/i.test(title)) {
    return 'May be partially funded — confirm on the official site.';
  }
  return 'See official site for funding details.';
}

function guessCountry(item: RssItem): string {
  const cats = item.categories.map((c) => c.value).filter(Boolean);
  const known = cats.find((c) =>
    /^(UK|USA|US|Canada|Germany|France|China|Japan|Australia|Europe|Africa|Gambia|Nigeria|Ghana|Kenya|South Africa)\b/i.test(
      c
    )
  );
  if (known) return known;
  return 'Open to African / international students — confirm eligibility on the official site.';
}

function guessOrganization(title: string): string {
  const cleaned = title
    .replace(/\s*\|.*$/, '')
    .replace(/\s*\(Fully Funded\)\s*/i, ' ')
    .replace(/\s+for\s+(Study|African|Emerging).*$/i, '')
    .replace(/\s+(Programme|Program|Scholarship)s?\s+\d{4}.*$/i, ' Scholarship')
    .trim();
  if (cleaned.length >= 8 && cleaned.length < 120) return cleaned;
  return 'Scholarship provider — confirm on the official programme website';
}

/**
 * Builds a NormalizedListing once an official URL has been extracted.
 * Returns null if the official URL is missing (caller should skip).
 */
export function normalizeOfaScholarshipItem(
  item: RssItem,
  officialUrl: string
): NormalizedListing | null {
  if (!item.title || !officialUrl) return null;

  const plain = stripHtml(item.descriptionHtml || '');
  const description =
    (plain.length >= 40
      ? plain
      : `${item.title}. Opportunity discovered via Opportunities for Africans; verify details on the official programme website.`) +
    ' Discovered via Opportunities for Africans (aggregator); always confirm eligibility and deadlines on the official site before applying.';

  return {
    kind: 'scholarship',
    sourceName: OFA_SOURCE_NAME,
    sourceId: item.guid || item.link,
    title: decodeEntities(item.title).trim(),
    organization: guessOrganization(decodeEntities(item.title)),
    country: guessCountry(item),
    level: guessLevel(item.title),
    funding: guessFunding(item.title, plain),
    field: 'See official site',
    deadline: extractDeadline(plain),
    description: description.slice(0, 4000),
    eligibility: [
      'Often open to African students / developing-country applicants — confirm nationality and academic rules on the official site.',
      'Eligibility varies by programme; do not rely on aggregator summaries alone.',
    ],
    requirements: [
      'Apply on the official programme website linked from this listing.',
      'Check the current cycle deadline and required documents on the official site.',
    ],
    benefits: [
      'See the official programme page for tuition, stipend, travel, and other coverage.',
    ],
    applicationUrl: officialUrl,
    officialSourceUrl: officialUrl,
  };
}
