import { cmcRouter } from "@/server/trpc/api/cmc/router";
import { ethereumRouter } from "@/server/trpc/api/ethereum/router";
import { exchangeRouter } from "@/server/trpc/api/exchange/router";
import { fiatRouter } from "@/server/trpc/api/fiat/router";
import { nanoBananoRouter } from "@/server/trpc/api/nano-banano/router";
import { uiRouter } from "@/server/trpc/api/ui/router";
import { uniswapRouter } from "@/server/trpc/api/uniswap/router";
import { wbanRouter } from "@/server/trpc/api/wban/router";
import {
  createCallerFactory,
  createTRPCRouter,
} from "@/server/trpc/setup/trpc";
import {
  inferReactQueryProcedureOptions,
  inferRouterClient,
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
  uniswap: uniswapRouter,
  ethereum: ethereumRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
export type AppRouterReactQueryOptions =
  inferReactQueryProcedureOptions<AppRouter>;
export type AppRouterQueryClient = inferRouterClient<AppRouter>;
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
