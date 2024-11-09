import { z } from "zod";

export const ExchangeSchema = z.enum([
  "Binance",
  "Coinex",
  "Kucoin",
  "Coinbase",
  "OKX",
  "Kraken",
]);
export type TAvailableExchange = z.infer<typeof ExchangeSchema>;

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
    exchange: TAvailableExchange;
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
    exchange: TAvailableExchange;
    ticker: string;
    changeRateDuringInterval: number;
    currentPrice: number;
  };
  isFallback?: boolean;
};
