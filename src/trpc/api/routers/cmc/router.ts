import { z } from "zod";

import { cmcApiUrl } from "@/trpc/api/routers/cmc/constants";
import { createTRPCRouter, publicProcedure } from "@/trpc/api/trpc";
import {
  TCmcGetCryptosResult,
  TCmcGetCryptosResultEdited,
} from "@/trpc/api/routers/cmc/types";
import { cmcFetchOptions } from "@/trpc/api/routers/cmc/secrets";

export const cmcRouter = createTRPCRouter({
  getCryptoInfos: publicProcedure
    .input(
      z.object({
        symbols: z.array(z.string()),
        convert: z.string(),
      })
    )
    .query(async ({ input: { symbols, convert } }) => {
      const symbolsStr = symbols.join(",");
      const url = `${cmcApiUrl}/v2/cryptocurrency/quotes/latest?symbol=${symbolsStr}&convert=${convert}`;

      const response = await fetch(url, cmcFetchOptions);
      if (!response.ok) throw new Error("Failed to fetch CMC data");

      const result: TCmcGetCryptosResult = await response.json();

      let editedResult: TCmcGetCryptosResultEdited = {};
      for (const key in result.data) {
        editedResult[key] = result.data[key][0];
      }

      return editedResult;
    }),
  getGlobalMetrics: publicProcedure
    .input(
      z.object({
        convert: z.string().default("USD"),
      })
    )
    .query(async ({ input: { convert } }) => {
      const fearAndGreedUrl = `${cmcApiUrl}/v3/fear-and-greed/latest`;
      const metricsUrl = `${cmcApiUrl}/v1/global-metrics/quotes/latest?convert=${convert}`;

      const fearGreedIndexPromise = fetch(fearAndGreedUrl, cmcFetchOptions);
      const metricsPromise = fetch(metricsUrl, cmcFetchOptions);

      const [fearGreedIndexResponse, metricsResponse] = await Promise.all([
        fearGreedIndexPromise,
        metricsPromise,
      ]);

      if (!fearGreedIndexResponse.ok) {
        throw new Error(
          `${fearGreedIndexResponse.status}: Failed to fetch CMC Fear and Greed Index`
        );
      }
      if (!metricsResponse.ok) {
        throw new Error(
          `${metricsResponse.status}: Failed to fetch CMC Global Metrics`
        );
      }

      const [fearGreedIndexData, metricsData]: [
        TCmcFearGreedIndexResult,
        TCmcGlobalMetricsResult,
      ] = await Promise.all([
        fearGreedIndexResponse.json(),
        metricsResponse.json(),
      ]);

      return {
        fear_greed_index: fearGreedIndexData.data,
        btc_dominance: metricsData.data.btc_dominance,
        eth_dominance: metricsData.data.eth_dominance,
        ...metricsData.data.quote[convert],
      };
    }),
  getCoinList: publicProcedure
    .input(
      z.object({
        convert: z.string().default("usd"),
        page: z.number().int().positive().default(0),
      })
    )
    .query(async ({ input: { convert, page } }) => {
      const limit = 100;
      const start = ((page || 1) - 1) * limit + 1;
      const coinListUrl = `${cmcApiUrl}/v1/cryptocurrency/listings/latest?convert=${convert}&limit=100&start=${start}`;
      const coinListPromise = fetch(coinListUrl, cmcFetchOptions);
      const [coinListResponse] = await Promise.all([coinListPromise]);

      const [coinListJson]: [TCmcCoinListResult] = await Promise.all([
        coinListResponse.json(),
      ]);

      if (!coinListResponse.ok) {
        throw new Error(
          `${coinListResponse.status}: Failed to fetch CMC coin list`
        );
      }

      return {
        coin_list: coinListJson.data,
      };
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
