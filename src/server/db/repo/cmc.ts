import { db } from "@/server/db/db";
import {
  cmcCryptoDefinitionsTable,
  cmcCryptoInfosTable,
  cmcCryptoQuotesTable,
  TInsertCmcCryptoDefinition,
  TInsertCmcCryptoInfo,
  TInsertCmcCryptoQuote,
} from "@/server/db/schema";
import {
  TCmcGetCryptosResult,
  TCmcGetCryptosResultRaw,
} from "@/server/trpc/api/crypto/cmc/types";
import { and, asc, eq, gt, inArray, lte, not, sql } from "drizzle-orm";

export async function insertCmcCryptoInfosAndQuotes({
  cmcData,
}: {
  cmcData: NonNullable<TCmcGetCryptosResultRaw["data"]>;
}) {
  let infos: TInsertCmcCryptoInfo[] = [];
  let quotes: TInsertCmcCryptoQuote[] = [];

  for (const key in cmcData) {
    const cryptoInfo = cmcData[key];
    const infoId = crypto.randomUUID();
    if (cryptoInfo.cmc_rank === undefined || cryptoInfo.cmc_rank === null) {
      continue;
    }
    infos.push({
      id: infoId,
      coinId: cryptoInfo.id,
      name: cryptoInfo.name,
      symbol: cryptoInfo.symbol,
      slug: cryptoInfo.slug,
      circulatingSupply: cryptoInfo.circulating_supply,
      cmcRank: cryptoInfo.cmc_rank,
      maxSupply: cryptoInfo.max_supply,
      totalSupply: cryptoInfo.total_supply,
      lastUpdated: new Date(cryptoInfo.last_updated),
    });
    for (const currency in cryptoInfo.quote) {
      const quote = cryptoInfo.quote[currency];
      quotes.push({
        infoId,
        currencyTicker: currency,
        price: quote.price,
        volume24h: quote.volume_24h,
        volumeChange24h: quote.volume_change_24h,
        percentChange1h: quote.percent_change_1h,
        percentChange24h: quote.percent_change_24h,
        percentChange7d: quote.percent_change_7d,
        percentChange30d: quote.percent_change_30d,
        percentChange60d: quote.percent_change_60d,
        percentChange90d: quote.percent_change_90d,
        marketCap: quote.market_cap,
        marketCapDominance: quote.market_cap_dominance,
        fullyDilutedMarketCap: quote.fully_diluted_market_cap,
        lastUpdated: new Date(quote.last_updated),
      });
    }
  }

  await db.transaction(async (tx) => {
    await tx.insert(cmcCryptoInfosTable).values(infos);
    await tx.insert(cmcCryptoQuotesTable).values(quotes);
  });
  return true;
}

