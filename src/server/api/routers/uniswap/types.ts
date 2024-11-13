import type { PoolSummary } from "@gfxlabs/oku";

export type TUniswapPoolsResultRaw = {
  result: {
    pools: PoolSummary[];
  };
};

export type TUniswapPoolsResult = {
  pools: {
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
