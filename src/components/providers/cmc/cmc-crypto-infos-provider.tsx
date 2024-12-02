"use client";

import { useCurrencyPreference } from "@/components/providers/currency-preference-provider";
import { defaultQueryOptions } from "@/lib/constants";
import { AppRouterOutputs, AppRouterQueryResult } from "@/server/trpc/api/root";
import { api } from "@/server/trpc/setup/react";
import React, { createContext, ReactNode, useContext } from "react";

export type TCryptoDef = {
  id: number;
};

const CmcCryptoInfosContext = createContext<TCmcCryptoInfosContext | null>(
  null
);

export const CmcCryptoInfosProvider: React.FC<{
  children: ReactNode;
  cryptos: TCryptoDef[];
  dontAddUsd?: boolean;
}> = ({ children, cryptos, dontAddUsd = false }) => {
  const currencyPreference = useCurrencyPreference();
  let convert = Object.values(currencyPreference).map((i) => i.ticker);
  if (!dontAddUsd && !convert.includes("USD")) convert.push("USD");

  const query = api.cmc.getCryptoInfos.useQuery(
    {
      convert,
      ids: cryptos.sort((a, b) => a.id - b.id).map((i) => i.id),
    },
    defaultQueryOptions.slow
  );
  return (
    <CmcCryptoInfosContext.Provider
      value={{
        ...query,
      }}
    >
      {children}
    </CmcCryptoInfosContext.Provider>
  );
};

export const useCmcCryptoInfos = () => {
  const context = useContext(CmcCryptoInfosContext);
  if (!context) {
    throw new Error(
      "CmcCryptoInfosProvider is required for useCmcCryptoInfos to work"
    );
  }
  return context;
};

export default CmcCryptoInfosProvider;

type TCmcCryptoInfosContext = AppRouterQueryResult<
  AppRouterOutputs["cmc"]["getCryptoInfos"]
>;
