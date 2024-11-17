import { cmcApiUrl } from "@/trpc/api/routers/cmc/constants";
import { cmcFetchOptions } from "@/trpc/api/routers/cmc/secrets";
import { TCmcGetCryptosResult } from "@/trpc/api/routers/cmc/types";
import {
  ethereumNetworks,
  etherscanApiUrl,
} from "@/trpc/api/routers/ethereum/constants";
import { etherscanApiKey } from "@/trpc/api/routers/ethereum/secrets";
import {
  EthereumNetworkSchema,
  TGasInfoResultRaw,
} from "@/trpc/api/routers/ethereum/types";
import { createTRPCRouter, publicProcedure } from "@/trpc/api/trpc";
import { z } from "zod";

const baseGasLimit = 21_000;
const swapGasLimit = 360_000;
const uniswapV3PositionCreationLimit = 500_000;
const ethToGwei = Math.pow(10, 9);

export const ethereumRouter = createTRPCRouter({
  getGasInfo: publicProcedure
    .input(
      z.object({
        page: z.number().int().positive().default(1),
        network: EthereumNetworkSchema.optional().default("ethereum"),
      })
    )
    .query(async ({ input: { network } }) => {
      const chainId = ethereumNetworks[network].id;
      const url = `${etherscanApiUrl}/v2/api?chainid=${chainId}&module=gastracker&action=gasoracle&apikey=${etherscanApiKey}`;
      const ethUsdUrl = `${cmcApiUrl}/v2/cryptocurrency/quotes/latest?symbol=ETH&convert=USD`;

      const [response, ethUsdRes] = await Promise.all([
        fetch(url),
        fetch(ethUsdUrl, cmcFetchOptions),
      ]);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch gas oracle data: ${response.statusText}`
        );
      }
      if (!ethUsdRes.ok) {
        throw new Error(`Failed to fetch ETH price: ${ethUsdRes.statusText}`);
      }

      const [data, ethUsdResJson]: [TGasInfoResultRaw, TCmcGetCryptosResult] =
        await Promise.all([response.json(), ethUsdRes.json()]);

      if (!data.result) {
        throw new Error(`No result data in gas oracle data: ${data.message}`);
      }

      const ethUsd = ethUsdResJson.data.ETH[0].quote.USD.price;

      const block = parseInt(data.result.LastBlock);
      const fastGwei = parseFloat(data.result.FastGasPrice);

      const gweiPerLimit = fastGwei / baseGasLimit;
      const swapGwei = gweiPerLimit * swapGasLimit;
      const uniswapV3PositionCreationGwei =
        gweiPerLimit * uniswapV3PositionCreationLimit;

      return {
        block,
        gwei: fastGwei,
        sendUsd: ((fastGwei * baseGasLimit) / ethToGwei) * ethUsd,
        swapUsd: ((swapGwei * baseGasLimit) / ethToGwei) * ethUsd,
        uniswapV3PositionCreationUsd:
          ((uniswapV3PositionCreationGwei * baseGasLimit) / ethToGwei) * ethUsd,
      };
    }),
});
