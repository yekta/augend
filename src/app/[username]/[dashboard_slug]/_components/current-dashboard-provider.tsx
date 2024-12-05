"use client";

import { api } from "@/server/trpc/setup/react";
import { createContext, FC, ReactNode, useContext, useEffect } from "react";

type TCurrentDashboardContext = {
  username?: string;
  dashboardSlug?: string;
  invalidateCards: () => Promise<void>;
  cancelCardsQuery: () => Promise<void>;
  isPendingCardInvalidation: boolean;
  dashboardName?: string;
  isPendingDashboardName: boolean;
  isLoadingErrorDashboardName: boolean;
  hasCards?: boolean;
};

const CurrentDashboardContext = createContext<TCurrentDashboardContext | null>(
  null
);

export const CurrentDashboardProvider: FC<{
  username: string;
  dashboardSlug: string;
  children: ReactNode;
}> = ({ username, dashboardSlug, children }) => {
  const utils = api.useUtils();
  const {
    data: dataCard,
    isPending: isPendingCards,
    isLoadingError: isLoadingErrorCards,
  } = api.ui.getCards.useQuery({
    username,
    dashboardSlug,
  });
  const dashboardName = dataCard?.dashboard?.data.dashboard.title;
  const invalidateCards = () =>
    utils.ui.getCards.invalidate({ username, dashboardSlug });
  const cancelCardsQuery = () =>
    utils.ui.getCards.cancel({ username, dashboardSlug });

  return (
    <CurrentDashboardContext.Provider
      value={{
        username,
        dashboardSlug,
        invalidateCards,
        cancelCardsQuery,
        isPendingCardInvalidation: isPendingCards,
        dashboardName,
        isPendingDashboardName: isPendingCards,
        isLoadingErrorDashboardName: isLoadingErrorCards,
        hasCards:
          dataCard === null
            ? false
            : dataCard !== undefined
            ? dataCard.cards.length > 0
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
