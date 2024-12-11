import { z } from "zod";

export const ExchangeSchema = z.enum([
  "Binance",
  "Coinbase",
  "Kraken",
  "Kucoin",
  "OKX",
  "CoinEx",
]);
export type TExchange = z.infer<typeof ExchangeSchema>;

export type TOrderBook = {
  asks: {
    price: number;
    amount: number;
  }[];
  bids: {
    price: number;
    amount: number;
  }[];
  metadata: {
    exchange: TExchange;
    ticker: string;
    volumeBase24h: number;
    volumeQuote24h: number | null;
    lastPrice: number;
  };
};

export type TOHLCV = {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
};

export type TOHLCVResult = {
  data: TOHLCV[];
  metadata: {
    exchange: TExchange;
    pair: string;
    currentPrice: number;
  };
  isFallback?: boolean;
};
