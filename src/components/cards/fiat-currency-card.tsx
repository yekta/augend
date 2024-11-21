"use client";

import ThreeLineCard from "@/components/cards/three-line-card";
import { useFiatCurrencyRates } from "@/components/providers/fiat-currency-rates-provider";
import { formatNumberTBMK } from "@/lib/number-formatters";

type TFiatCurrency = {
  symbol: string;
  name: string;
  slug: string;
  ticker: string;
};

const currencies: Record<string, TFiatCurrency> = {
  USD: {
    symbol: "$",
    name: "US Dollar",
    slug: "usd",
    ticker: "USD",
  },
  EUR: {
    symbol: "€",
    name: "Euro",
    slug: "eur",
    ticker: "EUR",
  },
  GBP: {
    symbol: "£",
    name: "British Pound",
    slug: "gbp",
    ticker: "GBP",
  },
  TRY: {
    symbol: "₺",
    name: "Turkish Lira",
    slug: "try",
    ticker: "TRY",
  },
};

export default function FiatCurrencyCard({ ticker }: { ticker: string }) {
  const {
    data: d,
    isError,
    isLoadingError,
    isPending,
    isRefetching,
  } = useFiatCurrencyRates();

  const [baseTicker, quoteTicker] = ticker.split("/");
  const data = d?.[ticker] || undefined;

  const baseCurrency = currencies[baseTicker];
  const quoteCurrency = currencies[quoteTicker];

  return (
    <ThreeLineCard
      key={ticker}
      top={`${baseCurrency.symbol} ${baseCurrency.ticker}`}
      middle={
        data
          ? `${quoteCurrency.symbol}${formatNumberTBMK(data.last)}`
          : undefined
      }
      bottom={`${baseCurrency.symbol} ${baseCurrency.ticker}`}
      isPending={isPending}
      isRefetching={isRefetching}
      isError={isError}
      isLoadingError={isLoadingError}
    />
  );
}
