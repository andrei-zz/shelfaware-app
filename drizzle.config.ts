import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

export default defineConfig({
  schema: "./database/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: process.env.NODE_ENV === "development",
  strict: process.env.NODE_ENV === "development",
});
