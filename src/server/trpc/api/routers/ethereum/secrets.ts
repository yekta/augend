import "server-only";

import { TEthereumNetwork } from "@/server/trpc/api/routers/ethereum/types";
import { ethers, JsonRpcProvider } from "ethers";

const etherscanApiKeyRaw = process.env.ETHERSCAN_API_KEY;
if (!etherscanApiKeyRaw) throw new Error("Missing ETHERSCAN_API_KEY");

export const etherscanApiKey = etherscanApiKeyRaw;

const alchemyApiKeyRaw = process.env.ALCHEMY_API_KEY;
if (!alchemyApiKeyRaw) throw new Error("Missing ALCHEMY_API_KEY");

export const alchemyApiKey = alchemyApiKeyRaw;

export const ethereumProviders: Record<
  TEthereumNetwork,
  ethers.JsonRpcProvider
> = {
  ethereum: new JsonRpcProvider(
    `https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`
  ),
  polygon: new JsonRpcProvider(
    `https://polygon-mainnet.g.alchemy.com/v2/${alchemyApiKey}`
  ),
};
