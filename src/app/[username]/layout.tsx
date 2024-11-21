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
  const { username } = await params;
  const { userId: userIdRaw } = await auth();
  if (!userIdRaw) return notFound();

  const user = await getUser({ username });

  let userId = userIdRaw;
  if (isDev) {
    const uids = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.devId, userId));
    userId = uids[0].id;
  }

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

  const routes: TRoute[] = dashboardObjects.map((d) => ({
    href: `/${d.user.username}/${d.dashboard.slug}`,
    icon: d.dashboard.icon,
    label: d.dashboard.title,
  }));

  return (
    <>
      <Navbar routes={routes} />
      <div className="h-13 hidden md:block" />
      {children}
      <div className="h-13 block md:hidden" />
    </>
  );
}
