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
}>({
  instanceId: getInstanceId(),
  orderedIds: [],
});

type Props = { initialIds: string[]; children: ReactNode };

export default function DndProvider({ initialIds, children }: Props) {
  const [orderedIds, setOrderedIds] = useState(initialIds);

  useEffect(() => {
    setOrderedIds(initialIds);
  }, [initialIds]);

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

        const updated = [...orderedIds];
        const startCardIndex = orderedIds.indexOf(startCardId);
        const destinationCardIndex = orderedIds.indexOf(destinationCardId);
        const [itemToMove] = updated.splice(startCardIndex, 1);
        updated.splice(destinationCardIndex, 0, itemToMove);

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
