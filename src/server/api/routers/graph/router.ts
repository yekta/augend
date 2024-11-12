import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { graphUniswapUrl } from "@/server/api/routers/graph/constants";
import {
  TUniswapPoolsResult,
  TUniswapPoolsResultRaw,
} from "@/server/api/routers/graph/types";

export const graphRouter = createTRPCRouter({
  getUniswapPools: publicProcedure
    .input(
      z.object({
        page: z.number().int().positive().default(1),
      })
    )
    .query(async ({ input: { page } }) => {
      const first = 100;
      const extra = 20;
      const skip = (page - 1) * first;
      const query = gql`
        query {
          pools(
            first: ${first + extra}
            skip: ${skip}
            orderBy: totalValueLockedETH
            orderDirection: desc
          ) {
            totalValueLockedETH
            feesUSD
            sqrtPrice
            volumeUSD
            feeTier
            token0 {
              id
              symbol
              totalValueLocked
              derivedETH
              decimals
            }
            token1 {
              id
              symbol
              totalValueLocked
              derivedETH
              decimals
            }
            poolDayData(first: 7, orderBy: date, orderDirection: desc) {
              feesUSD
              tvlUSD
              date
              volumeUSD
            }
          }
          bundles(first: 1) {
            id
            ethPriceUSD
          }
        }
      `;
      const res = await fetch(graphUniswapUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(query),
      });
      if (!res.ok) {
        throw new Error(`${res.status}: Failed to fetch Uniswap pools`);
      }
      const resJson: TUniswapPoolsResultRaw = await res.json();
      const editedRes: TUniswapPoolsResult = {
        bundles: resJson.data.bundles.map((bundle) => ({
          id: bundle.id,
          ethPriceUSD: Number(bundle.ethPriceUSD),
        })),
        pools: resJson.data.pools
          .filter((p) =>
            Number(p.totalValueLockedETH) > 10_000_000 ||
            (Number(p.totalValueLockedETH) > 100_000 &&
              Number(p.volumeUSD) < 100_000)
              ? false
              : true
          )
          .filter((p) => p.poolDayData.length === 7)
          .slice(0, first)
          .map((pool) => {
            const { price, token0, token1, isReversed } =
              conditionallyReversedPair(pool);
            const tvlUSD =
              Number(pool.totalValueLockedETH) *
              Number(resJson.data.bundles[0].ethPriceUSD);
            const volumeUSD24h = Number(pool.poolDayData[1].volumeUSD);
            const feeTier = Number(pool.feeTier) / 1_000_000;
            const feesUSD24h = Number(pool.poolDayData[1].feesUSD);
            return {
              feeTier,
              poolDayData: pool.poolDayData.map((day) => ({
                feesUSD: Number(day.feesUSD),
                tvlUSD: Number(day.tvlUSD),
                volumeUSD: Number(day.volumeUSD),
                date: day.date,
              })),
              volumeUSD24h,
              apr24h: (feesUSD24h / tvlUSD) * 365,
              price,
              token0: {
                id: token0.id,
                symbol: token0.symbol,
                derivedETH: Number(token0.derivedETH),
                totalValueLocked: Number(token0.totalValueLocked),
              },
              token1: {
                id: token1.id,
                symbol: token1.symbol,
                derivedETH: Number(token1.derivedETH),
                totalValueLocked: Number(token1.totalValueLocked),
              },
              tvlUSD,
              feesUSD24h,
              feesUSD7d: pool.poolDayData.reduce(
                (acc, day) => acc + Number(day.feesUSD),
                0
              ),
            };
          }),
      };
      return editedRes;
    }),
});

type Variables = { [key: string]: any };

function gql(
  strings: TemplateStringsArray,
  ...values: any[]
): { query: string; variables?: Variables } {
  // Join strings and inject values to form the final query string
  let query = strings.reduce(
    (acc, str, i) => `${acc}${str}${values[i] ?? ""}`,
    ""
  );

  // Collect only object values as variables
  const variables: Variables = values.reduce((acc, val) => {
    if (typeof val === "object" && val !== null) {
      return { ...acc, ...val };
    }
    return acc;
  }, {});

  return Object.keys(variables).length > 0 ? { query, variables } : { query };
}

function conditionallyReversedPair(
  pool: TUniswapPoolsResultRaw["data"]["pools"][0]
) {
  const alwaysLastPairs = ["USDC", "USDT", "DAI"];
  const { token0, token1, sqrtPrice } = pool;
  const token0Decimals = token0.decimals;
  const token1Decimals = token1.decimals;
  const decimalDifference = parseInt(token0Decimals) - parseInt(token1Decimals);
  const decimalDifferencePow = Math.pow(10, decimalDifference);
  let price =
    Math.pow(Number(sqrtPrice) / Math.pow(2, 96), 2) * decimalDifferencePow;
  if (
    alwaysLastPairs.includes(token0.symbol) &&
    !alwaysLastPairs.includes(token1.symbol)
  ) {
    return {
      price: 1 / price,
      token0: token1,
      token1: token0,
      isReversed: true,
    };
  }
  return { price, token0, token1, isReversed: false };
}
