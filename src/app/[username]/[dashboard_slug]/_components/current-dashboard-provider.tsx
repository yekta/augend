"use client";

import { useDashboards } from "@/components/providers/dashboards-provider";
import { AppRouterOutputs } from "@/server/trpc/api/root";
import { api } from "@/server/trpc/setup/react";
import { createContext, FC, ReactNode, useContext, useEffect } from "react";

type TCurrentDashboardContext = {
  username: string;
  dashboardSlug: string;
  dataCards?: AppRouterOutputs["ui"]["getCards"];
  isPendingCards: boolean;
  isLoadingErrorCards: boolean;
  hasCards?: boolean;
  invalidateCards: () => Promise<void>;
  cancelCardsQuery: () => Promise<void>;
  dataDashboard?: AppRouterOutputs["ui"]["getCards"]["dashboard"];
  isPendingDashboard: boolean;
  isLoadingErrorDashboard: boolean;
  invalidateDashboard: () => Promise<void>;
  cancelDashboardsQuery: () => Promise<void>;
  dashboardName?: string;
  invalidateDashboards: () => Promise<void>;
  errorMessageDashboard?: string;
};

const CurrentDashboardContext = createContext<TCurrentDashboardContext | null>(
  null
);

type Props = {
  username: string;
  dashboardSlug: string;
  children: ReactNode;
};

export const CurrentDashboardProvider: FC<Props> = ({
  username,
  dashboardSlug,
  children,
}) => {
  const utils = api.useUtils();

  const {
    data: dataCards,
    isPending: isPendingCards,
    isLoadingError: isLoadingErrorCards,
    error: errorCards,
  } = api.ui.getCards.useQuery({
    username,
    dashboardSlug,
  });

  const { invalidate: invalidateDashboards } = useDashboards();

  const dashboardName = dataCards?.dashboard?.data.dashboard.title;
  const dataDashboard = dataCards?.dashboard;
  const isPendingDashboard = isPendingCards;
  const errorDashboard = errorCards;
  const isLoadingErrorDashboard = isLoadingErrorCards;

  const invalidateCards = () =>
    utils.ui.getCards.invalidate({ username, dashboardSlug });
  const cancelCardsQuery = () =>
    utils.ui.getCards.cancel({ username, dashboardSlug });
  const invalidateDashboard = async () => {
    await Promise.all([invalidateDashboards(), invalidateCards()]);
  };
  const cancelDashboardsQuery = () => cancelCardsQuery();

  return (
    <CurrentDashboardContext.Provider
      value={{
        username,
        dashboardSlug,
        dataCards,
        isPendingCards,
        isLoadingErrorCards,
        invalidateCards,
        cancelCardsQuery,
        dataDashboard,
        isPendingDashboard,
        isLoadingErrorDashboard,
        dashboardName,
        invalidateDashboard,
        cancelDashboardsQuery,
        errorMessageDashboard: errorDashboard?.message,
        invalidateDashboards,
        hasCards:
          dataCards === null
            ? false
            : dataCards !== undefined
            ? dataCards.cards.length > 0
              ? true
              : false
            : undefined,
      }}
    >
      {children}
    </CurrentDashboardContext.Provider>
  );
};

export const useCurrentDashboard = () => {
  const context = useContext(CurrentDashboardContext);
  if (!context) {
    throw new Error(
      "CurrentDashboardProvider is required for useCurrentDashboard to work"
    );
  }
  return context;
};

export default CurrentDashboardProvider;
