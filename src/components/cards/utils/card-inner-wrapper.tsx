import { useDnd } from "@/app/[username]/[dashboard_slug]/_components/dnd-provider";
import { useCardInfo } from "@/components/cards/utils/card-info-provider";
import { useCurrentDashboard } from "@/components/providers/current-dashboard-provider";
import { useEditMode } from "@/components/providers/edit-mode-provider";
import { cn } from "@/lib/utils";
import { api } from "@/server/trpc/setup/react";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";
import { ComponentProps, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LoaderIcon, XIcon } from "lucide-react";

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
  ...rest
}: TCardInnerWrapperProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  const { cardId, isRemovable } = useCardInfo();
  const [dndState, setDndState] = useState<TDndState>("idle");
  const [preview, setPreview] = useState<HTMLElement | null>(null);
  const [cardSize, setCardSize] = useState<TSize>(defaultCardSize);
  const { instanceId } = useDnd();
  const { isEnabled: isEditModeEnabled } = useEditMode();

  const { invalidateCards, invalidationIsPending } = useCurrentDashboard();
  const [open, setOpen] = useState(false);

  const { mutate: deleteCard, isPending: isDeletePending } =
    api.ui.deleteCards.useMutation({
      onSuccess: async () => {
        await invalidateCards();
      },
    });

  const isAnyPending = isDeletePending || invalidationIsPending;

  const onDeleteClick = async ({ cardId }: { cardId: string }) => {
    if (!cardId) return;
    deleteCard({ ids: [cardId] });
  };

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
    "w-full border rounded-xl relative group/card-inner",
    className
  );

  const dataProperties = {
    "data-dnd-active": isEditModeEnabled ? true : undefined,
    "data-dnd-over": dndState === "over" ? true : undefined,
    "data-dnd-dragging": dndState === "dragging" ? true : undefined,
  };

  return (
    <>
      <div
        className={cn(
          classNameAll,
          "data-[dnd-active]:overflow-visible data-[dnd-active]:data-[dnd-dragging]:opacity-40 data-[dnd-active]:cursor-grab",
          "data-[dnd-active]:not-touch:hover:bg-background-secondary data-[dnd-active]:active:bg-background-secondary",
          "[&_*]:data-[dnd-active]:select-none [&_*]:data-[dnd-active]:pointer-events-none data-[dnd-over]:translate-x-[3px] data-[dnd-over]:before:-left-[3px]",
          "data-[dnd-over]:bg-background data-[dnd-over]:transition data-[dnd-over]:z-10 data-[dnd-over]:before:absolute data-[dnd-over]:before:w-full data-[dnd-over]:before:h-full"
        )}
        {...rest}
        ref={ref}
        {...dataProperties}
      >
        {children}
        {isEditModeEnabled && (
          <div className="w-full h-full inset-0 absolute rounded-lg z-20" />
        )}
        {isEditModeEnabled &&
          preview &&
          createPortal(
            <CardPreview className={classNameAll} cardSize={cardSize} />,
            preview
          )}
      </div>
      {isEditModeEnabled && (
        <div
          className="absolute left-0 top-0 py-1 h-full group/indicator"
          {...dataProperties}
        >
          <div
            className="group-data-[dnd-over]/indicator:scale-y-100 
            group-data-[dnd-over]/indicator:opacity-100 transition rounded-full
            opacity-0 scale-y-0 w-[3px] h-full z-30 bg-primary"
          />
        </div>
      )}
      {isEditModeEnabled && isRemovable && cardId && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              state={isAnyPending ? "loading" : "default"}
              onClick={() => setOpen(true)}
              size="icon"
              variant="outline"
              className="absolute left-0 top-0 size-7 rounded-full z-30 transition text-foreground shadow-md 
              shadow-shadow/[var(--opacity-shadow)] data-[dnd-over]:scale-0 data-[dnd-dragging]:scale-0
              data-[dnd-over]:opacity-0 data-[dnd-dragging]:opacity-0"
              {...dataProperties}
            >
              <div className="size-4">
                {isAnyPending ? (
                  <LoaderIcon className="size-full animate-spin" />
                ) : (
                  <XIcon className="size-full" />
                )}
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-destructive">
                Are you sure?
              </DialogTitle>
              <DialogDescription>
                This action cannot be undone. Are you sure you want to delete
                this card?
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end flex-wrap gap-2">
              <Button
                onClick={() => setOpen(false)}
                variant="outline"
                className="border-none text-muted-foreground"
              >
                Cancel
              </Button>
              <Button
                onClick={() => onDeleteClick({ cardId })}
                state={isAnyPending ? "loading" : "default"}
                data-pending={isAnyPending ? true : undefined}
                variant="destructive"
                className="group/button"
              >
                {isAnyPending && (
                  <div className="size-6 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <LoaderIcon className="size-full animate-spin" />
                  </div>
                )}
                <span className="group-data-[pending]/button:text-transparent">
                  Delete
                </span>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
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
