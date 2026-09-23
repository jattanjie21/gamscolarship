// Every source adapter (convex/sources/*.ts) normalizes whatever shape its
// upstream data comes in to this common type before it reaches the
// ingestion pipeline (convex/ingestion.ts). Ingestion, validation, and
// duplicate detection all work against this shape — they never see a raw
// API response.

export type NormalizedScholarship = {
  kind: 'scholarship';
  sourceName: string; // must match a row in the `sources` table
  sourceId?: string; // upstream's own id for this record, if it has one
  title: string;
  organization: string;
  country: string;
  level: string;
  funding: string;
  field: string;
  deadline: string;
  description: string;
  eligibility: string[];
  requirements: string[];
  benefits: string[];
  applicationUrl: string;
  officialSourceUrl?: string;
};

export type NormalizedOpportunity = {
  kind: 'opportunity';
  sourceName: string;
  sourceId?: string;
  title: string;
  organization: string;
  category: string;
  country: string;
  deadline: string;
  description: string;
  applicationUrl: string;
  officialSourceUrl?: string;
};

export type NormalizedListing = NormalizedScholarship | NormalizedOpportunity;
