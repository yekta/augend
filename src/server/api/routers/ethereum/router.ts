import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { EthereumNetworkSchema } from "@/server/api/routers/ethereum/types";
import {
  etherscanApiUrl,
  networkToChainId,
} from "@/server/api/routers/ethereum/constants";
import { etherscanApiKey } from "@/server/api/routers/ethereum/secrets";
import { getExchangeInstance } from "@/server/api/routers/exchange/helpers";

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
      const exchange = getExchangeInstance("OKX");
      const ticker = "ETH/USDT";
      const chainId = networkToChainId[network];
      const url = `${etherscanApiUrl}/v2/api?chainid=${chainId}&module=gastracker&action=gasoracle&apikey=${etherscanApiKey}`;

      const [ethUsdRes, response] = await Promise.all([
        exchange.fetchTickers([ticker]),
        fetch(url),
      ]);

      if (!ethUsdRes[ticker]) {
        throw new Error(`Ticker not in data: ${ticker}`);
      }

      const ethUsd = Number(ethUsdRes[ticker].last);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch gas oracle data: ${response.statusText}`
        );
      }
      const data: {
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
      } = await response.json();
      if (!data.result) {
        throw new Error(`No result data in gas oracle data: ${data.message}`);
      }

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
