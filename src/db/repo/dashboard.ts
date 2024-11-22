import { db } from "@/db/db";
import { dashboardsTable, usersTable } from "@/db/schema";
import { and, asc, desc, eq } from "drizzle-orm";

export async function getDashboard({
  userId,
  dashboardSlug,
}: {
  userId: string;
  dashboardSlug: string;
}) {
  const res = await db
    .select({
      dashboard: {
        id: dashboardsTable.id,
        slug: dashboardsTable.slug,
        title: dashboardsTable.title,
      },
      user: {
        id: usersTable.id,
        username: usersTable.username,
        email: usersTable.email,
        devId: usersTable.devId,
      },
    })
    .from(dashboardsTable)
    .where(
      and(
        eq(dashboardsTable.slug, dashboardSlug),
        eq(dashboardsTable.userId, userId)
      )
    )
    .innerJoin(usersTable, eq(dashboardsTable.userId, usersTable.id));
  if (res.length === 0) return null;
  return res[0];
}

export async function getDashboards({ userId }: { userId: string }) {
  const res = await db
    .select({
      dashboard: {
        id: dashboardsTable.id,
        slug: dashboardsTable.slug,
        icon: dashboardsTable.icon,
        title: dashboardsTable.title,
      },
      user: {
        id: usersTable.id,
        username: usersTable.username,
        email: usersTable.email,
        devId: usersTable.devId,
      },
    })
    .from(dashboardsTable)
    .where(eq(dashboardsTable.userId, userId))
    .innerJoin(usersTable, eq(dashboardsTable.userId, usersTable.id))
    .orderBy(
      asc(dashboardsTable.xOrder),
      desc(dashboardsTable.updatedAt),
      desc(dashboardsTable.id)
    );
  return res;
}
