import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

import * as schema from "~/database/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const db = drizzle({
  client: pool,
  schema,
  casing: "snake_case",
  logger: true,
});
