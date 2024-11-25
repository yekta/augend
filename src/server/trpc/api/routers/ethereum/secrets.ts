import "server-only";

import { TEthereumNetwork } from "@/server/trpc/api/routers/ethereum/types";
import { ethers, JsonRpcProvider } from "ethers";
import { env } from "@/lib/env";

export const ethereumProviders: Record<
  TEthereumNetwork,
  ethers.JsonRpcProvider
> = {
  ethereum: new JsonRpcProvider(
    `https://eth-mainnet.g.alchemy.com/v2/${env.ALCHEMY_API_KEY}`
  ),
  polygon: new JsonRpcProvider(
    `https://polygon-mainnet.g.alchemy.com/v2/${env.ALCHEMY_API_KEY}`
  ),
};
