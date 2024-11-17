import {
  NetworkPolygonPos,
  NetworkBinanceSmartChain,
  NetworkEthereum,
  NetworkFantom,
  NetworkArbitrumOne,
  IconComponentProps,
} from "@web3icons/react";
import { ForwardRefExoticComponent, RefAttributes } from "react";
import { z } from "zod";

export const wbanTokenAddress = "0xe20b9e246db5a0d21bf9209e4858bc9a3ff7a034";

export const WbanNetworkSchema = z.enum(["BSC", "MATIC", "ETH", "ARB", "FTM"]);
export type TWbanNetwork = z.infer<typeof WbanNetworkSchema>;

export const wbanNetworkObjects: TWbanNetworkObject[] = [
  {
    chain: "BSC",
    hotWallet:
      "ban_1wbanktxc5mtnydsjq6doy81wsnn7fw1z7yzw4zzieb6dfkihjtbwzgrxt9i",
    coldWallet:
      "ban_3bsco1dfwmwpnnjjqyqb9f7f83gtxsrmgdzdjdz58u6dhga5ajsgtsdz1g8h",
    explorerURL: "https://bscscan.com",
    pendingWithdrawalURL: "https://bsc-api.banano.cc/withdrawals/pending",
    tokenAddress: wbanTokenAddress,
    Icon: NetworkBinanceSmartChain,
  },
  {
    chain: "MATIC",
    hotWallet:
      "ban_3po1yhotz68w6mogy6budr7g8y7gw5wjqhbgc5gt549emeoof9npf315xmn4",
    coldWallet:
      "ban_1po1yco1cnoyymrm3xnf7h9iaway1bg5kqxq3cfb3za98gq73tfmjm4mp11n",
    explorerURL: "https://polygonscan.com",
    pendingWithdrawalURL: "https://polygon-api.banano.cc/withdrawals/pending",
    tokenAddress: wbanTokenAddress,
    Icon: NetworkPolygonPos,
  },
  {
    chain: "ETH",
    hotWallet:
      "ban_3ethhot3otmrcizy8kxkxbfmb3qjswatr4pnixexpdy6u18e1mjgxteynmay",
    coldWallet:
      "ban_3ethco1d34b1mmerybpw6pdgi3zt6p7ieb4aqcmbfn8i7af5w43d8ag8s7hk",
    explorerURL: "https://etherscan.io",
    pendingWithdrawalURL: "https://ethereum-api.banano.cc/withdrawals/pending",
    tokenAddress: wbanTokenAddress,
    Icon: NetworkEthereum,
  },
  {
    chain: "ARB",
    hotWallet:
      "ban_1arbhot3nd1ocih46ocoa7xsaqn6u8qrfqaswe3ygg8xmzno5of1zq5sp3r6",
    coldWallet:
      "ban_3arbc1d3usn8not6ddbegexdi7qdabp4d1g3emcgtirign1c6akjc55bexko",
    explorerURL: "https://arbiscan.io",
    pendingWithdrawalURL: "https://arbitrum-api.banano.cc/withdrawals/pending",
    tokenAddress: wbanTokenAddress,
    Icon: NetworkArbitrumOne,
  },
  {
    chain: "FTM",
    hotWallet:
      "ban_3ftmhot3nssj1ae3gt4o4ksa6p1wamub3jaet4odjt67wp9wy9ahn83umw81",
    coldWallet:
      "ban_3ftmco1d3sogpnq9j8gsa7t95xugtzj116hkudxj1spkw86476pzicua61ek",
    explorerURL: "https://ftmscan.com",
    pendingWithdrawalURL: "https://fantom-api.banano.cc/withdrawals/pending",
    tokenAddress: wbanTokenAddress,
    Icon: NetworkFantom,
  },
] as const;

export async function getPendingWithdrawal(url: string) {
  const result = await fetch(url);
  if (!result.ok) {
    throw new Error(`Failed to fetch: ${url}`);
  }
  const data: { amount: string } = await result.json();
  return data;
}

export type TWbanIcon = ForwardRefExoticComponent<
  Omit<IconComponentProps, "ref"> & RefAttributes<SVGSVGElement>
>;

export type TWbanNetworkObject = {
  chain: TWbanNetwork;
  hotWallet: string;
  coldWallet: string;
  explorerURL: string;
  pendingWithdrawalURL: string;
  tokenAddress: string;
  Icon: TWbanIcon;
};
