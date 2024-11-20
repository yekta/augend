"use client";

import {
  convertCurrency,
  TConvertCurrency,
} from "@/components/providers/cmc/constants";
import { defaultQueryOptions } from "@/lib/constants";
import { AppRouterOutputs, AppRouterQueryResult } from "@/trpc/api/root";
import { api } from "@/trpc/setup/react";
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
}> = ({ children, cryptos }) => {
  const query = api.cmc.getCryptoInfos.useQuery(
    {
      convert: convertCurrency.ticker,
      ids: cryptos.map((i) => i.id),
    },
    defaultQueryOptions.slow
  );
  return (
    <CmcCryptoInfosContext.Provider
      value={{
        ...query,
        convertCurrency,
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
> & {
  convertCurrency: TConvertCurrency;
};
