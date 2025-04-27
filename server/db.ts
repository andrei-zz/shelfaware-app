import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

import * as schema from "~/../database/schema";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

config({ path: ".env" });

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle({
  client: sql,
  schema,
  casing: "snake_case",
  logger: true,
});
