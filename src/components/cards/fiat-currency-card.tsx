"use client";

import ThreeLineCard from "@/components/cards/three-line-card";
import { TCardWrapperProps } from "@/components/cards/utils/card-wrapper";
import { useFiatCurrencyRates } from "@/components/providers/fiat-currency-rates-provider";
import { formatNumberTBMK } from "@/lib/number-formatters";
import { cn } from "@/lib/utils";

type TCurrency = {
  id: string;
  name: string;
  ticker: string;
  symbol: string;
};

export default function FiatCurrencyCard({
  baseCurrency,
  quoteCurrency,
  className,
  ...rest
}: TCardWrapperProps & {
  baseCurrency: TCurrency;
  quoteCurrency: TCurrency;
}) {
  const {
    data: d,
    isError,
    isLoadingError,
    isPending,
    isRefetching,
  } = useFiatCurrencyRates();

  const baseInUsd = d?.USD?.[baseCurrency.ticker]?.buy;
  const quoteInUsd = d?.USD?.[quoteCurrency.ticker]?.buy;
  const baseInQuote =
    baseInUsd && quoteInUsd ? baseInUsd / quoteInUsd : undefined;

  return (
    <ThreeLineCard
      className={cn(className)}
      {...rest}
      top={`${baseCurrency.symbol} ${baseCurrency.ticker}`}
      middle={
        baseInQuote
          ? `${quoteCurrency.symbol}${formatNumberTBMK(baseInQuote)}`
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
