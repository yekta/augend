"use client";

import { CreateDashboardButton } from "@/app/(app)/[username]/_components/create-dashboard-button";
import DashboardCard from "@/app/(app)/[username]/_components/dashboard-card";
import DashboardEmpty from "@/app/(app)/[username]/_components/dashboard-empty";
import { useDashboards } from "@/app/(app)/[username]/_components/dashboards-provider";
import { useDndDashboards } from "@/app/(app)/[username]/_components/dnd-dashboards-provider";
import { AppRouterOutputs } from "@/server/trpc/api/root";

type Props = {};

const placeholderData: AppRouterOutputs["ui"]["getDashboards"] = {
  dashboards: Array.from({ length: 12 }).map((_, index) => ({
    dashboard: {
      title: `Dashboard ${index + 1}`,
      isPublic: true,
      icon: "default",
      slug: "default",
      id: `id-${index}`,
    },
    user: {
      username: "username",
    },
    cardCount: 100,
  })),
  isOwner: false,
};

export default function ProfileDashboardCards({}: Props) {
  const {
    data,
    isPending,
    isLoadingError,
    notActive,
    username,
    isPendingUser,
    isLoadingErrorUser,
  } = useDashboards();
  const { orderedIds } = useDndDashboards();

  const orderedDashboards = data
    ? (orderedIds
        .map((id) => data.dashboards.find((d) => id === d.dashboard.id))
        .filter((c) => c !== undefined) as NonNullable<typeof data.dashboards>)
    : placeholderData.dashboards;

  return (
    <>
      {!isPendingUser && !isLoadingErrorUser && !username && (
        <DashboardEmpty>
          <h2 className="w-full text-center shrink min-w-0 font-medium text-base text-muted-foreground leading-tight">
            User doesn't exist.
          </h2>
        </DashboardEmpty>
      )}
      {!isPending && isLoadingError && (
        <DashboardEmpty>
          <h2 className="w-full text-center shrink min-w-0 font-medium text-base text-destructive leading-tight">
            Error loading dashboards.
          </h2>
        </DashboardEmpty>
      )}
      {!isPending &&
        !isLoadingError &&
        data &&
        data.dashboards &&
        data.dashboards.length === 0 && (
          <DashboardEmpty>
            <h2 className="w-full text-center shrink min-w-0 font-medium text-base text-muted-foreground leading-tight">
              {data.isOwner
                ? "You don't have any dashboards yet."
                : "No public dashboards yet."}
            </h2>
          </DashboardEmpty>
        )}
      {!notActive && (
        <>
          {orderedDashboards.map((dashboardObject, index) => (
            <DashboardCard
              key={dashboardObject.dashboard.id}
              title={dashboardObject.dashboard.title}
              cardCount={dashboardObject.cardCount}
              isPublic={dashboardObject.dashboard.isPublic}
              isOwner={data ? data.isOwner : false}
              href={`/${username}/${dashboardObject.dashboard.slug}`}
              isPending={isPending || isPendingUser}
              dashboardSlug={dashboardObject.dashboard.slug}
              dashboardId={dashboardObject.dashboard.id}
            />
          ))}
          {data?.isOwner && (
            <CreateDashboardButton
              modalId="create_dashboard_via_grid"
              variant="card"
            />
          )}
        </>
      )}
    </>
  );
}
