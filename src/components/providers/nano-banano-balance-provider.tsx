"use client";

import { defaultQueryOptions } from "@/lib/constants";
import { AppRouterOutputs, AppRouterQueryResult } from "@/server/trpc/api/root";
import { TNanoBananoAccount } from "@/server/trpc/api/crypto/nano-banano/types";
import { api } from "@/server/trpc/setup/react";
import React, { createContext, ReactNode, useContext } from "react";

const NanoBananoBalancesContext =
  createContext<TNanoBananoBalancesContext | null>(null);

export const NanoBananoBalancesProvider: React.FC<{
  children: ReactNode;
  accounts: TNanoBananoAccountFull[];
}> = ({ children, accounts }) => {
  const query = api.crypto.nanoBanano.getBalances.useQuery(
    {
      accounts: accounts.map((i) => ({ address: i.address })),
    },
    defaultQueryOptions.slow
  );
  return (
    <NanoBananoBalancesContext.Provider
      value={{
        ...query,
        accounts,
      }}
    >
      {children}
    </NanoBananoBalancesContext.Provider>
  );
};

export const useNanoBananoBalances = () => {
  const context = useContext(NanoBananoBalancesContext);
  if (!context) {
    throw new Error(
      "NanoBananoBalancesProvider is required for useNanoBananoBalances to work"
    );
  }
  return context;
};

export default NanoBananoBalancesProvider;

type TNanoBananoBalancesContext = AppRouterQueryResult<
  AppRouterOutputs["crypto"]["nanoBanano"]["getBalances"]
> & { accounts: TNanoBananoAccountFull[] };

export type TNanoBananoAccountFull = TNanoBananoAccount & { isOwner: boolean };
