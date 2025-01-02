"use client";

import { AppRouterOutputs } from "@/server/trpc/api/root";
import { api } from "@/server/trpc/setup/react";
import { usePathname } from "next/navigation";
import React, { createContext, FC, ReactNode, useContext } from "react";

type TDashboardsAutoContext = {
  data: AppRouterOutputs["ui"]["getDashboards"] | undefined;
  isPending: boolean;
  isFetching: boolean;
  isLoadingError: boolean;
  invalidate: () => Promise<void>;
  refetch: () => Promise<void>;
  isDashboardPath: boolean;
  username?: string;
  dashboardSlug?: string;
};

const DashboardsAutoContext = createContext<TDashboardsAutoContext | null>(
  null
);

type Props = {
  children: ReactNode;
};

export const DashboardsAutoProvider: FC<Props> = ({ children }) => {
  const pathname = usePathname();
  const arr = pathname.split("/");
  const username = arr.length > 1 ? pathname.split("/")[1] : undefined;
  const dashboardSlug = arr.length > 2 ? pathname.split("/")[2] : undefined;
  const isDashboardPath = pathname.split("/").length >= 3;

  const utils = api.useUtils();
  const { data, isPending, isLoadingError, isFetching } =
    api.ui.getDashboards.useQuery(
      {
        username: username!,
      },
      {
        enabled: isDashboardPath && username !== undefined,
      }
    );

  const invalidate = () => {
    if (!username) return Promise.resolve();
    return utils.ui.getDashboards.invalidate({ username: username! });
  };
  const refetch = () => {
    if (!username) return Promise.resolve();
    return utils.ui.getDashboards.refetch({ username: username! });
  };

  return (
    <DashboardsAutoContext.Provider
      value={{
        data,
        isPending,
        isLoadingError,
        isFetching,
        invalidate,
        refetch,
        isDashboardPath,
        username,
        dashboardSlug,
      }}
    >
      {children}
    </DashboardsAutoContext.Provider>
  );
};

export const useDashboardsAuto = () => {
  const context = useContext(DashboardsAutoContext);
  if (!context) {
    throw new Error(
      "DashboardsAutoProvider needs to be a parent of the component that uses useDashboardsAuto for it to work."
    );
  }
  return context;
};

export default DashboardsAutoProvider;
