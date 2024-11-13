import type { PoolSummary } from "@gfxlabs/oku";
import { z } from "zod";

export type TUniswapPoolsResultRaw = {
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
    token0: {
      name: string;
      symbol: string;
    };
    token1: {
      name: string;
      symbol: string;
    };
  }[];
};
