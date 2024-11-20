"use client";

import OhlcvChartCard, {
  TOhlcvChartConfig,
} from "@/components/cards/ohlcv-chart-card";
import { cleanEnvVar } from "@/lib/helpers";
import { ExchangeSchema } from "@/trpc/api/routers/exchange/types";

const items: TOhlcvChartConfig[] = (
  cleanEnvVar(process.env.NEXT_PUBLIC_ADMIN_OHLCV_CHART_CARDS) || ""
)
  .split(",")
  .map((i) => {
    const [exchange, ticker] = i.split(":");
    const parsedExchange = ExchangeSchema.parse(exchange);
    return {
      exchange: parsedExchange,
      ticker,
    };
  });

export default function OhlcvChartCards() {
  return (
    <div className="w-full flex flex-wrap">
      {items.map((item, index) => (
        <OhlcvChartCard
          key={`${item.exchange}-${item.ticker}-${index}`}
          config={item}
        />
      ))}
    </div>
  );
}
