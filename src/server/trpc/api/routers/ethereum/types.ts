import { z } from "zod";

export const EthereumNetworkSchema = z.enum(["Ethereum", "BSC"]);
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
