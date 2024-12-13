import ProfileSections from "@/app/[username]/_components/profile-sections";
import Blockies from "@/components/blockies/blockies";
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
      <div className="w-full flex flex-col items-center flex-1">
        <div className="w-full flex flex-col max-w-7xl px-1 pb-16 md:pb-20 md:px-5 pt-1 md:pt-2">
          <div className="w-full flex flex-col px-1 pb-1 md:pb-2 gap-4">
            <h1 className="w-full flex items-center gap-2 justify-start border border-transparent px-2 py-1.75 md:py-0.5 font-bold text-xl md:text-2xl leading-none">
              <Blockies
                width={24}
                height={24}
                className="size-6 rounded-full -my-1"
                address={user?.ethereumAddress || username}
              />
              <span className="shrink min-w-0 truncate">{username}</span>
            </h1>
          </div>
          <ProfileSections username={username} />
        </div>
      </div>
    </HydrateClient>
  );
}
