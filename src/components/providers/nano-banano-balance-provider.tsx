"use client";

import { defaultQueryOptions } from "@/lib/constants";
import { AppRouterOutputs, AppRouterQueryResult } from "@/trpc/api/root";
import { TNanoBananoAccount } from "@/trpc/api/routers/nano-banano/types";
import { api } from "@/trpc/setup/react";
import React, { createContext, ReactNode, useContext } from "react";

const NanoBananoBalancesContext =
  createContext<TNanoBananoBalancesContext | null>(null);

export const NanoBananoBalancesProvider: React.FC<{
  children: ReactNode;
  accounts: TNanoBananoAccount[];
}> = ({ children, accounts }) => {
  const query = api.nanoBanano.getBalances.useQuery(
    {
      accounts,
    },
    defaultQueryOptions.slow
  );
  return (
    <NanoBananoBalancesContext.Provider
      value={{
        ...query,
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
  AppRouterOutputs["nanoBanano"]["getBalances"]
> & {};
