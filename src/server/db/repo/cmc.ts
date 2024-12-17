import { db } from "@/server/db/db";
import {
  cmcCryptoInfoQuotesTable,
  cmcCryptoInfosTable,
  TInsertCmcCryptoInfo,
  TInsertCmcCryptoInfoQuote,
} from "@/server/db/schema";
import { TCmcGetCryptosResult } from "@/server/trpc/api/crypto/cmc/types";
import { and, eq, gt, inArray, sql } from "drizzle-orm";

export async function insertCmcCryptoInfosAndQuotes({
  cmcResult,
}: {
  cmcResult: TCmcGetCryptosResult;
}) {
  let infos: TInsertCmcCryptoInfo[] = [];
  let quotes: TInsertCmcCryptoInfoQuote[] = [];

  for (const key in cmcResult) {
    const cryptoInfo = cmcResult[key];
    const infoId = crypto.randomUUID();
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

  await Promise.all([
    db.insert(cmcCryptoInfosTable).values(infos),
    db.insert(cmcCryptoInfoQuotesTable).values(quotes),
  ]);
  return true;
}

export async function getLatestCryptoInfos({
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
    gt(cmcCryptoInfosTable.lastUpdated, afterDate),
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
        currency_ticker: cmcCryptoInfoQuotesTable.currencyTicker,
        price: cmcCryptoInfoQuotesTable.price,
        volume_24h: cmcCryptoInfoQuotesTable.volume24h,
        volume_change_24h: cmcCryptoInfoQuotesTable.volumeChange24h,
        percent_change_1h: cmcCryptoInfoQuotesTable.percentChange1h,
        percent_change_24h: cmcCryptoInfoQuotesTable.percentChange24h,
        percent_change_7d: cmcCryptoInfoQuotesTable.percentChange7d,
        percent_change_30d: cmcCryptoInfoQuotesTable.percentChange30d,
        percent_change_60d: cmcCryptoInfoQuotesTable.percentChange60d,
        percent_change_90d: cmcCryptoInfoQuotesTable.percentChange90d,
        market_cap: cmcCryptoInfoQuotesTable.marketCap,
        market_cap_dominance: cmcCryptoInfoQuotesTable.marketCapDominance,
        fully_diluted_market_cap:
          cmcCryptoInfoQuotesTable.fullyDilutedMarketCap,
        last_updated: cmcCryptoInfoQuotesTable.lastUpdated,
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
      cmcCryptoInfoQuotesTable,
      eq(cmcCryptoInfosTable.id, cmcCryptoInfoQuotesTable.infoId)
    )
    .where(inArray(cmcCryptoInfoQuotesTable.currencyTicker, currencyTickers));

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
