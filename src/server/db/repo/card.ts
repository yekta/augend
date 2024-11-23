import { db } from "@/server/db/db";
import {
  cardsTable,
  cardTypesTable,
  currenciesTable,
  dashboardsTable,
  usersTable,
} from "@/server/db/schema";
import { and, asc, desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

const primaryCurrencyAlias = alias(currenciesTable, "primary_currency");
const secondaryCurrencyAlias = alias(currenciesTable, "secondary_currency");
const tertiaryCurrencyAlias = alias(currenciesTable, "tertiary_currency");

function getCurrencyFields(
  curr:
    | typeof primaryCurrencyAlias
    | typeof secondaryCurrencyAlias
    | typeof tertiaryCurrencyAlias
) {
  return {
    id: curr.id,
    ticker: curr.ticker,
    name: curr.name,
    symbol: curr.symbol,
    coin_id: curr.coin_id,
    is_crypto: curr.is_crypto,
    max_decimals_preferred: curr.max_decimals_preferred,
  };
}

export async function getCards({
  userId,
  dashboardSlug,
  isOwner,
}: {
  userId: string;
  dashboardSlug: string;
  isOwner?: boolean;
}) {
  let whereFilters = [
    eq(dashboardsTable.slug, dashboardSlug),
    eq(dashboardsTable.userId, userId),
  ];
  if (!isOwner) {
    whereFilters.push(eq(dashboardsTable.isPublic, true));
  }
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
      primary_currency: getCurrencyFields(primaryCurrencyAlias),
      secondary_currency: getCurrencyFields(secondaryCurrencyAlias),
      tertiary_currency: getCurrencyFields(tertiaryCurrencyAlias),
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
    .where(and(...whereFilters))
    .orderBy(
      asc(cardsTable.xOrder),
      desc(cardsTable.updatedAt),
      desc(cardsTable.id)
    );
  return res;
}

export type TGetCardsResult = ReturnType<typeof getCards>;
