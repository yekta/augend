import "server-only";

import { TEthereumNetwork } from "@/server/trpc/api/routers/ethereum/types";
import { env } from "@/lib/env";
import { Alchemy, Network } from "alchemy-sdk";

export const ethereumProviders: Record<TEthereumNetwork, Alchemy> = {
  Ethereum: new Alchemy({
    apiKey: env.ALCHEMY_API_KEY,
    network: Network.ETH_MAINNET,
    connectionInfoOverrides: {
      skipFetchSetup: true,
    },
  }),
  BSC: new Alchemy({
    apiKey: env.ALCHEMY_API_KEY,
    network: Network.BNB_MAINNET,
    connectionInfoOverrides: {
      skipFetchSetup: true,
    },
  }),
};
