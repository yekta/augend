import { abi as uniswapPositionManagerABI } from "@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json";
import { ethers } from "ethers";

import { infuraApiKey } from "@/trpc/api/routers/uniswap/secrets";
import { TEthereumNetwork } from "@/trpc/api/routers/uniswap/types";

const providers: Record<TEthereumNetwork, ethers.JsonRpcProvider> = {
  ethereum: new ethers.InfuraProvider("mainnet", infuraApiKey),
  polygon: new ethers.InfuraProvider("matic", infuraApiKey),
};

export const uniswapPositionManagerAddress =
  "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";
export const uniswapOkuUrl = `https://omni.icarus.tools`;

export function getUniswapPositionManager(network: TEthereumNetwork) {
  return new ethers.Contract(
    uniswapPositionManagerAddress,
    uniswapPositionManagerABI,
    providers[network]
  );
}
