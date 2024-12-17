import { ethereumGeneralRouter } from "@/server/trpc/api/crypto/ethereum/general/router";
import { uniswapRouter } from "@/server/trpc/api/crypto/ethereum/uniswap/router";
import { createTRPCRouter } from "@/server/trpc/setup/trpc";

export const ethereumRouter = createTRPCRouter({
  general: ethereumGeneralRouter,
  uniswap: uniswapRouter,
});
