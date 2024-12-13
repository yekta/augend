import { mainDashboardSlug } from "@/lib/constants";
import { db } from "@/server/db/db";
import { cardsTable, dashboardsTable, usersTable } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { and, asc, count, desc, eq, inArray, isNull } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

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
  includeCardCounts,
}: {
  username: string;
  isOwner?: boolean;
  includeCardCounts?: boolean;
}) {
  const whereFilter = [
    dashboardBelongsToUsername(username),
    isNull(dashboardsTable.deletedAt),
  ];

  if (!isOwner) {
    whereFilter.push(eq(dashboardsTable.isPublic, true));
  }

  if (includeCardCounts) {
    const res = await db
      .select({
        dashboard: {
          slug: dashboardsTable.slug,
          icon: dashboardsTable.icon,
          title: dashboardsTable.title,
          isPublic: dashboardsTable.isPublic,
        },
        user: {
          username: usersTable.username,
        },
        cardCount: count(cardsTable.id),
      })
      .from(dashboardsTable)
      .where(and(...whereFilter))
      .innerJoin(usersTable, eq(dashboardsTable.userId, usersTable.id))
      .leftJoin(cardsTable, eq(dashboardsTable.id, cardsTable.dashboardId))
      .groupBy(
        dashboardsTable.slug,
        dashboardsTable.icon,
        dashboardsTable.title,
        dashboardsTable.xOrder,
        dashboardsTable.createdAt,
        dashboardsTable.id,
        usersTable.username
      )
      .orderBy(
        asc(dashboardsTable.xOrder),
        desc(dashboardsTable.createdAt),
        desc(dashboardsTable.id)
      );
    return res;
  }

  const res = await db
    .select({
      dashboard: {
        slug: dashboardsTable.slug,
        icon: dashboardsTable.icon,
        title: dashboardsTable.title,
        isPublic: dashboardsTable.isPublic,
      },
      user: {
        username: usersTable.username,
        ethereumAddress: usersTable.ethereumAddress,
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
  return res.map((r) => ({ ...r, cardCount: null }));
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

export async function renameDashboard({
  title,
  currentSlug,
  newSlug,
  userId,
}: {
  title: string;
  currentSlug: string;
  newSlug: string;
  userId: string;
}) {
  const _newSlug =
    currentSlug === mainDashboardSlug ? mainDashboardSlug : newSlug;
  await db
    .update(dashboardsTable)
    .set({ title, slug: _newSlug })
    .where(
      and(
        eq(dashboardsTable.userId, userId),
        eq(dashboardsTable.slug, currentSlug)
      )
    );
  return {
    slug: _newSlug,
    title,
  };
}

export async function deleteDashboard({
  userId,
  slug,
}: {
  userId: string;
  slug: string;
}) {
  if (slug === mainDashboardSlug) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Cannot delete the main dashboard",
    });
  }
  await db
    .update(dashboardsTable)
    .set({ deletedAt: new Date() })
    .where(
      and(eq(dashboardsTable.userId, userId), eq(dashboardsTable.slug, slug))
    );
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
