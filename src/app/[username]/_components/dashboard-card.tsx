import { useDashboards } from "@/app/[username]/_components/dashboards-provider";
import { useEditModeDashboards } from "@/app/[username]/_components/edit-mode-dashboards-provider";
import DeleteDashboardTrigger from "@/components/dashboard/delete-dashboard-trigger";
import { CardsIcon } from "@/components/icons/cards-icon";
import { Button } from "@/components/ui/button";
import { mainDashboardSlug } from "@/lib/constants";
import { EyeIcon, LoaderIcon, LockIcon, XIcon } from "lucide-react";
import { useState } from "react";

type Props = {
  href?: string;
  title: string;
  dashboardSlug: string;
  cardCount: number | null;
  isPublic: boolean;
  isOwner: boolean;
  isPending: boolean;
};

export default function DashboardCard({
  title,
  dashboardSlug,
  cardCount,
  isPublic,
  isOwner,
  href,
  isPending,
}: Props) {
  const { invalidate } = useDashboards();
  const { isEnabled: isEditEnabled } = useEditModeDashboards();
  const isPendingDeleteDashboard = false;
  const [open, setOpen] = useState(false);
  const isMainDashboard = dashboardSlug === mainDashboardSlug;

  const Comp = !isPending && !isEditEnabled && href ? "a" : "div";
  return (
    <Comp
      target="_self"
      href={href}
      data-has-href={!isPending && href !== undefined ? true : undefined}
      data-pending={isPending ? true : undefined}
      className="col-span-12 md:col-span-6 lg:col-span-4 p-1 group/card relative"
    >
      {isEditEnabled && isOwner && !isMainDashboard && (
        <DeleteDashboardTrigger
          dashboardSlug={dashboardSlug}
          open={open}
          onOpenChange={setOpen}
          dashboardTitle={title}
          afterSuccess={() => invalidate()}
        >
          <Button
            state={isPendingDeleteDashboard ? "loading" : "default"}
            size="icon"
            variant="outline"
            className="absolute left-0 top-0 size-7 rounded-full z-10 transition text-foreground shadow-md 
            shadow-shadow/[var(--opacity-shadow)] group-data-[dnd-over]/card:scale-0 group-data-[dnd-dragging]/card:scale-0
            group-data-[dnd-over]/card:opacity-0 group-data-[dnd-dragging]/card:opacity-0"
          >
            <div className="size-4">
              {isPendingDeleteDashboard ? (
                <LoaderIcon className="size-full animate-spin" />
              ) : (
                <XIcon className="size-full" />
              )}
            </div>
          </Button>
        </DeleteDashboardTrigger>
      )}
      <div className="border rounded-xl flex gap-16 flex-col items-start justify-start px-5 pt-4 pb-4.5 overflow-hidden not-touch:group-data-[has-href]/card:group-hover/card:bg-background-hover group-data-[has-href]/card:group-active/card:bg-background-hover">
        <div className="w-full flex items-center justify-between gap-4">
          <h2
            className="max-w-full shrink min-w-0 truncate font-bold text-xl leading-none
            group-data-[pending]/card:text-transparent group-data-[pending]/card:bg-foreground group-data-[pending]/card:rounded-md group-data-[pending]/card:animate-skeleton"
          >
            {title}
          </h2>
          {!isPending && isOwner && (
            <div className="size-5 -my-1 shrink-0 text-muted-foreground -mr-0.5">
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
    </Comp>
  );
}
