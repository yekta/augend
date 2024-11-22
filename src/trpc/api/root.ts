import { cmcRouter } from "@/trpc/api/routers/cmc/router";
import { coinGeckoRouter } from "@/trpc/api/routers/coin-gecko/router";
import { ethereumRouter } from "@/trpc/api/routers/ethereum/router";
import { exchangeRouter } from "@/trpc/api/routers/exchange/router";
import { fiatRouter } from "@/trpc/api/routers/fiat/router";
import { nanoBananoRouter } from "@/trpc/api/routers/nano-banano/router";
import { uiRouter } from "@/trpc/api/routers/ui/router";
import { uniswapRouter } from "@/trpc/api/routers/uniswap/router";
import { wbanRouter } from "@/trpc/api/routers/wban/router";
import { createCallerFactory, createTRPCRouter } from "@/trpc/api/trpc";
import {
  inferReactQueryProcedureOptions,
  TRPCClientErrorLike,
} from "@trpc/react-query";
import { UseTRPCQueryResult } from "@trpc/react-query/shared";
import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  ui: uiRouter,
  exchange: exchangeRouter,
  nanoBanano: nanoBananoRouter,
  cmc: cmcRouter,
  fiat: fiatRouter,
  wban: wbanRouter,
  coinGecko: coinGeckoRouter,
  uniswap: uniswapRouter,
  ethereum: ethereumRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
export type AppRouterReactQueryOptions =
  inferReactQueryProcedureOptions<AppRouter>;
export type AppRouterInputs = inferRouterInputs<AppRouter>;
export type AppRouterOutputs = inferRouterOutputs<AppRouter>;

export type AppRouterQueryResult<Output> = UseTRPCQueryResult<
  Output,
  TRPCClientErrorLike<AppRouter>
>;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
