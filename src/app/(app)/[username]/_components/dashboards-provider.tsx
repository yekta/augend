"use client";

import { useOtherUser } from "@/app/(app)/[username]/_components/other-user-provider";
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
  initialData?: AppRouterOutputs["ui"]["getDashboards"];
  children: ReactNode;
};

export const DashboardsProvider: React.FC<Props> = ({
  initialData,
  children,
}) => {
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
      initialData,
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
    throw new Error(
      "DashboardsProvider needs to be a parent of the component that uses useDashboards for it to work."
    );
  }
  return context;
};

export default DashboardsProvider;
