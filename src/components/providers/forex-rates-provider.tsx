"use client";

import { defaultQueryOptions } from "@/lib/constants";
import { AppRouterOutputs, AppRouterQueryResult } from "@/server/trpc/api/root";
import { api } from "@/server/trpc/setup/react";
import React, { createContext, ReactNode, useContext } from "react";

const ForexRatesContext = createContext<TForexRatesContext | null>(null);

export const ForexRatesProvider: React.FC<{
  children: ReactNode;
  initialData?: AppRouterOutputs["forex"]["getRates"];
}> = ({ children, initialData }) => {
  const query = api.forex.getRates.useQuery(undefined, {
    ...defaultQueryOptions.slow,
    initialData,
  });
  return (
    <ForexRatesContext.Provider
      value={{
        ...query,
      }}
    >
      {children}
    </ForexRatesContext.Provider>
  );
};

export const useForexRates = () => {
  const context = useContext(ForexRatesContext);
  if (!context) {
    throw new Error(
      "ForexRatesProvider needs to wrap useForexRates for it to work."
    );
  }
  return context;
};

export default ForexRatesProvider;

type TForexRatesContext = AppRouterQueryResult<
  AppRouterOutputs["forex"]["getRates"]
> & {};
