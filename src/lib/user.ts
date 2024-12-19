import { apiServer } from "@/server/trpc/setup/server";
import { cache } from "react";

export const prefetchFullUserCached = cache(
  async () =>
    await Promise.all([
      apiServer.ui.getUserFull.prefetch(),
      apiServer.ui.getCurrencies.prefetch({ category: "all" }),
    ])
);
