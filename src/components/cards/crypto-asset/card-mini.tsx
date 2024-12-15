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
import { useForexRates } from "@/components/providers/forex-rates-provider";
import Indicator from "@/components/ui/indicator";
import { getCmcUrl } from "@/lib/get-cmc-url";
import { formatNumberTBMK } from "@/lib/number-formatters";
import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon } from "lucide-react";

export default function CryptoAssetMiniCard({
  coinId,
  boughtAtTimestamp,
  buyAmount,
  buyPriceUsd,
  className,
  ...rest
}: TCardOuterWrapperProps & {
  coinId: number;
  boughtAtTimestamp: number;
  buyAmount: number;
  buyPriceUsd: number;
}) {
  const currencyPreference = useCurrencyPreference();
  const {
    data: dataForex,
    isError: isErrorForex,
    isLoadingError: isLoadingErrorForex,
    isPending: isPendingForex,
    isRefetching: isRefetchingForex,
  } = useForexRates();

  const {
    data: allDataCrypto,
    isError: isErrorCrypto,
    isLoadingError: isLoadingErrorCrypto,
    isPending: isPendingCrypto,
    isRefetching: isRefetchingCrypto,
  } = useCmcCryptoInfos();

  const dataCrypto = allDataCrypto?.[coinId];
  const convertCurrency = currencyPreference.primary;

  const price = dataCrypto?.quote[convertCurrency.ticker].price;

  const currentValueInCurrency =
    price !== undefined ? buyAmount * price : undefined;

  const originalValueInUsd = buyAmount * buyPriceUsd;
  const originalValueInCurrency = dataForex
    ? originalValueInUsd / dataForex["USD"][convertCurrency.ticker].buy
    : undefined;

  const pnlInCurrency =
    currentValueInCurrency !== undefined && originalValueInCurrency
      ? currentValueInCurrency - originalValueInCurrency
      : undefined;
  const pnlInCurrencyAbs =
    pnlInCurrency !== undefined ? Math.abs(pnlInCurrency) : undefined;
  const pnlPercentageAbs =
    originalValueInCurrency !== undefined &&
    currentValueInCurrency !== undefined
      ? Math.abs(
          ((currentValueInCurrency - originalValueInCurrency) /
            originalValueInCurrency) *
            100
        )
      : undefined;

  const valueSymbol = convertCurrency.symbol;

  const ticker = dataCrypto?.symbol;
  const slug = dataCrypto?.slug;

  const isChangePositive =
    pnlInCurrency !== undefined ? pnlInCurrency > 0 : undefined;
  const isChangeNegative =
    pnlInCurrency !== undefined ? pnlInCurrency < 0 : undefined;

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
      data-loading-error={(isLoadingErrorCrypto && true) || undefined}
      data-pending={(isPendingCrypto && true) || undefined}
      data-pnl-positive={(isChangePositive && true) || undefined}
      data-pnl-negative={(isChangeNegative && true) || undefined}
      {...restTyped}
    >
      <CardInnerWrapper
        className="flex px-2.5 md:pl-3.5 md:pr-3.75 py-3 md:py-4 gap-2.25 md:gap-3 flex-row items-center text-left
        not-touch:group-data-[has-href]/card:group-hover/card:bg-background-hover group-data-[has-href]/card:group-active/card:bg-background-hover relative overflow-hidden"
      >
        {isPendingCrypto ? (
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
            {/* Amount */}
            <p
              className="shrink text-sm md:text-base font-semibold truncate leading-none md:leading-none
              group-data-[pending]/card:rounded-sm group-data-[pending]/card:text-transparent group-data-[pending]/card:bg-foreground group-data-[pending]/card:animate-skeleton
              group-data-[loading-error]/card:text-destructive"
            >
              {isPendingCrypto
                ? "Loading"
                : buyAmount !== undefined
                ? `${formatNumberTBMK(buyAmount)}`
                : "Error"}
            </p>
            {/* Current value in currency */}
            <p
              className="shrink text-sm md:text-base font-semibold truncate leading-none md:leading-none
              group-data-[pending]/card:rounded-sm group-data-[pending]/card:text-transparent group-data-[pending]/card:bg-foreground group-data-[pending]/card:animate-skeleton
              group-data-[loading-error]/card:text-destructive"
            >
              {isPendingCrypto
                ? "Load"
                : currentValueInCurrency !== undefined
                ? `${valueSymbol}${formatNumberTBMK(currentValueInCurrency)}`
                : "Error"}
            </p>
          </div>
          {/* Bottom line */}
          <div className="w-full flex flex-row items-center justify-between gap-3">
            {/* Ticker */}
            <div
              className="shrink min-w-0 flex items-center justify-start gap-1.25 text-muted-foreground text-xs md:text-sm truncate leading-none md:leading-none
              group-data-[pending]/card:rounded-sm group-data-[pending]/card:text-transparent group-data-[pending]/card:bg-muted-foreground group-data-[pending]/card:animate-skeleton
              group-data-[loading-error]/card:text-destructive/60"
            >
              <p className="shrink min-w-0 truncate">
                {isPendingCrypto ? "Load" : ticker ? ticker : "Error"}
              </p>
            </div>
            {/* Pnl */}
            <div
              className="shrink min-w-0 flex items-center justify-start gap-1.5 text-xs md:text-sm truncate leading-none md:leading-none
              group-data-[pending]/card:rounded-sm group-data-[pending]/card:text-transparent group-data-[pending]/card:bg-muted-foreground group-data-[pending]/card:animate-skeleton
              group-data-[loading-error]/card:text-destructive/60
              group-data-[pnl-positive]/card:text-success group-data-[pnl-negative]/card:text-destructive"
            >
              <div className="flex items-center justify-start shrink min-w-0">
                {pnlInCurrencyAbs !== undefined && (
                  <ChangeIcon className="size-4 shrink-0 -my-0.5" />
                )}
                {/* Pnl in currency */}
                <p className="shrink min-w-0 truncate">
                  {isPendingCrypto
                    ? "Load"
                    : pnlInCurrencyAbs !== undefined
                    ? `${valueSymbol}${formatNumberTBMK(pnlInCurrencyAbs, 3)}`
                    : "Error"}
                </p>
              </div>
              <div className="flex items-center justify-end shrink min-w-0">
                {pnlPercentageAbs !== undefined && (
                  <ChangeIcon className="size-4 shrink-0 -my-0.5" />
                )}
                {/* Pnl in percentage */}
                <p className="shrink min-w-0 truncate">
                  {isPendingCrypto
                    ? "Load"
                    : pnlPercentageAbs !== undefined
                    ? `${formatNumberTBMK(pnlPercentageAbs, 3)}%`
                    : "Error"}
                </p>
              </div>
            </div>
          </div>
        </div>
        <Indicator
          isError={isErrorCrypto}
          isPending={isPendingCrypto}
          isRefetching={isRefetchingCrypto}
          hasData={dataCrypto !== undefined}
          className="left-0 top-0 bottom-auto right-auto"
        />
      </CardInnerWrapper>
    </CardOuterWrapper>
  );
}
