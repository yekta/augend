import { defaultCurrencyPreference } from "@/lib/constants";
import { db, TDbTransaction } from "@/server/db/db";
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

export const primaryCurrencyAlias = alias(currenciesTable, "primary_currency");
export const secondaryCurrencyAlias = alias(
  currenciesTable,
  "secondary_currency"
);
export const tertiaryCurrencyAlias = alias(
  currenciesTable,
  "tertiary_currency"
);

export function getCurrencyFields(
  curr: TCurrencyAlias
): TCurrencyFieldSelectors {
  return {
    id: curr.id,
    ticker: curr.ticker,
    name: curr.name,
    symbol: curr.symbol,
    symbolCustomFont: curr.symbolCustomFont,
    coinId: curr.coinId,
    isCrypto: curr.isCrypto,
    maxDecimalsPreferred: curr.maxDecimalsPreferred,
  };
}

const cardValueCurrencyAlias = alias(currenciesTable, "cardValueCurrency");
const cardValuesThatRequireCurrencyFetch = [
  "calculator_currency_id",
  "currency_currency_id_base",
  "currency_currency_id_quote",
];

export async function getCards({
  username,
  dashboardSlug,
  isOwner,
}: {
  username: string;
  dashboardSlug: string;
  isOwner?: boolean;
}) {
  // 1) Build WHERE filters
  const whereFilters = [
    eq(dashboardsTable.slug, dashboardSlug),
    inArray(
      dashboardsTable.userId,
      db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.username, username))
    ),
    isNull(dashboardsTable.deletedAt),
    isNull(cardsTable.deletedAt),
  ];

  if (!isOwner) {
    whereFilters.push(eq(dashboardsTable.isPublic, true));
  }

  // 2) Single query with a safe LEFT JOIN on currencies
  const queryResult = await db
    .select({
      card: {
        id: cardsTable.id,
        variant: cardsTable.variant,
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

      // CardValue fields
      value: {
        cardTypeInputId: cardValuesTable.cardTypeInputId,
        value: cardValuesTable.value,
        xOrder: cardValuesTable.xOrder,
      },

      // User’s default currency fields
      primaryCurrency: getCurrencyFields(primaryCurrencyAlias),
      secondaryCurrency: getCurrencyFields(secondaryCurrencyAlias),
      tertiaryCurrency: getCurrencyFields(tertiaryCurrencyAlias),

      // Dynamic currency fields
      cardValueCurrency: {
        id: cardValueCurrencyAlias.id,
        name: cardValueCurrencyAlias.name,
        symbol: cardValueCurrencyAlias.symbol,
        symbolCustomFont: cardValueCurrencyAlias.symbolCustomFont,
        ticker: cardValueCurrencyAlias.ticker,
        isCrypto: cardValueCurrencyAlias.isCrypto,
        coinId: cardValueCurrencyAlias.coinId,
        maxDecimalsPreferred: cardValueCurrencyAlias.maxDecimalsPreferred,
      },
    })
    .from(cardsTable)
    .innerJoin(dashboardsTable, eq(cardsTable.dashboardId, dashboardsTable.id))
    .innerJoin(cardTypesTable, eq(cardsTable.cardTypeId, cardTypesTable.id))
    .innerJoin(usersTable, eq(dashboardsTable.userId, usersTable.id))
    // The user's default currencies:
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
    // Card values + card type inputs
    .leftJoin(cardValuesTable, eq(cardsTable.id, cardValuesTable.cardId))
    .leftJoin(
      cardTypeInputsTable,
      eq(cardValuesTable.cardTypeInputId, cardTypeInputsTable.id)
    )
    // 3) Conditionally join currencies by casting UUID -> text
    .leftJoin(
      cardValueCurrencyAlias,
      and(
        // The cardTypeInputId must be one of the currency IDs
        inArray(
          cardValuesTable.cardTypeInputId,
          cardValuesThatRequireCurrencyFetch
        ),
        // Compare text(column) to text(column):
        eq(sql`${cardValueCurrencyAlias.id}::text`, cardValuesTable.value)
      )
    )
    .where(and(...whereFilters))
    .orderBy(
      asc(cardsTable.xOrder),
      desc(cardsTable.createdAt),
      desc(cardsTable.id)
    );

  // 4) If the user is not the owner, override currency fields
  const editedQueryResult = isOwner
    ? queryResult
    : queryResult.map((row) => ({
        ...row,
        primaryCurrency: defaultCurrencyPreference.primary,
        secondaryCurrency: defaultCurrencyPreference.secondary,
        tertiaryCurrency: defaultCurrencyPreference.tertiary,
      }));

  // 5) Shape the final result
  type TRow = (typeof editedQueryResult)[number];

  const shapedRes: Array<{
    card: TRow["card"];
    cardType: TRow["cardType"];
    user: TRow["user"];
    dashboard: TRow["dashboard"];
    values: NonNullable<TRow["value"]>[] | null;
    primaryCurrency: TRow["primaryCurrency"];
    secondaryCurrency: TRow["secondaryCurrency"];
    tertiaryCurrency: TRow["tertiaryCurrency"];
    cardValueCurrencies: Array<TRow["cardValueCurrency"]>;
  }> = [];

  for (const row of editedQueryResult) {
    const existingIndex = shapedRes.findIndex((s) => s.card.id === row.card.id);

    if (existingIndex === -1) {
      // No entry for this card yet
      shapedRes.push({
        card: row.card,
        cardType: row.cardType,
        user: row.user,
        dashboard: row.dashboard,
        values: row.value ? [row.value] : null,
        primaryCurrency: row.primaryCurrency,
        secondaryCurrency: row.secondaryCurrency,
        tertiaryCurrency: row.tertiaryCurrency,
        cardValueCurrencies: row.cardValueCurrency?.id
          ? [row.cardValueCurrency]
          : [],
      });
    } else {
      // We already have this card in shapedRes
      const existing = shapedRes[existingIndex];

      // Add the new "value" if present
      if (row.value) {
        if (!existing.values) {
          existing.values = [];
        }
        existing.values.push(row.value);
        // Keep them sorted if needed
        existing.values.sort((a, b) => a.xOrder - b.xOrder);
      }

      // Add the new "cardValueCurrency" if present
      if (row.cardValueCurrency?.id) {
        existing.cardValueCurrencies.push(row.cardValueCurrency);
      }

      shapedRes[existingIndex] = existing;
    }
  }

  return shapedRes;
}

