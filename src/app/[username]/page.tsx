import DashboardsGrid from "@/app/[username]/_components/dashboards-grid";
import DashboardsProvider from "@/app/[username]/_components/dashboards-provider";
import EditModeDashboardsProvider from "@/app/[username]/_components/edit-mode-dashboards-provider";
import OtherUserProvider from "@/app/[username]/_components/other-user-provider";
import ProfileDashboardCards from "@/app/[username]/_components/profile-dashboard-cards";
import { ProfileTitleBar } from "@/app/[username]/_components/profile-title-bar";
import { siteTitle } from "@/lib/constants";
import { apiServer, HydrateClient } from "@/server/trpc/setup/server";
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

  await Promise.all([
    apiServer.ui.getOtherUser.prefetch({ username }),
    apiServer.ui.getDashboards.prefetch({
      username,
      includeCardCounts,
    }),
  ]);

  return (
    <HydrateClient>
      <OtherUserProvider username={username}>
        <DashboardsProvider>
          <EditModeDashboardsProvider>
            <DashboardsGrid>
              <ProfileTitleBar />
              <ProfileDashboardCards />
            </DashboardsGrid>
          </EditModeDashboardsProvider>
        </DashboardsProvider>
      </OtherUserProvider>
    </HydrateClient>
  );
}
