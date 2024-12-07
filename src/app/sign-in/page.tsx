import SignInCard from "@/components/auth/sign-in-card";
import { siteTitle } from "@/lib/constants";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: `Sign In | ${siteTitle}`,
  description: "Start tracking your financial assets with Augend.",
};

type Props = {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
};

export default async function SignInPage({ searchParams }: Props) {
  const { callbackUrl, error } = await searchParams;
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center px-4 pt-6 pb-[calc(8vh+3rem)]">
      <SignInCard error={error} callbackUrl={callbackUrl} />
    </div>
  );
}
