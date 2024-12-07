import { TEthereumNetwork } from "@/server/trpc/api/ethereum/types";
import { z } from "zod";

type TNetworkInfoBase = {
  id: number;
  address: (s: string) => string;
  cmcId: number;
  okuSlug: string;
  uniswapPositionManagerAddress: string;
};
type TNetworkInfoWithGasTrack = TNetworkInfoBase & {
  gasTracker: null;
};
type TNetworkInfoWithGasTracker = TNetworkInfoBase & {
  gasTracker: string;
};
type TNetworkInfo = TNetworkInfoWithGasTrack | TNetworkInfoWithGasTracker;

export const EthereumNetworkSchema = z.enum(["Ethereum", "Arbitrum", "BSC"]);

export const ethereumNetworks: Record<TEthereumNetwork, TNetworkInfo> = {
  Ethereum: {
    id: 1,
    address: (address: string) => `https://etherscan.io/address/${address}`,
    gasTracker: "https://etherscan.io/gastracker",
    cmcId: 1027,
    okuSlug: "ethereum",
    uniswapPositionManagerAddress: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
  },
  Arbitrum: {
    id: 42161,
    address: (address: string) => `https://arbiscan.io/address/${address}`,
    gasTracker: null,
    cmcId: 11841,
    okuSlug: "arbitrum",
    uniswapPositionManagerAddress: "0xc36442b4a4522e871399cd717abdd847ab11fe88",
  },
  BSC: {
    id: 56,
    address: (address: string) => `https://bscscan.com/address/${address}`,
    gasTracker: "https://bscscan.com/gastracker",
    cmcId: 1839,
    okuSlug: "bsc",
    uniswapPositionManagerAddress: "0x7b8a01b39d58278b5de7e48c8449c9f4f5170613",
  },
};
