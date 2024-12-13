import CurrentDashboardProvider from "@/app/[username]/[dashboard_slug]/_components/current-dashboard-provider";
import DashboardPage from "@/app/[username]/[dashboard_slug]/_components/dashboard-page";
import { siteTitle } from "@/lib/constants";
import { apiServer, HydrateClient } from "@/server/trpc/setup/server";
import { Metadata } from "next";

type Props = {
  params: Promise<{ dashboard_slug: string; username: string }>;
};

const notFoundMeta = {
  title: `Not Found | ${siteTitle}`,
  description: "Not found.",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username, dashboard_slug } = await params;

  const dashboardObject = await apiServer.ui.getDashboard({
    username,
    dashboardSlug: dashboard_slug,
  });

  if (!dashboardObject) return notFoundMeta;

  return {
    title: `${dashboardObject.data.dashboard.title} | @${dashboardObject.data.user.username} | ${siteTitle}`,
    description: dashboardObject.data.dashboard.title,
  };
}

export default async function Page({ params }: Props) {
  const { dashboard_slug, username } = await params;

  await apiServer.ui.getCards.prefetch({
    username,
    dashboardSlug: dashboard_slug,
  });

  return (
    <HydrateClient>
      <CurrentDashboardProvider
        username={username}
        dashboardSlug={dashboard_slug}
      >
        <DashboardPage />
      </CurrentDashboardProvider>
    </HydrateClient>
  );
}
