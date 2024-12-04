import { ethereumNetworks } from "@/server/trpc/api/routers/ethereum/constants";
import { ethereumProviders } from "@/server/trpc/api/routers/ethereum/secrets";
import { TEthereumNetwork } from "@/server/trpc/api/routers/ethereum/types";
import { abi as uniswapPositionManagerABI } from "@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json";
import { Contract } from "alchemy-sdk";

export const uniswapOkuApiUrl = `https://omni.icarus.tools`;

export async function getUniswapPositionManager(network: TEthereumNetwork) {
  const provider = await ethereumProviders[network].config.getProvider();
  return new Contract(
    ethereumNetworks[network].uniswapPositionManagerAddress,
    uniswapPositionManagerABI,
    provider
  );
}
