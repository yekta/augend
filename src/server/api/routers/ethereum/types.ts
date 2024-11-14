import { z } from "zod";

export const EthereumNetworkSchema = z.enum(["ethereum"]);
export type TEthereumNetwork = z.infer<typeof EthereumNetworkSchema>;
