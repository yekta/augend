import { db } from "@/server/db/db";
import { currenciesTable } from "@/server/db/schema";
import { inArray } from "drizzle-orm";

export async function getCurrencies({ ids }: { ids: string[] }) {
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
    .where(inArray(currenciesTable.id, ids));
  return res;
}

export type TGetCurrenciesResult = ReturnType<typeof getCurrencies>;
