import { env } from "@/lib/env";
import { cachedFunction } from "@/server/redis/redis";
import { metalsDevApi } from "@/server/trpc/api/forex/constants";
import { MetalsDevResultSchema } from "@/server/trpc/api/forex/types";
import { createTRPCRouter, publicProcedure } from "@/server/trpc/setup/trpc";
import { TRPCError } from "@trpc/server";

const metalObjects = [
  {
    key: "gold",
    ticker: "XAU",
  },
  {
    key: "silver",
    ticker: "XAG",
  },
  {
    key: "platinum",
    ticker: "XPT",
  },
  {
    key: "palladium",
    ticker: "XPD",
  },
];

type TReturn = Record<string, Record<string, { buy: number }>>;

async function getForexRates() {
  const forexUrl = `${metalsDevApi}/v1/latest?api_key=${env.METALS_DEV_API_KEY}&currency=USD&unit=toz`;
  const [forexResult] = await Promise.all([fetch(forexUrl)]);
  const [forexData]: [unknown] = await Promise.all([forexResult.json()]);

  const { error: forexParseError, data: parsedForexData } =
    MetalsDevResultSchema.safeParse(forexData);

  if (forexParseError) {
    console.log(forexParseError);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Failed to parse forex data: ${forexParseError.message}`,
    });
  }

  let result: TReturn = {
    USD: {},
  };

  for (const metal of metalObjects) {
    if (
      parsedForexData.metals[metal.key] === undefined ||
      parsedForexData.metals[metal.key] === null
    ) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Metal "${metal.key}" not found in the result.`,
      });
    }
    result.USD[metal.ticker] = {
      buy: parsedForexData.metals[metal.key],
    };
  }

  for (const currency in parsedForexData.currencies) {
    result.USD[currency] = {
      buy: parsedForexData.currencies[currency],
    };
  }
  return result;
}

export const getForexRatesRatesCached = cachedFunction(getForexRates, {
  path: "forexRates",
  params: {},
  cacheTime: "minutes-medium",
});

export const forexRouter = createTRPCRouter({
  getRates: publicProcedure.query(async () => {
    const result = await getForexRatesRatesCached();
    return result;
  }),
});
