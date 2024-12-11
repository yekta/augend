import {
  getPendingWithdrawal,
  TWbanNetwork,
  wbanNetworkObjects,
} from "@/server/trpc/api/crypto/wban/helpers";
import { createTRPCRouter, publicProcedure } from "@/server/trpc/setup/trpc";

export const wbanRouter = createTRPCRouter({
  getPendingWithdrawals: publicProcedure.query(async () => {
    const promises = wbanNetworkObjects.map(async (network) =>
      getPendingWithdrawal(network.pendingWithdrawalURL)
    );
    const results = await Promise.all(promises);
    let res: Record<TWbanNetwork, { amount: number }> = {} as Record<
      TWbanNetwork,
      { amount: number }
    >;

    for (let i = 0; i < wbanNetworkObjects.length; i++) {
      const chain = wbanNetworkObjects[i].chain;
      res[chain] = { amount: Number(results[i].amount) };
    }

    return res;
  }),
});
