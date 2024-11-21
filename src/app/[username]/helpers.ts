import { db } from "@/db/db";
import {
  cardsTable,
  cardTypesTable,
  dashboardsTable,
  usersTable,
} from "@/db/schema";
import { and, asc, desc, eq } from "drizzle-orm";

export async function getUser({
  userId,
  username,
}:
  | { userId: string; username?: never }
  | { userId?: never; username: string }) {
  if (userId !== undefined) {
    const res = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));
    if (res.length === 0) return null;
    return res[0];
  } else if (username !== undefined) {
    const res = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, username));
    if (res.length === 0) return null;
    return res[0];
  }
  return null;
}

export async function getCards({
  userId,
  dashboardSlug,
}: {
  userId: string;
  dashboardSlug: string;
}) {
  const res = await db
    .select()
    .from(cardsTable)
    .innerJoin(dashboardsTable, eq(cardsTable.dashboardId, dashboardsTable.id))
    .innerJoin(cardTypesTable, eq(cardsTable.cardTypeId, cardTypesTable.id))
    .innerJoin(usersTable, eq(dashboardsTable.userId, usersTable.id))
    .where(
      and(
        eq(dashboardsTable.slug, dashboardSlug),
        eq(dashboardsTable.userId, userId)
      )
    )
    .orderBy(
      asc(cardsTable.xOrder),
      desc(cardsTable.updatedAt),
      desc(cardsTable.id)
    );
  return res;
}

export async function getDashboard({
  userId,
  dashboardSlug,
}: {
  userId: string;
  dashboardSlug: string;
}) {
  const res = await db
    .select()
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
