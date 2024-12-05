import { useCurrentDashboard } from "@/app/[username]/[dashboard_slug]/_components/current-dashboard-provider";
import { useDnd } from "@/app/[username]/[dashboard_slug]/_components/dnd-provider";
import { EditButton } from "@/components/edit-button";
import { LoaderIcon } from "lucide-react";

type Props = {
  isOwner: boolean;
  hasCards: boolean;
};

export function DashboardTitleBar({ isOwner, hasCards }: Props) {
  const { isPendingReorder } = useDnd();
  const { dashboardName, isPendingDashboardName, isLoadingErrorDashboardName } =
    useCurrentDashboard();
  return (
    <div className="col-span-12 items-center justify-start flex p-1 gap-3 px-3 md:px-3 pb-3">
      <h1 className="font-bold text-2xl leading-none truncate">
        {isPendingDashboardName
          ? "Loading"
          : isLoadingErrorDashboardName
          ? "Error"
          : dashboardName}
      </h1>
      {isOwner && hasCards && (
        <div className="flex items-center gap-2 justify-start">
          <EditButton className="-my-2" />
          <div className="size-5 shrink-0">
            {isPendingReorder && (
              <LoaderIcon className="size-full text-muted-more-foreground animate-spin" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
