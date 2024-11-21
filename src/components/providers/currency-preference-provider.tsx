"use client";

import { defaultQueryOptions } from "@/lib/constants";
import { AppRouterOutputs, AppRouterQueryResult } from "@/trpc/api/root";
import { api } from "@/trpc/setup/react";
import React, { createContext, ReactNode, useContext } from "react";

export type TDenominatorCurrency = {
  id: string;
  name: string;
  symbol: string;
  ticker: string;
  is_crypto: boolean;
};

export type TCurrencyPreference = {
  primary: TDenominatorCurrency;
  secondary: TDenominatorCurrency;
  tertiary: TDenominatorCurrency;
};

const CurrencyPreferenceContext =
  createContext<TCurrencyPreferenceContext | null>(null);

export const CurrencyPreferenceProvider: React.FC<{
  children: ReactNode;
  currencyPreference: TCurrencyPreference;
}> = ({ children, currencyPreference }) => {
  return (
    <CurrencyPreferenceContext.Provider value={currencyPreference}>
      {children}
    </CurrencyPreferenceContext.Provider>
  );
};

export const useCurrencyPreference = () => {
  const context = useContext(CurrencyPreferenceContext);
  if (!context) {
    throw new Error(
      "CurrencyPreferenceProvider is required for useCurrencyPreferences to work"
    );
  }
  return context;
};

export default CurrencyPreferenceProvider;

type TCurrencyPreferenceContext = TCurrencyPreference;
