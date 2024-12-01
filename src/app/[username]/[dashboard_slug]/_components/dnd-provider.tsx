import { TCardOuterWrapperProps } from "@/components/cards/utils/card-outer-wrapper";
import { AppRouterOutputs } from "@/server/trpc/api/root";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

function getInstanceId() {
  return Symbol("instance-id");
}

type TCard = NonNullable<AppRouterOutputs["ui"]["getCards"]>[number];
const DndContext = createContext<{
  instanceId: symbol;
  orderedCards: TCard[];
} | null>(null);

type Props = { initialCards: TCard[]; children: ReactNode };

export default function DndProvider({ initialCards, children }: Props) {
  const [orderedCards, setOrderedCards] = useState(initialCards);

  useEffect(() => {
    setOrderedCards(initialCards);
  }, [initialCards]);

  const [instanceId] = useState(getInstanceId);

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

        const updated = [...orderedCards];
        const ids = orderedCards.map((c) => c.card.id);
        const startCardIndex = ids.indexOf(startCardId);
        const destinationCardIndex = ids.indexOf(destinationCardId);
        const [itemToMove] = updated.splice(startCardIndex, 1);
        updated.splice(destinationCardIndex, 0, itemToMove);

        setOrderedCards(updated);
      },
    });
  }, [instanceId, orderedCards]);

  return (
    <DndContext.Provider
      value={{
        instanceId,
        orderedCards,
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
