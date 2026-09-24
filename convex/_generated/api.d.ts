/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as crons from "../crons.js";
import type * as discovery from "../discovery.js";
import type * as duplicates from "../duplicates.js";
import type * as ingestion from "../ingestion.js";
import type * as lib_adminAuth from "../lib/adminAuth.js";
import type * as maintenance from "../maintenance.js";
import type * as opportunities from "../opportunities.js";
import type * as rssIngestion from "../rssIngestion.js";
import type * as scholarships from "../scholarships.js";
import type * as sources_erasmusMundusAdapter from "../sources/erasmusMundusAdapter.js";
import type * as sources_manualAdapter from "../sources/manualAdapter.js";
import type * as sources_officialSiteAdapter from "../sources/officialSiteAdapter.js";
import type * as sources_officialSiteSources from "../sources/officialSiteSources.js";
import type * as sources_types from "../sources/types.js";
import type * as validation from "../validation.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  crons: typeof crons;
  discovery: typeof discovery;
  duplicates: typeof duplicates;
  ingestion: typeof ingestion;
  "lib/adminAuth": typeof lib_adminAuth;
  maintenance: typeof maintenance;
  opportunities: typeof opportunities;
  rssIngestion: typeof rssIngestion;
  scholarships: typeof scholarships;
  "sources/erasmusMundusAdapter": typeof sources_erasmusMundusAdapter;
  "sources/manualAdapter": typeof sources_manualAdapter;
  "sources/officialSiteAdapter": typeof sources_officialSiteAdapter;
  "sources/officialSiteSources": typeof sources_officialSiteSources;
  "sources/types": typeof sources_types;
  validation: typeof validation;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
