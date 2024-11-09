import { TAvailableExchange } from "@/server/api/routers/exchange/types";
import ccxt, { Exchange } from "ccxt";

export function getExchangeInstance(exchange: TAvailableExchange): Exchange {
  if (exchange === "Coinex") return new ccxt.coinex();
  if (exchange === "Kucoin") return new ccxt.kucoin();
  if (exchange === "Coinbase") return new ccxt.coinbaseadvanced();
  if (exchange === "OKX") return new ccxt.okx();
  if (exchange === "Kraken") return new ccxt.kraken();
  return new ccxt.binance(
    process.env.BINANCE_API_KEY && process.env.BINANCE_SECRET
      ? {
          apiKey: process.env.BINANCE_API_KEY,
          secret: process.env.BINANCE_SECRET,
        }
      : undefined
  );
}
