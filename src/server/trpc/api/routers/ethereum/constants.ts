import { TEthereumNetwork } from "@/server/trpc/api/routers/ethereum/types";

export const ethereumNetworks: Record<
  TEthereumNetwork,
  {
    id: number;
    address: (s: string) => string;
    gasTracker: string;
    cmcId: number;
    okuSlug: string;
  }
> = {
  Ethereum: {
    id: 1,
    address: (address: string) => `https://etherscan.io/address/${address}`,
    gasTracker: "https://etherscan.io/gastracker",
    cmcId: 1027,
    okuSlug: "ethereum",
  },
  BSC: {
    id: 56,
    address: (address: string) => `https://bscscan.com/address/${address}`,
    gasTracker: "https://bscscan.com/gastracker",
    cmcId: 1839,
    okuSlug: "bsc",
  },
};
