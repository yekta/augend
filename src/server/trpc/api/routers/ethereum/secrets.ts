import "server-only";

import { TEthereumNetwork } from "@/server/trpc/api/routers/ethereum/types";
import { env } from "@/lib/env";
import { Alchemy, Network } from "alchemy-sdk";

export const ethereumProviders: Record<TEthereumNetwork, Alchemy> = {
  ethereum: new Alchemy({
    apiKey: env.ALCHEMY_API_KEY,
    network: Network.ETH_MAINNET,
    connectionInfoOverrides: {
      skipFetchSetup: true,
    },
  }),
  polygon: new Alchemy({
    apiKey: env.ALCHEMY_API_KEY,
    network: Network.MATIC_MAINNET,
    connectionInfoOverrides: {
      skipFetchSetup: true,
    },
  }),
};
