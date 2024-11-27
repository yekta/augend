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
import { and, asc, desc, eq } from "drizzle-orm";
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
        primary_currency: defaultPrimaryCurrency,
        secondary_currency: defaultSecondaryCurrency,
        tertiary_currency: defaultTertiaryCurrency,
      }));

  type TResItem = (typeof editedRes)[number];

  const shapedRes: (Omit<TResItem, "value"> & {
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

type TCurrencyAlias =
  | typeof primaryCurrencyAlias
  | typeof secondaryCurrencyAlias
  | typeof tertiaryCurrencyAlias;

type TCurrencyFieldSelectors = {
  [K in keyof TCurrencyWithSelectedFields]: TCurrencyAlias[K];
};

const defaultPrimaryCurrency: TCurrencyWithSelectedFields = {
  id: "81260265-7335-4d20-9064-0357e75690d6",
  ticker: "USD",
  coinId: null,
  isCrypto: false,
  maxDecimalsPreferred: 2,
  name: "United States Dollar",
  symbol: "$",
};

const defaultSecondaryCurrency: TCurrencyWithSelectedFields = {
  id: "d11e7514-5c8e-423d-bc94-efa24bf0f423",
  ticker: "EUR",
  coinId: null,
  isCrypto: false,
  maxDecimalsPreferred: 2,
  name: "Euro",
  symbol: "€",
};

const defaultTertiaryCurrency: TCurrencyWithSelectedFields = {
  id: "9710ede3-9d6e-4c3f-8c1f-3664263e4a8e",
  ticker: "GBP",
  coinId: null,
  isCrypto: false,
  maxDecimalsPreferred: 2,
  name: "British Pound Sterling",
  symbol: "£",
};
