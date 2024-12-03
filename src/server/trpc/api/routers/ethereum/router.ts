import { cachedPromise } from "@/server/redis/redis";
import { cmcApiUrl } from "@/server/trpc/api/routers/cmc/constants";
import { cmcFetchOptions } from "@/server/trpc/api/routers/cmc/secrets";
import { TCmcGetCryptosResult } from "@/server/trpc/api/routers/cmc/types";
import { ethereumNetworks } from "@/server/trpc/api/routers/ethereum/constants";
import { ethereumProviders } from "@/server/trpc/api/routers/ethereum/secrets";
import { EthereumNetworkSchema } from "@/server/trpc/api/routers/ethereum/types";
import {
  cachedPublicProcedure,
  createTRPCRouter,
} from "@/server/trpc/setup/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const baseGasLimitGwei = 21_000;
const swapGasLimitGwei = 360_000;
const uniswapV3PositionCreationLimitGwei = 500_000;
const ethToGwei = Math.pow(10, 9);
const gweiToWei = Math.pow(10, 9);

export const ethereumRouter = createTRPCRouter({
  getGasInfo: cachedPublicProcedure("seconds-short")
    .input(
      z.object({
        network: EthereumNetworkSchema.optional().default("Ethereum"),
        convert: z.string().optional().default("USD"),
      })
    )
    .query(async ({ input: { network, convert }, ctx }) => {
      type TReturn = {
        block: number;
        gwei: number;
        sendUsd: number;
        swapUsd: number;
        uniswapV3PositionCreationUsd: number;
      };

      if (ctx.cachedResult) {
        return ctx.cachedResult as TReturn;
      }

      const cmcId = ethereumNetworks[network].cmcId;

      const [gasPriceWei, block, ethUsd] = await Promise.all([
        ethereumProviders[network].core.getGasPrice(),
        ethereumProviders[network].core.getBlockNumber(),
        cachedPromise({
          path: "ethereum.getGasInfo:getEthPrice",
          value: { cmcId, convert },
          promise: getEthPrice({ cmcId, convert }),
          cacheTime: "seconds-long",
        }),
      ]);

      const gasPriceGwei = gasPriceWei.toNumber() / gweiToWei;

      const swapGwei = gasPriceGwei * swapGasLimitGwei;
      const uniswapV3PositionCreationGwei =
        gasPriceGwei * uniswapV3PositionCreationLimitGwei;

      const result: TReturn = {
        block,
        gwei: gasPriceGwei,
        sendUsd: ((gasPriceGwei * baseGasLimitGwei) / ethToGwei) * ethUsd,
        swapUsd: (swapGwei / ethToGwei) * ethUsd,
        uniswapV3PositionCreationUsd:
          (uniswapV3PositionCreationGwei / ethToGwei) * ethUsd,
      };

      return result;
    }),
});

async function getEthPrice({
  cmcId,
  convert,
}: {
  cmcId: number;
  convert: string;
}) {
  const ethUsdUrl = `${cmcApiUrl}/v2/cryptocurrency/quotes/latest?id=${cmcId}&convert=${convert}`;
  const ethUsdRes = await fetch(ethUsdUrl, cmcFetchOptions);
  if (!ethUsdRes.ok) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Failed to fetch ETH price: ${ethUsdRes.statusText}`,
    });
  }
  const ethUsdResJson: TCmcGetCryptosResult = await ethUsdRes.json();
  return ethUsdResJson.data[cmcId].quote[convert].price;
}
