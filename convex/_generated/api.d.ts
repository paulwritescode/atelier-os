/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as appointments from "../appointments.js";
import type * as auth from "../auth.js";
import type * as clients from "../clients.js";
import type * as consultations from "../consultations.js";
import type * as crons from "../crons.js";
import type * as designs from "../designs.js";
import type * as documents from "../documents.js";
import type * as garments from "../garments.js";
import type * as jobs from "../jobs.js";
import type * as lib_auth from "../lib/auth.js";
import type * as measurements from "../measurements.js";
import type * as notifications from "../notifications.js";
import type * as participants from "../participants.js";
import type * as payments from "../payments.js";
import type * as production from "../production.js";
import type * as projects from "../projects.js";
import type * as quotations from "../quotations.js";
import type * as seed from "../seed.js";
import type * as stories from "../stories.js";
import type * as timeline from "../timeline.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  appointments: typeof appointments;
  auth: typeof auth;
  clients: typeof clients;
  consultations: typeof consultations;
  crons: typeof crons;
  designs: typeof designs;
  documents: typeof documents;
  garments: typeof garments;
  jobs: typeof jobs;
  "lib/auth": typeof lib_auth;
  measurements: typeof measurements;
  notifications: typeof notifications;
  participants: typeof participants;
  payments: typeof payments;
  production: typeof production;
  projects: typeof projects;
  quotations: typeof quotations;
  seed: typeof seed;
  stories: typeof stories;
  timeline: typeof timeline;
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
