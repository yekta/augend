import "server-only";

import { TExchange } from "@/server/trpc/api/exchange/types";
import ccxt, { Exchange } from "ccxt";
import { env } from "@/lib/env";

export function getExchangeInstance(exchange: TExchange): Exchange {
  if (exchange === "CoinEx") return new ccxt.coinex();
  if (exchange === "Kucoin") return new ccxt.kucoin();
  if (exchange === "Coinbase") return new ccxt.coinbaseadvanced();
  if (exchange === "OKX") return new ccxt.okx();
  if (exchange === "Kraken") return new ccxt.kraken();
  return new ccxt.binance(
    env.BINANCE_API_KEY && env.BINANCE_API_SECRET
      ? {
          apiKey: env.BINANCE_API_KEY,
          secret: env.BINANCE_API_SECRET,
        }
      : undefined
  );
}
