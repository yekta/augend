"use client";

import { useCurrentDashboard } from "@/app/[username]/[dashboard_slug]/_components/current-dashboard-provider";
import { AppRouterInputs } from "@/server/trpc/api/root";
import { api } from "@/server/trpc/setup/react";
import { autoScrollWindowForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export const dndItemType = "dnd-item";

function getInstanceId() {
  return Symbol("instance-id");
}

const DndContext = createContext<{
  instanceId: symbol;
  orderedIds: string[];
  isPendingReorderCards: boolean;
  isErrorReorderCards: boolean;
} | null>(null);

type Props = { initialIds: string[]; children: ReactNode };

export default function DndProvider({ initialIds, children }: Props) {
  const [orderedIds, setOrderedIds] = useState(initialIds);
  const { invalidateCards, cancelCardsQuery } = useCurrentDashboard();
  const {
    mutate: reorderCards,
    isPending: isPendingReorderCards,
    isError: isErrorReorderCards,
  } = api.ui.reorderCards.useMutation({
    onMutate: async () => {
      cancelCardsQuery();
    },
    onSuccess: async () => {
      await invalidateCards();
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
        const destinationCardId = destination.data.cardId;
        const startCardId = source.data.cardId;

        if (typeof destinationCardId !== "string") {
          return;
        }

        if (typeof startCardId !== "string") {
          return;
        }

        const updated = [...orderedIds];
        const startCardIndex = orderedIds.indexOf(startCardId);
        const destinationCardIndex = orderedIds.indexOf(destinationCardId);
        const [itemToMove] = updated.splice(startCardIndex, 1);
        updated.splice(destinationCardIndex, 0, itemToMove);

        // If order changed, update the DB
        let orderObjects: AppRouterInputs["ui"]["reorderCards"]["orderObjects"] =
          [];
        for (let i = 0; i < updated.length; i++) {
          const updatedCardId = updated[i];
          const originalCardId = orderedIds[i];
          if (updatedCardId !== originalCardId) {
            orderObjects.push({
              id: updatedCardId,
              xOrder: i,
            });
          }
        }
        if (orderObjects.length > 0) {
          reorderCards({
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
    <DndContext.Provider
      value={{
        instanceId,
        orderedIds,
        isPendingReorderCards,
        isErrorReorderCards,
      }}
    >
      {children}
    </DndContext.Provider>
  );
}

export const useDnd = () => {
  const context = useContext(DndContext);
  if (!context) {
    throw new Error("DndProvider is required for useDnd to work");
  }
  return context;
};
