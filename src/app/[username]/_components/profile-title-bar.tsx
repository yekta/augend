"use client";

import { CreateDashboardButton } from "@/app/[username]/_components/create-dashboard-button";
import { useDashboards } from "@/app/[username]/_components/dashboards-provider";
import { useDndDashboards } from "@/app/[username]/_components/dnd-dashboards-provider";
import EditButtonDashboards from "@/app/[username]/_components/edit-button-dashboards";
import { useEditModeDashboards } from "@/app/[username]/_components/edit-mode-dashboards-provider";
import Blockies from "@/components/blockies/blockies";
import { LoaderIcon, TriangleAlertIcon } from "lucide-react";

type Props = {};

export function ProfileTitleBar({}: Props) {
  const {
    ethereumAddress,
    username,
    usernameParam,
    data,
    isPendingUser,
    isLoadingErrorUser,
  } = useDashboards();
  const { isPendingReorderDashboards, isErrorReorderDashboards } =
    useDndDashboards();

  const { canEdit } = useEditModeDashboards();

  return (
    <div
      data-pending={isPendingUser ? true : undefined}
      data-error={!isPendingUser && isLoadingErrorUser ? true : undefined}
      className="col-span-12 group/title items-center justify-between flex gap-1.5 px-1 pb-1 md:pb-2"
    >
      <h1 className="border flex gap-2 items-center justify-start border-transparent px-2 py-1.75 md:py-0.5 rounded-lg font-bold text-xl md:text-2xl leading-none md:leading-none truncate shrink">
        <Blockies
          width={24}
          height={24}
          className="size-6 rounded-full -my-1 shrink-0"
          address={ethereumAddress || username || usernameParam}
        />
        <span className="shrink min-w-0 py-1 -my-1 truncate">
          {username || usernameParam}
        </span>
      </h1>
      {data && data.isOwner ? (
        <div className="flex items-center justify-start shrink-0 gap-1.5">
          <div className="size-7 flex items-center justify-center">
            {isPendingReorderDashboards && (
              <LoaderIcon className="size-5 text-muted-more-foreground animate-spin" />
            )}
            {!isPendingReorderDashboards && isErrorReorderDashboards && (
              <TriangleAlertIcon className="size-5 text-destructive" />
            )}
          </div>
          <CreateDashboardButton modalId="create_dashboard_via_title" />
          {canEdit && <EditButtonDashboards />}
        </div>
      ) : (
        <div className="size-9 -mr-2 shrink-0" />
      )}
    </div>
  );
}
