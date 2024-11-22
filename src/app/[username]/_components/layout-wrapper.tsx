"use client";

import Navbar, { TRoute } from "@/components/navbar";
import { AppRouterOutputs } from "@/trpc/api/root";
import { api } from "@/trpc/setup/react";

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
      <Navbar
        routes={routes}
        isPending={isPending}
        isLoadingError={isLoadingError}
      />
      <div className="h-13 hidden md:block" />
      {children}
      <div className="h-13 block md:hidden" />
    </>
  );
}
