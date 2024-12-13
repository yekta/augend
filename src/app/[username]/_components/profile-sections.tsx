"use client";

import DashboardCard from "@/app/[username]/_components/dashboard-card";
import DashboardEmpty from "@/app/[username]/_components/dashboard-empty";
import { useDashboards } from "@/app/[username]/_components/dashboards-provider";
import { useDndDashboards } from "@/app/[username]/_components/dnd-dashboards-provider";
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
    cardCount: 1000,
  })),
  isOwner: false,
};

export default function ProfileSections({}: Props) {
  const { data, isPending, isLoadingError, username } = useDashboards();
  const { orderedIds } = useDndDashboards();

  const orderedDashboards = data
    ? (orderedIds
        .map((id) => data.dashboards.find((d) => id === d.dashboard.id))
        .filter((c) => c !== undefined) as NonNullable<typeof data.dashboards>)
    : placeholderData.dashboards;

  return (
    <>
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
      {(isPending || (data && data.dashboards.length > 0)) &&
        orderedDashboards.map((dashboardObject, index) => (
          <DashboardCard
            key={dashboardObject.dashboard.id}
            title={dashboardObject.dashboard.title}
            cardCount={dashboardObject.cardCount}
            isPublic={dashboardObject.dashboard.isPublic}
            isOwner={data ? data.isOwner : false}
            href={`/${username}/${dashboardObject.dashboard.slug}`}
            isPending={isPending}
            dashboardSlug={dashboardObject.dashboard.slug}
            dashboardId={dashboardObject.dashboard.id}
          />
        ))}
    </>
  );
}
