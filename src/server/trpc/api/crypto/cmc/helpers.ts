import { upsertCmcCryptoDefinitions } from "@/server/db/repo/cmc";
import { TInsertCmcCryptoDefinition } from "@/server/db/schema";
import { cmcApiUrl } from "@/server/trpc/api/crypto/cmc/constants";
import { cmcFetchOptions } from "@/server/trpc/api/crypto/cmc/secrets";
import {
  TCmcCoinIdMapsResult,
  TCmcGetCryptosResult,
  TCmcGetCryptosResultRaw,
} from "@/server/trpc/api/crypto/cmc/types";
import { TRPCError } from "@trpc/server";

export function shapeGetCryptoInfosRawResult(
  data: NonNullable<TCmcGetCryptosResultRaw["data"]>
) {
  let shapedResult: TCmcGetCryptosResult = {};
  for (const coinId in data) {
    const coin = data[coinId];
    shapedResult[coinId] = {
      id: Number(coinId),
      name: coin.name,
      symbol: coin.symbol,
      slug: coin.slug,
      circulating_supply: coin.circulating_supply,
      cmc_rank: coin.cmc_rank,
      max_supply: coin.max_supply,
      total_supply: coin.total_supply,
      last_updated: coin.last_updated,
      quote: {},
    };
    for (const currency in coin.quote) {
      const quote = coin.quote[currency];
      shapedResult[coinId].quote[currency] = {
        price: quote.price,
        volume_24h: quote.volume_24h,
        volume_change_24h: quote.volume_change_24h,
        percent_change_1h: quote.percent_change_1h,
        percent_change_24h: quote.percent_change_24h,
        percent_change_7d: quote.percent_change_7d,
        percent_change_30d: quote.percent_change_30d,
        percent_change_60d: quote.percent_change_60d,
        percent_change_90d: quote.percent_change_90d,
        market_cap: quote.market_cap,
        market_cap_dominance: quote.market_cap_dominance,
        fully_diluted_market_cap: quote.fully_diluted_market_cap,
        last_updated: quote.last_updated,
      };
    }
  }
  return shapedResult;
}

export async function updateCryptoDefinitionsCache() {
  const limit = 5000;
  const sortBy = "cmc_rank";
  const url = `${cmcApiUrl}/v1/cryptocurrency/map?sort=${sortBy}&limit=${limit}`;
  const res = await fetch(url, cmcFetchOptions);

  if (!res.ok) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `${res.status}: Failed to fetch CMC ID maps`,
    });
  }

  const resJson: TCmcCoinIdMapsResult = await res.json();

  if (!resJson.data) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `No data in CMC ID maps`,
    });
  }

  const unfilteredResult: TInsertCmcCryptoDefinition[] = resJson.data.map(
    (d) => ({
      id: d.id,
      name: d.name,
      rank: d.rank,
      symbol: d.symbol,
    })
  );

  // Filter results with the same name using a Map
  const map = new Map<string, TInsertCmcCryptoDefinition>();
  for (const item of unfilteredResult) {
    if (!map.has(item.name)) {
      map.set(item.name, item);
    }
  }
  const result = Array.from(map.values());

  await upsertCmcCryptoDefinitions({ values: result });
}
