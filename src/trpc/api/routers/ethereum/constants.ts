import { TEthereumNetwork } from "@/trpc/api/routers/ethereum/types";

export const etherscanApiUrl = "https://api.etherscan.io";
export const networkToChainId: Record<TEthereumNetwork, number> = {
  ethereum: 1,
};
