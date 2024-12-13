import DashboardsProvider from "@/app/[username]/_components/dashboards-provider";
import EditModeDashboardsProvider from "@/app/[username]/_components/edit-mode-dashboards-provider";
import ProfileSections from "@/app/[username]/_components/profile-sections";
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

  const [user, _] = await Promise.all([
    apiServer.ui.getOtherUser({ username }),
    apiServer.ui.getDashboards.prefetch({ username, includeCardCounts: true }),
  ]);

  return (
    <HydrateClient>
      <DashboardsProvider
        username={username}
        ethereumAddress={user?.ethereumAddress}
      >
        <EditModeDashboardsProvider>
          <div className="w-full flex flex-col items-center flex-1">
            <div className="w-full flex flex-col max-w-7xl px-1 pb-16 md:pb-20 md:px-5 pt-1 md:pt-2">
              <ProfileTitleBar />
              <ProfileSections />
            </div>
          </div>
        </EditModeDashboardsProvider>
      </DashboardsProvider>
    </HydrateClient>
  );
}
