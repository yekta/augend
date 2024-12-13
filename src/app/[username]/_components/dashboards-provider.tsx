"use client";

import { AppRouterOutputs } from "@/server/trpc/api/root";
import { api } from "@/server/trpc/setup/react";
import React, { createContext, ReactNode, useContext } from "react";

type TDashboardsContext = {
  data: AppRouterOutputs["ui"]["getDashboards"] | undefined;
  isPending: boolean;
  isLoadingError: boolean;
  invalidate: () => Promise<void>;
  cancelQuery: () => void;
  username: string;
  ethereumAddress?: string | null;
};

const DashboardsContext = createContext<TDashboardsContext | null>(null);

type Props = {
  username: string;
  ethereumAddress?: string | null;
  children: ReactNode;
};

export const DashboardsProvider: React.FC<Props> = ({
  username,
  ethereumAddress,
  children,
}) => {
  const utils = api.useUtils();
  const includeCardCounts = true;
  const { data, isPending, isLoadingError } = api.ui.getDashboards.useQuery({
    username,
    includeCardCounts,
  });
  const invalidate = () =>
    utils.ui.getDashboards.invalidate({ username, includeCardCounts });
  const cancelQuery = () =>
    utils.ui.getDashboards.cancel({ username, includeCardCounts });

  return (
    <DashboardsContext.Provider
      value={{
        data,
        isPending,
        isLoadingError,
        invalidate,
        username,
        ethereumAddress,
        cancelQuery,
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
