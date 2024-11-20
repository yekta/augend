"use client";

import OhlcvChartCard, {
  TOhlcvChartConfig,
} from "@/components/cards/ohlcv-chart-card";

const items: TOhlcvChartConfig[] = [
  {
    exchange: "Coinex",
    ticker: "BANANO/USDT",
  },
  {
    exchange: "Coinex",
    ticker: "BANANO/BTC",
  },
];

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
