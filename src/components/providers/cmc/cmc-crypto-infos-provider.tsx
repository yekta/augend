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
  initialData?: AppRouterOutputs["crypto"]["cmc"]["getCryptoInfos"];
}> = ({ children, cryptos, dontAddUsd = false, initialData }) => {
  const currencyPreference = useCurrencyPreference();
  let convert = Object.values(currencyPreference).map((i) => i.ticker);
  if (!dontAddUsd && !convert.includes("USD")) convert.push("USD");

  const emptyInitialData: AppRouterOutputs["crypto"]["cmc"]["getCryptoInfos"] =
    {};
  const enabled = cryptos.length > 0;
  const query = api.crypto.cmc.getCryptoInfos.useQuery(
    {
      convert,
      ids: cryptos.map((i) => i.id),
    },
    {
      ...defaultQueryOptions.slow,
      enabled,
      initialData: initialData
        ? initialData
        : !enabled
        ? emptyInitialData
        : undefined,
    }
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
      "CmcCryptoInfosProvider needs to be a parent of the component that uses useCmcCryptoInfos for it to work."
    );
  }
  return context;
};

export default CmcCryptoInfosProvider;

type TCmcCryptoInfosContext = AppRouterQueryResult<
  AppRouterOutputs["crypto"]["cmc"]["getCryptoInfos"]
>;
