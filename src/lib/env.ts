import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string().url(),
    REDIS_URL: z.string().url(),
    CMC_API_KEY: z.string(),
    ALCHEMY_API_KEY: z.string(),
    TIINGO_API_KEY: z.string(),
    METALS_DEV_API_KEY: z.string(),
    CCXT_PROXY_URL: z.string().url().optional(),
    AUTH_SECRET: z.string(),
    AUTH_DRIZZLE_URL: z.string().url(),
    AUTH_GOOGLE_ID: z.string().optional(),
    AUTH_GOOGLE_SECRET: z.string().optional(),
    AUTH_DISCORD_ID: z.string().optional(),
    AUTH_DISCORD_SECRET: z.string().optional(),
    AUTH_GITHUB_ID: z.string().optional(),
    AUTH_GITHUB_SECRET: z.string().optional(),
    AUTH_URL: z.string().url(),
    POSTHOG_API_KEY: z.string().optional(),
    GHOST_API_URL: z.string().optional(),
    GHOST_CONTENT_API_KEY: z.string().optional(),
    RAILWAY_API_KEY: z.string().optional(),
    BINANCE_API_KEY: z.string().optional(),
    BINANCE_API_SECRET: z.string().optional(),
    BANANO_API_KEY: z.string().optional(),
    CLOUDFLARE_ZONE_ID: z.string().optional(),
    CLOUDFLARE_EMAIL: z.string().optional(),
    CLOUDFLARE_API_KEY: z.string().optional(),
    RAILWAY_WEBHOOK_SECRET: z.string().optional(),
    RAILWAY_SERVICE_ID: z.string().optional(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_BUCKET_URL: z.string(),
    NEXT_PUBLIC_SITE_URL: z.string(),
    NEXT_PUBLIC_REOWN_PROJECT_ID: z.string(),
    NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().optional(),
    NEXT_PUBLIC_POSTHOG_HOST_ASSETS: z.string().optional(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL,
    CMC_API_KEY: process.env.CMC_API_KEY,
    ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY,
    TIINGO_API_KEY: process.env.TIINGO_API_KEY,
    METALS_DEV_API_KEY: process.env.METALS_DEV_API_KEY,
    CCXT_PROXY_URL: process.env.CCXT_PROXY_URL,
    NEXT_PUBLIC_BUCKET_URL: process.env.NEXT_PUBLIC_BUCKET_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_REOWN_PROJECT_ID: process.env.NEXT_PUBLIC_REOWN_PROJECT_ID,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_POSTHOG_HOST_ASSETS:
      process.env.NEXT_PUBLIC_POSTHOG_HOST_ASSETS,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_DRIZZLE_URL: process.env.AUTH_DRIZZLE_URL,
    AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
    AUTH_DISCORD_ID: process.env.AUTH_DISCORD_ID,
    AUTH_DISCORD_SECRET: process.env.AUTH_DISCORD_SECRET,
    AUTH_GITHUB_ID: process.env.AUTH_GITHUB_ID,
    AUTH_GITHUB_SECRET: process.env.AUTH_GITHUB_SECRET,
    AUTH_URL: process.env.AUTH_URL,
    POSTHOG_API_KEY: process.env.POSTHOG_API_KEY,
    GHOST_API_URL: process.env.GHOST_API_URL,
    GHOST_CONTENT_API_KEY: process.env.GHOST_CONTENT_API_KEY,
    RAILWAY_API_KEY: process.env.RAILWAY_API_KEY,
    RAILWAY_SERVICE_ID: process.env.RAILWAY_SERVICE_ID,
    BINANCE_API_KEY: process.env.BINANCE_API_KEY,
    BINANCE_API_SECRET: process.env.BINANCE_API_SECRET,
    BANANO_API_KEY: process.env.BANANO_API_KEY,
    CLOUDFLARE_ZONE_ID: process.env.CLOUDFLARE_ZONE_ID,
    CLOUDFLARE_EMAIL: process.env.CLOUDFLARE_EMAIL,
    CLOUDFLARE_API_KEY: process.env.CLOUDFLARE_API_KEY,
    RAILWAY_WEBHOOK_SECRET: process.env.RAILWAY_WEBHOOK_SECRET,
    NODE_ENV: process.env.NODE_ENV,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
