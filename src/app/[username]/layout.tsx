import Navbar, { TRoute } from "@/components/navbar";
import { db } from "@/db/db";
import { dashboardsTable, usersTable } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { asc, desc, eq } from "drizzle-orm";

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
  if (!userIdRaw) return <div>Not found!</div>;

  const users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username));

  let userId = userIdRaw;
  if (isDev) {
    const uids = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.devId, userId));
    userId = uids[0].id;
  }

  if (users.length === 0 || users[0].id !== userId)
    return <div>Not found...</div>;

  const dashboards = await db
    .select()
    .from(dashboardsTable)
    .where(eq(dashboardsTable.userId, userId))
    .innerJoin(usersTable, eq(dashboardsTable.userId, usersTable.id))
    .orderBy(
      asc(dashboardsTable.xOrder),
      desc(dashboardsTable.updatedAt),
      desc(dashboardsTable.id)
    );

  const routes: TRoute[] = dashboards.map((d) => ({
    href: `/${d.users.username}/${d.dashboards.slug}`,
    icon: d.dashboards.icon,
    label: d.dashboards.title,
  }));

  return (
    <div className="w-full flex flex-col min-h-[100svh]">
      <Navbar routes={routes} />
      <div className="h-13 hidden md:block" />
      {children}
      <div className="h-13 block md:hidden" />
    </div>
  );
}