export async function createCard({
  cardTypeId,
  dashboardId,
  xOrder,
  variant,
  id = crypto.randomUUID(),
  tx,
}: {
  cardTypeId: string;
  dashboardId: string;
  xOrder: number;
  variant?: string;
  id?: string;
  tx?: TDbTransaction;
}) {
  const client = tx ? tx : db;
  await client.insert(cardsTable).values({
    id,
    cardTypeId,
    dashboardId,
    xOrder,
    variant,
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
    throw new Error("orderObjects array must be be longer than 0");
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

  const res = await db
    .update(cardsTable)
    .set({ xOrder: finalSql })
    .where(
      and(inArray(cardsTable.id, ids), cardsDashboardBelongsToUser(userId))
    )
    .returning({ id: cardsTable.id, xOrder: cardsTable.xOrder });
  return res;
}

export async function getMaximumCardXOrder({
  dashboardId,
}: {
  dashboardId: string;
}) {
  const res = await db
    .select({
      xOrder: cardsTable.xOrder,
    })
    .from(cardsTable)
    .innerJoin(dashboardsTable, eq(cardsTable.dashboardId, dashboardsTable.id))
    .where(
      and(
        eq(cardsTable.dashboardId, dashboardId),
        isNull(dashboardsTable.deletedAt)
      )
    )
    .orderBy(desc(cardsTable.xOrder))
    .limit(1);
  if (res.length === 0) return -1;
  return res[0].xOrder;
}

type TCurrencyAlias =
  | typeof primaryCurrencyAlias
  | typeof secondaryCurrencyAlias
  | typeof tertiaryCurrencyAlias;

type TCurrencyFieldSelectors = {
  [K in keyof TCurrencyWithSelectedFields]: TCurrencyAlias[K];
};
