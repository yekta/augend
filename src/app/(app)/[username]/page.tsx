import DashboardsGrid from "@/app/(app)/[username]/_components/dashboards-grid";
import DashboardsProvider from "@/app/(app)/[username]/_components/dashboards-provider";
import EditModeDashboardsProvider from "@/app/(app)/[username]/_components/edit-mode-dashboards-provider";
import OtherUserProvider from "@/app/(app)/[username]/_components/other-user-provider";
import ProfileDashboardCards from "@/app/(app)/[username]/_components/profile-dashboard-cards";
import { ProfileTitleBar } from "@/app/(app)/[username]/_components/profile-title-bar";
import { siteTitle } from "@/lib/constants";
import { apiServer } from "@/server/trpc/setup/server";
import { Metadata } from "next";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;

  return {
    title: `@${username.toLowerCase()} | ${siteTitle}`,
    description: `Check out @${username} on ${siteTitle}.`,
  };
}

type Props = {
  params: Promise<{ username: string }>;
};

export default async function Page({ params }: Props) {
  const { username } = await params;
  const includeCardCounts = true;

  const start = performance.now();
  const [otherUserData, dashboardsData] = await Promise.all([
    apiServer.ui.getOtherUser({ username }),
    apiServer.ui.getDashboards({
      username,
      includeCardCounts,
    }),
  ]);
  const duration = Math.round(performance.now() - start);
  console.log(
    `[PREFETCH]: getOtherUser & getDashboards | ${username} | ${duration}ms`
  );

  return (
    <OtherUserProvider username={username} initialData={otherUserData}>
      <DashboardsProvider initialData={dashboardsData}>
        <EditModeDashboardsProvider>
          <DashboardsGrid>
            <ProfileTitleBar />
            <ProfileDashboardCards />
          </DashboardsGrid>
        </EditModeDashboardsProvider>
      </DashboardsProvider>
    </OtherUserProvider>
  );
}
