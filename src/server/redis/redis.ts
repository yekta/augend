import { env } from "@/lib/env";
import { createCacheKeyForTRPCRoute } from "@/server/redis/cache-utils";
import { Redis } from "ioredis";

const redis = new Redis(env.REDIS_URL + "?family=0");

const cacheTimes = {
  "seconds-short": 8,
  "seconds-medium": 24,
  "seconds-long": 48,
  "minutes-short": 60 * 3,
  "minutes-medium": 60 * 10,
  "minutes-long": 60 * 45,
  "hours-short": 60 * 60 * 2,
  "hours-medium": 60 * 60 * 6,
  "hours-long": 60 * 60 * 12,
};

export type TCacheTime = keyof typeof cacheTimes;

export async function setCache(
  key: string,
  value: unknown,
  cacheTime: TCacheTime
) {
  const start = performance.now();
  try {
    await redis.set(key, JSON.stringify(value), "EX", cacheTimes[cacheTime]);
    const duration = Math.round(performance.now() - start);

    console.log(`[CACHE][SET]: "${key}" | ${duration}ms`);

    return true;
  } catch (error) {
    console.log(`[CACHE][ERROR]: Setting cache for "${key}"`, error);
  }
  return false;
}

export async function getCache<T>(key: string) {
  const start = performance.now();
  try {
    const value = await redis.get(key);
    const duration = Math.round(performance.now() - start);

    if (!value) {
      console.log(`[CACHE][MISS]: "${key}" | ${duration}ms`);
      return null;
    }

    console.log(`[CACHE][HIT]: "${key}" | ${duration}ms`);

    return JSON.parse(value) as T;
  } catch (error) {
    console.log(`[CACHE][ERROR]: Getting cache for "${key}"`, error);
  }
  return null;
}

export async function cachedPromise<T>({
  path,
  params,
  promise,
  cacheTime = "seconds-medium",
}: {
  path: string;
  params: any;
  promise: Promise<T>;
  cacheTime: TCacheTime;
}) {
  const key = createCacheKeyForTRPCRoute(path, params, cacheTime);
  const cache = await getCache<T>(key);
  if (cache) {
    return cache;
  }

  const result = await promise;
  await setCache(key, result, cacheTime);
  return result;
}
