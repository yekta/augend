import "server-only";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "@/lib/env";

const databaseUrlRaw = env.DATABASE_URL;
if (!databaseUrlRaw) {
  throw new Error("DATABASE_URL is not set");
}
const databaseUrl = databaseUrlRaw;

const pool = new Pool({
  connectionString: databaseUrl,
  idleTimeoutMillis: 30_000,
});
export const db = drizzle({ client: pool });
