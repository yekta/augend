import { ethereumNetworks } from "@/server/trpc/api/ethereum/constants";
import { ethereumProviders } from "@/server/trpc/api/ethereum/secrets";
import { TEthereumNetwork } from "@/server/trpc/api/ethereum/types";
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
