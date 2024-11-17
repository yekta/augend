import { TEthereumNetwork } from "@/trpc/api/routers/ethereum/types";

export const etherscanApiUrl = "https://api.etherscan.io";

export const ethereumNetworks: Record<
  TEthereumNetwork,
  {
    id: number;
    address: (s: string) => string;
    gasTracker: string;
  }
> = {
  ethereum: {
    id: 1,
    address: (address: string) => `https://etherscan.io/address/${address}`,
    gasTracker: "https://etherscan.io/gastracker",
  },
  polygon: {
    id: 137,
    address: (address: string) => `https://polygonscan.com/address/${address}`,
    gasTracker: "https://polygonscan.com/gastracker",
  },
};
