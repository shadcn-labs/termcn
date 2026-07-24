/* eslint-disable */
/**
 * Generated data model types.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `pnpm convex dev`.
 * @module
 */

import type {
  DataModelFromSchemaDefinition,
  DocumentByName,
  SystemTableNames,
  TableNamesInDataModel,
} from "convex/server";
import type { GenericId } from "convex/values";
import schema from "../schema.js";

export type TableNames = TableNamesInDataModel<DataModel>;

export type Doc<TableName extends TableNames> = DocumentByName<
  DataModel,
  TableName
>;

export type Id<TableName extends TableNames | SystemTableNames> =
  GenericId<TableName>;

export type DataModel = DataModelFromSchemaDefinition<typeof schema>;
