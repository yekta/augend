import { cmcApiUrl } from "@/server/trpc/api/routers/cmc/constants";
import { cmcFetchOptions } from "@/server/trpc/api/routers/cmc/secrets";
import { TCmcGetCryptosResult } from "@/server/trpc/api/routers/cmc/types";
import { ethereumNetworks } from "@/server/trpc/api/routers/ethereum/constants";
import { ethereumProviders } from "@/server/trpc/api/routers/ethereum/secrets";
import { EthereumNetworkSchema } from "@/server/trpc/api/routers/ethereum/types";
import { createTRPCRouter, publicProcedure } from "@/server/trpc/setup/trpc";
import { z } from "zod";

const baseGasLimit = 21_000;
const swapGasLimit = 360_000;
const uniswapV3PositionCreationLimit = 500_000;
const ethToGwei = Math.pow(10, 9);
const gweiToWei = Math.pow(10, 9);

export const ethereumRouter = createTRPCRouter({
  getGasInfo: publicProcedure
    .input(
      z.object({
        network: EthereumNetworkSchema.optional().default("ethereum"),
        convert: z.string().optional().default("USD"),
      })
    )
    .query(async ({ input: { network, convert } }) => {
      const cmcId = ethereumNetworks[network].cmcId;
      const ethUsdUrl = `${cmcApiUrl}/v2/cryptocurrency/quotes/latest?id=${cmcId}&convert=${convert}`;

      const [gasPriceBigNumber, block, ethUsdRes] = await Promise.all([
        ethereumProviders[network].core.getGasPrice(),
        ethereumProviders[network].core.getBlockNumber(),
        fetch(ethUsdUrl, cmcFetchOptions),
      ]);

      if (!ethUsdRes.ok) {
        throw new Error(`Failed to fetch ETH price: ${ethUsdRes.statusText}`);
      }

      const [ethUsdResJson]: [TCmcGetCryptosResult] = await Promise.all([
        ethUsdRes.json(),
      ]);

      const gasPriceGwei = gasPriceBigNumber.toNumber() / gweiToWei;
      const ethUsd = ethUsdResJson.data[cmcId].quote[convert].price;

      const gweiPerLimit = gasPriceGwei / baseGasLimit;
      const swapGwei = gweiPerLimit * swapGasLimit;
      const uniswapV3PositionCreationGwei =
        gweiPerLimit * uniswapV3PositionCreationLimit;

      return {
        block,
        gwei: gasPriceGwei,
        sendUsd: ((gasPriceGwei * baseGasLimit) / ethToGwei) * ethUsd,
        swapUsd: ((swapGwei * baseGasLimit) / ethToGwei) * ethUsd,
        uniswapV3PositionCreationUsd:
          ((uniswapV3PositionCreationGwei * baseGasLimit) / ethToGwei) * ethUsd,
      };
    }),
});
