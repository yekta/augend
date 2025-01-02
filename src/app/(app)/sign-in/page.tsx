import SignInCard from "@/components/auth/sign-in-card";
import { mainDashboardSlug, siteTitle } from "@/lib/constants";
import { auth } from "@/server/auth/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: `Sign In | ${siteTitle}`,
  description: `Start tracking your financial assets with ${siteTitle}.`,
};

type Props = {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
};

export default async function SignInPage({ searchParams }: Props) {
  const { callbackUrl, error } = await searchParams;
  let cleanedCallbackUrl: string | undefined = undefined;

  if (callbackUrl) {
    if (callbackUrl.startsWith("/")) {
      cleanedCallbackUrl = callbackUrl;
    } else {
      try {
        const url = new URL(callbackUrl);
        const { pathname, search } = url;
        cleanedCallbackUrl = pathname + search;
      } catch (e) {
        console.log(e);
      }
    }
  }

  const session = await auth();
  if (session?.user) {
    redirect(
      cleanedCallbackUrl || `/${session.user.username}/${mainDashboardSlug}`
    );
  }

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center px-4 pt-6 pb-[calc(6vh+2rem)]">
      <SignInCard error={error} callbackUrl={cleanedCallbackUrl} />
    </div>
  );
}
