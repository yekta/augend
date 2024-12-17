import {
  getCmcLatestCryptoInfos,
  insertCmcCryptoInfosAndQuotes,
} from "@/server/db/repo/cmc";
import { cmcApiUrl } from "@/server/trpc/api/crypto/cmc/constants";
import { cmcFetchOptions } from "@/server/trpc/api/crypto/cmc/secrets";
import { TCmcGetCryptosResultRaw } from "@/server/trpc/api/crypto/cmc/types";
import {
  EthereumNetworkSchema,
  ethereumNetworks,
} from "@/server/trpc/api/crypto/ethereum/constants";
import { ethereumProviders } from "@/server/trpc/api/crypto/ethereum/secrets";
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
  const freshTime = 1000 * 60 * 2;
  const startRead = performance.now();
  const result = await getCmcLatestCryptoInfos({
    coinIds: [cmcId],
    currencyTickers: [convert],
    afterTimestamp: Date.now() - freshTime,
  });
  const duration = Math.round(performance.now() - startRead);
  if (result) {
    console.log(`[POSTGRES_CACHE][HIT]: ${logKey} | ${duration}ms`);
    return result[cmcId].quote[convert].price;
  } else {
    console.log(`[POSTGRES_CACHE][MISS]: ${logKey} | ${duration}ms`);
  }
  //////////////////////////////////

  const ethUsdUrl = `${cmcApiUrl}/v2/cryptocurrency/quotes/latest?id=${cmcId}&convert=${convert}`;
  const ethUsdRes = await fetch(ethUsdUrl, cmcFetchOptions);
  if (!ethUsdRes.ok) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Failed to fetch ETH price: ${ethUsdRes.statusText}`,
    });
  }
  const ethUsdResJson: TCmcGetCryptosResultRaw = await ethUsdRes.json();

  //// Write to Postgres cache ////
  const startWrite = performance.now();
  await insertCmcCryptoInfosAndQuotes({ cmcResult: ethUsdResJson });
  console.log(
    `[POSTGRES_CACHE][SET]: ${logKey} | ${Math.floor(
      performance.now() - startWrite
    )}ms`
  );
  ////////////////////////////////

  return ethUsdResJson.data[cmcId].quote[convert].price;
}
