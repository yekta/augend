import type { AnalyticsPosition, PoolSummary, Swap } from "@gfxlabs/oku";
import { z } from "zod";

export const UniswapNetworkSchema = z.enum(["ethereum"]);
export type TUniswapNetwork = z.infer<typeof UniswapNetworkSchema>;

export type TUniswapPoolsResultRaw = {
  result: {
    pools: PoolSummary[];
  };
  error?: { code: number; message: string };
};

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
    isTokensReversed: boolean;
    tvl0: number;
    tvl1: number;
    tvl0USD: number;
    tvl1USD: number;
  }[];
};

export type TUniswapPositionResultRaw = {
  result: AnalyticsPosition;
  error?: { code: number; message: string };
};

export type TUniswapPositionResult = {
  position: {
    poolAddress: string;
    amount0: number;
    amount1: number;
    amount0USD: number;
    amount1USD: number;
    amountTotalUSD: number;
    apr: number;
    priceLower: number;
    priceUpper: number;
    priceCurrent: number;
    uncollectedFees0: number;
    uncollectedFees1: number;
    uncollectedFees0USD: number;
    uncollectedFees1USD: number;
    uncollectedFeesTotalUSD: number;
    deposit0: number;
    deposit1: number;
    token0: TToken;
    token1: TToken;
    createdAt: number;
    nftUri: string;
  };
};

export type TUniswapPoolSwapsResultRaw = {
  result: {
    token0: string;
    token1: string;
    swaps: Swap[];
  };
  error?: { code: number; message: string };
};

export type TUniswapPoolSwapsResult = {
  swaps: {
    amount0: number;
    amount1: number;
    amountUSD: number;
    timestamp: number;
    type: "sell" | "buy";
    traderAddress: string;
  }[];
  pool: {
    token0: {
      id: string;
    };
    token1: {
      id: string;
    };
  };
};

type TToken = {
  id: string;
  name: string;
  symbol: string;
};
