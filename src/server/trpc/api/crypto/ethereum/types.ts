import { EthereumNetworkSchema } from "@/server/trpc/api/crypto/ethereum/constants";
import { z } from "zod";

export type TEthereumNetwork = z.infer<typeof EthereumNetworkSchema>;

export type TGasInfoResultRaw = {
  status: string;
  message: string;
  result?: {
    LastBlock: string;
    SafeGasPrice: string;
    ProposeGasPrice: string;
    FastGasPrice: string;
    suggestBaseFee: string;
    gasUsedRatio: string;
  };
};

const isEthereumAddress = (address: string): boolean =>
  /^0x[a-fA-F0-9]{40}$/.test(address);

export const EthereumAddressSchema = z.string().refine(isEthereumAddress, {
  message: "Invalid Ethereum address",
});
