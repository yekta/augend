import "server-only";

import { TEthereumNetwork } from "@/server/trpc/api/routers/ethereum/types";
import { ethers } from "ethers";

const etherscanApiKeyRaw = process.env.ETHERSCAN_API_KEY;
if (!etherscanApiKeyRaw) throw new Error("Missing ETHERSCAN_API_KEY");

export const etherscanApiKey = etherscanApiKeyRaw;

const infuraApiKeyRaw = process.env.INFURA_API_KEY;
if (!infuraApiKeyRaw) throw new Error("Missing INFURA_API_KEY");

export const infuraApiKey = infuraApiKeyRaw;

export const ethereumProviders: Record<
  TEthereumNetwork,
  ethers.JsonRpcProvider
> = {
  ethereum: new ethers.InfuraProvider("mainnet", infuraApiKey),
  polygon: new ethers.InfuraProvider("matic", infuraApiKey),
};
