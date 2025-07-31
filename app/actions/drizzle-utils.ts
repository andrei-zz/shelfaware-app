import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { NeonQueryResultHKT } from "drizzle-orm/neon-serverless";
import type { PgTransaction } from "drizzle-orm/pg-core";

export type DrizzleTx = PgTransaction<
  NeonQueryResultHKT,
  typeof import("~/database/schema"),
  ExtractTablesWithRelations<typeof import("~/database/schema")>
>;
