import { env } from "@/lib/env";
import "server-only";

export const cmcFetchOptions = {
  // CMC responses are cached explicitly in Redis/Postgres. Avoid a second
  // Next.js data-cache entry in the web process.
  cache: "no-store",
  headers: {
    "x-cmc_pro_API_KEY": env.CMC_API_KEY,
  },
} satisfies RequestInit;
