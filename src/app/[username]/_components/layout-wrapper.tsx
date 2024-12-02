"use client";

import DashboardTabs, { TRoute } from "@/components/navigation/dashboard-tabs";
import { AppRouterOutputs } from "@/server/trpc/api/root";
import { api } from "@/server/trpc/setup/react";

export default function LayoutWrapper({
  children,
  username,
  initialDashboards,
}: {
  children: Readonly<React.ReactNode>;
  username: string;
  initialDashboards?: AppRouterOutputs["ui"]["getDashboards"];
}) {
  const {
    data: dashboards,
    isPending,
    isLoadingError,
  } = api.ui.getDashboards.useQuery(
    { username },
    { initialData: initialDashboards }
  );

  const routes: TRoute[] = dashboards
    ? dashboards.map((d) => ({
        href: `/${d.user.username}/${d.dashboard.slug}`,
        icon: d.dashboard.icon,
        label: d.dashboard.title,
      }))
    : [];

  return (
    <>
      <DashboardTabs
        routes={routes}
        isPending={isPending}
        isLoadingError={isLoadingError}
      />
      {children}
      <div className="h-13 block md:hidden" />
    </>
  );
}
