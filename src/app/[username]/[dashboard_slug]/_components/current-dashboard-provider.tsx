"use client";

import { api } from "@/server/trpc/setup/react";
import { createContext, FC, ReactNode, useContext, useEffect } from "react";

type TCurrentDashboardContext = {
  username?: string;
  dashboardSlug?: string;
  invalidateCards: () => Promise<void>;
  cancelCardsQuery: () => Promise<void>;
  isPendingCardInvalidation: boolean;
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
  const { isPending: isPendingCardInvalidation } = api.ui.getCards.useQuery({
    username,
    dashboardSlug,
  });
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
        isPendingCardInvalidation,
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
