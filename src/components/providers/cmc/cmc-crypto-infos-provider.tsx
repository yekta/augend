"use client";

import {
  convertCurrency,
  TConvertCurrency,
} from "@/components/providers/cmc/constants";
import { defaultQueryOptions } from "@/lib/constants";
import { AppRouterOutputs, AppRouterQueryResult } from "@/server/api/root";
import { api } from "@/trpc/react";
import React, { createContext, ReactNode, useContext } from "react";

const cryptos = [
  "BTC",
  "ETH",
  "XNO",
  "BAN",
  "SOL",
  "BNB",
  "DOGE",
  "UNI",
  "ARB",
  "OP",
  "MATIC",
  "XMR",
];

const CmcCryptoInfosContext = createContext<TCmcCryptoInfosContext | null>(
  null
);

export const CmcCryptoInfosProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const query = api.cmc.getCryptoInfos.useQuery(
    {
      convert: convertCurrency.ticker,
      symbols: cryptos,
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
