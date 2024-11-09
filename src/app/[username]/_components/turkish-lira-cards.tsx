"use client";

import ThreeLineCard from "@/components/cards/three-line-card";
import { defaultQueryOptions } from "@/lib/constants";
import { cleanEnvVar } from "@/lib/helpers";
import { formatNumberTBMK } from "@/lib/number-formatters";
import {
  currenciesForLira,
  CurrencyForLiraTickerEnum,
  getCurrencyUrl,
  TCurrencyForLira,
} from "@/server/api/routers/turkish-lira/helpers";
import { api } from "@/trpc/react";

export const items: TCurrencyForLira[] = (
  cleanEnvVar(process.env.NEXT_PUBLIC_ADMIN_TURKISH_LIRA_CARDS) || ""
)
  .split(",")
  .filter((i) => {
    const ticker = CurrencyForLiraTickerEnum.parse(i);
    const curr = currenciesForLira.find((j) => j.ticker === ticker);
    return curr !== undefined;
  })
  .map((i) => {
    const ticker = CurrencyForLiraTickerEnum.parse(i);
    const curr = currenciesForLira.find((j) => j.ticker === ticker)!;
    return {
      ticker,
      symbol: curr.symbol,
      slug: curr.slug,
      name: curr.name,
    };
  });
const convertCurrencySymbol = "₺";

export default function TurkishLiraCards() {
  const { data, isError, isLoadingError, isPending, isRefetching } =
    api.turkishLira.getRates.useQuery(undefined, defaultQueryOptions.normal);

  return (
    <>
      {items.map((item, index) => {
        return (
          <ThreeLineCard
            href={getCurrencyUrl(item.slug)}
            key={item.ticker + index}
            top={`${item.symbol} ${item.ticker}`}
            middle={
              data
                ? `${convertCurrencySymbol}${formatNumberTBMK(
                    data[item.ticker].buy
                  )}`
                : undefined
            }
            bottom={`${item.symbol} ${item.ticker}`}
            isPending={isPending}
            isRefetching={isRefetching}
            isError={isError}
            isLoadingError={isLoadingError}
          />
        );
      })}
    </>
  );
}
