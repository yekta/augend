"use client";

import { useEditModeCards } from "@/app/[username]/[dashboard_slug]/_components/edit-mode-cards-provider";

import { useCurrentDashboard } from "@/app/[username]/[dashboard_slug]/_components/current-dashboard-provider";
import {
  dndCardItemType,
  useDndCards,
} from "@/app/[username]/[dashboard_slug]/_components/dnd-cards-provider";
import ErrorLine from "@/components/error-line";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { api } from "@/server/trpc/setup/react";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";
import { LoaderIcon, MinusIcon } from "lucide-react";
import Link from "next/link";
import { ComponentProps, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

type TSharedProps = {
  cardId?: string;
  isRemovable?: boolean;
  noHref?: boolean;
};
export type TCardOuterWrapperDivProps = ComponentProps<"div"> &
  TSharedProps & {
    href?: undefined;
  };
export type TCardOuterWrapperLinkProps = ComponentProps<typeof Link> &
  TSharedProps & {};
export type TCardOuterWrapperButtonProps = ComponentProps<"button"> &
  TSharedProps & {
    href?: undefined;
    onClick?: () => void;
  };

export type TCardOuterWrapperProps =
  | TCardOuterWrapperDivProps
  | TCardOuterWrapperLinkProps
  | TCardOuterWrapperButtonProps;

type TDndState = "idle" | "dragging" | "over" | "preview";

type TSize = {
  width: number;
  height: number;
};
const defaultCardSize: TSize = { width: 100, height: 50 };

export default function CardOuterWrapper({
  className,
  children,
  isRemovable,
  noHref,
  cardId,
  ...rest
}: TCardOuterWrapperProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  const classNameAll = cn(
    "flex flex-col p-1 group/card col-span-12 relative focus:outline-none",
    className
  );

  const { invalidateCards, removeCardIdsOptimistic, dataCards, setDataCards } =
    useCurrentDashboard();

  const { isEnabled: isEditModeCardsEnabled } = useEditModeCards();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dndState, setDndState] = useState<TDndState>("idle");
  const [preview, setPreview] = useState<HTMLElement | null>(null);
  const [cardSize, setCardSize] = useState<TSize>(defaultCardSize);
  const { instanceId } = useDndCards();

  const {
    mutate: deleteCard,
    isPending: isPendingDeleteCard,
    error: errorDeleteCard,
  } = api.ui.deleteCards.useMutation({
    onMutate: async ({ ids }) => {
      const oldData = dataCards ? { ...dataCards } : undefined;
      removeCardIdsOptimistic(ids);
      return {
        dataCards: oldData,
      };
    },
    onSettled: async () => {
      invalidateCards();
    },
    onError: (err, _, context) => {
      toast.error("Card deletion failed.", {
        description: "Please try again.",
        duration: 5000,
        closeButton: false,
      });
      if (context?.dataCards) {
        setDataCards(context.dataCards);
      }
    },
  });

  const onDeleteClick = async ({ cardId }: { cardId: string }) => {
    if (!cardId) return;
    deleteCard({ ids: [cardId] });
  };

  useEffect(() => {
    if (!isEditModeCardsEnabled || !ref.current) return;
    const el = ref.current;

    return combine(
      draggable({
        element: el,
        getInitialData: () => ({ type: dndCardItemType, cardId, instanceId }),
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
          source.data.type === dndCardItemType &&
          source.data.cardId !== cardId,
        onDragEnter: () => setDndState("over"),
        onDragLeave: () => setDndState("idle"),
        onDrop: () => setDndState("idle"),
      })
    );
  }, [instanceId, isEditModeCardsEnabled, cardId]);

  if (isEditModeCardsEnabled && cardId) {
    const restDiv = rest as TCardOuterWrapperDivProps;
    return (
      <div
        className={cn(
          classNameAll,
          "data-[dnd-active]:data-[dnd-dragging]:opacity-50 relative data-[dnd-active]:cursor-grab data-[dnd-over]:z-20"
        )}
        data-dnd-active={isEditModeCardsEnabled ? true : undefined}
        data-dnd-over={dndState === "over" ? true : undefined}
        data-dnd-dragging={dndState === "dragging" ? true : undefined}
        data-has-href={true}
        {...restDiv}
        ref={ref}
      >
        {children}
        {/* To block the content below */}
        {isEditModeCardsEnabled && (
          <div className="w-full h-full inset-0 absolute z-10" />
        )}
        {/* Vertical indicator */}
        {isEditModeCardsEnabled && (
          <div className="absolute left-0.5 top-0 py-1 h-full pointer-events-none">
            <div
              className="group-data-[dnd-over]/card:scale-y-100 
                group-data-[dnd-over]/card:opacity-100 transition rounded-full
                opacity-0 scale-y-0 w-1 -translate-x-1/2 h-full z-10 bg-primary"
            />
          </div>
        )}
        {/* Preview for the dragging element */}
        {isEditModeCardsEnabled &&
          preview &&
          createPortal(
            <CardPreview className={classNameAll} cardSize={cardSize} />,
            preview
          )}
        {/* Delete card button */}
        {isEditModeCardsEnabled && isRemovable && cardId && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                aria-label="Delete Card"
                state={isPendingDeleteCard ? "loading" : "default"}
                onClick={() => setIsDialogOpen(true)}
                size="icon"
                variant="outline"
                className="absolute bg-border left-0 top-0 size-7 rounded-full z-10 transition-[opacity,transform] text-foreground shadow-md 
                shadow-shadow/[var(--opacity-shadow)] group-data-[dnd-over]/card:scale-0 group-data-[dnd-dragging]/card:scale-0
                group-data-[dnd-over]/card:opacity-0 group-data-[dnd-dragging]/card:opacity-0
                not-touch:hover:bg-destructive not-touch:hover:text-destructive-foreground
                active:bg-destructive active:text-destructive-foreground"
              >
                <div className="size-4">
                  {isPendingDeleteCard ? (
                    <LoaderIcon className="size-full animate-spin" />
                  ) : (
                    <MinusIcon className="size-full" />
                  )}
                </div>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle className="text-destructive">
                  Delete card
                </DialogTitle>
                <DialogDescription>
                  This action cannot be undone. Are you sure you want to delete
                  this card?
                </DialogDescription>
              </DialogHeader>
              {errorDeleteCard && (
                <ErrorLine message={errorDeleteCard.message} />
              )}
              <div className="flex justify-end flex-wrap gap-2">
                <Button
                  onClick={() => setIsDialogOpen(false)}
                  variant="outline"
                  className="border-none text-muted-foreground"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => onDeleteClick({ cardId })}
                  state={isPendingDeleteCard ? "loading" : "default"}
                  data-pending={isPendingDeleteCard ? true : undefined}
                  variant="destructive"
                  className="group/button"
                >
                  {isPendingDeleteCard && (
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
      </div>
    );
  }

  if (!noHref && "href" in rest && rest.href) {
    const {
      target = "_blank",
      href,
      ...restLink
    } = rest as TCardOuterWrapperLinkProps;

    return (
      <Link
        data-has-href={href ? true : undefined}
        href={href}
        {...restLink}
        className={classNameAll}
        target={target}
      >
        {children}
      </Link>
    );
  }

  if ("onClick" in rest && rest.onClick) {
    const restButton = rest as TCardOuterWrapperButtonProps;
    return (
      <button {...restButton} className={classNameAll}>
        {children}
      </button>
    );
  }

  const restDiv = rest as TCardOuterWrapperDivProps;
  return (
    <div {...restDiv} className={classNameAll}>
      {children}
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
        width: `${(2 * cardSize.width) / 3}px`,
        height: `${(2 * cardSize.height) / 3}px`,
      }}
      className={cn(
        className,
        "bg-background border border-dashed border-foreground rounded-xl relative"
      )}
    />
  );
}
