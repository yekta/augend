"use client";

import {
  convertCurrency,
  TConvertCurrency,
} from "@/components/providers/cmc/constants";
import { defaultQueryOptions } from "@/lib/constants";
import { AppRouterOutputs, AppRouterQueryResult } from "@/trpc/api/root";
import { api } from "@/trpc/setup/react";
import React, { createContext, ReactNode, useContext } from "react";

const CmcGlobalMetricsContext = createContext<TCmcGlobalMetricsContext | null>(
  null
);

export const CmcGlobalMetricsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const query = api.cmc.getGlobalMetrics.useQuery(
    {
      convert: convertCurrency.ticker,
    },
    defaultQueryOptions.slow
  );
  return (
    <CmcGlobalMetricsContext.Provider
      value={{
        ...query,
        convertCurrency,
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
> & {
  convertCurrency: TConvertCurrency;
};
