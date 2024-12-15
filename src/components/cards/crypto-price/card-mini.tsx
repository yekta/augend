"use client";

import CardInnerWrapper from "@/components/cards/_utils/card-inner-wrapper";
import CardOuterWrapper, {
  TCardOuterWrapperDivProps,
  TCardOuterWrapperLinkProps,
  TCardOuterWrapperProps,
} from "@/components/cards/_utils/card-outer-wrapper";
import CryptoIcon from "@/components/icons/crypto-icon";
import { useCmcCryptoInfos } from "@/components/providers/cmc/cmc-crypto-infos-provider";
import { useCurrencyPreference } from "@/components/providers/currency-preference-provider";
import Indicator from "@/components/ui/indicator";
import { getCmcUrl } from "@/lib/get-cmc-url";
import { formatNumberTBMK } from "@/lib/number-formatters";
import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon } from "lucide-react";

export default function CryptoPriceMiniCard({
  coinId,
  className,
  ...rest
}: TCardOuterWrapperProps & {
  coinId: number;
}) {
  const currencyPreference = useCurrencyPreference();
  const {
    data: d,
    isError,
    isLoadingError,
    isPending,
    isRefetching,
  } = useCmcCryptoInfos();

  const data = d?.[coinId];
  const convertCurrency = currencyPreference.primary;

  const priceSymbol = convertCurrency.symbol;
  const price = data?.quote[convertCurrency.ticker].price;
  const marketCap = data?.quote[convertCurrency.ticker].market_cap;
  const rank = data?.cmc_rank;
  const ticker = data?.symbol;
  const slug = data?.slug;
  const isChangePositive = data
    ? data.quote[convertCurrency.ticker].percent_change_24h > 0
    : undefined;
  const isChangeNegative = data
    ? data.quote[convertCurrency.ticker].percent_change_24h < 0
    : undefined;

  const ChangeIcon =
    isChangeNegative === true
      ? ArrowDownIcon
      : isChangePositive === true
      ? ArrowUpIcon
      : ArrowRightIcon;

  const restAsDiv = rest as TCardOuterWrapperDivProps;
  const restAsLink = rest as TCardOuterWrapperLinkProps;
  const restTyped = slug
    ? {
        ...restAsLink,
        href: restAsLink.href || getCmcUrl(slug),
      }
    : restAsDiv;

  return (
    <CardOuterWrapper
      className={className}
      data-loading-error={(isLoadingError && true) || undefined}
      data-pending={(isPending && true) || undefined}
      {...restTyped}
    >
      <CardInnerWrapper
        className="flex px-2.5 md:pl-3.5 md:pr-3.75 py-3 md:py-4 gap-2.25 md:gap-3 flex-row items-center text-left
        not-touch:group-data-[has-href]/card:group-hover/card:bg-background-hover group-data-[has-href]/card:group-active/card:bg-background-hover relative overflow-hidden"
      >
        {isPending ? (
          <div className="size-5 md:size-6 rounded-md bg-foreground animate-skeleton shrink-0" />
        ) : (
          <CryptoIcon
            cryptoName={ticker}
            className="size-5 md:size-6 shrink-0 group-data-[loading-error]/card:text-destructive"
          />
        )}
        <div className="flex-1 flex flex-col overflow-hidden gap-1.5">
          {/* Top line */}
          <div className="w-full flex flex-row items-center justify-between gap-3">
            <div
              className="shrink min-w-0 flex items-center justify-start gap-1.25 text-muted-foreground text-xs md:text-sm truncate leading-none md:leading-none
              group-data-[pending]/card:rounded-sm group-data-[pending]/card:text-transparent group-data-[pending]/card:bg-muted-foreground group-data-[pending]/card:animate-skeleton
              group-data-[loading-error]/card:text-destructive/60"
            >
              <p className="shrink min-w-0 truncate">
                {isPending ? "Load" : ticker ? ticker : "Error"}
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
                        data.quote[convertCurrency.ticker].percent_change_24h,
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
                : price !== undefined
                ? `${priceSymbol}${formatNumberTBMK(price)}`
                : "Error"}
            </p>
            <p
              className="shrink text-sm md:text-base font-semibold truncate leading-none md:leading-none
              group-data-[pending]/card:rounded-sm group-data-[pending]/card:text-transparent group-data-[pending]/card:bg-foreground group-data-[pending]/card:animate-skeleton
              group-data-[loading-error]/card:text-destructive"
            >
              {isPending
                ? "Loading"
                : marketCap !== undefined
                ? `${priceSymbol}${formatNumberTBMK(marketCap, 3)}`
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
