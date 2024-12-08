"use client";

import { useDashboards } from "@/components/providers/dashboards-provider";
import { AppRouterOutputs } from "@/server/trpc/api/root";
import { api } from "@/server/trpc/setup/react";
import { createContext, FC, ReactNode, useContext } from "react";

type TUserFullContext = {
  dataUser?: AppRouterOutputs["ui"]["getUserFull"];
  isPendingUser: boolean;
  isLoadingErrorUser: boolean;
};

const UserFullContext = createContext<TUserFullContext | null>(null);

type Props = {
  children: ReactNode;
  initialData?: AppRouterOutputs["ui"]["getUserFull"];
};

export const UserFullProvider: FC<Props> = ({ initialData, children }) => {
  const {
    data: dataUser,
    isPending: isPendingUser,
    isLoadingError: isLoadingErrorUser,
  } = api.ui.getUserFull.useQuery(undefined, {
    initialData,
  });

  return (
    <UserFullContext.Provider
      value={{
        dataUser: dataUser,
        isPendingUser,
        isLoadingErrorUser,
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
