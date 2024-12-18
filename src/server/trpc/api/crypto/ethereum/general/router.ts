import {
  getCmcCryptoIds,
  getCmcLatestCryptoInfos,
  insertCmcCryptoInfosAndQuotes,
} from "@/server/db/repo/cmc";
import { cleanAndSortArray } from "@/server/redis/cache-utils";
import { cmcApiUrl } from "@/server/trpc/api/crypto/cmc/constants";
import { getCmcCryptoInfosData } from "@/server/trpc/api/crypto/cmc/router";
import { cmcFetchOptions } from "@/server/trpc/api/crypto/cmc/secrets";
import { TCmcGetCryptosResultRaw } from "@/server/trpc/api/crypto/cmc/types";
import {
  ethereumNetworks,
  EthereumNetworkSchema,
} from "@/server/trpc/api/crypto/ethereum/constants";
import { ethereumProviders } from "@/server/trpc/api/crypto/ethereum/secrets";
import {
  cachedPublicProcedure,
  cacheTimesMs,
  createTRPCRouter,
} from "@/server/trpc/setup/trpc";
import { TRPCError } from "@trpc/server";
import { after } from "next/server";
import { z } from "zod";

const baseGasLimitGwei = 21_000;
const swapGasLimitGwei = 360_000;
const uniswapV3PositionCreationLimitGwei = 500_000;
const ethToGwei = Math.pow(10, 9);
const gweiToWei = Math.pow(10, 9);

export const ethereumGeneralRouter = createTRPCRouter({
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
        getEthPrice({ cmcId, convert }),
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

export async function getEthPrice({
  cmcId,
  convert,
}: {
  cmcId: number;
  convert: string;
}) {
  const data = await getCmcCryptoInfosData({
    ids: [cmcId],
    convert: [convert],
  });

  return data[cmcId].quote[convert].price;
}
