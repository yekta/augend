import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/trpc/api/trpc";
import {
  coinGeckoApiUrl,
  coinGeckoFetchOptions,
} from "@/trpc/api/routers/coin-gecko/constants";

export const coinGeckoRouter = createTRPCRouter({
  getCoinList: publicProcedure
    .input(
      z.object({
        convert: z.string().default("usd"),
      })
    )
    .query(async ({ input: { convert } }) => {
      const coinListUrl = `${coinGeckoApiUrl}/v3/coins/markets?vs_currency=${convert}&order=market_cap_desc&per_page=100&page=1&sparkline=false`;
      const coinListPromise = fetch(coinListUrl, coinGeckoFetchOptions);
      const [coinListResponse] = await Promise.all([coinListPromise]);

      const [coinListJson]: [TCoinListResult[]] = await Promise.all([
        coinListResponse.json(),
      ]);

      if (!coinListResponse.ok) {
        throw new Error(
          `${coinListResponse.status}: Failed to fetch CoinGecko coin list`
        );
      }

      return {
        coin_list: coinListJson,
      };
    }),
});

type TCoinListResult = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  roi: {
    times: number;
    currency: string;
    percentage: number;
  };
  last_updated: string;
};