export async function getCmcLatestCryptoInfos({
  coinIds,
  currencyTickers,
  afterTimestamp,
}: {
  coinIds: number[];
  currencyTickers: string[];
  afterTimestamp: number;
}) {
  const afterDate = new Date(afterTimestamp);
  const infoConditions = [
    inArray(cmcCryptoInfosTable.coinId, coinIds),
    gt(cmcCryptoInfosTable.createdAt, afterDate),
  ];

  const latestSubquery = db
    .select({
      coinId: cmcCryptoInfosTable.coinId,
      maxLastUpdated: sql`MAX(${cmcCryptoInfosTable.lastUpdated})`.as(
        "max_last_updated"
      ),
    })
    .from(cmcCryptoInfosTable)
    .where(and(...infoConditions))
    .groupBy(cmcCryptoInfosTable.coinId)
    .as("latest");

  const rows = await db
    .select({
      info: {
        id: cmcCryptoInfosTable.id,
        coin_id: cmcCryptoInfosTable.coinId,
        name: cmcCryptoInfosTable.name,
        symbol: cmcCryptoInfosTable.symbol,
        slug: cmcCryptoInfosTable.slug,
        circulating_supply: cmcCryptoInfosTable.circulatingSupply,
        cmc_rank: cmcCryptoInfosTable.cmcRank,
        max_supply: cmcCryptoInfosTable.maxSupply,
        total_supply: cmcCryptoInfosTable.totalSupply,
        last_updated: cmcCryptoInfosTable.lastUpdated,
      },
      quote: {
        currency_ticker: cmcCryptoQuotesTable.currencyTicker,
        price: cmcCryptoQuotesTable.price,
        volume_24h: cmcCryptoQuotesTable.volume24h,
        volume_change_24h: cmcCryptoQuotesTable.volumeChange24h,
        percent_change_1h: cmcCryptoQuotesTable.percentChange1h,
        percent_change_24h: cmcCryptoQuotesTable.percentChange24h,
        percent_change_7d: cmcCryptoQuotesTable.percentChange7d,
        percent_change_30d: cmcCryptoQuotesTable.percentChange30d,
        percent_change_60d: cmcCryptoQuotesTable.percentChange60d,
        percent_change_90d: cmcCryptoQuotesTable.percentChange90d,
        market_cap: cmcCryptoQuotesTable.marketCap,
        market_cap_dominance: cmcCryptoQuotesTable.marketCapDominance,
        fully_diluted_market_cap: cmcCryptoQuotesTable.fullyDilutedMarketCap,
        last_updated: cmcCryptoQuotesTable.lastUpdated,
      },
    })
    .from(cmcCryptoInfosTable)
    .innerJoin(
      latestSubquery,
      and(
        eq(cmcCryptoInfosTable.coinId, latestSubquery.coinId),
        eq(cmcCryptoInfosTable.lastUpdated, latestSubquery.maxLastUpdated)
      )
    )
    .innerJoin(
      cmcCryptoQuotesTable,
      eq(cmcCryptoInfosTable.id, cmcCryptoQuotesTable.infoId)
    )
    .where(inArray(cmcCryptoQuotesTable.currencyTicker, currencyTickers));

  const requiredPairs = new Set(
    coinIds.flatMap((cid) => currencyTickers.map((ct) => `${cid}_${ct}`))
  );

  const returnedPairs = new Set(
    rows.map((r) => `${r.info.coin_id}_${r.quote.currency_ticker}`)
  );

  const shapedResult: TCmcGetCryptosResult = {};

  for (const { info, quote } of rows) {
    const { coin_id, ...restInfo } = info;
    const { currency_ticker, ...restQuote } = quote;

    if (!shapedResult[coin_id]) {
      shapedResult[coin_id.toString()] = {
        ...restInfo,
        id: coin_id,
        last_updated: restInfo.last_updated.toISOString(),
        quote: {},
      };
    }

    shapedResult[coin_id].quote[currency_ticker] = {
      ...restQuote,
      last_updated: restQuote.last_updated.toISOString(),
    };
  }

  if (
    requiredPairs.size === returnedPairs.size &&
    [...requiredPairs].every((pair) => returnedPairs.has(pair))
  ) {
    return shapedResult;
  }

  return null;
}

export async function upsertCmcCryptoDefinitions({
  values,
}: {
  values: TInsertCmcCryptoDefinition[];
}) {
  const res = await db
    .insert(cmcCryptoDefinitionsTable)
    .values(values)
    .onConflictDoUpdate({
      target: cmcCryptoDefinitionsTable.id,
      set: {
        name: sql.raw(`excluded.${cmcCryptoDefinitionsTable.name.name}`),
        rank: sql.raw(`excluded.${cmcCryptoDefinitionsTable.rank.name}`),
        updatedAt: sql.raw(
          `excluded.${cmcCryptoDefinitionsTable.updatedAt.name}`
        ),
        deletedAt: sql.raw(
          `excluded.${cmcCryptoDefinitionsTable.deletedAt.name}`
        ),
        symbol: sql.raw(`excluded.${cmcCryptoDefinitionsTable.symbol.name}`),
      },
    })
    .returning();
  return res;
}

export async function getCmcCryptoDefinitions({
  limit,
  offset,
}: {
  limit: number;
  offset: number;
}) {
  const date = new Date(offset);
  const [rows, first] = await Promise.all([
    db
      .select({
        id: cmcCryptoDefinitionsTable.id,
        name: cmcCryptoDefinitionsTable.name,
        rank: cmcCryptoDefinitionsTable.rank,
        symbol: cmcCryptoDefinitionsTable.symbol,
        createdAt: cmcCryptoDefinitionsTable.createdAt,
      })
      .from(cmcCryptoDefinitionsTable)
      .orderBy(asc(cmcCryptoDefinitionsTable.rank))
      .limit(limit)
      .where(lte(cmcCryptoDefinitionsTable.createdAt, date)),
    db
      .select({
        updatedAt: cmcCryptoDefinitionsTable.updatedAt,
      })
      .from(cmcCryptoDefinitionsTable)
      .orderBy(asc(cmcCryptoDefinitionsTable.id))
      .limit(1),
  ]);

  return {
    result: {
      data: rows,
      next: rows.length === limit ? rows[limit - 1].createdAt.getTime() : null,
    },
    timestamp: first.length > 0 ? first[0].updatedAt.getTime() : null,
  };
}

export async function getCmcCryptoIds({
  limit,
  exclude,
}: {
  limit: number;
  exclude: number[];
}) {
  const result = await db
    .select({
      id: cmcCryptoDefinitionsTable.id,
    })
    .from(cmcCryptoDefinitionsTable)
    .orderBy(asc(cmcCryptoDefinitionsTable.rank))
    .limit(limit)
    .where(not(inArray(cmcCryptoDefinitionsTable.id, exclude)));
  return result;
}
