import { useCurrentDashboard } from "@/app/[username]/[dashboard_slug]/_components/current-dashboard-provider";
import { useDnd } from "@/app/[username]/[dashboard_slug]/_components/dnd-provider";
import { AddCardButton } from "@/components/cards/_utils/add-card";
import { EditButton } from "@/components/edit-button";
import { LoaderIcon } from "lucide-react";

type Props = {
  isOwner: boolean;
  hasCards: boolean;
  username: string;
  dashboardSlug: string;
};

export function DashboardTitleBar({
  username,
  dashboardSlug,
  isOwner,
  hasCards,
}: Props) {
  const { isPendingReorder } = useDnd();
  const { dashboardName, isPendingDashboardName, isLoadingErrorDashboardName } =
    useCurrentDashboard();
  return (
    <div className="col-span-12 items-center justify-between flex gap-2 px-3 pb-1 md:pb-2">
      <h1 className="font-bold text-xl md:text-2xl leading-none truncate shrink">
        {isPendingDashboardName
          ? "Loading"
          : isLoadingErrorDashboardName
          ? "Error"
          : dashboardName}
      </h1>
      {isOwner && hasCards ? (
        <div className="flex items-center justify-start shrink-0 -mr-2 gap-1.5">
          {isPendingReorder && (
            <div className="size-9 flex items-center justify-center">
              <LoaderIcon className="size-5 text-muted-more-foreground animate-spin" />
            </div>
          )}
          <AddCardButton
            variant="icon"
            username={username}
            dashboardSlug={dashboardSlug}
            xOrderPreference="first"
          />
          <EditButton />
        </div>
      ) : (
        <div className="size-9 -mr-2 shrink-0" />
      )}
    </div>
  );
}
