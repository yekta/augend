"use client";

import { api } from "@/server/trpc/setup/react";
import { createContext, FC, ReactNode, useContext } from "react";

type TCurrentDashboardContext = {
  username?: string;
  dashboardSlug?: string;
  invalidateCards: () => Promise<void>;
  cancelCardsQuery: () => Promise<void>;
  invalidateDashboard: () => Promise<void>;
  cancelDashboardsQuery: () => Promise<void>;
  isPendingCards: boolean;
  isPendingDashboard: boolean;
  dashboardName?: string;
  isLoadingErrorDashboard: boolean;
  errorMessageDashboard?: string;
  hasCards?: boolean;
};

const CurrentDashboardContext = createContext<TCurrentDashboardContext | null>(
  null
);

type Props = {
  username: string;
  dashboardSlug: string;
  children: ReactNode;
  onSuccessDashboardRename?: () => void;
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
  } = api.ui.getCards.useQuery({
    username,
    dashboardSlug,
  });

  const {
    data: dataDashboard,
    isPending: isPendingDashboard,
    error: errorDashboard,
    isLoadingError: isLoadingErrorDashboard,
  } = api.ui.getDashboard.useQuery({
    username,
    dashboardSlug,
  });

  const dashboardName =
    dataDashboard?.data.dashboard.title ||
    dataCards?.dashboard?.data.dashboard.title;

  const invalidateCards = () =>
    utils.ui.getCards.invalidate({ username, dashboardSlug });
  const cancelCardsQuery = () =>
    utils.ui.getCards.cancel({ username, dashboardSlug });
  const invalidateDashboard = () =>
    utils.ui.getDashboard.invalidate({ username, dashboardSlug });
  const cancelDashboardsQuery = () =>
    utils.ui.getDashboard.cancel({ username, dashboardSlug });

  return (
    <CurrentDashboardContext.Provider
      value={{
        username,
        dashboardSlug,
        invalidateCards,
        cancelCardsQuery,
        isPendingCards,
        dashboardName,
        isPendingDashboard,
        invalidateDashboard,
        cancelDashboardsQuery,
        isLoadingErrorDashboard,
        errorMessageDashboard: errorDashboard?.message,
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
