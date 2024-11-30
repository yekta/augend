import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DraggableAttributes,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { CSS } from "@dnd-kit/utilities";

import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable";
import { Dispatch, SetStateAction, useState } from "react";

export type TDndItem<T> = T & { id: UniqueIdentifier };

export default function DndWrapper<T>({
  items,
  setItems,
  children,
}: {
  items: TDndItem<T>[];
  setItems: Dispatch<SetStateAction<TDndItem<T>[]>>;
  children: (context: {
    item: TDndItem<T>;
    attributes: DraggableAttributes;
    listeners: SyntheticListenerMap | undefined;
    setNodeRef: (node: HTMLElement | null) => void;
    style: Record<string, any>;
    isActive: boolean;
  }) => React.ReactNode;
}) {
  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  function onDragStart({ active }: DragStartEvent) {
    setActiveId(active.id);
  }

  function onDragOver({ active, over }: DragOverEvent) {
    if (!activeId) return;
    if (!over) return;
    if (activeId === over.id) return;
    setItems((items) => {
      return arrayMove(
        items,
        items.map((i) => i.id).indexOf(activeId),
        items.map((i) => i.id).indexOf(over.id)
      );
    });
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      collisionDetection={closestCorners}
    >
      <SortableContext items={items} strategy={rectSortingStrategy}>
        {items.map((item) => (
          <SortableItem key={item.id} id={item.id}>
            {({ attributes, listeners, setNodeRef, style }) =>
              children({
                item,
                attributes,
                listeners,
                setNodeRef,
                style,
                isActive: activeId === item.id,
              })
            }
          </SortableItem>
        ))}
      </SortableContext>
    </DndContext>
  );
}
export function SortableItem({
  id,
  children,
}: {
  id: UniqueIdentifier;
  children: (context: {
    attributes: DraggableAttributes;
    listeners: SyntheticListenerMap | undefined;
    setNodeRef: (node: HTMLElement | null) => void;
    style: Record<string, any>;
  }) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(
      transform ? { ...transform, scaleX: 1, scaleY: 1 } : transform
    ),
    transition,
  };

  return children({
    attributes,
    style,
    listeners,
    setNodeRef,
  });
}
