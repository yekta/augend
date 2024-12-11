import "server-only";

import { TExchange } from "@/server/trpc/api/crypto/exchange/types";
import ccxt, { Exchange } from "ccxt";
import { env } from "@/lib/env";

const exchanges: Record<TExchange, Exchange> = {
  CoinEx: new ccxt.coinex(),
  Kucoin: new ccxt.kucoin(),
  Coinbase: new ccxt.coinbaseadvanced(),
  OKX: new ccxt.okx(),
  Kraken: new ccxt.kraken(),
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
    exchange.proxyUrl = env.CCXT_PROXY_URL;
    exchange.headers = {
      Origin: env.NEXT_PUBLIC_SITE_URL,
    };
  }
  return exchange;
}
