import { z } from "zod";

import { uniswapOkuUrl } from "@/server/api/routers/uniswap/constants";
import {
  TUniswapPoolsResult,
  TUniswapPoolsResultRaw,
  UniswapNetworkSchema,
} from "@/server/api/routers/uniswap/types";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import type { SearchFilterOpts } from "@gfxlabs/oku";

export const uniswapRouter = createTRPCRouter({
  getPools: publicProcedure
    .input(
      z.object({
        page: z.number().int().positive().default(1),
        network: UniswapNetworkSchema.optional().default("ethereum"),
      })
    )
    .query(async ({ input: { page, network } }) => {
      const first = 100;
      const url = `${uniswapOkuUrl}/${network}/cush/topPools`;
      const body: { params: SearchFilterOpts[] } = {
        params: [
          {
            fee_tiers: [],
            sort_by: "tvl_usd",
            sort_order: false,
            result_size: first,
            result_offset: page - 1,
          },
        ],
      };
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        throw new Error(`${res.status}: Failed to fetch Uniswap pools`);
      }
      const resJson: TUniswapPoolsResultRaw = await res.json();
      const editedRes: TUniswapPoolsResult = {
        pools: resJson.result.pools
          .filter((p) => p.t0_volume_usd > 1000)
          .map((pool) => {
            const feeTier = pool.fee / 1_000_000;
            const fees24hUSD = pool.total_fees_usd;
            return {
              address: pool.address,
              tvlUSD: pool.tvl_usd,
              price: pool.last_price,
              apr24h: (fees24hUSD / pool.tvl_usd) * 365,
              feeTier,
              fees24hUSD,
              fees7dUSD: pool.total_volume_7d_usd * feeTier,
              volume24hUSD: pool.t0_volume_usd,
              volume7dUSD: pool.total_volume_7d_usd,
              token0: {
                name: pool.t0_name,
                symbol: pool.t0_symbol,
              },
              token1: {
                name: pool.t1_name,
                symbol: pool.t1_symbol,
              },
            };
          }),
      };
      return editedRes;
    }),
});
