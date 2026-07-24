/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `pnpm convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as billing from "../billing.js";
import type * as dodo from "../dodo.js";
import type * as health_check from "../health-check.js";
import type * as http from "../http.js";
import type * as licenses from "../licenses.js";
import type * as payments from "../payments.js";
import type * as validators from "../validators.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  billing: typeof billing;
  dodo: typeof dodo;
  "health-check": typeof health_check;
  http: typeof http;
  licenses: typeof licenses;
  payments: typeof payments;
  validators: typeof validators;
}>;

export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: import("@convex-dev/better-auth/_generated/component.js").ComponentApi<"betterAuth">;
  dodopayments: import("@dodopayments/convex/_generated/component.js").ComponentApi<"dodopayments">;
};
