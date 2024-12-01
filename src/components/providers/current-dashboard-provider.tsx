"use client";

import { api } from "@/server/trpc/setup/react";
import { createContext, FC, ReactNode, useContext } from "react";

type TCurrentDashboardContext = {
  username?: string;
  dashboardSlug?: string;
  invalidateCards: () => Promise<void>;
  invalidationIsPending: boolean;
};

const CurrentDashboardContext = createContext<TCurrentDashboardContext>({
  username: undefined,
  dashboardSlug: undefined,
  invalidateCards: async () => {},
  invalidationIsPending: false,
});

export const CurrentDashboardProvider: FC<{
  username: string;
  dashboardSlug: string;
  children: ReactNode;
}> = ({ username, dashboardSlug, children }) => {
  const utils = api.useUtils();
  const { isPending: invalidationIsPending } = api.ui.getCards.useQuery(
    {
      username,
      dashboardSlug,
    },
    {
      enabled: false,
    }
  );
  const invalidateCards = () =>
    utils.ui.getCards.invalidate({ username, dashboardSlug });

  return (
    <CurrentDashboardContext.Provider
      value={{
        username,
        dashboardSlug,
        invalidateCards,
        invalidationIsPending,
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
