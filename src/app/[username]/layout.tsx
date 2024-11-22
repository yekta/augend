import { getUser } from "@/app/[username]/_lib/helpers";
import Navbar, { TRoute } from "@/components/navbar";
import { db } from "@/db/db";
import { dashboardsTable, usersTable } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { asc, desc, eq } from "drizzle-orm";
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

  console.log("[username]/layout | Auth | ", Date.now() - current);
  current = Date.now();

  const user = await getUser({ username });
  console.log("[username]/layout | getUser | ", Date.now() - current);
  current = Date.now();

  let userId = userIdRaw;
  if (isDev) {
    const uids = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.devId, userId));
    userId = uids[0].id;
  }
  console.log("[username]/layout | isDev | ", Date.now() - current);
  current = Date.now();

  if (user === null) return notFound();

  const dashboardObjects = await db
    .select({
      dashboard: dashboardsTable,
      user: usersTable,
    })
    .from(dashboardsTable)
    .where(eq(dashboardsTable.userId, userId))
    .innerJoin(usersTable, eq(dashboardsTable.userId, usersTable.id))
    .orderBy(
      asc(dashboardsTable.xOrder),
      desc(dashboardsTable.updatedAt),
      desc(dashboardsTable.id)
    );

  console.log("[username]/layout | getDashboards | ", Date.now() - current);
  current = Date.now();

  const routes: TRoute[] = dashboardObjects.map((d) => ({
    href: `/${d.user.username}/${d.dashboard.slug}`,
    icon: d.dashboard.icon,
    label: d.dashboard.title,
  }));

  console.log("[username]/layout | Total |", Date.now() - start);

  return (
    <>
      <Navbar routes={routes} />
      <div className="h-13 hidden md:block" />
      {children}
      <div className="h-13 block md:hidden" />
    </>
  );
}
