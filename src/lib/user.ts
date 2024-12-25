import { apiServer } from "@/server/trpc/setup/server";
import { cache } from "react";

export const prefetchFullUserAndCurrenciesCached = cache(async () => {
  const start = performance.now();
  await Promise.all([
    apiServer.ui.getUserFull.prefetch(),
    apiServer.ui.getCurrencies.prefetch({ category: "all" }),
  ]);
  const duration = Math.round(performance.now() - start);
  console.log(`[PREFETCH]: prefetchFullUserAndCurrencies | ${duration}ms`);
});
