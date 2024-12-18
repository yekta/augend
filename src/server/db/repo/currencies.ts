import { db } from "@/server/db/db";
import { currenciesTable } from "@/server/db/schema";
import { and, asc, eq, inArray } from "drizzle-orm";

export async function getCurrencies({
  ids,
  category,
}: {
  ids?: string[];
  category: "all" | "forex" | "crypto";
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
            category === "forex"
              ? eq(currenciesTable.isCrypto, false)
              : category === "crypto"
              ? eq(currenciesTable.isCrypto, true)
              : undefined
          )
        : category === "forex"
        ? eq(currenciesTable.isCrypto, false)
        : category === "crypto"
        ? eq(currenciesTable.isCrypto, true)
        : undefined
    )
    .orderBy(asc(currenciesTable.xOrder), asc(currenciesTable.name));
  return res;
}

export type TGetCurrenciesResult = ReturnType<typeof getCurrencies>;
