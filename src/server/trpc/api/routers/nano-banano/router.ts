import { z } from "zod";

import {
  bananoApiUrl,
  nanoApiUrl,
} from "@/server/trpc/api/routers/nano-banano/constants";
import {
  isBan,
  isNano,
  rawToBanOrNano,
} from "@/server/trpc/api/routers/nano-banano/helpers";
import {
  AccountSchema,
  TNanoBananoBalanceResponse,
  TNanoBananoResult,
} from "@/server/trpc/api/routers/nano-banano/types";
import { createTRPCRouter, publicProcedure } from "@/server/trpc/setup/trpc";

export const nanoBananoRouter = createTRPCRouter({
  getBalances: publicProcedure
    .input(
      z.object({
        accounts: z.array(AccountSchema),
      })
    )
    .query(async ({ input: { accounts } }) => {
      const results: TNanoBananoResult[] = [];
      const nanoAddresses = accounts
        .map((a) => a.address)
        .filter((a) => isNano(a));
      const banAddresses = accounts
        .map((a) => a.address)
        .filter((a) => isBan(a));

      const nanoBalancesPromise = getBalances({
        addresses: nanoAddresses,
        isNano: true,
      });
      const banBalancesPromise = getBalances({
        addresses: banAddresses,
        isNano: false,
      });

      const [nanoBalances, banBalances] = await Promise.all([
        nanoBalancesPromise,
        banBalancesPromise,
      ]);

      for (const account of accounts) {
        const address = account.address;
        const isNanoAddress = isNano(address);
        let balanceObj:
          | TNanoBananoBalanceResponse["balances"][string]
          | undefined = undefined;

        if (isNanoAddress && address in nanoBalances.balances) {
          balanceObj = nanoBalances.balances[address];
        } else if (!isNanoAddress && address in banBalances.balances) {
          balanceObj = banBalances.balances[address];
        }

        if (!balanceObj) {
          throw new Error("Failed to fetch NANO balances");
        }

        results.push({
          address,
          balance: rawToBanOrNano(balanceObj.balance, isNanoAddress),
          pending: rawToBanOrNano(balanceObj.pending, isNanoAddress),
          receivable: rawToBanOrNano(balanceObj.receivable, isNanoAddress),
        });
      }
      return results;
    }),
  /* getAllHistory: publicProcedure
    .input(
      z.object({
        account: AccountSchema,
        minAmount: z.number().optional(),
        minTimestamp: z.number().optional(),
      })
    )
    .query(async ({ input: { account, minAmount, minTimestamp } }) => {
      let head: string | undefined = undefined;
      let fullHistory: TNanoBananoHistoryResultEdited["history"] = [];

      const initialRes = await getHistoryPage({
        address: account.address,
      });

      fullHistory = fullHistory.concat(initialRes.history);

      if (initialRes.previous) {
        head = initialRes.previous;
        while (head) {
          const res = await getHistoryPage({
            address: account.address,
            head,
          });
          console.log("History res length:", res.history.length, head);
          fullHistory = fullHistory.concat(res.history);
          head = res.previous;
        }
      }

      if (minAmount) {
        fullHistory = fullHistory.filter((h) => h.amount_decimal >= minAmount);
      }

      if (minTimestamp) {
        fullHistory = fullHistory.filter((h) => h.timestamp >= minTimestamp);
      }

      return {
        account,
        history: fullHistory,
      };
    }), */
});

async function getBalances({
  addresses,
  isNano,
}: {
  addresses: string[];
  isNano?: boolean;
}) {
  const res = await fetch(isNano ? nanoApiUrl : bananoApiUrl, {
    method: "POST",
    body: JSON.stringify({
      action: "accounts_balances",
      accounts: addresses,
    }),
  });
  if (!res.ok) {
    throw new Error("Failed to fetch NANO/BAN balances");
  }
  const json: TNanoBananoBalanceResponse = await res.json();
  if (json.errors) {
    throw new Error(JSON.stringify(json.errors));
  }
  return json;
}

/* async function getHistoryPage({
  address,
  head,
}: {
  address: string;
  head?: string;
}) {
  const isNanoAddress = isNano(address);
  const res = await fetch(isNanoAddress ? nanoApiUrl : bananoApiUrl, {
    method: "POST",
    body: JSON.stringify({
      action: "account_history",
      account: address,
      count: 10000,
      head,
    }),
    headers: isNanoAddress ? undefined : bananoHeaders,
  });
  if (!res.ok) {
    throw new Error("Failed to fetch NANO/BAN history");
  }
  const json: TNanoBananoHistoryResult = await res.json();
  const result = json.history.map((h) => {
    return {
      type: h.type,
      address: h.account,
      timestamp: Number(h.local_timestamp) * 1000,
      amount_decimal: rawToBanOrNano(h.amount, isNano(address)),
    };
  });
  return {
    ...json,
    history: result,
  };
} */
