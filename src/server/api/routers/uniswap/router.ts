import { z } from "zod";

import {
  getUniswapPositionManager,
  uniswapOkuUrl,
} from "@/server/api/routers/uniswap/constants";
import {
  TUniswapPoolsResult,
  TUniswapPoolsResultRaw,
  TUniswapPoolSwapsResult,
  TUniswapPoolSwapsResultRaw,
  TUniswapPositionResult,
  TUniswapPositionResultRaw,
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
      const limit = 200;
      const url = `${uniswapOkuUrl}/${network}/cush/topPools`;
      const body: { params: SearchFilterOpts[] } = {
        params: [
          {
            fee_tiers: [],
            sort_by: "tvl_usd",
            sort_order: false,
            result_size: limit,
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
              isTokensReversed: pool.is_preferred_token_order === false,
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
      const positionManager = getUniswapPositionManager(network);
      const url = `${uniswapOkuUrl}/${network}/cush/analyticsPosition`;
      const body = {
        params: [
          {
            token_id: id,
          },
        ],
      };
      const nftUriPromise = positionManager.tokenURI(id);
      const positionPromise = fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const [nftUriRaw, positionRes] = await Promise.all([
        nftUriPromise,
        positionPromise,
      ]);

      if (!positionRes.ok) {
        throw new Error(`${positionRes.status}: Failed to fetch Uniswap pools`);
      }

      const nftUri = parseNftUri(nftUriRaw);

      const positionJson: TUniswapPositionResultRaw = await positionRes.json();
      if (positionJson.error) {
        throw new Error(positionJson.error.message);
      }

      const position = positionJson.result.position;
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
      const feeRatio =
        position.position_profit.uncollected_usd_fees / amountTotalUSD;
      const sinceCreatedAt = Date.now() - position.created_date;
      const yearInMs = 1000 * 60 * 60 * 24 * 365;
      const editedRes: TUniswapPositionResult = {
        position: {
          poolAddress: position.pool,
          nftUri,
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
          apr: (feeRatio / sinceCreatedAt) * yearInMs,
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
  getSwaps: publicProcedure
    .input(
      z.object({
        network: UniswapNetworkSchema.optional().default("ethereum"),
        poolAddress: z.string(),
        page: z.number().int().positive().default(1),
      })
    )
    .query(async ({ input: { network, poolAddress, page } }) => {
      const limit = 100;
      const url = `${uniswapOkuUrl}/${network}/cush/poolSwaps`;
      const poolUrl = `${uniswapOkuUrl}/${network}/cush/searchPoolsByAddress`;
      const body = {
        params: [poolAddress, limit, page - 1, false],
      };
      const poolBody = {
        params: [
          poolAddress,
          {
            result_size: 2,
            sort_by: "tvl_usd",
            sort_order: false,
          },
        ],
      };
      const [swapsRes, poolRes] = await Promise.all([
        fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }),
        fetch(poolUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(poolBody),
        }),
      ]);

      if (!swapsRes.ok) {
        throw new Error(`${swapsRes.status}: Failed to fetch Uniswap swaps`);
      }
      if (!poolRes.ok) {
        throw new Error(`${poolRes.status}: Failed to fetch Uniswap pool`);
      }

      const [swapsResJson, poolResJson]: [
        TUniswapPoolSwapsResultRaw,
        TUniswapPoolsResultRaw,
      ] = await Promise.all([swapsRes.json(), poolRes.json()]);

      if (swapsResJson.error) {
        throw new Error(`Swap result has error: ${swapsResJson.error.message}`);
      }

      if (poolResJson.error) {
        throw new Error(`Pool result has error: ${poolResJson.error.message}`);
      }

      const pool = poolResJson.result.pools.find(
        (p) => p.address === poolAddress
      );
      if (!pool) {
        throw new Error(`Pool not found with address: ${poolAddress}`);
      }

      const isPoolReversed = pool.t0 !== swapsResJson.result.token0;

      const swapsResult: TUniswapPoolSwapsResult = {
        pool: {
          tvlUSD: pool.tvl_usd,
          tvl0USD: isPoolReversed ? pool.t1_tvl_usd : pool.t0_tvl_usd,
          tvl1USD: isPoolReversed ? pool.t0_tvl_usd : pool.t1_tvl_usd,
          volume24hUSD: pool.t0_volume_usd,
          fees24hUSD: pool.total_fees_usd,
          address: poolResJson.result.pools[0].address,
          token0: {
            id: isPoolReversed ? pool.t1 : pool.t0,
            name: isPoolReversed ? pool.t1_name : pool.t0_name,
            symbol: isPoolReversed ? pool.t1_symbol : pool.t0_symbol,
          },
          token1: {
            id: isPoolReversed ? pool.t0 : pool.t1,
            name: isPoolReversed ? pool.t0_name : pool.t1_name,
            symbol: isPoolReversed ? pool.t0_symbol : pool.t1_symbol,
          },
        },
        swaps: swapsResJson.result.swaps
          .sort((a, b) => b.time - a.time)
          .map((swap) => {
            return {
              amount0: swap.amount0,
              amount1: swap.amount1,
              amountUSD: swap.usd_value,
              timestamp: swap.time,
              type: swap.side === "sell" ? "sell" : "buy",
              traderAddress: swap.recipient,
            };
          }),
      };

      return swapsResult;
    }),
});

function getDecimalAmount(amount: string, decimals: number) {
  return Number(amount) / Math.pow(10, decimals);
}

function parseNftUri(uriBase64: string): string {
  const animateTagRegex = /<animate.*?"(.*?)"[^\>]+>/g;
  /<g style="transform:translate\(226px, 392px\)"(.*?)<\/g><\/g>/g;
  const textPathRegex = /<textPath.*?href="#(.*?)".*?>(.*?)<\/textPath>/g;

  const regexes = [animateTagRegex, textPathRegex];

  const baseURI = uriBase64.split(",")[1] || uriBase64;
  const uriUTF8 = Buffer.from(baseURI, "base64").toString("utf8");
  const image = JSON.parse(uriUTF8).image;

  const dataStr = "data:image/svg+xml;base64,";
  const [_, svgBase64] = image.split(dataStr);
  const svg = Buffer.from(svgBase64, "base64").toString("utf8");

  let editedSvg = svg;
  regexes.forEach((regex) => {
    editedSvg = editedSvg.replace(regex, "");
  });

  const editedSvgBase64 = Buffer.from(editedSvg).toString("base64");
  return dataStr + editedSvgBase64;
}
