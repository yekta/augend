"use client";

import { useCurrencyPreference } from "@/components/providers/currency-preference-provider";
import { defaultQueryOptions } from "@/lib/constants";
import { AppRouterOutputs, AppRouterQueryResult } from "@/server/trpc/api/root";
import { api } from "@/server/trpc/setup/react";
import React, { createContext, ReactNode, useContext } from "react";

const CmcGlobalMetricsContext = createContext<TCmcGlobalMetricsContext | null>(
  null
);

export const CmcGlobalMetricsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const currencyPreference = useCurrencyPreference();
  const query = api.cmc.getGlobalMetrics.useQuery(
    {
      convert: currencyPreference.primary.ticker,
    },
    defaultQueryOptions.slow
  );
  return (
    <CmcGlobalMetricsContext.Provider
      value={{
        ...query,
      }}
    >
      {children}
    </CmcGlobalMetricsContext.Provider>
  );
};

export const useCmcGlobalMetrics = () => {
  const context = useContext(CmcGlobalMetricsContext);
  if (!context) {
    throw new Error(
      "CmcGlobalMetricsProvider is required for useCmcGlobalMetrics to work"
    );
  }
  return context;
};

export default CmcGlobalMetricsProvider;

type TCmcGlobalMetricsContext = AppRouterQueryResult<
  AppRouterOutputs["cmc"]["getGlobalMetrics"]
> & {};
