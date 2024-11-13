import { z } from "zod";

import { uniswapOkuUrl } from "@/server/api/routers/uniswap/constants";
import {
  TUniswapPoolsResult,
  TUniswapPoolsResultRaw,
} from "@/server/api/routers/uniswap/types";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import type { SearchFilterOpts } from "@gfxlabs/oku";

const NetworkSchema = z.enum(["ethereum"]);

export const uniswapRouter = createTRPCRouter({
  getPools: publicProcedure
    .input(
      z.object({
        page: z.number().int().positive().default(1),
        network: NetworkSchema.optional().default("ethereum"),
      })
    )
    .query(async ({ input: { page, network } }) => {
      throw new Error("Not implemented");
      const first = 100;
      const skip = (page - 1) * first;
      const extra = 50;
      const url = `${uniswapOkuUrl}/${network}/cush/topPools`;
      const body: { params: SearchFilterOpts[] } = {
        params: [
          {
            fee_tiers: [],
            sort_by: "tvl_usd",
            sort_order: false,
            result_size: first + extra,
            result_offset: skip,
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
          .slice(0, first)
          .map((pool) => {
            const feeTier = pool.fee / 1_000_000;
            const fees24hUSD = pool.total_fees_usd;
            return {
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
