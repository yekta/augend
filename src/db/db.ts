import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const databaseUrlRaw = process.env.DATABASE_URL;
if (!databaseUrlRaw) {
  throw new Error("DATABASE_URL is not set");
}
const databaseUrl = databaseUrlRaw;

const sql = neon(databaseUrl);
export const db = drizzle({ client: sql });
