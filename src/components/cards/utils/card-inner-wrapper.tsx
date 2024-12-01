import { useDnd } from "@/app/[username]/[dashboard_slug]/_components/dnd-provider";
import { useEditMode } from "@/components/providers/edit-mode-provider";
import { cn } from "@/lib/utils";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";
import { ComponentProps, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type TCardInnerWrapperProps = ComponentProps<"div"> & { cardId?: string };
type TDndState = "idle" | "dragging" | "over" | "preview";

type TSize = {
  width: number;
  height: number;
};
const defaultCardSize: TSize = { width: 100, height: 50 };

export default function CardInnerWrapper({
  className,
  children,
  cardId,
  ...rest
}: TCardInnerWrapperProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  const [dndState, setDndState] = useState<TDndState>("idle");
  const [preview, setPreview] = useState<HTMLElement | null>(null);
  const [cardSize, setCardSize] = useState<TSize>(defaultCardSize);
  const { instanceId } = useDnd();
  const { isEnabled: isEditModeEnabled } = useEditMode();

  useEffect(() => {
    if (!isEditModeEnabled || !ref.current) return;
    const el = ref.current;

    return combine(
      draggable({
        element: el,
        getInitialData: () => ({ type: "grid-item", cardId, instanceId }),
        onDragStart: () => {
          setDndState("dragging");
        },
        onDrop: () => {
          setDndState("idle");
          setPreview(null);
          setCardSize(defaultCardSize);
        },

        onGenerateDragPreview({ nativeSetDragImage }) {
          setCustomNativeDragPreview({
            nativeSetDragImage,
            render({ container }) {
              if (ref.current) {
                const { width, height } = ref.current.getBoundingClientRect();
                setCardSize({ width, height });
              }
              setPreview(container);
            },
          });
        },
      }),
      dropTargetForElements({
        element: el,
        getData: () => ({ cardId }),
        canDrop: ({ source }) =>
          source.data.instanceId === instanceId &&
          source.data.type === "grid-item" &&
          source.data.cardId !== cardId,
        onDragEnter: () => setDndState("over"),
        onDragLeave: () => setDndState("idle"),
        onDrop: () => setDndState("idle"),
      })
    );
  }, [instanceId, isEditModeEnabled, cardId]);

  const classNameAll = cn(
    "w-full border rounded-xl relative overflow-hidden group/card-inner",
    className
  );

  return (
    <div
      className={cn(
        classNameAll,
        "data-[dnd-active]:data-[dnd-dragging]:opacity-40 data-[dnd-active]:cursor-grab",
        "data-[dnd-active]:not-touch:hover:bg-background-secondary data-[dnd-active]:active:bg-background-secondary",
        "[&_*]:data-[dnd-active]:select-none [&_*]:data-[dnd-active]:pointer-events-none"
      )}
      data-dnd-active={isEditModeEnabled ? true : undefined}
      data-dnd-over={dndState === "over" ? true : undefined}
      data-dnd-dragging={dndState === "dragging" ? true : undefined}
      {...rest}
      ref={ref}
    >
      {children}
      {isEditModeEnabled && (
        <>
          <div className="w-full h-full inset-0 absolute rounded-lg z-20" />
          <div
            className="absolute left-0 top-0 group-data-[dnd-over]/card-inner:scale-y-100 
            group-data-[dnd-over]/card-inner:opacity-100 transition 
            opacity-0 scale-y-0 w-[4px] h-full z-30 bg-primary"
          />
        </>
      )}
      {isEditModeEnabled &&
        preview &&
        createPortal(
          <CardPreview className={classNameAll} cardSize={cardSize} />,
          preview
        )}
    </div>
  );
}

function CardPreview({
  cardSize,
  className,
}: {
  cardSize: { width: number; height: number };
  className?: string;
}) {
  return (
    <div
      style={{
        width: `${cardSize.width / 2}px`,
        height: `${cardSize.height / 2}px`,
      }}
      className={cn(className, "bg-foreground/40 border-foreground/80")}
    ></div>
  );
}
