import "server-only";

import { TExchange } from "@/server/trpc/api/crypto/exchange/types";
import ccxt, { Exchange } from "ccxt";
import { env } from "@/lib/env";

const exchanges: Record<TExchange, Exchange> = {
  CoinEx: withOptionalProxy(new ccxt.coinex()),
  Kucoin: withOptionalProxy(new ccxt.kucoin()),
  Coinbase: withOptionalProxy(new ccxt.coinbaseadvanced()),
  OKX: withOptionalProxy(new ccxt.okx()),
  Kraken: withOptionalProxy(new ccxt.kraken()),
  Binance: withOptionalProxy(
    new ccxt.binance(
      env.BINANCE_API_KEY && env.BINANCE_API_SECRET
        ? {
            apiKey: env.BINANCE_API_KEY,
            secret: env.BINANCE_API_SECRET,
          }
        : undefined
    )
  ),
};

export function getExchangeInstance(exchange: TExchange): Exchange {
  if (!exchanges[exchange]) {
    return exchanges.Binance;
  }
  return exchanges[exchange];
}

function withOptionalProxy(exchange: Exchange) {
  if (env.CCXT_PROXY_URL) {
    let url = env.CCXT_PROXY_URL;
    if (!url.endsWith("/")) {
      url = url + "/";
    }
    exchange.proxyUrl = url;
  }
  return exchange;
}
