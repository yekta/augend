"use client";

import { type ReactNode, createContext, useRef, useContext } from "react";
import { useStore } from "zustand";

import {
  type MainStore,
  MainStoreInitState,
  createMainStore,
} from "@/lib/stores/main/store";

export type MainStoreApi = ReturnType<typeof createMainStore>;

export const MainStoreContext = createContext<MainStoreApi | undefined>(
  undefined
);

export interface MainStoreProviderProps {
  children: ReactNode;
  initState?: MainStoreInitState;
}

export const MainStoreProvider = ({
  children,
  initState,
}: MainStoreProviderProps) => {
  const storeRef = useRef<MainStoreApi>();
  if (!storeRef.current) {
    storeRef.current = createMainStore(initState);
  }

  return (
    <MainStoreContext.Provider value={storeRef.current}>
      {children}
    </MainStoreContext.Provider>
  );
};

export const useMainStore = <T,>(selector: (store: MainStore) => T): T => {
  const counterStoreContext = useContext(MainStoreContext);

  if (!counterStoreContext) {
    throw new Error(
      `MainStoreProvider needs to be a parent of the component that uses useMainStore for it to work.`
    );
  }

  return useStore(counterStoreContext, selector);
};
