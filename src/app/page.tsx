import { mainDashboardSlug, siteDescription, siteTitle } from "@/lib/constants";
import { auth } from "@/server/auth";
import { getUser } from "@/server/db/repo/user";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
};

export default async function Home() {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  } else {
    const user = await getUser({ userId: session.user.id });
    if (user) {
      redirect(`/${user.username}/${mainDashboardSlug}`);
    }
  }
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center p-5 pb-[calc(8vh+1.5rem)] text-center">
      Home
    </div>
  );
}
