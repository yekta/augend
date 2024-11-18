"use client";

import {
  convertCurrency,
  TConvertCurrency,
} from "@/components/providers/cmc/constants";
import { defaultQueryOptions } from "@/lib/constants";
import { AppRouterOutputs, AppRouterQueryResult } from "@/trpc/api/root";
import { api } from "@/trpc/setup/react";
import React, { createContext, ReactNode, useContext } from "react";

const cryptos: {
  ticker: string;
  id: number;
}[] = process.env.NEXT_PUBLIC_CMC_CRYPTOS?.split(",").map((i) => {
  const [ticker, id] = i.split(":");
  return {
    ticker,
    id: parseInt(id),
  };
}) ?? [
  {
    ticker: "BTC",
    id: 1,
  },
  {
    ticker: "ETH",
    id: 1027,
  },
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
