import type { AnalyticsPosition, PoolSummary } from "@gfxlabs/oku";
import { z } from "zod";

export type TUniswapPoolsResultRaw = {
  result: {
    pools: PoolSummary[];
  };
  error?: { code: number; message: string };
};

export type TUniswapPositionResultResultRaw = {
  result: {
    pools: PoolSummary[];
  };
};

export const UniswapNetworkSchema = z.enum(["ethereum"]);
export type TUniswapNetwork = z.infer<typeof UniswapNetworkSchema>;

export type TUniswapPoolsResult = {
  pools: {
    address: string;
    price: number;
    feeTier: number;
    tvlUSD: number;
    fees24hUSD: number;
    fees7dUSD: number;
    volume24hUSD: number;
    volume7dUSD: number;
    apr24h: number;
    token0: TToken;
    token1: TToken;
  }[];
};

export type TUniswapPositionResultRaw = {
  result: AnalyticsPosition;
  error?: { code: number; message: string };
};

export type TUniswapPositionResult = {
  position: {
    amount0: number;
    amount1: number;
    amount0USD: number;
    amount1USD: number;
    amountTotalUSD: number;
    ratio0: number;
    ratio1: number;
    priceLower: number;
    priceUpper: number;
    priceCurrent: number;
    uncollectedFees0: number;
    uncollectedFees1: number;
    uncollectedFeesTotalUSD: number;
    deposit0: number;
    deposit1: number;
    token0: TToken;
    token1: TToken;
    createdAt: number;
  };
};

type TToken = {
  id: string;
  name: string;
  symbol: string;
};
