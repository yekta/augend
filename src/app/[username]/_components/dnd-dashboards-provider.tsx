"use client";

import { useDashboards } from "@/app/[username]/_components/dashboards-provider";
import { useDashboardsAuto } from "@/components/providers/dashboards-auto-provider";
import { AppRouterInputs } from "@/server/trpc/api/root";
import { api } from "@/server/trpc/setup/react";
import { autoScrollWindowForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export const dndDashboardItemType = "dnd-dashboard-item";

function getInstanceId() {
  return Symbol("instance-id");
}

const DndDashboardsContext = createContext<{
  instanceId: symbol;
  orderedIds: string[];
  isPendingReorderDashboards: boolean;
  isErrorReorderDashboards: boolean;
} | null>(null);

type Props = { children: ReactNode };

export default function DndDashboardsProvider({ children }: Props) {
  const { data } = useDashboards();
  const initialIds = useMemo(
    () => data?.dashboards.map((d) => d.dashboard.id) ?? [],
    [data]
  );
  const [orderedIds, setOrderedIds] = useState(initialIds);

  const {
    invalidate: invalidateDashboards,
    cancelQuery: cancelDashboardsQuery,
  } = useDashboards();

  const { invalidate: invalidateDashboardsAuto } = useDashboardsAuto();

  const {
    mutate: reorderDashboards,
    isPending: isPendingReorderDashboards,
    isError: isErrorReorderDashboards,
  } = api.ui.reorderDashboards.useMutation({
    onMutate: async () => {
      cancelDashboardsQuery();
    },
    onSuccess: async () => {
      await Promise.all([invalidateDashboards(), invalidateDashboardsAuto()]);
    },
  });

  const [instanceId] = useState(getInstanceId);

  useEffect(() => {
    setOrderedIds(initialIds);
  }, [initialIds]);

  useEffect(() => {
    return monitorForElements({
      canMonitor({ source }) {
        return source.data.instanceId === instanceId;
      },
      onDrop({ source, location }) {
        const destination = location.current.dropTargets[0];
        if (!destination) {
          return;
        }
        const destionationDashboardId = destination.data.dashboardId;
        const startDashboardId = source.data.dashboardId;

        if (typeof destionationDashboardId !== "string") {
          return;
        }

        if (typeof startDashboardId !== "string") {
          return;
        }

        const updated = [...orderedIds];
        const startDashboardIndex = orderedIds.indexOf(startDashboardId);
        const destionationDashboardIndex = orderedIds.indexOf(
          destionationDashboardId
        );
        const [itemToMove] = updated.splice(startDashboardIndex, 1);
        updated.splice(destionationDashboardIndex, 0, itemToMove);

        // If order changed, update the DB
        let orderObjects: AppRouterInputs["ui"]["reorderDashboards"]["orderObjects"] =
          [];
        for (let i = 0; i < updated.length; i++) {
          const updatedDashboardId = updated[i];
          const originalDashboardId = orderedIds[i];
          if (updatedDashboardId !== originalDashboardId) {
            orderObjects.push({
              id: updatedDashboardId,
              xOrder: i,
            });
          }
        }
        if (orderObjects.length > 0) {
          reorderDashboards({
            orderObjects,
          });
        }

        setOrderedIds(updated);
      },
    });
  }, [instanceId, orderedIds]);

  useEffect(() => {
    return autoScrollWindowForElements({
      getAllowedAxis: () => "vertical",
    });
  }, []);

  return (
    <DndDashboardsContext.Provider
      value={{
        instanceId,
        orderedIds,
        isPendingReorderDashboards,
        isErrorReorderDashboards,
      }}
    >
      {children}
    </DndDashboardsContext.Provider>
  );
}

export const useDndDashboards = () => {
  const context = useContext(DndDashboardsContext);
  if (!context) {
    throw new Error(
      "DndDashboardsProvider is required for useDndDashboards to work"
    );
  }
  return context;
};
