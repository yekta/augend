import { defaultCurrencyPreference } from "@/lib/constants";
import { db } from "@/server/db/db";
import { TCurrencyWithSelectedFields } from "@/server/db/repo/types";
import {
  cardsTable,
  cardTypeInputsTable,
  cardTypesTable,
  cardValuesTable,
  currenciesTable,
  dashboardsTable,
  usersTable,
} from "@/server/db/schema";
import {
  and,
  asc,
  desc,
  eq,
  exists,
  inArray,
  isNull,
  sql,
  SQL,
} from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

const primaryCurrencyAlias = alias(currenciesTable, "primary_currency");
const secondaryCurrencyAlias = alias(currenciesTable, "secondary_currency");
const tertiaryCurrencyAlias = alias(currenciesTable, "tertiary_currency");

function getCurrencyFields(curr: TCurrencyAlias): TCurrencyFieldSelectors {
  return {
    id: curr.id,
    ticker: curr.ticker,
    name: curr.name,
    symbol: curr.symbol,
    coinId: curr.coinId,
    isCrypto: curr.isCrypto,
    maxDecimalsPreferred: curr.maxDecimalsPreferred,
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
    isNull(dashboardsTable.deletedAt),
    isNull(cardsTable.deletedAt),
  ];
  if (!isOwner) {
    whereFilters.push(eq(dashboardsTable.isPublic, true));
  }
  const res = await db
    .select({
      card: {
        id: cardsTable.id,
      },
      cardType: {
        id: cardTypesTable.id,
      },
      user: {
        username: usersTable.username,
      },
      dashboard: {
        id: dashboardsTable.id,
        title: dashboardsTable.title,
      },
      value: {
        cardTypeInputId: cardValuesTable.cardTypeInputId,
        value: cardValuesTable.value,
        xOrder: cardValuesTable.xOrder,
      },
      primaryCurrency: getCurrencyFields(primaryCurrencyAlias),
      secondaryCurrency: getCurrencyFields(secondaryCurrencyAlias),
      tertiaryCurrency: getCurrencyFields(tertiaryCurrencyAlias),
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
    .leftJoin(cardValuesTable, eq(cardsTable.id, cardValuesTable.cardId))
    .leftJoin(
      cardTypeInputsTable,
      eq(cardValuesTable.cardTypeInputId, cardTypeInputsTable.id)
    )
    .where(and(...whereFilters))
    .orderBy(
      asc(cardsTable.xOrder),
      desc(cardsTable.updatedAt),
      desc(cardsTable.id)
    );
  const editedRes = isOwner
    ? res
    : res.map((r) => ({
        ...r,
        primary_currency: defaultCurrencyPreference.primary,
        secondary_currency: defaultCurrencyPreference.secondary,
        tertiary_currency: defaultCurrencyPreference.tertiary,
      }));

  type TResItem = (typeof editedRes)[number];

  let shapedRes: (Omit<TResItem, "value"> & {
    values: NonNullable<TResItem["value"]>[] | null;
  })[] = [];

  for (const row of editedRes) {
    const existingRowIndex = shapedRes.findIndex(
      (r) => r.card.id === row.card.id
    );
    let existingRow =
      existingRowIndex !== -1 ? shapedRes[existingRowIndex] : null;
    if (!existingRow) {
      const { value, ...rest } = row;
      shapedRes.push({
        ...rest,
        values: row.value ? [row.value] : null,
      });
      continue;
    }
    if (existingRow.values && row.value) {
      existingRow.values.push(row.value);
      existingRow.values = existingRow.values.sort(
        (a, b) => a.xOrder - b.xOrder
      );
      shapedRes[existingRowIndex] = existingRow;
    }
  }
  return shapedRes;
}

export async function createCard({
  cardTypeId,
  dashboardId,
  xOrder,
}: {
  cardTypeId: string;
  dashboardId: string;
  xOrder: number;
}) {
  const id = crypto.randomUUID();
  await db.insert(cardsTable).values({
    id,
    cardTypeId,
    dashboardId,
    xOrder,
  });
  return id;
}

const cardsDashboardBelongsToUser = (userId: string) =>
  exists(
    db
      .select({ id: dashboardsTable.id })
      .from(dashboardsTable)
      .where(
        and(
          eq(dashboardsTable.id, cardsTable.dashboardId),
          eq(dashboardsTable.userId, userId),
          isNull(dashboardsTable.deletedAt)
        )
      )
  );

export async function deleteCards({
  userId,
  ids,
}: {
  userId: string;
  ids: string[];
}) {
  return await db
    .delete(cardsTable)
    .where(
      and(inArray(cardsTable.id, ids), cardsDashboardBelongsToUser(userId))
    );
}

export async function reorderCards({
  userId,
  orderObjects,
}: {
  userId: string;
  orderObjects: { id: string; xOrder: number }[];
}) {
  if (orderObjects.length < 1) {
    throw new Error("orderObjects array must be provided be longer than 0");
  }

  let sqlChunks: SQL[] = [];
  let ids: string[] = [];

  sqlChunks.push(sql`(case`);

  for (const orderObject of orderObjects) {
    sqlChunks.push(
      sql`when ${cardsTable.id} = ${orderObject.id} then ${orderObject.xOrder}::integer`
    );
    ids.push(orderObject.id);
  }
  sqlChunks.push(sql`end)`);

  const finalSql = sql.join(sqlChunks, sql.raw(" "));

  await db
    .update(cardsTable)
    .set({ xOrder: finalSql })
    .where(
      and(inArray(cardsTable.id, ids), cardsDashboardBelongsToUser(userId))
    );
}

type TCurrencyAlias =
  | typeof primaryCurrencyAlias
  | typeof secondaryCurrencyAlias
  | typeof tertiaryCurrencyAlias;

type TCurrencyFieldSelectors = {
  [K in keyof TCurrencyWithSelectedFields]: TCurrencyAlias[K];
};
