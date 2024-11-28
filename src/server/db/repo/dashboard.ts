import { db } from "@/server/db/db";
import { cardsTable, dashboardsTable, usersTable } from "@/server/db/schema";
import { and, asc, desc, eq } from "drizzle-orm";

type SharedProps = {
  userId: string;
  isOwner: boolean;
};

export async function getDashboard({
  userId,
  dashboardSlug,
  dashboardId,
  isOwner,
}:
  | (SharedProps & {
      dashboardSlug: string;
      dashboardId?: never;
    })
  | (SharedProps & {
      dashboardSlug?: never;
      dashboardId: string;
    })) {
  if (!dashboardSlug && !dashboardId) {
    throw new Error("Either dashboardSlug or dashboardId must be provided");
  }
  let whereFilter = [eq(dashboardsTable.userId, userId)];
  if (dashboardSlug) {
    whereFilter.push(eq(dashboardsTable.slug, dashboardSlug));
  } else if (dashboardId) {
    whereFilter.push(eq(dashboardsTable.id, dashboardId));
  }

  if (!isOwner) {
    whereFilter.push(eq(dashboardsTable.isPublic, true));
  }

  const res = await db
    .select({
      dashboard: {
        id: dashboardsTable.id,
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
  return { data: res[0], isOwner };
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

export async function getMaximumXOrderForDashboard({
  dashboardId,
}: {
  dashboardId: string;
}) {
  const res = await db
    .select({
      xOrder: cardsTable.xOrder,
    })
    .from(cardsTable)
    .where(eq(cardsTable.dashboardId, dashboardId))
    .orderBy(desc(cardsTable.xOrder))
    .limit(1);
  if (res.length === 0) return -1;
  return res[0].xOrder;
}

export type TGetDashboardResult = ReturnType<typeof getDashboard>;
export type TGetDashboardsResult = ReturnType<typeof getDashboards>;
