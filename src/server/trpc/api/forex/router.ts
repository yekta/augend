import { env } from "@/lib/env";
import { metalsDevApi } from "@/server/trpc/api/forex/constants";
import { TMetalsDevsResult } from "@/server/trpc/api/forex/types";
import {
  cachedPublicProcedure,
  createTRPCRouter,
} from "@/server/trpc/setup/trpc";
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

export const forexRouter = createTRPCRouter({
  getRates: cachedPublicProcedure("minutes-long").query(async ({ ctx }) => {
    type TReturn = Record<string, Record<string, { buy: number }>>;

    if (ctx.cachedResult) {
      return ctx.cachedResult as TReturn;
    }

    const forexUrl = `${metalsDevApi}/v1/latest?api_key=${env.METALS_DEV_API_KEY}&currency=USD&unit=toz`;

    const [forexResult] = await Promise.all([fetch(forexUrl)]);

    const [forexData]: [TMetalsDevsResult] = await Promise.all([
      forexResult.json(),
    ]);

    let result: TReturn = {
      USD: {},
    };

    for (const metal of metalObjects) {
      if (
        forexData.metals[metal.key] === undefined ||
        forexData.metals[metal.key] === null
      ) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Metal "${metal.key}" not found in the result.`,
        });
      }
      result.USD[metal.ticker] = {
        buy: forexData.metals[metal.key],
      };
    }

    for (const currency in forexData.currencies) {
      result.USD[currency] = {
        buy: forexData.currencies[currency],
      };
    }

    return result;
  }),
});
