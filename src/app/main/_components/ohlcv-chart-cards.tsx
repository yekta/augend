"use client";

import OhlcvChartCard, {
  TOhlcvChartConfig,
} from "@/components/cards/ohlcv-chart-card";
import { cleanEnvVar } from "@/lib/helpers";
import { formatNumberTBMK } from "@/lib/number-formatters";
import { ExchangeSchema } from "@/trpc/api/routers/exchange/types";

const priceFormatters: Record<string, (i: number) => string> = {
  "BAN/BTC": (i: number) => formatNumberTBMK(i * 1e8, 3, true),
};
const defaultFormatter = (i: number) => formatNumberTBMK(i, 4, true);

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
      priceFormatter: priceFormatters[ticker] || defaultFormatter,
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
