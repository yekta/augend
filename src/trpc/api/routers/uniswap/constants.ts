import { ethereumProviders } from "@/trpc/api/routers/ethereum/secrets";
import { TEthereumNetwork } from "@/trpc/api/routers/ethereum/types";
import { abi as uniswapPositionManagerABI } from "@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json";
import { ethers } from "ethers";

export const uniswapPositionManagerAddress =
  "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";
export const uniswapOkuApiUrl = `https://omni.icarus.tools`;

export function getUniswapPositionManager(network: TEthereumNetwork) {
  return new ethers.Contract(
    uniswapPositionManagerAddress,
    uniswapPositionManagerABI,
    ethereumProviders[network]
  );
}
