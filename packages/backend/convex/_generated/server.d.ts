/* eslint-disable */
/**
 * Generated utilities for implementing server-side Convex functions.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `pnpm convex dev`.
 * @module
 */

import type {
  ActionBuilder,
  GenericActionCtx,
  GenericDatabaseReader,
  GenericDatabaseWriter,
  GenericMutationCtx,
  GenericQueryCtx,
  HttpActionBuilder,
  MutationBuilder,
  QueryBuilder,
} from "convex/server";
import type { DataModel } from "./dataModel.js";

type Env = {
  readonly AUTH_EMAIL_FROM?: string;
  readonly DODO_BUNDLE_PRODUCT_ID: string;
  readonly DODO_PAYMENTS_API_KEY: string;
  readonly DODO_PAYMENTS_ENVIRONMENT: "live_mode" | "test_mode";
  readonly DODO_SKILL_PRODUCT_ID: string;
  readonly DODO_TEAM_BUNDLE_PRODUCT_ID?: string;
  readonly DODO_TEAM_SKILL_PRODUCT_ID?: string;
  readonly RESEND_API_KEY?: string;
  readonly SITE_URL: string;
};

export declare const query: QueryBuilder<DataModel, "public">;
export declare const internalQuery: QueryBuilder<DataModel, "internal">;
export declare const mutation: MutationBuilder<DataModel, "public">;
export declare const internalMutation: MutationBuilder<DataModel, "internal">;
export declare const action: ActionBuilder<DataModel, "public">;
export declare const internalAction: ActionBuilder<DataModel, "internal">;
export declare const httpAction: HttpActionBuilder;
export declare const env: Env;

export type QueryCtx = GenericQueryCtx<DataModel>;
export type MutationCtx = GenericMutationCtx<DataModel>;
export type ActionCtx = GenericActionCtx<DataModel>;
export type DatabaseReader = GenericDatabaseReader<DataModel>;
export type DatabaseWriter = GenericDatabaseWriter<DataModel>;
