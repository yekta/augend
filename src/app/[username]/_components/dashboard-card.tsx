import { useDashboards } from "@/app/[username]/_components/dashboards-provider";
import {
  dndDashboardItemType,
  useDndDashboards,
} from "@/app/[username]/_components/dnd-dashboards-provider";
import { useEditModeDashboards } from "@/app/[username]/_components/edit-mode-dashboards-provider";
import DeleteDashboardTrigger from "@/components/dashboard/delete-dashboard-trigger";
import { CardsIcon } from "@/components/icons/cards-icon";
import { Button } from "@/components/ui/button";
import { mainDashboardSlug } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";
import { EyeIcon, LockIcon, MinusIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  href?: string;
  title: string;
  dashboardSlug: string;
  dashboardId: string;
  cardCount: number | null;
  isPublic: boolean;
  isOwner: boolean;
  isPending: boolean;
};

type TDndState = "idle" | "dragging" | "over" | "preview";

type TSize = {
  width: number;
  height: number;
};
const defaultCardSize: TSize = { width: 100, height: 50 };

export const dashboardCardSizeClassName =
  "col-span-12 sm:col-span-6 lg:col-span-4 xl:col-span-3";

export default function DashboardCard({
  title,
  dashboardSlug,
  dashboardId,
  cardCount,
  isPublic,
  isOwner,
  href,
  isPending,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { invalidate } = useDashboards();
  const { isEnabled: isEditEnabled } = useEditModeDashboards();
  const [open, setOpen] = useState(false);
  const isMainDashboard = dashboardSlug === mainDashboardSlug;
  const [dndState, setDndState] = useState<TDndState>("idle");
  const [preview, setPreview] = useState<HTMLElement | null>(null);
  const [cardSize, setCardSize] = useState<TSize>(defaultCardSize);
  const { instanceId } = useDndDashboards();

  const wrapperClassName = `${dashboardCardSizeClassName} h-36 flex flex-col p-1 group/card relative`;

  useEffect(() => {
    if (!isEditEnabled || !ref.current) return;
    const el = ref.current;

    return combine(
      draggable({
        element: el,
        getInitialData: () => ({
          type: dndDashboardItemType,
          dashboardId,
          instanceId,
        }),
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
        getData: () => ({ dashboardId }),
        canDrop: ({ source }) =>
          source.data.instanceId === instanceId &&
          source.data.type === dndDashboardItemType &&
          source.data.dashboardId !== dashboardId,
        onDragEnter: () => setDndState("over"),
        onDragLeave: () => setDndState("idle"),
        onDrop: () => setDndState("idle"),
      })
    );
  }, [instanceId, isEditEnabled, dashboardId]);

  const shouldRenderLink = !isPending && !isEditEnabled && href;

  const CardContent = useMemo(
    () => () =>
      (
        <div
          className="border rounded-xl flex gap-4 flex-1 flex-col items-start justify-between px-5 pt-4 pb-4.5 overflow-hidden
          not-touch:group-data-[has-href]/card:group-hover/card:bg-background-hover group-data-[has-href]/card:group-active/card:bg-background-hover
          group-data-[dnd-active]/card:overflow-visible group-data-[dnd-over]/card:bg-background group-data-[dnd-over]/card:transition
          group-data-[dnd-active]/card:not-touch:group-hover/card:bg-background-hover
          [&_*]:group-data-[dnd-active]/card:select-none group-data-[dnd-over]/card:translate-x-1
          group-focus-visible/card:ring-1 group-focus-visible/card:ring-foreground/50 
          group-focus-visible/card:ring-offset-2 group-focus-visible/card:ring-offset-background"
        >
          <div className="w-full flex items-center justify-between gap-4">
            <h2
              className="max-w-full shrink min-w-0 truncate font-bold text-lg leading-none
              group-data-[pending]/card:text-transparent group-data-[pending]/card:bg-foreground group-data-[pending]/card:rounded-md group-data-[pending]/card:animate-skeleton"
            >
              {title}
            </h2>
            {!isPending && isOwner && (
              <div className="size-4.5 -my-1 shrink-0 text-muted-foreground -mr-0.5">
                {isPublic ? (
                  <EyeIcon className="size-full text-warning" />
                ) : (
                  <LockIcon className="size-full text-success" />
                )}
              </div>
            )}
          </div>
          {cardCount !== null ? (
            <div className="w-full flex gap-1.5 text-right items-center font-medium justify-end text-muted-foreground text-base">
              {!isPending && <CardsIcon className="size-4 -my-1" />}
              <p
                className="shrink min-w-0 truncate leading-none
                group-data-[pending]/card:text-transparent group-data-[pending]/card:bg-muted-foreground group-data-[pending]/card:rounded group-data-[pending]/card:animate-skeleton"
              >
                {cardCount}
              </p>
            </div>
          ) : (
            <div className="w-full" />
          )}
        </div>
      ),
    [title, cardCount, isOwner, isPublic, isPending]
  );

  if (isEditEnabled && isOwner) {
    return (
      <div
        ref={ref}
        data-dnd-active={isEditEnabled ? true : undefined}
        data-dnd-over={dndState === "over" ? true : undefined}
        data-dnd-dragging={dndState === "dragging" ? true : undefined}
        data-pending={isPending ? true : undefined}
        className={cn(
          wrapperClassName,
          "data-[dnd-active]:data-[dnd-dragging]:opacity-50 relative data-[dnd-active]:cursor-grab data-[dnd-over]:z-20"
        )}
      >
        <CardContent />
        {isEditEnabled && (
          <div className="w-full h-full inset-0 absolute z-10" />
        )}
        {/* Vertical indicator */}
        {isEditEnabled && (
          <div className="absolute left-0.5 top-0 py-1 h-full pointer-events-none">
            <div
              className="group-data-[dnd-over]/card:scale-y-100 
              group-data-[dnd-over]/card:opacity-100 transition rounded-full
              opacity-0 scale-y-0 w-1 -translate-x-1/2 h-full z-10 bg-primary"
            />
          </div>
        )}
        {/* Preview for the dragging element */}
        {isEditEnabled &&
          preview &&
          createPortal(
            <CardPreview className={wrapperClassName} cardSize={cardSize} />,
            preview
          )}
        {isEditEnabled && isOwner && !isMainDashboard && (
          <DeleteDashboardTrigger
            dashboardSlug={dashboardSlug}
            open={open}
            onOpenChange={setOpen}
            dashboardTitle={title}
            afterSuccess={() => invalidate()}
          >
            <Button
              aria-label="Delete Dashboard"
              size="icon"
              variant="outline"
              className="z-30 absolute bg-border left-0 top-0 size-7 rounded-full transition-[opacity,transform] shadow-md 
              shadow-shadow/[var(--opacity-shadow)] group-data-[dnd-over]/card:scale-0 group-data-[dnd-dragging]/card:scale-0
              group-data-[dnd-over]/card:opacity-0 group-data-[dnd-dragging]/card:opacity-0 text-foreground
              not-touch:hover:bg-destructive not-touch:hover:text-destructive-foreground
              active:bg-destructive active:text-destructive-foreground"
            >
              <div className="size-4">
                <MinusIcon className="size-full" />
              </div>
            </Button>
          </DeleteDashboardTrigger>
        )}
      </div>
    );
  }

  if (shouldRenderLink)
    return (
      <Link
        data-pending={isPending ? true : undefined}
        data-has-href={true}
        className={wrapperClassName}
        href={href}
      >
        <CardContent />
      </Link>
    );

  return (
    <div
      data-pending={isPending ? true : undefined}
      className={wrapperClassName}
    >
      <CardContent />
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
