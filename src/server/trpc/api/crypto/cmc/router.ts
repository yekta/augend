import { z } from "zod";

import {
  getLatestCryptoInfos,
  insertCmcCryptoInfosAndQuotes,
} from "@/server/db/repo/cmc";
import { cleanAndSortArray } from "@/server/redis/cache-utils";
import { cmcApiUrl } from "@/server/trpc/api/crypto/cmc/constants";
import { cmcFetchOptions } from "@/server/trpc/api/crypto/cmc/secrets";
import {
  TCmcGetCryptosRawResult,
  TCmcGetCryptosResult,
} from "@/server/trpc/api/crypto/cmc/types";
import {
  cachedPublicProcedure,
  createTRPCRouter,
  publicProcedure,
} from "@/server/trpc/setup/trpc";
import { TRPCError } from "@trpc/server";

export const cmcRouter = createTRPCRouter({
  getCryptoInfos: publicProcedure
    .input(
      z.object({
        ids: z.array(z.number()).max(100),
        convert: z.array(z.string()).max(3).optional().default(["USD"]),
      })
    )
    .query(async ({ input: { ids, convert }, ctx }) => {
      const cleanedIds = cleanAndSortArray(ids);
      const cleanedConvert = cleanAndSortArray(convert);

      type TReturn = TCmcGetCryptosResult;

      //// Read from postgres cache ////
      const freshDuration = 1000 * 30;
      let startRead = performance.now();
      const result: TReturn | null = await getLatestCryptoInfos({
        coinIds: cleanedIds,
        currencyTickers: cleanedConvert,
        afterTimestamp: Date.now() - freshDuration,
      });
      const logKey = `getCryptoInfos:${cleanedConvert.join(
        ","
      )}:${cleanedIds.join(",")}`;
      if (result) {
        console.log(
          `[POSTGRES_CACHE][HIT]: ${logKey} | ${Math.round(
            performance.now() - startRead
          )}ms`
        );
        return result;
      } else {
        console.log(
          `[POSTGRES_CACHE][MISS]: ${logKey} | ${Math.round(
            performance.now() - startRead
          )}ms`
        );
      }
      //////////////////////////////////

      const idsStr = cleanedIds.join(",");
      const urls = cleanedConvert.map(
        (c) =>
          `${cmcApiUrl}/v2/cryptocurrency/quotes/latest?id=${idsStr}&convert=${c}`
      );
      const responses = await Promise.all(
        urls.map((url) => fetch(url, cmcFetchOptions))
      );

      const results: TCmcGetCryptosRawResult[] = await Promise.all(
        responses.map((r) => r.json())
      );

      results.forEach((r) => {
        if (!r.data) {
          console.log(r);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch CMC crypto infos",
          });
        }
      });

      let editedResult: TReturn = {};
      const firstResult = results[0];
      for (const key in firstResult.data) {
        const quoteObj: TCmcGetCryptosResult[number]["quote"] = {};
        for (const result of results) {
          const quote = result.data[key].quote;
          for (const currency in quote) {
            const item = quote[currency];
            quoteObj[currency] = {
              price: item.price,
              volume_24h: item.volume_24h,
              volume_change_24h: item.volume_change_24h,
              percent_change_1h: item.percent_change_1h,
              percent_change_24h: item.percent_change_24h,
              percent_change_7d: item.percent_change_7d,
              percent_change_30d: item.percent_change_30d,
              percent_change_60d: item.percent_change_60d,
              percent_change_90d: item.percent_change_90d,
              market_cap: item.market_cap,
              market_cap_dominance: item.market_cap_dominance,
              fully_diluted_market_cap: item.fully_diluted_market_cap,
              last_updated: item.last_updated,
            };
          }
        }
        const item = firstResult.data[key];
        editedResult[key] = {
          id: item.id,
          name: item.name,
          symbol: item.symbol,
          slug: item.slug,
          circulating_supply: item.circulating_supply,
          cmc_rank: item.cmc_rank,
          max_supply: item.max_supply,
          total_supply: item.total_supply,
          last_updated: item.last_updated,
          quote: quoteObj,
        };
      }

      //// Write to Postgres cache ////
      const startWrite = performance.now();
      await insertCmcCryptoInfosAndQuotes({ cmcResult: editedResult });
      console.log(
        `[POSTGRES_CACHE][SET]: ${logKey} | ${Math.floor(
          performance.now() - startWrite
        )}ms`
      );
      ////////////////////////////////

      return editedResult;
    }),
  getGlobalMetrics: cachedPublicProcedure("minutes-short")
    .input(
      z.object({
        convert: z.string().optional().default("USD"),
      })
    )
    .query(async ({ input: { convert }, ctx }) => {
      type TReturn = TCmcGlobalMetricsResult["data"]["quote"]["USD"] & {
        fear_greed_index: TCmcFearGreedIndexResult["data"];
        eth_dominance: number;
        btc_dominance: number;
      };

      if (ctx.cachedResult) {
        return ctx.cachedResult as TReturn;
      }

      const fearAndGreedUrl = `${cmcApiUrl}/v3/fear-and-greed/latest`;
      const metricsUrl = `${cmcApiUrl}/v1/global-metrics/quotes/latest?convert=${convert}`;

      const fearGreedIndexPromise = fetch(fearAndGreedUrl, cmcFetchOptions);
      const metricsPromise = fetch(metricsUrl, cmcFetchOptions);

      const [fearGreedIndexResponse, metricsResponse] = await Promise.all([
        fearGreedIndexPromise,
        metricsPromise,
      ]);

      if (!fearGreedIndexResponse.ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `${fearGreedIndexResponse.status}: Failed to fetch CMC Fear and Greed Index`,
        });
      }
      if (!metricsResponse.ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `${metricsResponse.status}: Failed to fetch CMC Global Metrics`,
        });
      }

      const [fearGreedIndexData, metricsData]: [
        TCmcFearGreedIndexResult,
        TCmcGlobalMetricsResult
      ] = await Promise.all([
        fearGreedIndexResponse.json(),
        metricsResponse.json(),
      ]);

      const result: TReturn = {
        fear_greed_index: fearGreedIndexData.data,
        btc_dominance: metricsData.data.btc_dominance,
        eth_dominance: metricsData.data.eth_dominance,
        ...metricsData.data.quote[convert],
      };

      return result;
    }),
  getCoinList: cachedPublicProcedure("minutes-short")
    .input(
      z.object({
        convert: z.string().optional().default("USD"),
        page: z.number().int().positive().default(0),
      })
    )
    .query(async ({ input: { convert, page }, ctx }) => {
      type TReturn = {
        coin_list: TCmcCoinListResult["data"];
      };

      if (ctx.cachedResult) {
        return ctx.cachedResult as TReturn;
      }

      const limit = 100;
      const start = ((page || 1) - 1) * limit + 1;
      const coinListUrl = `${cmcApiUrl}/v1/cryptocurrency/listings/latest?convert=${convert}&limit=100&start=${start}`;
      const coinListPromise = fetch(coinListUrl, cmcFetchOptions);
      const [coinListResponse] = await Promise.all([coinListPromise]);

      const [coinListJson]: [TCmcCoinListResult] = await Promise.all([
        coinListResponse.json(),
      ]);

      if (!coinListResponse.ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `${coinListResponse.status}: Failed to fetch CMC coin list`,
        });
      }

      const result: TReturn = {
        coin_list: coinListJson.data,
      };

      return result;
    }),
  getCoinIdMaps: cachedPublicProcedure("hours-medium")
    .input(
      z.object({
        limit: z
          .number()
          .int()
          .max(1500)
          .min(1500)
          .positive()
          .optional()
          .default(1500),
        sortBy: z.enum(["cmc_rank", "id"]).optional().default("cmc_rank"),
      })
    )
    .query(async ({ input: { limit, sortBy }, ctx }) => {
      type TReturn = {
        id: number;
        name: string;
        rank: number;
        symbol: string;
      }[];

      if (ctx.cachedResult) {
        return ctx.cachedResult as TReturn;
      }

      const url = `${cmcApiUrl}/v1/cryptocurrency/map?sort=${sortBy}&limit=${limit}`;
      const res = await fetch(url, cmcFetchOptions);

      if (!res.ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `${res.status}: Failed to fetch CMC ID maps`,
        });
      }

      const resJson: TCmcCoinIdMapsResult = await res.json();

      if (!resJson.data) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `No data in CMC ID maps`,
        });
      }

      const unfilteredResult: TReturn = resJson.data.map((d) => ({
        id: d.id,
        name: d.name,
        rank: d.rank,
        symbol: d.symbol,
      }));

      // Filter results with the same name using a Map
      const map = new Map<string, TReturn[0]>();
      for (const item of unfilteredResult) {
        if (!map.has(item.name)) {
          map.set(item.name, item);
        }
      }
      const result: TReturn = Array.from(map.values());

      return result;
    }),
});

type TCmcFearGreedIndexResult = {
  data: {
    value: number;
    value_classification: string;
    timestamp: string;
  };
};

type TCmcGlobalMetricsResult = {
  data: {
    btc_dominance: number;
    eth_dominance: number;
    quote: {
      [key: string]: {
        total_market_cap: number;
        total_volume_24h: number;
        last_updated: string;
        total_market_cap_yesterday: number;
        total_market_cap_yesterday_percentage_change: number;
      };
    };
  };
};

type TCmcCoinListResult = {
  data: {
    id: number;
    name: string;
    symbol: string;
    slug: string;
    num_market_pairs: number;
    date_added: string;
    tags: string[];
    max_supply: number;
    circulating_supply: number;
    total_supply: number;
    platform: string | null;
    cmc_rank: number;
    last_updated: string;
    quote: {
      [key: string]: {
        price: number;
        volume_24h: number;
        percent_change_1h: number;
        percent_change_24h: number;
        percent_change_7d: number;
        market_cap: number;
        last_updated: string;
      };
    };
  }[];
};

type TCmcCoinIdMapsResult = {
  data: {
    id: number;
    name: string;
    rank: number;
    symbol: string;
    is_active: number;
  }[];
};
