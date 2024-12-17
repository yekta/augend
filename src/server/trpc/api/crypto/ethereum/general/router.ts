import {
  getCmcCryptoIds,
  getCmcLatestCryptoInfos,
  insertCmcCryptoInfosAndQuotes,
} from "@/server/db/repo/cmc";
import { cleanAndSortArray } from "@/server/redis/cache-utils";
import { cmcApiUrl } from "@/server/trpc/api/crypto/cmc/constants";
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
  //// Read from Postgres cache ////
  const logKey = `getEthPrice:${convert}:${cmcId}`;
  const startRead = performance.now();
  const result = await getCmcLatestCryptoInfos({
    coinIds: [cmcId],
    currencyTickers: [convert],
    afterTimestamp: Date.now() - cacheTimesMs["minutes-short"],
  });
  const duration = Math.round(performance.now() - startRead);
  if (result) {
    console.log(`[POSTGRES_CACHE][HIT]: ${logKey} | ${duration}ms`);
    return result[cmcId].quote[convert].price;
  } else {
    console.log(`[POSTGRES_CACHE][MISS]: ${logKey} | ${duration}ms`);
  }
  //////////////////////////////////

  // This uses the same credit amount up to 100 currencies so pad it to 100
  const newIds = await getCmcCryptoIds({
    limit: 99,
    exclude: [cmcId],
  });
  const paddedIds = cleanAndSortArray([cmcId, ...newIds.map((n) => n.id)]);

  const idsStr = paddedIds.join(",");
  const url = `${cmcApiUrl}/v2/cryptocurrency/quotes/latest?id=${idsStr}&convert=${convert}`;
  const response = await fetch(url, cmcFetchOptions);

  if (!response.ok) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Failed to fetch ETH price: ${response.statusText}`,
    });
  }

  const resJson: TCmcGetCryptosResultRaw = await response.json();
  const data = resJson.data;
  if (!data) {
    console.log("No data in CMC crypto info result:", resJson);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "No data in CMC response: getEthPrice",
    });
  }

  //// Write to Postgres cache ////
  const startWrite = performance.now();
  await insertCmcCryptoInfosAndQuotes({ cmcData: data });
  console.log(
    `[POSTGRES_CACHE][SET]: ${logKey} | ${Math.floor(
      performance.now() - startWrite
    )}ms`
  );
  ////////////////////////////////

  return data[cmcId].quote[convert].price;
}
