import { db } from "@/db/db";
import { dashboardsTable, usersTable } from "@/db/schema";
import { and, asc, desc, eq } from "drizzle-orm";

export async function getDashboard({
  userId,
  dashboardSlug,
  isOwner,
}: {
  userId: string;
  dashboardSlug: string;
  isOwner?: boolean;
}) {
  let whereFilter = [
    eq(dashboardsTable.slug, dashboardSlug),
    eq(dashboardsTable.userId, userId),
  ];
  if (!isOwner) {
    whereFilter.push(eq(dashboardsTable.isPublic, true));
  }
  const res = await db
    .select({
      dashboard: {
        slug: dashboardsTable.slug,
        title: dashboardsTable.title,
        icon: dashboardsTable.icon,
      },
      user: {
        username: usersTable.username,
      },
    })
    .from(dashboardsTable)
    .where(and(...whereFilter))
    .innerJoin(usersTable, eq(dashboardsTable.userId, usersTable.id));
  if (res.length === 0) return null;
  return res[0];
}

export async function getDashboards({
  userId,
  isOwner,
}: {
  userId: string;
  isOwner?: boolean;
}) {
  const whereFilter = [eq(dashboardsTable.userId, userId)];

  if (!isOwner) {
    whereFilter.push(eq(dashboardsTable.isPublic, true));
  }

  const res = await db
    .select({
      dashboard: {
        slug: dashboardsTable.slug,
        icon: dashboardsTable.icon,
        title: dashboardsTable.title,
      },
      user: {
        username: usersTable.username,
      },
    })
    .from(dashboardsTable)
    .where(and(...whereFilter))
    .innerJoin(usersTable, eq(dashboardsTable.userId, usersTable.id))
    .orderBy(
      asc(dashboardsTable.xOrder),
      desc(dashboardsTable.updatedAt),
      desc(dashboardsTable.id)
    );
  return res;
}

export type TGetDashboardResult = ReturnType<typeof getDashboard>;
export type TGetDashboardsResult = ReturnType<typeof getDashboards>;
