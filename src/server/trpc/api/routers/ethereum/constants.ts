import { TEthereumNetwork } from "@/server/trpc/api/routers/ethereum/types";

export const ethereumNetworks: Record<
  TEthereumNetwork,
  {
    id: number;
    address: (s: string) => string;
    gasTracker: string;
    cmcId: number;
  }
> = {
  Ethereum: {
    id: 1,
    address: (address: string) => `https://etherscan.io/address/${address}`,
    gasTracker: "https://etherscan.io/gastracker",
    cmcId: 1027,
  },
  Polygon: {
    id: 137,
    address: (address: string) => `https://polygonscan.com/address/${address}`,
    gasTracker: "https://polygonscan.com/gastracker",
    cmcId: 3890,
  },
};
