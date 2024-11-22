import { db } from "@/db/db";
import { currenciesTable } from "@/db/schema";
import { inArray } from "drizzle-orm";

export async function getCurrencies({ ids }: { ids: string[] }) {
  const res = await db
    .select({
      id: currenciesTable.id,
      name: currenciesTable.name,
      symbol: currenciesTable.symbol,
      ticker: currenciesTable.ticker,
      is_crypto: currenciesTable.is_crypto,
      coin_id: currenciesTable.coin_id,
      max_decimals_preferred: currenciesTable.max_decimals_preferred,
    })
    .from(currenciesTable)
    .where(inArray(currenciesTable.id, ids));
  return res;
}

export type TGetCurrenciesResult = ReturnType<typeof getCurrencies>;
