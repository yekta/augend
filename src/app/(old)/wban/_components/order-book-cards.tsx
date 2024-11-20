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
  },
  {
    exchange: "Coinex",
    ticker: "BANANO/BTC",
    limit: lines,
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
