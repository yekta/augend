import { db } from "@/server/db/db";
import { cardsTable, dashboardsTable, usersTable } from "@/server/db/schema";
import { and, asc, desc, eq, inArray, isNull } from "drizzle-orm";

type SharedProps = {
  username: string;
  isOwner: boolean;
};

const dashboardBelongsToUsername = (username: string) =>
  inArray(
    dashboardsTable.userId,
    db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.username, username))
  );

export async function getDashboard({
  username,
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
  let whereFilter = [
    dashboardBelongsToUsername(username),
    isNull(dashboardsTable.deletedAt),
  ];
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
  username,
  isOwner,
}: {
  username: string;
  isOwner?: boolean;
}) {
  const whereFilter = [
    dashboardBelongsToUsername(username),
    isNull(dashboardsTable.deletedAt),
  ];

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
      desc(dashboardsTable.createdAt),
      desc(dashboardsTable.id)
    );
  return res;
}

export async function createDashboard({
  userId,
  title,
  slug,
  icon,
  xOrder,
}: {
  userId: string;
  title: string;
  slug: string;
  icon?: string;
  xOrder?: number;
}) {
  const id = crypto.randomUUID();
  await db.insert(dashboardsTable).values([
    {
      id,
      userId,
      title,
      slug,
      icon,
      xOrder,
    },
  ]);
  return id;
}

export async function isDashboardSlugAvailable({
  slug,
  userId,
}: {
  slug: string;
  userId: string;
}) {
  const res = await db
    .select({
      id: dashboardsTable.id,
    })
    .from(dashboardsTable)
    .where(
      and(eq(dashboardsTable.slug, slug), eq(dashboardsTable.userId, userId))
    )
    .limit(1);
  return res.length === 0;
}

export async function getMaximumDashboardXOrder({
  userId,
}: {
  userId: string;
}) {
  const res = await db
    .select({
      xOrder: dashboardsTable.xOrder,
    })
    .from(dashboardsTable)
    .where(
      and(eq(dashboardsTable.userId, userId), isNull(dashboardsTable.deletedAt))
    )
    .orderBy(desc(dashboardsTable.xOrder))
    .limit(1);
  if (res.length === 0) return -1;
  return res[0].xOrder;
}

export type TGetDashboardResult = ReturnType<typeof getDashboard>;
export type TGetDashboardsResult = ReturnType<typeof getDashboards>;
