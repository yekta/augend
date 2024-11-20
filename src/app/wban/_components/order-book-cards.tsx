"use client";

import OrderBookCard, {
  TOrderBookConfig,
} from "@/components/cards/order-book-card";
import { formatNumberTBMK } from "@/lib/number-formatters";

const lines = 10;
const items: TOrderBookConfig[] = [
  {
    exchange: "Coinex",
    ticker: "BANANO/USDT",
    limit: lines,
    getUrl: (ticker: string) =>
      `https://www.coinex.com/en/exchange/${ticker
        .replaceAll("/", "-")
        .toLowerCase()}`,
    priceFormatter: (i: number) => formatNumberTBMK(i, 4, true),
  },
  {
    exchange: "Coinex",
    ticker: "BANANO/BTC",
    limit: lines,
    getUrl: (ticker: string) =>
      `https://www.coinex.com/en/exchange/${ticker
        .replaceAll("/", "-")
        .toLowerCase()}`,
    priceFormatter: (i: number) => formatNumberTBMK(i * 1e8, 3, true),
  },
];

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
