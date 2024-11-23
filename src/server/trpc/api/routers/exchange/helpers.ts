import {
  binanceApiKey,
  binanceApiSecret,
} from "@/server/trpc/api/routers/exchange/secrets";
import { TAvailableExchange } from "@/server/trpc/api/routers/exchange/types";
import ccxt, { Exchange } from "ccxt";

export function getExchangeInstance(exchange: TAvailableExchange): Exchange {
  if (exchange === "Coinex") return new ccxt.coinex();
  if (exchange === "Kucoin") return new ccxt.kucoin();
  if (exchange === "Coinbase") return new ccxt.coinbaseadvanced();
  if (exchange === "OKX") return new ccxt.okx();
  if (exchange === "Kraken") return new ccxt.kraken();
  return new ccxt.binance(
    binanceApiKey && binanceApiSecret
      ? {
          apiKey: binanceApiKey,
          secret: binanceApiSecret,
        }
      : undefined
  );
}
