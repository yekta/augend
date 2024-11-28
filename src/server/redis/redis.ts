import { env } from "@/lib/env";
import { Redis } from "ioredis";

const { host, port, password, database } = parseRedisUrl(env.REDIS_URL);

const redis = new Redis({
  host,
  port,
  password,
  db: database,
});

function createKey(key: string, params: string[]) {
  return `${key}:${params.join("_")}`;
}

const cacheTimes = {
  short: 8,
  medium: 24,
  long: 48,
};

export async function setCache(
  key: string,
  params: string[],
  value: any,
  cacheType: keyof typeof cacheTimes = "medium"
) {
  const _key = createKey(key, params);
  try {
    await redis.set(_key, JSON.stringify(value), "EX", cacheTimes[cacheType]);
    console.log(`[CACHE]: Set for "${_key}"`);
    return true;
  } catch (error) {
    console.log(`Error setting cache for "key"`, error);
  }
  return false;
}

export async function getCache<T>(key: string, params: string[]) {
  const _key = createKey(key, params);
  try {
    const value = await redis.get(createKey(key, params));
    if (!value) return null;
    console.log(`[CACHE]: Hit for "${_key}"`);
    return JSON.parse(value) as T;
  } catch (error) {
    console.log(`Error getting cache for "key"`, error);
  }
  return null;
}

interface RedisConfig {
  host: string;
  port: number;
  username?: string;
  password?: string;
  database?: number;
  protocol: string;
  tls: boolean;
}

function parseRedisUrl(url: string): RedisConfig {
  try {
    const parsedUrl = new URL(url);

    // Extract basic components
    const protocol = parsedUrl.protocol.replace(":", "");
    const host = parsedUrl.hostname;
    const port = parsedUrl.port ? parseInt(parsedUrl.port, 10) : 6379;

    // Initialize config with required fields
    const config: RedisConfig = {
      host,
      port,
      protocol,
      tls: protocol === "rediss",
    };

    // Parse authentication if present
    if (parsedUrl.username || parsedUrl.password) {
      // URL decoded username handling
      const decodedUsername = decodeURIComponent(parsedUrl.username);
      if (decodedUsername && decodedUsername !== "default") {
        config.username = decodedUsername;
      }

      // URL decoded password handling
      if (parsedUrl.password) {
        config.password = decodeURIComponent(parsedUrl.password);
      }
    }

    // Parse database number from pathname
    const pathname = parsedUrl.pathname;
    if (pathname && pathname.length > 1) {
      const database = parseInt(pathname.slice(1), 10);
      if (!isNaN(database)) {
        config.database = database;
      }
    }

    return config;
  } catch (error) {
    throw new Error(`Invalid Redis URL: ${error}`);
  }
}
