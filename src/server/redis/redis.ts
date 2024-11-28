import { env } from "@/lib/env";
import { Redis } from "ioredis";

const redis = new Redis(env.REDIS_URL);

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
