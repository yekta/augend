"use client";

import { defaultQueryOptions } from "@/lib/constants";
import { AppRouterOutputs, AppRouterQueryResult } from "@/trpc/api/root";
import { api } from "@/trpc/setup/react";
import React, { createContext, ReactNode, useContext } from "react";

const FiatCurrencyRatesContext =
  createContext<TFiatCurrencyRatesContext | null>(null);

export const FiatCurrencyRatesProvider: React.FC<{
  children: ReactNode;
  tickers: string[];
}> = ({ children, tickers }) => {
  const query = api.fiat.getRates.useQuery(
    {
      tickers,
    },
    defaultQueryOptions.slow
  );
  return (
    <FiatCurrencyRatesContext.Provider
      value={{
        ...query,
      }}
    >
      {children}
    </FiatCurrencyRatesContext.Provider>
  );
};

export const useFiatCurrencyRates = () => {
  const context = useContext(FiatCurrencyRatesContext);
  if (!context) {
    throw new Error(
      "FiatCurrencyRatesProvider is required for useFiatCurrencyRatess to work"
    );
  }
  return context;
};

export default FiatCurrencyRatesProvider;

type TFiatCurrencyRatesContext = AppRouterQueryResult<
  AppRouterOutputs["fiat"]["getRates"]
> & {};