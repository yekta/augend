import { Button } from "@/components/ui/button";
import { mainDashboardSlug, siteDescription, siteTitle } from "@/lib/constants";
import { auth } from "@/server/auth";
import { getUser } from "@/server/db/repo/user";
import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
};

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    const user = await getUser({ userId: session.user.id });
    if (user) {
      redirect(`/${user.username}/${mainDashboardSlug}`);
    }
  }
  return (
    <div className="w-full flex-1 flex flex-col items-center">
      <div className="w-full max-w-7xl flex justify-center items-start">
        <div className="flex flex-col items-center max-w-full px-5 md:px-8 pt-8 md:pt-16">
          <h1 className="text-4xl md:text-5xl font-bold text-center leading-none tracking-tight">
            Track financial assets
          </h1>
          <p className="text-lg text-center mt-2 max-w-lg text-muted-foreground">
            Track crypto, NFTs, Uniswap positions, stocks, financial trends, and
            more with highly customizable dashboards.
          </p>
          <Button className="mt-4">
            <Link href="/sign-in">Get Started</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
