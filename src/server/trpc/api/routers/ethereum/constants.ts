import { TEthereumNetwork } from "@/server/trpc/api/routers/ethereum/types";

export const ethereumNetworks: Record<
  TEthereumNetwork,
  {
    id: number;
    address: (s: string) => string;
    gasTracker: string;
    cmcId: number;
    okuSlug: string;
    uniswapPositionManagerAddress: string;
  }
> = {
  Ethereum: {
    id: 1,
    address: (address: string) => `https://etherscan.io/address/${address}`,
    gasTracker: "https://etherscan.io/gastracker",
    cmcId: 1027,
    okuSlug: "ethereum",
    uniswapPositionManagerAddress: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
  },
  BSC: {
    id: 56,
    address: (address: string) => `https://bscscan.com/address/${address}`,
    gasTracker: "https://bscscan.com/gastracker",
    cmcId: 1839,
    okuSlug: "bsc",
    uniswapPositionManagerAddress: "0x7b8a01b39d58278b5de7e48c8449c9f4f5170613",
  },
};
