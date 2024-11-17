"use client";

import OrderBookCard, {
  TOrderBookConfig,
} from "@/components/cards/order-book-card";
import { cleanEnvVar } from "@/lib/helpers";
import { formatNumberTBMK } from "@/lib/number-formatters";
import {
  ExchangeSchema,
  TAvailableExchange,
} from "@/trpc/api/routers/exchange/types";

const lines = 10;
const priceFormatters: Record<string, (i: number) => string> = {
  "BAN/BTC": (i: number) => formatNumberTBMK(i * 1e8, 3, true),
};
const getUrlFunctions: Partial<
  Record<TAvailableExchange, (ticker: string) => string>
> = {
  Coinex: (ticker: string) =>
    `https://www.coinex.com/en/exchange/${ticker
      .replaceAll("/", "-")
      .toLowerCase()}`,
};
const defaultFormatter = (i: number) => formatNumberTBMK(i, 4, true);

const items: TOrderBookConfig[] = (
  cleanEnvVar(process.env.NEXT_PUBLIC_ADMIN_ORDER_BOOK_CARDS) || ""
)
  .split(",")
  .map((i) => {
    const [exchange, ticker] = i.split(":");
    const parsedExchange = ExchangeSchema.parse(exchange);
    return {
      exchange: parsedExchange,
      ticker,
      limit: lines,
      getUrl: getUrlFunctions[parsedExchange] || (() => ""),
      priceFormatter: priceFormatters[ticker] || defaultFormatter,
    };
  });

export default function OrderBookCards() {
  return (
    <div className="w-full flex flex-wrap">
      {items.map((item, index) => {
        return (
          <OrderBookCard
            key={`${item.exchange}-${item.ticker}-${index}`}
            config={item}
          />
        );
      })}
    </div>
  );
}
