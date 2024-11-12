export type TUniswapPoolsResultRaw = {
  data: {
    pools: {
      totalValueLockedETH: string;
      sqrtPrice: string;
      feesUSD: string;
      volumeUSD: string;
      feeTier: string;
      token0: {
        id: string;
        symbol: string;
        totalValueLocked: string;
        derivedETH: string;
        decimals: string;
      };
      token1: {
        id: string;
        symbol: string;
        totalValueLocked: string;
        derivedETH: string;
        decimals: string;
      };
      poolDayData: {
        feesUSD: string;
        tvlUSD: string;
        volumeUSD: string;
        date: number;
      }[];
    }[];
    bundles: {
      id: string;
      ethPriceUSD: string;
    }[];
  };
  errors?: [
    {
      message: string;
    },
  ];
};

export type TUniswapPoolsResult = {
  pools: {
    price: number;
    tvlUSD: number;
    feeTier: number;
    volumeUSD24h: number;
    apr24h: number;
    feesUSD24h: number;
    feesUSD7d: number;
    token0: {
      id: string;
      symbol: string;
      totalValueLocked: number;
      derivedETH: number;
    };
    token1: {
      id: string;
      symbol: string;
      totalValueLocked: number;
      derivedETH: number;
    };
    poolDayData: {
      feesUSD: number;
      tvlUSD: number;
      volumeUSD: number;
      date: number;
    }[];
  }[];
  bundles: {
    id: string;
    ethPriceUSD: number;
  }[];
};
