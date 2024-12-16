"use client";

import CardInnerWrapper from "@/components/cards/_utils/card-inner-wrapper";
import CardOuterWrapper, {
  TCardOuterWrapperDivProps,
  TCardOuterWrapperLinkProps,
  TCardOuterWrapperProps,
} from "@/components/cards/_utils/card-outer-wrapper";
import ThreeLineCard from "@/components/cards/_utils/three-line-card";
import CryptoIcon from "@/components/icons/crypto-icon";
import { useCmcCryptoInfos } from "@/components/providers/cmc/cmc-crypto-infos-provider";
import { useCurrencyPreference } from "@/components/providers/currency-preference-provider";
import Indicator from "@/components/ui/indicator";
import { getCmcUrl } from "@/lib/get-cmc-url";
import { formatNumberTBMK } from "@/lib/number-formatters";
import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon } from "lucide-react";
import { useMemo } from "react";

export default function CryptoPriceCard({
  coinId,
  className,
  variant,
  ...rest
}: TCardOuterWrapperProps & {
  coinId: number;
  variant?: "mini" | "default" | string;
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
  const rank = data?.cmc_rank;
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
          <CryptoIcon cryptoName={data?.symbol} className="size-4 -my-1" />
          <p className="min-w-0 shrink truncate">{data?.symbol}</p>
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
                  data?.quote[convertCurrency.ticker].percent_change_24h,
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
        <p className="min-w-0 shrink truncate">#{rank}</p>
      </div>
    );
  }, [data, convertCurrency]);

  if (variant === "mini") {
    return (
      <CardOuterWrapper
        className={className}
        data-loading-error={(isLoadingError && true) || undefined}
        data-pending={(isPending && true) || undefined}
        {...restTyped}
      >
        <CardInnerWrapper
          className="flex px-3 md:pl-3.5 md:pr-4 py-3 md:py-4 gap-2.25 md:gap-3 flex-row items-center text-left
          not-touch:group-data-[has-href]/card:group-hover/card:bg-background-hover group-data-[has-href]/card:group-active/card:bg-background-hover relative overflow-hidden"
        >
          <div className="size-5 md:size-6 shrink-0 -ml-0.5">
            {" "}
            {isPending ? (
              <div className="size-full rounded-md bg-foreground animate-skeleton" />
            ) : (
              <CryptoIcon
                cryptoName={data?.symbol}
                className="size-full group-data-[loading-error]/card:text-destructive"
              />
            )}
          </div>

          <div className="flex-1 flex flex-col overflow-hidden gap-1.5">
            {/* Top line */}
            <div className="w-full flex flex-row items-center justify-between gap-3">
              <div
                className="shrink min-w-0 flex items-center justify-start gap-1.25 text-muted-foreground text-xs md:text-sm truncate leading-none md:leading-none
                group-data-[pending]/card:rounded-sm group-data-[pending]/card:text-transparent group-data-[pending]/card:bg-muted-foreground group-data-[pending]/card:animate-skeleton
                group-data-[loading-error]/card:text-destructive/60"
              >
                <p className="shrink min-w-0 truncate">
                  {isPending ? "Load" : data?.symbol ? data.symbol : "Error"}
                </p>
                <div
                  data-negative={isChangeNegative ? true : undefined}
                  data-positive={isChangePositive ? true : undefined}
                  className="flex shrink min-w-0 truncate items-center justify-start text-muted-foreground group-data-[loading-error]/card:text-destructive data-[negative]/card:text-destructive data-[positive]/card:text-success"
                >
                  {data && (
                    <ChangeIcon className="size-3.5 md:size-4 shrink-0 -my-0.5" />
                  )}
                  <p className="shrink min-w-0 truncate">
                    {isPending
                      ? "Load"
                      : data
                      ? formatNumberTBMK(
                          data?.quote[convertCurrency.ticker]
                            .percent_change_24h,
                          3,
                          false,
                          true
                        ) + "%"
                      : "Error"}
                  </p>
                </div>
              </div>
              <p
                className="shrink-0 text-muted-foreground text-xs md:text-sm truncate leading-none md:leading-none
                group-data-[pending]/card:rounded-sm group-data-[pending]/card:text-transparent group-data-[pending]/card:bg-muted-foreground group-data-[pending]/card:animate-skeleton
                group-data-[loading-error]/card:text-destructive/60"
              >
                {isPending ? "Load" : rank ? `#${rank}` : "Error"}
              </p>
            </div>
            {/* Bottom line */}
            <div className="w-full flex flex-row items-center justify-between gap-3">
              <p
                className="shrink text-sm md:text-base font-semibold truncate leading-none md:leading-none
                group-data-[pending]/card:rounded-sm group-data-[pending]/card:text-transparent group-data-[pending]/card:bg-foreground group-data-[pending]/card:animate-skeleton
                group-data-[loading-error]/card:text-destructive"
              >
                {isPending
                  ? "Loading"
                  : data !== undefined
                  ? `${convertCurrency.symbol}${formatNumberTBMK(
                      data.quote[convertCurrency.ticker].price
                    )}`
                  : "Error"}
              </p>
              <p
                className="shrink text-sm md:text-base font-semibold truncate leading-none md:leading-none
                group-data-[pending]/card:rounded-sm group-data-[pending]/card:text-transparent group-data-[pending]/card:bg-foreground group-data-[pending]/card:animate-skeleton
                group-data-[loading-error]/card:text-destructive"
              >
                {isPending
                  ? "Loading"
                  : data?.quote[convertCurrency.ticker].market_cap !== undefined
                  ? `${convertCurrency.symbol}${formatNumberTBMK(
                      data?.quote[convertCurrency.ticker].market_cap,
                      3
                    )}`
                  : "Error"}
              </p>
            </div>
          </div>
          <Indicator
            isError={isError}
            isPending={isPending}
            isRefetching={isRefetching}
            hasData={data !== undefined}
            className="left-0 top-0 bottom-auto right-auto"
          />
        </CardInnerWrapper>
      </CardOuterWrapper>
    );
  }

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
