"use client";

import { useOtherUser } from "@/app/[username]/_components/other-user-provider";
import { AppRouterOutputs } from "@/server/trpc/api/root";
import { api } from "@/server/trpc/setup/react";
import React, { createContext, ReactNode, useContext } from "react";

type TDashboardsContext = {
  data: AppRouterOutputs["ui"]["getDashboards"] | undefined;
  isPending: boolean;
  isLoadingError: boolean;
  invalidate: () => Promise<void>;
  cancelQuery: () => void;
  username?: string;
  usernameParam: string;
  ethereumAddress?: string | null;
  isPendingUser: boolean;
  isLoadingErrorUser: boolean;
  notActive: boolean;
  isOwner?: boolean;
};

const DashboardsContext = createContext<TDashboardsContext | null>(null);

type Props = {
  children: ReactNode;
};

export const DashboardsProvider: React.FC<Props> = ({ children }) => {
  const utils = api.useUtils();
  const includeCardCounts = true;
  const {
    data: userData,
    isPending: isPendingUser,
    isLoadingError: isLoadingErrorUser,
    usernameParam,
  } = useOtherUser();

  const { data, isPending, isLoadingError } = api.ui.getDashboards.useQuery(
    {
      username: userData?.username!,
      includeCardCounts,
    },
    {
      enabled: userData !== undefined && userData !== null,
    }
  );

  const invalidate = () => {
    if (!userData) return Promise.resolve();
    return utils.ui.getDashboards.invalidate({
      username: userData.username,
      includeCardCounts,
    });
  };

  const cancelQuery = () =>
    userData
      ? utils.ui.getDashboards.cancel({
          username: userData?.username,
          includeCardCounts,
        })
      : null;

  return (
    <DashboardsContext.Provider
      value={{
        data,
        isPending,
        isLoadingError,
        invalidate,
        isPendingUser,
        isLoadingErrorUser,
        username: userData?.username,
        usernameParam,
        ethereumAddress: userData?.ethereumAddress,
        cancelQuery,
        notActive: !isPendingUser && !isLoadingErrorUser && !userData,
        isOwner: data?.isOwner,
      }}
    >
      {children}
    </DashboardsContext.Provider>
  );
};

export const useDashboards = () => {
  const context = useContext(DashboardsContext);
  if (!context) {
    throw new Error("DashboardsProvider is required for useDashboards to work");
  }
  return context;
};

export default DashboardsProvider;
