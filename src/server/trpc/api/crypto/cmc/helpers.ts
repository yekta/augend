import {
  TCmcGetCryptosResult,
  TCmcGetCryptosResultRaw,
} from "@/server/trpc/api/crypto/cmc/types";

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
