import { z } from "zod";

import { uniswapOkuUrl } from "@/server/api/routers/uniswap/constants";
import {
  TUniswapPoolsResult,
  TUniswapPoolsResultRaw,
  TUniswapPositionResult,
  TUniswapPositionResultRaw,
  UniswapNetworkSchema,
} from "@/server/api/routers/uniswap/types";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import type { AnalyticsPosition, SearchFilterOpts } from "@gfxlabs/oku";

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
      if (resJson.error) {
        throw new Error(resJson.error.message);
      }
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
                id: pool.t0,
                name: pool.t0_name,
                symbol: pool.t0_symbol,
              },
              token1: {
                id: pool.t1,
                name: pool.t1_name,
                symbol: pool.t1_symbol,
              },
            };
          }),
      };
      return editedRes;
    }),
  getPosition: publicProcedure
    .input(
      z.object({
        id: z.number(),
        network: UniswapNetworkSchema.optional().default("ethereum"),
      })
    )
    .query(async ({ input: { id, network } }) => {
      const url = `${uniswapOkuUrl}/${network}/cush/analyticsPosition`;
      const body = {
        params: [
          {
            token_id: id,
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
      const resJson: TUniswapPositionResultRaw = await res.json();
      if (resJson.error) {
        throw new Error(resJson.error.message);
      }

      const position = resJson.result.position;

      const decimals0 = Math.pow(
        10,
        position.position_pool_data.token0_decimals
      );
      const decimals1 = Math.pow(
        10,
        position.position_pool_data.token1_decimals
      );
      const amount0USD = Number(
        position.current_position_values.amount0_current_usd
      );
      const amount1USD = Number(
        position.current_position_values.amount1_current_usd
      );
      const amountTotalUSD = Number(
        position.current_position_values.total_value_current_usd
      );
      const ratio0 = amount0USD / amountTotalUSD;
      const ratio1 = 1 - ratio0;
      const priceCurrent = Number(
        position.position_pool_data.current_pool_price
      );
      const editedRes: TUniswapPositionResult = {
        position: {
          amount0: getDecimalAmount(
            position.current_position_values.amount0_current,
            position.position_pool_data.token0_decimals
          ),
          amount1: getDecimalAmount(
            position.current_position_values.amount1_current,
            position.position_pool_data.token0_decimals
          ),
          amount0USD,
          amount1USD,
          amountTotalUSD,
          ratio0,
          ratio1,
          priceLower: Number(position.position_price_range.lower_price),
          priceUpper: Number(position.position_price_range.upper_price),
          priceCurrent,
          uncollectedFees0: getDecimalAmount(
            position.current_fee_info.token0FeesUncollected,
            position.position_pool_data.token0_decimals
          ),
          uncollectedFees1: getDecimalAmount(
            position.current_fee_info.token1FeesUncollected,
            position.position_pool_data.token1_decimals
          ),
          uncollectedFeesTotalUSD:
            position.position_profit.uncollected_usd_fees,
          deposit0: getDecimalAmount(
            position.total_deposit_amounts.total_deposit_amount0,
            position.position_pool_data.token1_decimals
          ),
          deposit1: getDecimalAmount(
            position.total_deposit_amounts.total_deposit_amount1,
            position.position_pool_data.token1_decimals
          ),
          token0: {
            id: position.position_pool_data.token0,
            symbol: position.position_pool_data.token0_symbol,
            name: position.position_pool_data.token0_name,
          },
          token1: {
            id: position.position_pool_data.token1,
            symbol: position.position_pool_data.token1_symbol,
            name: position.position_pool_data.token1_name,
          },
          createdAt: position.created_date,
        },
      };
      return editedRes;
    }),
});

function getDecimalAmount(amount: string, decimals: number) {
  return Number(amount) / Math.pow(10, decimals);
}
