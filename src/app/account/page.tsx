import UserFullProvider from "@/app/[username]/[dashboard_slug]/_components/user-full-provider";
import AccountSections from "@/app/account/_components/sections";
import { siteTitle } from "@/lib/constants";
import { auth } from "@/server/auth/auth";
import { apiServer } from "@/server/trpc/setup/server";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: `Account | ${siteTitle}`,
  description: `Manage your account on ${siteTitle}.`,
};

type Props = {};

export default async function Page({}: Props) {
  const session = await auth();
  if (!session) {
    return redirect("/sign-in?callbackUrl=/account");
  }
  const [userInitialData, currenciesInitialData] = await Promise.all([
    apiServer.ui.getUserFull(),
    apiServer.ui.getCurrencies({ forexOnly: true }),
  ]);
  return (
    <UserFullProvider
      userInitialData={userInitialData}
      currenciesInitialData={currenciesInitialData}
    >
      <div className="w-full flex flex-col items-center flex-1">
        <div className="w-full flex flex-col max-w-7xl px-1 pb-16 md:pb-20 md:px-5 pt-1 md:pt-2">
          <div className="w-full flex flex-col px-1 pb-1 md:pb-2 gap-4">
            <h1 className="w-full border border-transparent px-2 py-1.75 md:py-0.5 font-bold text-xl md:text-2xl leading-none">
              Account
            </h1>
            <AccountSections />
          </div>
        </div>
      </div>
    </UserFullProvider>
  );
}
