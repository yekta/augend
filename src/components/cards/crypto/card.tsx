"use client";

import {
  TCardOuterWrapperDivProps,
  TCardOuterWrapperLinkProps,
  TCardOuterWrapperProps,
} from "@/components/cards/_utils/card-outer-wrapper";
import ThreeLineCard from "@/components/cards/_utils/three-line-card";
import CryptoIcon from "@/components/icons/crypto-icon";
import { useCmcCryptoInfos } from "@/components/providers/cmc/cmc-crypto-infos-provider";
import { useCurrencyPreference } from "@/components/providers/currency-preference-provider";
import { getCmcUrl } from "@/lib/get-cmc-url";
import { formatNumberTBMK } from "@/lib/number-formatters";
import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon } from "lucide-react";
import { useMemo } from "react";

export default function CryptoCard({
  coinId,
  className,
  ...rest
}: TCardOuterWrapperProps & {
  coinId: number;
}) {
  const currencyPreference = useCurrencyPreference();
  const formatter = formatNumberTBMK;
  const {
    data: d,
    isPending,
    isRefetching,
    isError,
    isLoadingError,
  } = useCmcCryptoInfos();

  const data = d?.[coinId];
  const convertCurrency = currencyPreference.primary;

  const isChangeNegative = data
    ? data.quote[convertCurrency.ticker].percent_change_24h < 0
    : undefined;
  const isChangePositive = data
    ? data.quote[convertCurrency.ticker].percent_change_24h > 0
    : undefined;
  const ChangeIcon =
    isChangeNegative === true
      ? ArrowDownIcon
      : isChangePositive === true
      ? ArrowUpIcon
      : ArrowRightIcon;

  const restAsDiv = rest as TCardOuterWrapperDivProps;
  const restAsLink = rest as TCardOuterWrapperLinkProps;
  const restTyped =
    data && !rest.noHref
      ? { ...restAsLink, href: rest.href || getCmcUrl(data.slug) }
      : restAsDiv;

  const Top = useMemo(() => {
    if (!data) return "Error";

    return (
      <div className="min-w-0 shrink overflow-hidden max-w-full flex items-center justify-center gap-1.25">
        <div className="flex items-center gap-0.5 justify-start min-w-0 shrink truncate">
          <CryptoIcon cryptoName={data.symbol} className="size-4 -my-1" />
          <p className="min-w-0 shrink truncate">{data.symbol}</p>
        </div>
        <div
          data-negative={isChangeNegative ? true : undefined}
          data-positive={isChangePositive ? true : undefined}
          className="flex shrink min-w-0 truncate items-center justify-start text-muted-foreground group-data-[loading-error]:text-destructive data-[negative]:text-destructive data-[positive]:text-success"
        >
          {data && <ChangeIcon className="size-4 shrink-0 -my-0.5" />}
          <p className="shrink min-w-0 truncate">
            {isPending
              ? "Load"
              : data
              ? formatNumberTBMK(
                  data.quote[convertCurrency.ticker].percent_change_24h,
                  3,
                  false,
                  true
                ) + "%"
              : "Error"}
          </p>
        </div>
      </div>
    );
  }, [data, isChangeNegative, isChangePositive, isPending, convertCurrency]);

  const Bottom = useMemo(() => {
    if (!data) return undefined;

    return (
      <div className="w-full flex items-center justify-center gap-1.25">
        <p className="shrink min-w-0 truncate">
          {convertCurrency.symbol}
          {formatNumberTBMK(data.quote[convertCurrency.ticker].market_cap, 3)}
        </p>
        <p className="text-muted-foreground">•</p>
        <p className="min-w-0 shrink truncate">#{data.cmc_rank}</p>
      </div>
    );
  }, [data, convertCurrency]);

  return (
    <ThreeLineCard
      className={className}
      top={Top}
      middle={
        data
          ? `${convertCurrency.symbol}${formatter(
              data.quote[convertCurrency.ticker].price
            )}`
          : undefined
      }
      bottom={Bottom}
      isPending={isPending}
      isRefetching={isRefetching}
      isError={isError}
      isLoadingError={isLoadingError}
      {...restTyped}
    />
  );
}
