import { db } from "@/server/db/db";
import { currenciesTable } from "@/server/db/schema";
import { and, eq, inArray } from "drizzle-orm";

export async function getCurrencies({
  ids,
  forexOnly,
}: {
  ids?: string[];
  forexOnly?: boolean;
}) {
  const res = await db
    .select({
      id: currenciesTable.id,
      name: currenciesTable.name,
      symbol: currenciesTable.symbol,
      ticker: currenciesTable.ticker,
      isCrypto: currenciesTable.isCrypto,
      coinId: currenciesTable.coinId,
      maxDecimalsPreferred: currenciesTable.maxDecimalsPreferred,
    })
    .from(currenciesTable)
    .where(
      ids
        ? and(
            inArray(currenciesTable.id, ids),
            forexOnly === true ? eq(currenciesTable.isCrypto, false) : undefined
          )
        : forexOnly === true
        ? eq(currenciesTable.isCrypto, false)
        : undefined
    );
  return res;
}

export type TGetCurrenciesResult = ReturnType<typeof getCurrencies>;
