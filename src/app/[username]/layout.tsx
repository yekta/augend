import Navbar, { TRoute } from "@/components/navbar";
import { getDashboards } from "@/db/repo/dashboard";
import { getRealUserId, getUser } from "@/db/repo/user";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

const isDev = process.env.NODE_ENV === "development";

export default async function UserLayout({
  params,
  children,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}>) {
  const start = Date.now();
  let current = Date.now();

  const { username } = await params;
  const { userId: userIdRaw } = await auth();
  if (!userIdRaw) return notFound();

  console.log(`[username]/layout | Auth | ${Date.now() - current}ms`);
  current = Date.now();

  const user = await getUser({ username });
  console.log(`[username]/layout | getUser | ${Date.now() - current}ms`);
  current = Date.now();

  let userId: string | null = userIdRaw;
  if (isDev) {
    userId = await getRealUserId({ userDevId: userIdRaw });
    if (userId === null) return notFound();
  }
  console.log(`[username]/layout | isDev | ${Date.now() - current}ms`);
  current = Date.now();

  if (user === null) return notFound();

  const dashboardObjects = await getDashboards({ userId: user.id });

  console.log(`[username]/layout | getDashboards | ${Date.now() - current}ms`);
  current = Date.now();

  const routes: TRoute[] = dashboardObjects.map((d) => ({
    href: `/${d.user.username}/${d.dashboard.slug}`,
    icon: d.dashboard.icon,
    label: d.dashboard.title,
  }));

  console.log(`[username]/layout | Total | ${Date.now() - start}ms`);

  return (
    <>
      <Navbar routes={routes} />
      <div className="h-13 hidden md:block" />
      {children}
      <div className="h-13 block md:hidden" />
    </>
  );
}
