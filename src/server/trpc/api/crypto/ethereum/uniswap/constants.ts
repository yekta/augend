import {
  ethereumNetworks,
  TEthereumNetwork,
} from "@/server/trpc/api/crypto/ethereum/constants";
import { ethereumProviders } from "@/server/trpc/api/crypto/ethereum/secrets";
import uniswapPositionManagerABIJson from "@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json";
import { Contract } from "alchemy-sdk";

export const uniswapOkuApiUrl = `https://omni.icarus.tools`;

export async function getUniswapPositionManager(network: TEthereumNetwork) {
  const provider = await ethereumProviders[network].config.getProvider();
  return new Contract(
    ethereumNetworks[network].uniswapPositionManagerAddress,
    uniswapPositionManagerABIJson.abi,
    provider
  );
}
