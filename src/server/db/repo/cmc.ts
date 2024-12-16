import { db } from "@/server/db/db";
import {
  cmcCryptoInfoQuotesTable,
  cmcCryptoInfosTable,
  TInsertCmcCryptoInfo,
  TInsertCmcCryptoInfoQuote,
} from "@/server/db/schema";

export async function insertCmcCryptoInfos({
  infos,
}: {
  infos: TInsertCmcCryptoInfo[];
}) {
  if (infos.length < 1) {
    throw new Error("orderObjects array must be be longer than 0");
  }
  await db.insert(cmcCryptoInfosTable).values(infos);
  return true;
}

export async function insertCmcCryptoInfoQuotes({
  quotes,
}: {
  quotes: TInsertCmcCryptoInfoQuote[];
}) {
  await db.insert(cmcCryptoInfoQuotesTable).values(quotes);
  return true;
}
