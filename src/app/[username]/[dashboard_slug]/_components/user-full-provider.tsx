"use client";

import { AppRouterOutputs } from "@/server/trpc/api/root";
import { api } from "@/server/trpc/setup/react";
import { createContext, FC, ReactNode, useContext } from "react";

type TUserFullContext = {
  dataUser?: AppRouterOutputs["ui"]["getUserFull"];
  isPendingUser: boolean;
  isLoadingErrorUser: boolean;
  invalidateUser: () => Promise<void>;
  dataCurrencies?: AppRouterOutputs["ui"]["getCurrencies"];
  isPendingCurrencies: boolean;
  isLoadingErrorCurrencies: boolean;
  invalidateCurrencies: () => Promise<void>;
};

const UserFullContext = createContext<TUserFullContext | null>(null);

type Props = {
  children: ReactNode;
  userInitialData?: AppRouterOutputs["ui"]["getUserFull"];
  currenciesInitialData?: AppRouterOutputs["ui"]["getCurrencies"];
};

export const UserFullProvider: FC<Props> = ({
  userInitialData,
  currenciesInitialData,
  children,
}) => {
  const utils = api.useUtils();
  const {
    data: dataUser,
    isPending: isPendingUser,
    isLoadingError: isLoadingErrorUser,
  } = api.ui.getUserFull.useQuery(undefined, {
    initialData: userInitialData,
  });
  const invalidateUser = () => utils.ui.getUserFull.invalidate();

  const {
    data: dataCurrencies,
    isPending: isPendingCurrencies,
    isLoadingError: isLoadingErrorCurrencies,
  } = api.ui.getCurrencies.useQuery(
    { fiatOnly: true },
    {
      initialData: currenciesInitialData,
    }
  );
  const invalidateCurrencies = () => utils.ui.getCurrencies.invalidate();

  return (
    <UserFullContext.Provider
      value={{
        dataUser,
        isPendingUser,
        isLoadingErrorUser,
        invalidateUser,
        dataCurrencies,
        isPendingCurrencies,
        isLoadingErrorCurrencies,
        invalidateCurrencies,
      }}
    >
      {children}
    </UserFullContext.Provider>
  );
};

export const useUserFull = () => {
  const context = useContext(UserFullContext);
  if (!context) {
    throw new Error("UserFullProvider is required for useUserFull to work");
  }
  return context;
};

export default UserFullProvider;
