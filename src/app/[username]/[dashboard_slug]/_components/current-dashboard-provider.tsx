"use client";

import { useDashboardsAuto } from "@/components/providers/dashboards-auto-provider";
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
  removeCardIdsOptimistic: (ids: string[]) => void;
  dataDashboard?: AppRouterOutputs["ui"]["getCards"]["dashboard"];
  isPendingDashboard: boolean;
  isLoadingErrorDashboard: boolean;
  invalidateDashboard: () => Promise<void>;
  cancelDashboardsQuery: () => Promise<void>;
  dashboardTitle?: string;
  invalidateDashboards: () => Promise<void>;
  errorMessageDashboard?: string;
  setDataCards: (data: AppRouterOutputs["ui"]["getCards"]) => void;
  isOwner?: boolean;
};

const CurrentDashboardContext = createContext<TCurrentDashboardContext | null>(
  null
);

type Props = {
  username: string;
  dashboardSlug: string;
  children: ReactNode;
  enabled?: boolean;
};

export const CurrentDashboardProvider: FC<Props> = ({
  username,
  dashboardSlug,
  children,
  enabled = true,
}) => {
  const utils = api.useUtils();

  const {
    data: dataCards,
    isPending: isPendingCards,
    isLoadingError: isLoadingErrorCards,
    error: errorCards,
  } = api.ui.getCards.useQuery(
    {
      username,
      dashboardSlug,
    },
    {
      enabled,
    }
  );

  const { invalidate: invalidateDashboards } = useDashboardsAuto();

  const dashboardTitle = dataCards?.dashboard?.title;
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
  const removeCardIdsOptimistic = (ids: string[]) => {
    utils.ui.getCards.setData(
      {
        username,
        dashboardSlug,
      },
      (data) => {
        if (data === undefined) return data;
        cancelCardsQuery();
        let newData = { ...data };
        newData.cards = data.cards.filter(
          (cardObject) => !ids.includes(cardObject.card.id)
        );
        return newData;
      }
    );
  };
  const setDataCards = (data: typeof dataCards) => {
    utils.ui.getCards.setData(
      {
        username,
        dashboardSlug,
      },
      data
    );
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
        dashboardTitle,
        invalidateDashboard,
        cancelDashboardsQuery,
        errorMessageDashboard: errorDashboard?.message,
        invalidateDashboards,
        removeCardIdsOptimistic,
        setDataCards,
        isOwner: dataDashboard?.isOwner,
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
      "CurrentDashboardProvider needs to be a parent of the component that uses useCurrentDashboard for it to work."
    );
  }
  return context;
};

export default CurrentDashboardProvider;
