import { db } from "@/db/db";
import {
  cardsTable,
  cardTypesTable,
  currenciesTable,
  dashboardsTable,
  usersTable,
} from "@/db/schema";
import { and, asc, desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

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
  const primaryCurrencyAlias = alias(currenciesTable, "primary_currency");
  const secondaryCurrencyAlias = alias(currenciesTable, "secondary_currency");
  const tertiaryCurrencyAlias = alias(currenciesTable, "tertiary_currency");
  const res = await db
    .select({
      card: cardsTable,
      dashboard: dashboardsTable,
      card_type: cardTypesTable,
      user: usersTable,
      primary_currency: primaryCurrencyAlias,
      secondary_currency: secondaryCurrencyAlias,
      tertiary_currency: tertiaryCurrencyAlias,
    })
    .from(cardsTable)
    .innerJoin(dashboardsTable, eq(cardsTable.dashboardId, dashboardsTable.id))
    .innerJoin(cardTypesTable, eq(cardsTable.cardTypeId, cardTypesTable.id))
    .innerJoin(usersTable, eq(dashboardsTable.userId, usersTable.id))
    .innerJoin(
      primaryCurrencyAlias,
      eq(usersTable.primaryCurrencyId, primaryCurrencyAlias.id)
    )
    .innerJoin(
      secondaryCurrencyAlias,
      eq(usersTable.secondaryCurrencyId, secondaryCurrencyAlias.id)
    )
    .innerJoin(
      tertiaryCurrencyAlias,
      eq(usersTable.tertiaryCurrencyId, tertiaryCurrencyAlias.id)
    )
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
    .select({
      dashboard: dashboardsTable,
      user: usersTable,
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
