import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrlRaw = process.env.DATABASE_URL;
if (!databaseUrlRaw) {
  throw new Error("DATABASE_URL is not set");
}
const databaseUrl = databaseUrlRaw;

const pool = new Pool({
  connectionString: databaseUrl,
  idleTimeoutMillis: 30_000,
});
export const db = drizzle({ client: pool });
