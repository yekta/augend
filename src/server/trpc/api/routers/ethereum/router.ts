import { cmcApiUrl } from "@/server/trpc/api/routers/cmc/constants";
import { cmcFetchOptions } from "@/server/trpc/api/routers/cmc/secrets";
import { TCmcGetCryptosResult } from "@/server/trpc/api/routers/cmc/types";
import { ethereumNetworks } from "@/server/trpc/api/routers/ethereum/constants";
import { ethereumProviders } from "@/server/trpc/api/routers/ethereum/secrets";
import { EthereumNetworkSchema } from "@/server/trpc/api/routers/ethereum/types";
import { createTRPCRouter, publicProcedure } from "@/server/trpc/setup/trpc";
import { z } from "zod";

const baseGasLimitGwei = 21_000;
const swapGasLimitGwei = 360_000;
const uniswapV3PositionCreationLimitGwei = 500_000;
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

      const [gasPriceWei, block, ethUsdRes] = await Promise.all([
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

      const gasPriceGwei = gasPriceWei.toNumber() / gweiToWei;
      const ethUsd = ethUsdResJson.data[cmcId].quote[convert].price;

      const swapGwei = gasPriceGwei * swapGasLimitGwei;
      const uniswapV3PositionCreationGwei =
        gasPriceGwei * uniswapV3PositionCreationLimitGwei;

      return {
        block,
        gwei: gasPriceGwei,
        sendUsd: ((gasPriceGwei * baseGasLimitGwei) / ethToGwei) * ethUsd,
        swapUsd: (swapGwei / ethToGwei) * ethUsd,
        uniswapV3PositionCreationUsd:
          (uniswapV3PositionCreationGwei / ethToGwei) * ethUsd,
      };
    }),
});
