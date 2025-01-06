import CurrentDashboardProvider from "@/app/(app)/[username]/[dashboard_slug]/_components/current-dashboard-provider";
import DashboardPage from "@/app/(app)/[username]/[dashboard_slug]/_components/dashboard-page";
import { siteTitle } from "@/lib/constants";
import { apiServer } from "@/server/trpc/setup/server";
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

  const start = performance.now();
  const dataCards = await apiServer.ui.getCards({
    username,
    dashboardSlug: dashboard_slug,
  });
  const duration = Math.round(performance.now() - start);
  console.log(
    `[PREFETCH]: getCards | ${username}/${dashboard_slug} | ${duration}ms`
  );

  return (
    <CurrentDashboardProvider
      username={username}
      dashboardSlug={dashboard_slug}
      initialData={dataCards}
    >
      <DashboardPage />
    </CurrentDashboardProvider>
  );
}
