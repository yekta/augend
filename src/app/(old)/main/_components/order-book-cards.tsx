"use client";

import OrderBookCard, {
  TOrderBookConfig,
} from "@/components/cards/order-book-card";
import { cleanEnvVar } from "@/lib/helpers";
import { ExchangeSchema } from "@/trpc/api/routers/exchange/types";

const lines = 10;

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
