import { TEthereumNetwork } from "@/server/trpc/api/routers/ethereum/types";

export const etherscanApiUrl = "https://api.etherscan.io";

export const ethereumNetworks: Record<
  TEthereumNetwork,
  {
    id: number;
    address: (s: string) => string;
    gasTracker: string;
    cmcId: number;
  }
> = {
  ethereum: {
    id: 1,
    address: (address: string) => `https://etherscan.io/address/${address}`,
    gasTracker: "https://etherscan.io/gastracker",
    cmcId: 1027,
  },
  polygon: {
    id: 137,
    address: (address: string) => `https://polygonscan.com/address/${address}`,
    gasTracker: "https://polygonscan.com/gastracker",
    cmcId: 3890,
  },
};
