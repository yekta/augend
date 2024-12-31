"use client";

import { TCurrencyWithSelectedFields } from "@/server/db/repo/types";
import React, { createContext, ReactNode, useContext } from "react";

export type TCurrencyPreference = {
  primary: TCurrencyWithSelectedFields;
  secondary: TCurrencyWithSelectedFields;
  tertiary: TCurrencyWithSelectedFields;
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
      "CurrencyPreferenceProvider needs to be a parent of the component that uses useCurrencyPreferences for it to work."
    );
  }
  return context;
};

export default CurrencyPreferenceProvider;

type TCurrencyPreferenceContext = TCurrencyPreference;
