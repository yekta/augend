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
      card: {
        id: cardsTable.id,
        cardTypeId: cardsTable.cardTypeId,
        values: cardsTable.values,
      },
      cardType: {
        id: cardTypesTable.id,
        inputs: cardTypesTable.inputs,
      },
      user: {
        id: usersTable.id,
        username: usersTable.username,
        email: usersTable.email,
        devId: usersTable.devId,
      },
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
